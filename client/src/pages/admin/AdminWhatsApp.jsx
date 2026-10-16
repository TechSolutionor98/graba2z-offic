"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Inbox,
  Link2,
  Lock,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Settings as SettingsIcon,
  X,
} from "lucide-react"

import config from "../../config/config"
import { describeApiError } from "../../utils/apiError"

// The four order events the shop can tell a customer about, in the order they
// happen. The labels and help text are written for the shop owner, not for a
// developer -- this screen is the only place these rules are explained.
const EVENTS = [
  {
    key: "orderPlaced",
    label: "Order placed",
    help: "Sent the moment an order is placed, with Confirm order and Cancel order buttons. A tap updates the order straight away.",
  },
  {
    key: "shipped",
    label: "Shipped",
    help: "Sent when the order is marked Shipped, or when a tracking number is added to an order already marked Shipped. The customer is told once, whichever comes first.",
  },
  { key: "delivered", label: "Delivered", help: "Sent when the order is marked Delivered." },
  { key: "cancelled", label: "Cancelled", help: "Sent when the order is marked Cancelled." },
]

const EMPTY_SETTINGS = {
  phoneNumberId: "",
  wabaId: "",
  apiVersion: "v21.0",
  defaultCountryCode: "971",
  businessDisplayNumber: "",
  enabled: false,
  notifications: { orderPlaced: false, shipped: false, delivered: false, cancelled: false },
  templates: {
    orderPlaced: { name: "", language: "en" },
    shipped: { name: "", language: "en" },
    delivered: { name: "", language: "en" },
    cancelled: { name: "", language: "en" },
  },
  accessTokenSet: false,
  accessTokenHint: "",
  appSecretSet: false,
  appSecretHint: "",
  verifyTokenSet: false,
  verifyTokenHint: "",
}

const fmtTime = (value) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : ""

const fmtShort = (value) => {
  if (!value) return ""
  const date = new Date(value)
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
}

