"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Check,
  Copy,
  Loader2,
  Mail,
  Megaphone,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react"

import AdminSidebar from "../../components/admin/AdminSidebar"
import config from "../../config/config"
import { describeApiError } from "../../utils/apiError"

/**
 * Email campaigns: choose who, choose what, send.
 *
 * The audience step shows the combined figure rather than four list sizes added
 * together, because a person who is a registered user, a newsletter subscriber
 * and a bulk-purchase enquiry is one human being who must get one email. The
 * server does the deduplicating; this screen shows what it cost so the number
 * on the Send button is the number of emails that will actually go out.
 */

const SOURCE_HINTS = {
  users: "Everyone with an account on the shop",
  newsletter: "People who signed up for updates",
  callbacks: "People who asked to be called back",
  bulk: "Companies who enquired about bulk orders",
}

const STATUS_STYLE = {
  draft: "bg-gray-100 text-gray-700",
  sending: "bg-blue-100 text-blue-700",
  paused: "bg-amber-100 text-amber-700",
  sent: "bg-lime-100 text-lime-700",
  failed: "bg-red-100 text-red-700",
}

const STATUS_LABEL = {
  draft: "Draft",
  sending: "Sending",
  paused: "Paused",
  sent: "Sent",
  failed: "Failed",
}

const emptyCampaign = {
  name: "",
  subject: "",
  template: "",
  audience: { sources: [], onlyVerifiedUsers: false, excludeAdmins: true, mode: "all", picked: [] },
  throttlePerMinute: 30,
  sender: "support",
}

/**
 * Where an unfinished campaign is kept between visits.
 *
 * Putting a campaign together means choosing an audience, a template and a
 * subject, and leaving the page used to throw all of it away. This holds the
 * work in the browser until it is saved as a real draft, sent, or abandoned
 * deliberately.
 */
const WIP_KEY = "campaignInProgress"