/** "closes in 3h 12m", so the person replying knows how long they have. */
const describeCountdown = (expiresAt) => {
  if (!expiresAt) return ""
  const remaining = new Date(expiresAt).getTime() - Date.now()
  if (remaining <= 0) return "closed"
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`
}

const AdminWhatsApp = () => {
  const [tab, setTab] = useState("connection")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
  const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token])

  const [unreadTotal, setUnreadTotal] = useState(0)

  const flash = useCallback((message) => {
    setSuccess(message)
    setTimeout(() => setSuccess(""), 4000)
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-lime-600" />
            WhatsApp
          </h1>
          <p className="text-sm text-gray-500">
            Order notifications and customer replies, through Meta&rsquo;s official WhatsApp Business Platform.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <TabButton active={tab === "connection"} onClick={() => setTab("connection")} icon={SettingsIcon}>
          Connection
        </TabButton>
        <TabButton active={tab === "inbox"} onClick={() => setTab("inbox")} icon={Inbox} badge={unreadTotal}>
          Inbox
        </TabButton>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-400 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {/* Both tabs stay mounted so the inbox keeps its unread count and open
          conversation while the owner looks at the connection, and so the
          Inbox tab's badge is right before it has ever been opened. */}
      <div className={tab === "connection" ? "" : "hidden"}>
        <ConnectionTab authHeader={authHeader} onError={setError} onSuccess={flash} />
      </div>
      <div className={tab === "inbox" ? "" : "hidden"}>
        <InboxTab authHeader={authHeader} onError={setError} onUnreadTotal={setUnreadTotal} active={tab === "inbox"} />
      </div>
    </div>
  )
}

// ===========================================================================
// Connection
// ===========================================================================

const ConnectionTab = ({ authHeader, onError, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_SETTINGS)
  const [secrets, setSecrets] = useState({ accessToken: "", appSecret: "", verifyToken: "" })
  const [readiness, setReadiness] = useState(null)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [templateVariables, setTemplateVariables] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testPhone, setTestPhone] = useState("")
  // The template the test goes out as. Left blank it uses the order-placed one,
  // but a brand-new account usually has nothing approved yet except Meta's own
  // hello_world, so this has to be overridable or the first test cannot be run.
  const [testTemplate, setTestTemplate] = useState("")
  const [testLanguage, setTestLanguage] = useState("")
  const [testing, setTesting] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${config.API_URL}/api/whatsapp/settings`, authHeader)
      setForm({ ...EMPTY_SETTINGS, ...data.settings })
      setReadiness(data.readiness)
      setWebhookUrl(data.webhookUrl || "")
      setTemplateVariables(data.templateVariables || {})
      setSecrets({ accessToken: "", appSecret: "", verifyToken: "" })
    } catch (e) {
      onError(describeApiError(e, "Could not load the WhatsApp connection"))
    } finally {
      setLoading(false)
    }
  }, [authHeader, onError])

  useEffect(() => {
    load()
  }, [load])

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }))
  const setTemplate = (event, patch) =>
    setForm((prev) => ({
      ...prev,
      templates: { ...prev.templates, [event]: { ...prev.templates[event], ...patch } },
    }))
  const setNotification = (event, value) =>
    setForm((prev) => ({ ...prev, notifications: { ...prev.notifications, [event]: value } }))

  const save = async () => {
    try {
      setSaving(true)
      onError("")
      const payload = {
        phoneNumberId: form.phoneNumberId,
        wabaId: form.wabaId,
        apiVersion: form.apiVersion,
        defaultCountryCode: form.defaultCountryCode,
        businessDisplayNumber: form.businessDisplayNumber,
        enabled: form.enabled,
        notifications: form.notifications,
        templates: form.templates,
      }
      // A blank secret box means "leave the saved one alone", never "clear it".
      if (secrets.accessToken.trim()) payload.accessToken = secrets.accessToken.trim()
      if (secrets.appSecret.trim()) payload.appSecret = secrets.appSecret.trim()
      if (secrets.verifyToken.trim()) payload.verifyToken = secrets.verifyToken.trim()

      const { data } = await axios.put(`${config.API_URL}/api/whatsapp/settings`, payload, authHeader)
      setForm({ ...EMPTY_SETTINGS, ...data.settings })
      setReadiness(data.readiness)
      setSecrets({ accessToken: "", appSecret: "", verifyToken: "" })
      onSuccess("Saved.")
    } catch (e) {
      onError(describeApiError(e, "Could not save the WhatsApp connection"))
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    try {
      setTesting(true)
      onError("")
      await axios.post(
        `${config.API_URL}/api/whatsapp/test`,
        {
          phone: testPhone,
          templateName: testTemplate.trim() || form.templates.orderPlaced.name,
          language: testLanguage.trim() || form.templates.orderPlaced.language,
        },
        authHeader,
      )
      onSuccess(`Test message sent to ${testPhone}.`)
    } catch (e) {
      onError(describeApiError(e, "The test message could not be sent"))
    } finally {
      setTesting(false)
    }
  }

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      onError("Could not copy — select the address and copy it by hand.")
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Loading…</div>
  }

  return (
    <div className="space-y-6">
      {readiness && !readiness.ready && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold">Nothing is being sent on WhatsApp yet.</p>
            <p className="mt-1">{readiness.reason}</p>
          </div>
        </div>
      )}
      {readiness?.ready && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <ShieldCheck className="mt-0.5 shrink-0" size={18} />
          <p>
            WhatsApp is connected and switched on. Only the notifications ticked below will actually go out.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* ---- Credentials ---- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Credentials from Meta</h2>
              <p className="mt-1 text-sm text-gray-500">
                From the Meta app dashboard, under WhatsApp. Everything here is stored on the server; the tokens are
                never shown again once saved.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Phone number ID" hint="WhatsApp → API Setup">
                <input
                  className={inputClass}
                  value={form.phoneNumberId}
                  onChange={(e) => set({ phoneNumberId: e.target.value })}
                  placeholder="123456789012345"
                />
              </Field>
              <Field label="WhatsApp Business Account ID" hint="optional, for support">
                <input
                  className={inputClass}
                  value={form.wabaId}
                  onChange={(e) => set({ wabaId: e.target.value })}
                  placeholder="987654321098765"
                />
              </Field>

              <SecretField
                label="Access token"
                hint="System User → permanent token"
                saved={form.accessTokenSet}
                savedHint={form.accessTokenHint}
                value={secrets.accessToken}
                onChange={(value) => setSecrets((prev) => ({ ...prev, accessToken: value }))}
              />
              <SecretField
                label="App secret"
                hint="App dashboard → Settings → Basic"
                saved={form.appSecretSet}
                savedHint={form.appSecretHint}
                value={secrets.appSecret}
                onChange={(value) => setSecrets((prev) => ({ ...prev, appSecret: value }))}
              />
              <SecretField
                label="Verify token"
                hint="any phrase you invent — type the same one into Meta"
                saved={form.verifyTokenSet}
                savedHint={form.verifyTokenHint}
                value={secrets.verifyToken}
                onChange={(value) => setSecrets((prev) => ({ ...prev, verifyToken: value }))}
              />
              <Field label="Your WhatsApp number" hint="shown here for reference only">
                <input
                  className={inputClass}
                  value={form.businessDisplayNumber}
                  onChange={(e) => set({ businessDisplayNumber: e.target.value })}
                  placeholder="+971 50 000 0000"
                />
              </Field>
              <Field label="Default country code" hint="for customers who type a local number">
                <input
                  className={inputClass}
                  value={form.defaultCountryCode}
                  onChange={(e) => set({ defaultCountryCode: e.target.value })}
                  placeholder="971"
                />
              </Field>
              <Field label="Graph API version">
                <input
                  className={inputClass}
                  value={form.apiVersion}
                  onChange={(e) => set({ apiVersion: e.target.value })}
                  placeholder="v21.0"
                />
              </Field>
            </div>

            {/* ---- The webhook address ---- */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Link2 size={15} />
                Register this address with Meta
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Meta app dashboard → WhatsApp → Configuration → Callback URL, with the verify token above, and
                subscribe to the <code className="rounded bg-gray-200 px-1">messages</code> field. Without it, replies
                and button taps never reach this screen.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800">
                  {webhookUrl}
                </code>
                <button
                  type="button"
                  onClick={copyWebhook}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </section>

          {/* ---- Notifications ---- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Which notifications go out</h2>
              <p className="mt-1 text-sm text-gray-500">
                Every one starts switched off. Nothing is sent for an event until you turn it on and name the template
                Meta approved for it.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                checked={form.enabled}
                onChange={(e) => set({ enabled: e.target.checked })}
              />
              <span className="text-sm">
                <span className="font-medium text-gray-900">WhatsApp is switched on</span>
                <span className="mt-0.5 block text-gray-500">
                  The master switch. With this off, nothing is sent at all, whatever is ticked below.
                </span>
              </span>
            </label>

            <div className="space-y-3">
              {EVENTS.map((event) => (
                <div key={event.key} className="rounded-xl border border-gray-200 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                      checked={Boolean(form.notifications[event.key])}
                      onChange={(e) => setNotification(event.key, e.target.checked)}
                    />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900">{event.label}</span>
                      <span className="mt-0.5 block text-gray-500">{event.help}</span>
                    </span>
                  </label>

                  <div className="mt-3 grid grid-cols-1 gap-3 pl-7 md:grid-cols-[1fr_140px]">
                    <Field label="Approved template name">
                      <input
                        className={inputClass}
                        value={form.templates[event.key]?.name || ""}
                        onChange={(e) => setTemplate(event.key, { name: e.target.value })}
                        placeholder="order_confirmation"
                      />
                    </Field>
                    <Field label="Language">
                      <input
                        className={inputClass}
                        value={form.templates[event.key]?.language || "en"}
                        onChange={(e) => setTemplate(event.key, { language: e.target.value })}
                        placeholder="en"
                      />
                    </Field>
                  </div>

                  {templateVariables[event.key]?.length > 0 && (
                    <p className="mt-2 pl-7 text-xs text-gray-500">
                      The template is filled in this order:{" "}
                      {templateVariables[event.key].map((variable, index) => (
                        <span key={variable} className="whitespace-nowrap">
                          <code className="rounded bg-gray-100 px-1">{`{{${index + 1}}}`}</code> {variable}
                          {index < templateVariables[event.key].length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {event.key === "orderPlaced" && (
                        <>
                          {" "}
                          The template also needs two quick-reply buttons, the first to confirm and the second to
                          cancel.
                        </>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white hover:bg-lime-700 disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* ---- Test send ---- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Send a test message</h2>
            <p className="text-sm text-gray-500">
              Sends one approved template to one number, to prove the connection works. One a minute, and never to a
              number that has opted out.
            </p>
            <Field label="Phone number">
              <input
                className={inputClass}
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+971 50 000 0000"
              />
            </Field>
            <div className="grid grid-cols-[1fr_110px] gap-2">
              <Field label="Template" hint="blank = order placed">
                <input
                  className={inputClass}
                  value={testTemplate}
                  onChange={(e) => setTestTemplate(e.target.value)}
                  placeholder={form.templates.orderPlaced.name || "hello_world"}
                />
              </Field>
              <Field label="Language">
                <input
                  className={inputClass}
                  value={testLanguage}
                  onChange={(e) => setTestLanguage(e.target.value)}
                  placeholder={form.templates.orderPlaced.language || "en_US"}
                />
              </Field>
            </div>
            <p className="text-xs text-gray-500">
              Nothing approved yet? Every account starts with Meta&rsquo;s own <code className="rounded bg-gray-100 px-1">hello_world</code>{" "}
              in <code className="rounded bg-gray-100 px-1">en_US</code>. It takes no variables, so it is the quickest
              way to prove the credentials and the number work.
            </p>
            <button
              type="button"
              onClick={sendTest}
              disabled={testing || !testPhone.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Send size={15} />
              {testing ? "Sending…" : "Send test"}
            </button>
            {form.lastTestSentAt && (
              <p className="text-xs text-gray-400">Last test: {fmtTime(form.lastTestSentAt)}</p>
            )}
          </section>

          {/* ---- The rules, in plain words ---- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <ShieldCheck size={16} className="text-lime-600" />
              What keeps this number safe
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              These are enforced by the system, not left to whoever is on the inbox. You cannot switch them off.
            </p>
            <ul className="mt-3 space-y-3 text-sm text-gray-600">
              <Rule title="Only people who already dealt with the shop">
                A customer can be messaged because they placed an order or because they wrote to us first. There is no
                way to upload a list of numbers.
              </Rule>
              <Rule title="Free replies only within 24 hours">
                WhatsApp allows a freely written message only for 24 hours after the customer&rsquo;s last one. After
                that the reply box locks itself and says so, because a run of rejected messages damages this
                number&rsquo;s standing. Approved templates are still allowed.
              </Rule>
              <Rule title="&ldquo;STOP&rdquo; is final">
                A message that is exactly <strong>STOP</strong> or <strong>unsubscribe</strong> silences every future
                message, order notifications included. A sentence that merely contains the word
                (&ldquo;stop sending me the wrong size&rdquo;) is a complaint and is left alone. If someone who opted
                out writes in again, that reopens the conversation.
              </Rule>
              <Rule title="Nothing here can break an order">
                Notifications are sent after the order is already saved and nothing waits on them. If WhatsApp is down
                or the message is refused, the order goes through exactly as normal.
              </Rule>
              <Rule title="This is Meta&rsquo;s official platform">
                Not a QR-code login pretending to be a linked phone. That is what gets business numbers banned
                permanently, and the number on your invoices is not worth the risk.
              </Rule>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

// ===========================================================================
// Inbox
// ===========================================================================

const InboxTab = ({ authHeader, onError, onUnreadTotal, active }) => {
  const [conversations, setConversations] = useState([])
  const [search, setSearch] = useState("")
  const [selectedPhone, setSelectedPhone] = useState("")
  const [thread, setThread] = useState({ contact: null, messages: [] })
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const loadConversations = useCallback(async () => {
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""
      const { data } = await axios.get(`${config.API_URL}/api/whatsapp/conversations${query}`, authHeader)
      setConversations(data.conversations || [])
      onUnreadTotal(data.totalUnread || 0)
    } catch (e) {
      onError(describeApiError(e, "Could not load the conversations"))
    } finally {
      setLoadingList(false)
    }
  }, [authHeader, onError, onUnreadTotal, search])

  const loadThread = useCallback(
    async (phone, { markRead = false } = {}) => {
      if (!phone) return
      try {
        setLoadingThread(true)
        const { data } = await axios.get(
          `${config.API_URL}/api/whatsapp/conversations/${encodeURIComponent(phone)}/messages`,
          authHeader,
        )
        setThread({ contact: data.contact, messages: data.messages || [] })
        if (markRead) {
          await axios.post(
            `${config.API_URL}/api/whatsapp/conversations/${encodeURIComponent(phone)}/read`,
            {},
            authHeader,
          )
          loadConversations()
        }
      } catch (e) {
        onError(describeApiError(e, "Could not load that conversation"))
      } finally {
        setLoadingThread(false)
      }
    },
    [authHeader, loadConversations, onError],
  )

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Keep the list and the open conversation current without a manual refresh.
  // Only while this tab is on screen -- there is no reason to poll behind it.
  useEffect(() => {
    if (!active) return undefined
    const timer = setInterval(() => {
      loadConversations()
      if (selectedPhone) loadThread(selectedPhone)
    }, 15000)
    return () => clearInterval(timer)
  }, [active, loadConversations, loadThread, selectedPhone])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [thread.messages.length])

  const openConversation = (phone) => {
    setSelectedPhone(phone)
    setDraft("")
    loadThread(phone, { markRead: true })
  }

  const contact = thread.contact
  const canReply = Boolean(contact?.canReply)

  const send = async () => {
    if (!draft.trim() || !canReply) return
    try {
      setSending(true)
      onError("")
      await axios.post(
        `${config.API_URL}/api/whatsapp/conversations/${encodeURIComponent(selectedPhone)}/reply`,
        { text: draft.trim() },
        authHeader,
      )
      setDraft("")
      await loadThread(selectedPhone)
      loadConversations()
    } catch (e) {
      onError(describeApiError(e, "The reply could not be sent"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      {/* ---- Conversation list ---- */}
      <div className="flex max-h-[700px] flex-col rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className={`${inputClass} pl-9`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or number"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList && <p className="p-4 text-sm text-gray-500">Loading…</p>}
          {!loadingList && conversations.length === 0 && (
            <p className="p-4 text-sm text-gray-500">
              No conversations yet. One appears as soon as an order notification goes out or a customer writes in.
            </p>
          )}
          {conversations.map((item) => (
            <button
              key={item.phone}
              type="button"
              onClick={() => openConversation(item.phone)}
              className={`flex w-full items-start gap-3 border-b border-gray-100 p-3 text-left hover:bg-gray-50 ${
                selectedPhone === item.phone ? "bg-lime-50" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-gray-900">{item.name || `+${item.phone}`}</span>
                  <span className="shrink-0 text-xs text-gray-400">{fmtShort(item.lastMessageAt)}</span>
                </div>
                <p className="truncate text-xs text-gray-500">
                  {item.lastMessageDirection === "out" ? "You: " : ""}
                  {item.lastMessagePreview || "No messages yet"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {item.optedOut && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">Opted out</span>
                  )}
                  {!item.optedOut && item.windowOpen && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">
                      {describeCountdown(item.windowExpiresAt)}
                    </span>
                  )}
                </div>
              </div>
              {item.unreadCount > 0 && (
                <span className="mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-lime-600 px-1.5 text-[11px] font-semibold text-white">
                  {item.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Thread ---- */}
      <div className="flex max-h-[700px] min-h-[500px] flex-col rounded-2xl border border-gray-200 bg-white">
        {!contact && (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-gray-500">
            Pick a conversation to read it.
          </div>
        )}

        {contact && (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{contact.name || `+${contact.phone}`}</p>
                <p className="text-xs text-gray-500">
                  +{contact.phone} ·{" "}
                  {contact.consentSource === "order" ? "placed an order" : "wrote to the shop first"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadThread(selectedPhone)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw size={13} />
                Refresh
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
              {loadingThread && thread.messages.length === 0 && <p className="text-sm text-gray-500">Loading…</p>}
              {thread.messages.map((message) => (
                <MessageBubble key={message._id} message={message} />
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              {!canReply && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <Lock size={15} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{contact.replyBlockedReason}</p>
                    <p className="mt-0.5 text-xs">
                      {contact.optedOut
                        ? "They will be able to be answered again if they write in themselves."
                        : "An approved template is the only thing WhatsApp allows until they message again."}
                    </p>
                  </div>
                </div>
              )}

              {canReply && contact.windowExpiresAt && (
                <p className="mb-2 text-xs text-gray-500">
                  Reply window {describeCountdown(contact.windowExpiresAt)} — closes {fmtTime(contact.windowExpiresAt)}.
                </p>
              )}

              <div className="flex items-end gap-2">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={draft}
                  disabled={!canReply || sending}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder={canReply ? "Type a reply…" : "Replies are not allowed right now"}
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!canReply || sending || !draft.trim()}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-lime-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={15} />
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ===========================================================================
// Pieces
// ===========================================================================

const MessageBubble = ({ message }) => {
  // A system line is this app explaining itself -- an opt-out, a button tap, a
  // notification that was held back. It never went to WhatsApp.
  if (message.type === "system") {
    return (
      <p className="mx-auto max-w-md rounded-lg bg-gray-200 px-3 py-1.5 text-center text-xs text-gray-600">
        {message.body}
      </p>
    )
  }

  const outbound = message.direction === "out"
  return (
    <div className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
          outbound
            ? message.status === "failed"
              ? "bg-red-100 text-red-900"
              : "bg-lime-600 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {message.type === "template" && (
          <p className={`mb-1 text-[11px] uppercase tracking-wide ${outbound ? "text-lime-100" : "text-gray-400"}`}>
            Template · {message.templateName}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p
          className={`mt-1 flex items-center gap-1.5 text-[11px] ${
            outbound ? (message.status === "failed" ? "text-red-700" : "text-lime-100") : "text-gray-400"
          }`}
        >
          {fmtShort(message.createdAt)}
          {outbound && <span>· {message.status}</span>}
          {message.sentBy?.name && <span>· {message.sentBy.name}</span>}
        </p>
        {message.error && <p className="mt-1 text-[11px] text-red-700">{message.error}</p>}
      </div>
    </div>
  )
}

const TabButton = ({ active, onClick, icon: Icon, badge, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
      active ? "border-lime-600 text-lime-700" : "border-transparent text-gray-500 hover:text-gray-800"
    }`}
  >
    <Icon size={15} />
    {children}
    {badge > 0 && (
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-600 px-1.5 text-[11px] font-semibold text-white">
        {badge}
      </span>
    )}
  </button>
)

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200 disabled:bg-gray-100 disabled:text-gray-500"

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1 flex items-center justify-between gap-2 text-sm font-medium text-gray-700">
      {label}
      {hint && <span className="text-xs font-normal text-gray-400">{hint}</span>}
    </span>
    {children}
  </label>
)

// A saved secret is never sent back to the browser, so the box shows its last
// four characters and stays empty. Typing replaces it; leaving it alone keeps it.
const SecretField = ({ label, hint, saved, savedHint, value, onChange }) => (
  <Field label={label} hint={hint}>
    <input
      className={inputClass}
      type="password"
      autoComplete="new-password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={saved ? `Saved (${savedHint}) — type to replace` : "Not set yet"}
    />
  </Field>
)

const Rule = ({ title, children }) => (
  <li className="flex gap-2">
    <Check size={15} className="mt-0.5 shrink-0 text-lime-600" />
    <span>
      <span className="font-medium text-gray-900">{title}.</span> {children}
    </span>
  </li>
)

export default AdminWhatsApp