const readWip = () => {
  try {
    const raw = sessionStorage.getItem(WIP_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // A corrupted or unreadable value must not stop the page loading.
    return null
  }
}

const writeWip = (value) => {
  try {
    sessionStorage.setItem(WIP_KEY, JSON.stringify(value))
  } catch {
    /* private browsing, or storage full -- losing the resume is not worth an error */
  }
}

const clearWip = () => {
  try {
    sessionStorage.removeItem(WIP_KEY)
  } catch {
    /* nothing to do */
  }
}

const getAdminToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [sources, setSources] = useState([])
  // Which mailboxes the server can actually send from -- fetched rather than
  // listed here, so a mailbox with no password set never appears as a choice.
  const [senders, setSenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | "new" | id
  const [form, setForm] = useState(emptyCampaign)
  const [audience, setAudience] = useState(null)
  const [audienceLoading, setAudienceLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [testTo, setTestTo] = useState("")
  const [detail, setDetail] = useState(null) // a sent campaign being inspected
  const [recipients, setRecipients] = useState([])
  const [recipientFilter, setRecipientFilter] = useState("all")
  const [confirmSend, setConfirmSend] = useState(false)
  const [suppression, setSuppression] = useState(null)
  // The address picker.
  const [addresses, setAddresses] = useState({ rows: [], total: 0, pages: 1, allMatching: [] })
  const [addressSearch, setAddressSearch] = useState("")
  const [addressPage, setAddressPage] = useState(1)
  const [addressesLoading, setAddressesLoading] = useState(false)

  const API = config.API_URL
  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${getAdminToken()}` } }),
    []
  )

  // -------------------------------------------------------------- loading

  const fetchCampaigns = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/campaigns`, authHeader)
      setCampaigns(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(describeApiError(e, "The campaigns could not be loaded"))
    } finally {
      setLoading(false)
    }
  }, [API, authHeader])

  useEffect(() => {
    fetchCampaigns()
    axios
      .get(`${API}/api/email-templates`)
      .then((r) => setTemplates(Array.isArray(r.data) ? r.data.filter((t) => !t.isDraft) : []))
      .catch(() => setTemplates([]))
    axios
      .get(`${API}/api/campaigns/sources`, authHeader)
      .then((r) => setSources(Array.isArray(r.data) ? r.data : []))
      .catch(() => setSources([]))
    axios
      .get(`${API}/api/campaigns/senders`, authHeader)
      .then((r) => setSenders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setSenders([]))
  }, [API, authHeader, fetchCampaigns])

  // A sending campaign's figures move while you watch. Polling only while one
  // is actually in flight -- a list of finished campaigns does not change on
  // its own, and polling it would be traffic for nothing.
  const anySending = campaigns.some((c) => c.status === "sending")
  useEffect(() => {
    if (!anySending) return undefined
    const timer = setInterval(fetchCampaigns, 4000)
    return () => clearInterval(timer)
  }, [anySending, fetchCampaigns])

  // -------------------------------------------------------------- audience

  const sourceKeys = form.audience.sources.join(",")
  const { onlyVerifiedUsers, excludeAdmins } = form.audience
  // A stable string rather than the array itself, so the effect reruns when the
  // ticks change and not merely because a new array was built this render.
  const pickedKey = (form.audience.picked || []).join(",")

  useEffect(() => {
    if (!editing || editing === "detail") return undefined
    if (!form.audience.sources.length) {
      setAudience(null)
      return undefined
    }

    let cancelled = false
    setAudienceLoading(true)
    // Counting four collections is not instant and the boxes get clicked in
    // quick succession, so the request is held back briefly and abandoned if
    // another click lands first.
    const timer = setTimeout(() => {
      axios
        .post(
          `${API}/api/campaigns/audience`,
          {
            sources: form.audience.sources,
            onlyVerifiedUsers,
            excludeAdmins,
            mode: form.audience.mode,
            picked: form.audience.picked,
          },
          authHeader
        )
        .then((r) => {
          if (!cancelled) setAudience(r.data)
        })
        .catch(() => {
          if (!cancelled) setAudience(null)
        })
        .finally(() => {
          if (!cancelled) setAudienceLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, authHeader, editing, sourceKeys, onlyVerifiedUsers, excludeAdmins, form.audience.mode, pickedKey])

  // Only fetched while the picker is actually open: these are four whole
  // collections, and nobody sending to everyone needs them read at all.
  const picking = form.audience.mode === "pick"

  useEffect(() => {
    if (!editing || !picking || !form.audience.sources.length) return undefined

    let cancelled = false
    setAddressesLoading(true)
    const timer = setTimeout(() => {
      axios
        .post(
          `${API}/api/campaigns/audience/list`,
          {
            sources: form.audience.sources,
            onlyVerifiedUsers,
            excludeAdmins,
            search: addressSearch,
            page: addressPage,
            limit: 100,
          },
          authHeader
        )
        .then((r) => {
          if (!cancelled) setAddresses(r.data)
        })
        .catch(() => {
          if (!cancelled) setAddresses({ rows: [], total: 0, pages: 1, allMatching: [] })
        })
        .finally(() => {
          if (!cancelled) setAddressesLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, authHeader, editing, picking, sourceKeys, onlyVerifiedUsers, excludeAdmins, addressSearch, addressPage])

  // A search that still shows page 7 of the previous search shows nothing.
  useEffect(() => {
    setAddressPage(1)
  }, [addressSearch, sourceKeys])

  const picked = form.audience.picked || []
  const pickedSet = useMemo(() => new Set(picked), [picked])

  const setPicked = (next) =>
    setForm({ ...form, audience: { ...form.audience, picked: [...new Set(next)] } })

  const togglePicked = (email) =>
    setPicked(pickedSet.has(email) ? picked.filter((e) => e !== email) : [...picked, email])

  const setMode = (mode) =>
    setForm({ ...form, audience: { ...form.audience, mode } })

  // Only a campaign that does not exist on the server yet: one already saved is
  // recovered by opening it, and keeping a second copy here would let the two
  // disagree.
  useEffect(() => {
    if (editing !== "new") return
    const empty = !form.name.trim() && !form.subject.trim() && !form.template && !form.audience.sources.length
    if (empty) clearWip()
    else writeWip(form)
  }, [editing, form])

  const toggleSource = (key) => {
    const chosen = form.audience.sources.includes(key)
      ? form.audience.sources.filter((s) => s !== key)
      : [...form.audience.sources, key]
    setForm({ ...form, audience: { ...form.audience, sources: chosen } })
  }

  // -------------------------------------------------------------- actions

  const startNew = () => {
    const resumed = readWip()
    setForm(resumed ? { ...emptyCampaign, ...resumed } : emptyCampaign)
    setAudience(null)
    setEditing("new")
    setError("")
    setNotice(resumed ? "Picked up where you left off. Clear it with Discard if you would rather start fresh." : "")
  }

  /** Throw the unfinished campaign away and begin again. */
  const discardWip = () => {
    clearWip()
    setForm(emptyCampaign)
    setAudience(null)
    setNotice("")
  }

  const startEdit = (campaign) => {
    setForm({
      name: campaign.name || "",
      subject: campaign.subject || "",
      template: campaign.template?._id || campaign.template || "",
      audience: {
        sources: campaign.audience?.sources || [],
        onlyVerifiedUsers: Boolean(campaign.audience?.onlyVerifiedUsers),
        excludeAdmins: campaign.audience?.excludeAdmins !== false,
        mode: campaign.audience?.mode === "pick" ? "pick" : "all",
        picked: campaign.audience?.picked || [],
      },
      throttlePerMinute: campaign.throttlePerMinute || 30,
      sender: campaign.sender || "support",
    })
    setEditing(campaign._id)
    setError("")
    setNotice("")
  }

  const closeEditor = () => {
    // Deliberately not cleared: leaving the editor is exactly when somebody
    // wants their work still here when they come back.
    setEditing(null)
    setForm(emptyCampaign)
    setAudience(null)
    setError("")
  }

  const save = async ({ thenSend = false } = {}) => {
    setError("")
    if (!form.name.trim()) {
      setError("Give the campaign a name before saving.")
      return null
    }

    try {
      setSaving(true)
      const payload = { ...form, template: form.template || null }
      const { data } =
        editing === "new"
          ? await axios.post(`${API}/api/campaigns`, payload, authHeader)
          : await axios.put(`${API}/api/campaigns/${editing}`, payload, authHeader)

      await fetchCampaigns()
      // It exists on the server now, so the browser copy would only go stale.
      clearWip()
      if (editing === "new") setEditing(data._id)
      if (!thenSend) setNotice("Campaign saved.")
      return data._id || editing
    } catch (e) {
      setError(describeApiError(e, "The campaign could not be saved"))
      return null
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    setError("")
    setNotice("")
    const id = await save({ thenSend: true })
    if (!id) return

    try {
      setSending(true)
      const { data } = await axios.post(`${API}/api/campaigns/${id}/test`, { to: testTo }, authHeader)
      setNotice(data.message)
    } catch (e) {
      setError(describeApiError(e, "The test could not be sent"))
    } finally {
      setSending(false)
    }
  }

  const reallySend = async () => {
    setConfirmSend(false)
    setError("")
    setNotice("")
    const id = await save({ thenSend: true })
    if (!id) return

    try {
      setSending(true)
      const { data } = await axios.post(`${API}/api/campaigns/${id}/send`, {}, authHeader)
      setNotice(data.message)
      await fetchCampaigns()
      closeEditor()
    } catch (e) {
      setError(describeApiError(e, "The campaign could not be sent"))
    } finally {
      setSending(false)
    }
  }

  const act = async (id, action) => {
    setError("")
    try {
      const { data } = await axios.post(`${API}/api/campaigns/${id}/${action}`, {}, authHeader)
      setNotice(data.message)
      await fetchCampaigns()
    } catch (e) {
      setError(describeApiError(e, "That did not work"))
    }
  }

  const duplicate = async (id) => {
    try {
      await axios.post(`${API}/api/campaigns/${id}/duplicate`, {}, authHeader)
      await fetchCampaigns()
      setNotice("Copied. The copy is a draft you can edit.")
    } catch (e) {
      setError(describeApiError(e, "That campaign could not be copied"))
    }
  }

  const remove = async (id) => {
    if (!window.confirm("Delete this campaign and its record of who it went to?")) return
    try {
      await axios.delete(`${API}/api/campaigns/${id}`, authHeader)
      await fetchCampaigns()
    } catch (e) {
      setError(describeApiError(e, "That campaign could not be deleted"))
    }
  }

  const openDetail = async (campaign) => {
    setDetail(campaign)
    setRecipientFilter("all")
    try {
      const { data } = await axios.get(`${API}/api/campaigns/${campaign._id}/recipients?limit=200`, authHeader)
      setRecipients(data.rows || [])
    } catch {
      setRecipients([])
    }
  }

  const openSuppression = async () => {
    try {
      const { data } = await axios.get(`${API}/api/campaigns/suppression/list`, authHeader)
      setSuppression(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(describeApiError(e, "The unsubscribe list could not be loaded"))
    }
  }

  // -------------------------------------------------------------- render

  const chosenTemplate = templates.find((t) => t._id === form.template)
  const readyToSend =
    form.name.trim() &&
    form.subject.trim() &&
    form.template &&
    form.audience.sources.length > 0 &&
    audience?.unique > 0

  const filteredRecipients =
    recipientFilter === "all" ? recipients : recipients.filter((r) => r.status === recipientFilter)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl p-6">
          {/* ------------------------------------------------------ header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Megaphone className="text-lime-600" size={24} />
                Campaigns
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Send a template to your customers. Everyone gets one copy, however many lists they are on.
              </p>
            </div>

            {!editing && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openSuppression}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Ban size={16} />
                  Unsubscribed
                </button>
                <button
                  type="button"
                  onClick={startNew}
                  className="flex items-center gap-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-600"
                >
                  <Plus size={16} />
                  New Campaign
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-800">
              <Check size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1">{notice}</span>
              <button type="button" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* ------------------------------------------------------- editor */}
          {editing ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={closeEditor}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={16} />
                Back to campaigns
              </button>

              {/* 1 -- what it is */}
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  1 · The campaign
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Name</span>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="October laptop offers"
                      className={inputClass}
                    />
                    <span className="mt-1 block text-xs text-gray-400">
                      For your records. Customers never see this.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Subject line</span>
                    <input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder={chosenTemplate?.subject || "Up to 30% off this weekend"}
                      className={inputClass}
                    />
                    <span className="mt-1 block text-xs text-gray-400">
                      What the reader sees in their inbox.
                    </span>
                  </label>
                </div>
              </section>

              {/* 2 -- who */}
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  2 · Who it goes to
                </h2>
                <p className="mb-4 text-xs text-gray-500">
                  Pick any combination. Anyone on more than one list still gets a single email.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {sources.map((source) => {
                    const on = form.audience.sources.includes(source.key)
                    return (
                      <button
                        key={source.key}
                        type="button"
                        onClick={() => toggleSource(source.key)}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                          on ? "border-lime-500 bg-lime-50" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            on ? "border-lime-500 bg-lime-500 text-white" : "border-gray-300 bg-white"
                          }`}
                        >
                          {on && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">{source.label}</span>
                          <span className="block text-xs text-gray-500">{SOURCE_HINTS[source.key]}</span>
                          {on && audience?.counts?.[source.key] !== undefined && (
                            <span className="mt-1 block text-xs font-medium text-lime-700">
                              {audience.counts[source.key]} addresses
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-5 border-t border-gray-100 pt-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.audience.onlyVerifiedUsers}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          audience: { ...form.audience, onlyVerifiedUsers: e.target.checked },
                        })
                      }
                      className="h-4 w-4 accent-lime-500"
                    />
                    Only users who verified their email
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.audience.excludeAdmins}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          audience: { ...form.audience, excludeAdmins: e.target.checked },
                        })
                      }
                      className="h-4 w-4 accent-lime-500"
                    />
                    Leave out staff accounts
                  </label>
                </div>

                {/* Everyone, or the ones you tick. */}
                {form.audience.sources.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                      {[
                        { key: "all", label: "Everyone in these lists" },
                        { key: "pick", label: "Choose addresses myself" },
                      ].map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setMode(option.key)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                            form.audience.mode === option.key
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {picking && (
                      <div className="mt-3 rounded-lg border border-gray-200">
                        {/* search + bulk ticks */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
                          <div className="relative min-w-[200px] flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              value={addressSearch}
                              onChange={(e) => setAddressSearch(e.target.value)}
                              placeholder="Search a name or address"
                              className={`${inputClass} pl-9`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPicked([...picked, ...addresses.allMatching])}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Select all {addressSearch ? "matching" : ""} ({addresses.allMatching.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setPicked(picked.filter((e) => !addresses.allMatching.includes(e)))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Clear
                          </button>
                        </div>

                        {/* the addresses */}
                        <div className="max-h-80 overflow-y-auto">
                          {addressesLoading ? (
                            <p className="flex items-center gap-2 p-6 text-sm text-gray-500">
                              <Loader2 size={14} className="animate-spin" />
                              Loading addresses…
                            </p>
                          ) : addresses.rows.length === 0 ? (
                            <p className="p-6 text-center text-sm text-gray-500">
                              {addressSearch ? "Nobody matches that." : "These lists are empty."}
                            </p>
                          ) : (
                            addresses.rows.map((row) => {
                              const on = pickedSet.has(row.email)
                              return (
                                <label
                                  key={row.email}
                                  className={`flex items-center gap-3 border-b border-gray-100 px-3 py-2 last:border-b-0 ${
                                    row.suppressed ? "opacity-50" : "cursor-pointer hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    disabled={row.suppressed}
                                    onChange={() => togglePicked(row.email)}
                                    className="h-4 w-4 shrink-0 accent-lime-500"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm text-gray-900">{row.email}</span>
                                    {row.name && (
                                      <span className="block truncate text-xs text-gray-500">{row.name}</span>
                                    )}
                                  </span>
                                  <span className="shrink-0 text-xs text-gray-400">
                                    {row.suppressed
                                      ? "Unsubscribed"
                                      : sources.find((x) => x.key === row.source)?.label || row.source}
                                  </span>
                                </label>
                              )
                            })
                          )}
                        </div>

                        {/* paging */}
                        <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
                          <span>
                            <span className="font-semibold text-gray-800">{picked.length}</span> ticked ·{" "}
                            {addresses.total} shown
                          </span>
                          {addresses.pages > 1 && (
                            <span className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={addressPage <= 1}
                                onClick={() => setAddressPage((n) => n - 1)}
                                className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
                              >
                                Back
                              </button>
                              <span>
                                {addressPage} of {addresses.pages}
                              </span>
                              <button
                                type="button"
                                disabled={addressPage >= addresses.pages}
                                onClick={() => setAddressPage((n) => n + 1)}
                                className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
                              >
                                Next
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* The honest number, and what it cost to get there. */}
                {form.audience.sources.length > 0 && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    {audienceLoading ? (
                      <p className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 size={14} className="animate-spin" />
                        Counting&hellip;
                      </p>
                    ) : audience ? (
                      <>
                        <p className="flex items-baseline gap-2">
                          <Users size={16} className="text-lime-600" />
                          <span className="text-2xl font-bold text-gray-900">{audience.unique}</span>
                          <span className="text-sm text-gray-600">
                            {audience.unique === 1 ? "person will be emailed" : "people will be emailed"}
                          </span>
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {picking
                            ? `${picked.length} ticked out of ${audience.available} you could email.`
                            : `${audience.raw} across the lists you chose` +
                              (audience.duplicates > 0 ? `, ${audience.duplicates} on more than one list` : "") +
                              (audience.suppressed > 0 ? `, ${audience.suppressed} unsubscribed` : "") +
                              (audience.invalid > 0 ? `, ${audience.invalid} not a usable address` : "") +
                              "."}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">The audience could not be counted.</p>
                    )}
                  </div>
                )}
              </section>

              {/* 3 -- what */}
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  3 · What it sends
                </h2>

                {templates.length === 0 ? (
                  <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    There are no finished templates yet. Build one under Email Templates first.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => {
                      const on = form.template === template._id
                      return (
                        <button
                          key={template._id}
                          type="button"
                          onClick={() => setForm({ ...form, template: template._id })}
                          className={`overflow-hidden rounded-lg border text-left transition ${
                            on ? "border-lime-500 ring-2 ring-lime-100" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="h-28 overflow-hidden bg-gray-50">
                            <iframe
                              title={template.name}
                              srcDoc={template.html}
                              sandbox=""
                              scrolling="no"
                              className="pointer-events-none h-[280px] w-[400px] origin-top-left scale-[0.37] border-0"
                            />
                          </div>
                          <div className="border-t border-gray-100 p-3">
                            <p className="truncate text-sm font-semibold text-gray-900">{template.name}</p>
                            <p className="truncate text-xs text-gray-500">{template.subject}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* 4 -- how */}
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  4 · Sending
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Send from</span>
                    <select
                      value={form.sender}
                      onChange={(e) => setForm({ ...form, sender: e.target.value })}
                      className={inputClass}
                    >
                      {senders.length === 0 ? (
                        <option value="support">Graba2z Support</option>
                      ) : (
                        senders.map((mailbox) => (
                          <option key={mailbox.key} value={mailbox.key}>
                            {mailbox.label} — {mailbox.address}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="mt-1 block text-xs text-gray-400">
                      The address customers see, and the one their replies go to.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Speed</span>
                    <select
                      value={form.throttlePerMinute}
                      onChange={(e) => setForm({ ...form, throttlePerMinute: Number(e.target.value) })}
                      className={inputClass}
                    >
                      <option value={10}>Slow — 10 per minute</option>
                      <option value={30}>Normal — 30 per minute</option>
                      <option value={60}>Fast — 60 per minute</option>
                      <option value={120}>Very fast — 120 per minute</option>
                    </select>
                    <span className="mt-1 block text-xs text-gray-400">
                      Going faster than your mail provider allows gets the domain blocked. Normal is safe.
                    </span>
                  </label>
                </div>

                {audience?.unique > 0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    At this speed, {audience.unique} emails take about{" "}
                    {Math.max(1, Math.round(audience.unique / form.throttlePerMinute))} minute
                    {Math.round(audience.unique / form.throttlePerMinute) === 1 ? "" : "s"}.
                  </p>
                )}

                {/* Test first. Always. */}
                <div className="mt-5 rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Send yourself a test first</p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={testTo}
                      onChange={(e) => setTestTo(e.target.value)}
                      placeholder="you@grabatoz.ae"
                      className={`${inputClass} max-w-xs flex-1`}
                    />
                    <button
                      type="button"
                      onClick={sendTest}
                      disabled={sending || !testTo.trim() || !form.template}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                      Send test
                    </button>
                  </div>
                </div>
              </section>

              {/* actions */}
              <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-gray-200 bg-white px-5 py-4">
                <button
                  type="button"
                  onClick={() => save()}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save draft"}
                </button>
                {editing === "new" && (
                  <button
                    type="button"
                    onClick={discardWip}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
                  >
                    Discard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmSend(true)}
                  disabled={!readyToSend || sending || saving}
                  className="flex items-center gap-2 rounded-lg bg-lime-500 px-5 py-2 text-sm font-semibold text-white hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={15} />
                  {audience?.unique ? `Send to ${audience.unique} people` : "Send"}
                </button>
                {!readyToSend && (
                  <span className="text-xs text-gray-500">
                    {!form.name.trim()
                      ? "Name the campaign first."
                      : !form.subject.trim()
                        ? "Write the subject line."
                        : !form.audience.sources.length
                          ? "Choose who it goes to."
                          : picking && picked.length === 0
                            ? "Tick the addresses this should go to."
                            : !form.template
                              ? "Pick a template."
                              : "Nobody in those lists can be emailed."}
                  </span>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 py-20 text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              Loading campaigns…
            </div>
          ) : campaigns.length === 0 ? (
            /* ----------------------------------------------------- empty */
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <Megaphone className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="mb-1 font-semibold text-gray-900">No campaigns yet</p>
              <p className="mb-5 text-sm text-gray-500">
                Pick an audience, pick a template, and send.
              </p>
              <button
                type="button"
                onClick={startNew}
                className="inline-flex items-center gap-2 rounded-lg bg-lime-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-lime-600"
              >
                <Plus size={16} />
                New Campaign
              </button>
            </div>
          ) : (
            /* ------------------------------------------------------ list */
            <div className="space-y-3">
              {campaigns.map((campaign) => {
                const done = campaign.stats?.sent + campaign.stats?.failed + campaign.stats?.skipped || 0
                const total = campaign.stats?.total || 0
                const pct = total ? Math.round((done / total) * 100) : 0

                return (
                  <div key={campaign._id} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-gray-900">{campaign.name}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              STATUS_STYLE[campaign.status] || STATUS_STYLE.draft
                            }`}
                          >
                            {STATUS_LABEL[campaign.status] || campaign.status}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          {campaign.subject || campaign.template?.subject || "No subject yet"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {(campaign.audience?.sources || []).map((s) => SOURCE_HINTS[s] && s).filter(Boolean).length >
                          0
                            ? (campaign.audience?.sources || [])
                                .map((s) => sources.find((x) => x.key === s)?.label || s)
                                .join(" · ")
                            : "No audience chosen"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {campaign.status === "sending" && (
                          <button
                            type="button"
                            onClick={() => act(campaign._id, "pause")}
                            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                          >
                            <Pause size={14} />
                            Pause
                          </button>
                        )}
                        {["paused", "failed"].includes(campaign.status) && (
                          <button
                            type="button"
                            onClick={() => act(campaign._id, "resume")}
                            className="flex items-center gap-1.5 rounded-lg border border-lime-300 bg-lime-50 px-3 py-1.5 text-xs font-semibold text-lime-800 hover:bg-lime-100"
                          >
                            <Play size={14} />
                            Resume
                          </button>
                        )}
                        {["draft"].includes(campaign.status) && (
                          <button
                            type="button"
                            onClick={() => startEdit(campaign)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                        )}
                        {total > 0 && (
                          <button
                            type="button"
                            onClick={() => openDetail(campaign)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Report
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => duplicate(campaign._id)}
                          title="Duplicate"
                          className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(campaign._id)}
                          title="Delete"
                          className="rounded-lg border border-gray-300 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {total > 0 && (
                      <div className="mt-4">
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-lime-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">{campaign.stats.sent}</span> sent
                          {campaign.stats.failed > 0 && ` · ${campaign.stats.failed} failed`}
                          {campaign.stats.skipped > 0 && ` · ${campaign.stats.skipped} unsubscribed`}
                          {" · "}
                          {total} in total
                        </p>
                      </div>
                    )}

                    {campaign.lastError && (
                      <p className="mt-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{campaign.lastError}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------- send dialog */}
      {confirmSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Send to {audience?.unique} {audience?.unique === 1 ? "person" : "people"}?
            </h3>
            <p className="mb-5 text-sm text-gray-600">
              This cannot be taken back once it starts. You can pause it, but anything already sent has
              gone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmSend(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Not yet
              </button>
              <button
                type="button"
                onClick={reallySend}
                className="flex items-center gap-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-600"
              >
                <Send size={15} />
                Send it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- report */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h3 className="font-bold text-gray-900">{detail.name}</h3>
                <p className="text-xs text-gray-500">Who it went to, and what happened</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 border-b border-gray-200 px-5 py-3">
              {["all", "sent", "failed", "skipped", "pending"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRecipientFilter(key)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${
                    recipientFilter === key ? "bg-lime-50 text-lime-700" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {key === "skipped" ? "Unsubscribed" : key}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {filteredRecipients.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">Nothing here.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                      <th className="pb-2">Email</th>
                      <th className="pb-2">From list</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecipients.map((row) => (
                      <tr key={row._id} className="border-b border-gray-100">
                        <td className="py-2">
                          <span className="block text-gray-900">{row.email}</span>
                          {row.error && <span className="block text-xs text-red-600">{row.error}</span>}
                        </td>
                        <td className="py-2 text-xs text-gray-500">
                          {sources.find((s) => s.key === row.source)?.label || row.source}
                        </td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              row.status === "sent"
                                ? "bg-lime-100 text-lime-700"
                                : row.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : row.status === "skipped"
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {row.status === "skipped" ? "Unsubscribed" : row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------- unsubscribed people */}
      {suppression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h3 className="font-bold text-gray-900">Unsubscribed</h3>
                <p className="text-xs text-gray-500">
                  These people are never sent a campaign. The list cannot be edited here.
                </p>
              </div>
              <button type="button" onClick={() => setSuppression(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {suppression.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">Nobody has unsubscribed.</p>
              ) : (
                <ul className="space-y-2">
                  {suppression.map((row) => (
                    <li key={row._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <span className="text-sm text-gray-800">{row.email}</span>
                      <span className="text-xs capitalize text-gray-500">{row.reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCampaigns
