"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"
import { AlertTriangle, ArrowLeft, Blocks, Check, ChevronDown, Code, Copy, Download, FileUp, Images, Link2, LayoutTemplate, Loader2, Mail, Pencil, Plus, Send, Star, Trash2, Upload, X } from "lucide-react"

import AdminSidebar from "../../components/admin/AdminSidebar"
import EmailBuilder from "../../components/admin/email/EmailBuilder"
import ImageManager from "../../components/admin/email/ImageManager"
import config from "../../config/config"
import { describeApiError } from "../../utils/apiError"
import { DEFAULT_SETTINGS, normalizeBlocks, renderEmailHtml } from "../../utils/emailBlocks"
import { EMAIL_PRESETS, PRESET_CATEGORIES } from "../../utils/emailPresets"
import { EMAIL_LAYOUTS } from "../../utils/emailLayouts"

/**
 * Email templates, built by dragging blocks rather than by writing HTML.
 *
 * A template is stored twice over: `blocks` is what the builder edits, `html` is
 * what gets sent. The HTML is re-rendered from the blocks on every save, so the
 * newsletter screen -- which only ever reads `html` -- needs no knowledge of any
 * of this and keeps working unchanged.
 *
 * Templates written before the builder existed have no blocks. Those open in the
 * HTML editor, because turning hand-written HTML back into blocks would mean
 * guessing, and guessing wrong would quietly discard somebody's email.
 */

const TYPE_LABELS = {
  newsletter: "Newsletter",
  order: "Order",
  verification: "Verification",
  custom: "Custom",
}

const emptyTemplate = {
  name: "",
  type: "newsletter",
  subject: "",
  html: "",
  isDefault: false,
  blocks: [],
  settings: { ...DEFAULT_SETTINGS },
}

/**
 * The grey wireframe on a layout card.
 *
 * Bars and boxes rather than a shrunken rendering of the real blocks: at this
 * size a real email is an unreadable smudge, and the card is there to show the
 * shape, which a wireframe shows better.
 */
const Wireframe = ({ rows }) => {
  const piece = (row, key) => {
    if (row.kind === "bar")
      return <div key={key} className="rounded-sm bg-gray-400" style={{ width: `${row.width}%`, height: row.height }} />
    if (row.kind === "line")
      return <div key={key} className="rounded-sm bg-gray-200" style={{ width: `${row.width ?? 100}%`, height: 5 }} />
    if (row.kind === "box")
      return <div key={key} className="w-full rounded bg-sky-200" style={{ height: row.height }} />
    if (row.kind === "rule") return <div key={key} className="h-px w-full bg-gray-200" />
    if (row.kind === "cols")
      return (
        <div key={key} className="flex gap-1.5">
          {Array.from({ length: row.count }).map((_, index) => (
            <div key={index} className="flex flex-1 flex-col gap-1">
              {row.rows.map((inner, innerIndex) => piece(inner, `${index}-${innerIndex}`))}
            </div>
          ))}
        </div>
      )
    if (row.kind === "split")
      return (
        <div key={key} className="flex items-start gap-1.5">
          <div className="flex flex-1 flex-col gap-1">{row.left.map((inner, i) => piece(inner, i))}</div>
          <div className="w-1/3">{piece(row.right, "r")}</div>
        </div>
      )
    return null
  }

  return <div className="flex flex-col gap-1.5">{rows.map((row, index) => piece(row, index))}</div>
}

const getAdminToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyTemplate)
  // "builder" for block templates, "html" for ones written by hand.
  const [mode, setMode] = useState("builder")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [saving, setSaving] = useState(false)
  const [testTo, setTestTo] = useState("")
  const [testing, setTesting] = useState(false)
  // "mine" is what the shop has saved; "defaults" is the set it keeps ready.
  const [tab, setTab] = useState("defaults")
  const [category, setCategory] = useState("All")
  const [libraryOpen, setLibraryOpen] = useState(false)
  // The import panel: paste markup, upload a file, or read a web address.
  const [importWay, setImportWay] = useState("paste")
  const [importText, setImportText] = useState("")
  const [importUrl, setImportUrl] = useState("")
  const [importing, setImporting] = useState(false)
  // Whether the builder card has opened to show the layout choices beneath it.
  const [layoutsOpen, setLayoutsOpen] = useState(false)
  // What the template looked like when it was last saved (or opened). Comparing
  // against it is the only honest way to know whether anything has changed --
  // a flag set on every edit cannot tell an edit from an edit-and-undo.
  const savedSnapshot = useRef("")
  const [leaving, setLeaving] = useState(false)

  // `editing` carries three different things: "choose" and "import" are screens
  // on the way in, anything else is a template actually open in an editor.
  const isEditingTemplate = Boolean(editing) && editing !== "choose" && editing !== "import"

  // Only the parts that end up saved. Anything else -- which panel is open, what
  // is typed in the test-send box -- is not a change to the template.
  const snapshotOf = (value) =>
    JSON.stringify({
      name: value.name,
      subject: value.subject,
      type: value.type,
      isDefault: value.isDefault,
      blocks: value.blocks,
      settings: value.settings,
      html: value.html,
    })

  const dirty = isEditingTemplate && snapshotOf(form) !== savedSnapshot.current

  const API = config.API_URL
  const authHeader = { headers: { Authorization: `Bearer ${getAdminToken()}` } }

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/api/email-templates`)
      setTemplates(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(describeApiError(e, "Could not load templates"))
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [API])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Closing the tab loses the same work the dialog protects. The browser shows
  // its own wording here; all a page can do is ask for the prompt.
  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const startNew = () => {
    setEditing("choose")
    setError("")
  }

  /** Begin a blank draft in one of the two editors. */
  const startBlank = (which) => {
    setEditing("new")
    setForm({ ...emptyTemplate, blocks: [], settings: { ...DEFAULT_SETTINGS } })
    setMode(which)
    savedSnapshot.current = snapshotOf({ ...emptyTemplate, blocks: [], settings: { ...DEFAULT_SETTINGS } })
    setError("")
  }

  /** Begin from markup that came from somewhere else. */
  const startFromHtml = (html) => {
    if (!String(html || "").trim()) {
      setError("There was no HTML to import.")
      return
    }
    setEditing("new")
    // No blocks: imported markup cannot be turned back into blocks without
    // guessing, and a wrong guess would silently discard somebody's design.
    const next = { ...emptyTemplate, html, blocks: [], settings: { ...DEFAULT_SETTINGS } }
    setForm(next)
    savedSnapshot.current = snapshotOf(next)
    setMode("html")
    setImportText("")
    setImportUrl("")
    setError("")
  }

  const importFromUrl = async () => {
    setError("")
    try {
      setImporting(true)
      const { data } = await axios.post(`${API}/api/email-templates/import-url`, { url: importUrl }, authHeader)
      startFromHtml(data.html)
    } catch (e) {
      setError(describeApiError(e, "That address could not be imported"))
    } finally {
      setImporting(false)
    }
  }

  const importFromFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => startFromHtml(String(reader.result || ""))
    reader.onerror = () => setError("That file could not be read.")
    reader.readAsText(file)
  }

  const startFromLayout = (layout) => {
    const built = layout.build()
    setEditing("new")
    const next = { ...emptyTemplate, blocks: built.blocks, settings: built.settings }
    setForm(next)
    setMode("builder")
    setLayoutsOpen(false)
    savedSnapshot.current = snapshotOf(next)
    setError("")
  }

  /**
   * A default is a starting point, never a thing you edit.
   *
   * `setEditing("new")` is what guarantees it: saving goes through the create
   * endpoint, so the result is a new row in My Templates and the default is
   * untouched. The defaults themselves are code, not database rows, so there is
   * no edit path to close off.
   */
  const startFromPreset = (preset) => {
    const built = preset.build()
    setEditing("new")
    const next = {
      ...emptyTemplate,
      name: preset.id === "blank" ? "" : preset.name,
      fromDefault: preset.id !== "blank",
      blocks: built.blocks,
      settings: built.settings,
    }
    setForm(next)
    setMode("builder")
    savedSnapshot.current = snapshotOf(next)
    setError("")
  }

  const startEdit = (tpl) => {
    const hasBlocks = Array.isArray(tpl.blocks) && tpl.blocks.length > 0
    const next = {
      ...emptyTemplate,
      ...tpl,
      blocks: hasBlocks ? normalizeBlocks(tpl.blocks) : [],
      settings: { ...DEFAULT_SETTINGS, ...(tpl.settings || {}) },
    }
    setEditing(tpl._id)
    setForm(next)
    setMode(hasBlocks ? "builder" : "html")
    savedSnapshot.current = snapshotOf(next)
    setError("")
  }

  /** Closing the editor: straight out if nothing changed, a question if it did. */
  const requestClose = () => {
    if (dirty) setLeaving(true)
    else cancelEdit()
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(emptyTemplate)
    savedSnapshot.current = ""
    setLeaving(false)
    setError("")
  }

  // What this template would send right now. Rendered on demand rather than kept
  // in state, so a test send and a save can never disagree about the content.
  const currentHtml = () =>
    mode === "builder" ? renderEmailHtml(form.blocks, form.settings) : form.html

  const sendTest = async () => {
    setError("")
    setNotice("")
    try {
      setTesting(true)
      const { data } = await axios.post(
        `${API}/api/email-templates/test-send`,
        // A template carries no subject of its own any more -- the campaign that
        // sends it supplies one -- so a test is labelled with the template name.
        { to: testTo, subject: form.name || "Email template", html: currentHtml() },
        authHeader,
      )
      // The detail line matters: "accepted by the mail server" is not the same
      // as "arrived", and the difference is where to go looking if it does not.
      setNotice([data?.message, data?.detail].filter(Boolean).join(" "))
    } catch (e) {
      setError(describeApiError(e, "The test could not be sent"))
    } finally {
      setTesting(false)
    }
  }

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(currentHtml())
      setNotice("HTML copied to the clipboard.")
    } catch {
      setError("Could not copy. Switch to HTML mode and copy it by hand.")
    }
  }

  const downloadHtml = () => {
    const blob = new Blob([currentHtml()], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${(form.name || "email-template").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  const save = async (e, { asDraft = false, thenClose = false } = {}) => {
    e?.preventDefault?.()
    setError("")

    // The builder is the source of truth in builder mode, so the HTML is
    // regenerated here rather than trusted from state -- there is no way for the
    // two to be saved out of step.
    // A draft is still a real template; the flag only labels it as unfinished so
    // half-written work is not mistaken for something ready to send.
    const draftSafe = asDraft ? { ...form, name: form.name.trim() || "Untitled draft" } : form
    const payload =
      mode === "builder"
        ? { ...draftSafe, isDraft: asDraft, html: renderEmailHtml(draftSafe.blocks, draftSafe.settings) }
        : { ...draftSafe, isDraft: asDraft, blocks: undefined, settings: undefined }

    // A draft is allowed to be empty -- the point of it is not losing work that
    // is not finished yet.
    if (!asDraft && mode === "builder" && form.blocks.length === 0) {
      setError("Add at least one block before saving.")
      return
    }
    if (!asDraft && !form.name.trim()) {
      setError("Give the template a name before saving.")
      return
    }
    if (!asDraft && mode === "html" && !payload.html.trim()) {
      setError("The HTML cannot be empty.")
      return
    }

    try {
      setSaving(true)
      if (editing === "new") await axios.post(`${API}/api/email-templates`, payload, authHeader)
      else await axios.put(`${API}/api/email-templates/${editing}`, payload, authHeader)
      await fetchTemplates()
      savedSnapshot.current = snapshotOf(draftSafe)
      setLeaving(false)
      // Back to the shop's own templates, not to whichever tab was open when
      // the editor was entered -- the thing just saved is in this one, and
      // landing anywhere else looks like the save did nothing.
      setTab("mine")
      if (thenClose || !asDraft) cancelEdit()
      else setNotice("Draft saved.")
    } catch (err) {
      setError(describeApiError(err, "Failed to save template"))
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this template? This cannot be undone.")) return
    try {
      await axios.delete(`${API}/api/email-templates/${id}`, authHeader)
      await fetchTemplates()
    } catch (e) {
      setError(describeApiError(e, "Could not delete the template"))
    }
  }

  const setDefault = async (id) => {
    try {
      await axios.patch(`${API}/api/email-templates/${id}/default`, {}, authHeader)
      await fetchTemplates()
    } catch (e) {
      setError(describeApiError(e, "Could not set the default"))
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Mail className="text-lime-600" />
              Email Templates
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Build an email by dragging blocks into place. No HTML needed.
            </p>
          </div>
          {!editing && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setLibraryOpen(true)}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Images size={16} />
                Image Manager
              </button>
              <button
                onClick={startNew}
                className="flex items-center gap-2 rounded-md bg-lime-500 px-4 py-2 text-white hover:bg-lime-600"
              >
                <Plus size={16} />
                New Template
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <Check size={16} />
            <span className="flex-1">{notice}</span>
            <button onClick={() => setNotice("")} className="text-green-500 hover:text-green-800">
              <X size={16} />
            </button>
          </div>
        )}

        {editing === "choose" ? (
          /* How would you like to start? Three routes in, because a template can
             arrive three ways: built here, written as HTML, or brought in from
             somewhere else entirely. */
          <div className="mx-auto max-w-5xl">
            <button
              onClick={cancelEdit}
              className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft size={15} />
              Back to templates
            </button>

            <h2 className="text-2xl font-bold text-gray-900">New template</h2>
            <p className="mt-1 text-gray-600">How would you like to create it?</p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  id: "builder",
                  Icon: LayoutTemplate,
                  title: "Drag and drop builder",
                  body: "Pick a layout to start from, then drag blocks into place. No HTML needed.",
                  recommended: true,
                  expands: true,
                  action: () => setLayoutsOpen((open) => !open),
                },
                {
                  id: "html",
                  Icon: Code,
                  title: "HTML editor",
                  body: "Write or paste the markup yourself, with a live preview beside it.",
                  action: () => startBlank("html"),
                },
                {
                  id: "import",
                  Icon: FileUp,
                  title: "Import a template",
                  body: "Bring one in from a file, a web address, or pasted HTML.",
                  action: () => setEditing("import"),
                },
              ].map(({ id, Icon, title, body, recommended, expands, action }) => (
                <button
                  key={id}
                  onClick={action}
                  className={`group relative rounded-xl border bg-white p-6 text-left transition-all hover:border-lime-400 hover:shadow-md ${
                    expands && layoutsOpen ? "border-lime-500 shadow-md" : "border-gray-200"
                  }`}
                >
                  {recommended && (
                    <span className="absolute left-4 top-4 rounded bg-lime-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-lime-700">
                      Recommended
                    </span>
                  )}
                  <div className="mt-6 flex h-28 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-lime-50">
                    <Icon size={44} className="text-gray-300 group-hover:text-lime-500" strokeWidth={1.3} />
                  </div>
                  <h3 className="mt-4 flex items-center gap-1.5 text-base font-bold text-gray-900 group-hover:text-lime-700">
                    {title}
                    {expands && (
                      <ChevronDown size={16} className={`transition-transform ${layoutsOpen ? "rotate-180" : ""}`} />
                    )}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-gray-500">{body}</p>
                </button>
              ))}
            </div>

            {/* The layout tray, under the card that opened it. A layout is the
                arrangement without the words -- different from the defaults
                next door, which are finished emails about something. */}
            {layoutsOpen && (
              <div className="relative mt-3 rounded-xl bg-gray-800 p-5">
                <span className="absolute -top-2 left-24 h-4 w-4 rotate-45 bg-gray-800" />
                <p className="mb-3 text-sm font-semibold text-white">Choose a layout to start from</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {EMAIL_LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => startFromLayout(layout)}
                      className="group rounded-lg bg-white p-2.5 text-left transition-transform hover:-translate-y-0.5 hover:ring-2 hover:ring-lime-400"
                    >
                      <div className="rounded border border-gray-100 bg-white p-2.5">
                        <Wireframe rows={layout.skeleton} />
                      </div>
                      <p className="mt-2 text-center text-sm font-semibold text-gray-800 group-hover:text-lime-700">
                        {layout.name}
                      </p>
                      <p className="mt-0.5 text-center text-[11px] leading-snug text-gray-400">{layout.description}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => startBlank("builder")}
                  className="mt-3 text-xs font-semibold text-lime-400 hover:underline"
                >
                  Or start from a blank canvas
                </button>
              </div>
            )}

            {EMAIL_PRESETS.length > 0 && (
              <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Or start from one of your defaults</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {EMAIL_PRESETS.length} ready to use, already written for GrabAtoZ.
                </p>
                <button
                  onClick={() => {
                    cancelEdit()
                    setTab("defaults")
                  }}
                  className="mt-2.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  See the defaults
                </button>
              </div>
            )}
          </div>
        ) : editing === "import" ? (
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => setEditing("choose")}
              className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900">Import a template</h2>
            <p className="mt-1 text-gray-600">It opens in the HTML editor, where you can check it before saving.</p>

            <div className="mt-5 rounded-xl border border-gray-200 bg-white">
              <div className="flex gap-1 border-b border-gray-200 px-3 pt-3">
                {[
                  { id: "paste", Icon: Code, label: "Paste HTML" },
                  { id: "file", Icon: Upload, label: "Upload a file" },
                  { id: "url", Icon: Link2, label: "From a web address" },
                ].map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setImportWay(id)}
                    className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${
                      importWay === id ? "border-lime-600 text-lime-700" : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {importWay === "paste" && (
                  <>
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      rows={12}
                      placeholder="<html>…"
                      className={`${inputClass} font-mono text-xs`}
                    />
                    <button
                      onClick={() => startFromHtml(importText)}
                      disabled={!importText.trim()}
                      className="mt-3 rounded-md bg-lime-500 px-5 py-2 font-medium text-white hover:bg-lime-600 disabled:opacity-40"
                    >
                      Import
                    </button>
                  </>
                )}

                {importWay === "file" && (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 hover:border-lime-400 hover:bg-lime-50">
                    <Upload size={28} className="text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-700">Choose an .html file</span>
                    <span className="mt-0.5 text-xs text-gray-400">Or drag one onto this box</span>
                    <input
                      type="file"
                      accept=".html,.htm,text/html"
                      hidden
                      onChange={(e) => importFromFile(e.target.files?.[0])}
                    />
                  </label>
                )}

                {importWay === "url" && (
                  <>
                    <input
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://example.com/newsletter.html"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      The address must be reachable from the public internet. Addresses on a private network are
                      refused.
                    </p>
                    <button
                      onClick={importFromUrl}
                      disabled={importing || !importUrl.trim()}
                      className="mt-3 flex items-center gap-2 rounded-md bg-lime-500 px-5 py-2 font-medium text-white hover:bg-lime-600 disabled:opacity-40"
                    >
                      {importing ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
                      {importing ? "Reading…" : "Import"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-snug text-amber-900">
              An imported template opens in the HTML editor and stays there — markup written elsewhere cannot be turned
              back into blocks without guessing, and a wrong guess would quietly discard the design.
            </p>
          </div>
        ) : isEditingTemplate && mode === "builder" ? null : isEditingTemplate ? (
          <form onSubmit={save} className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Template name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`mt-1 ${inputClass}`}
                    placeholder="Weekend offers"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={`mt-1 ${inputClass}`}
                  >
                    {Object.entries(TYPE_LABELS).map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                  />
                  Use as the default for this type
                </label>

                <div className="flex gap-1">
                  {[
                    { id: "builder", Icon: Blocks, text: "Builder" },
                    { id: "html", Icon: Code, text: "HTML" },
                  ].map(({ id, Icon, text }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMode(id)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium ${
                        mode === id
                          ? "border-lime-500 bg-lime-50 text-lime-700"
                          : "border-gray-300 bg-white text-gray-600"
                      }`}
                    >
                      <Icon size={14} />
                      {text}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "html" && form.blocks.length > 0 && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                  Saving in HTML mode drops the blocks, so this template can no longer be opened in the builder.
                </p>
              )}
            </div>

            {mode === "builder" ? (
              <EmailBuilder
                blocks={form.blocks}
                settings={form.settings}
                onChange={({ blocks, settings }) => setForm({ ...form, blocks, settings })}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">HTML</p>
                  <textarea
                    value={form.html}
                    onChange={(e) => setForm({ ...form, html: e.target.value })}
                    rows={22}
                    className={`${inputClass} font-mono text-xs`}
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <p className="border-b border-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Preview
                  </p>
                  <iframe title="Email preview" srcDoc={form.html} sandbox="" className="block h-[520px] w-full border-0" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-md bg-lime-500 px-5 py-2 font-medium text-white hover:bg-lime-600 disabled:opacity-60"
              >
                <Check size={16} />
                {saving ? "Saving…" : "Save template"}
              </button>
              <button
                type="button"
                onClick={requestClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <span className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />

              <button
                type="button"
                onClick={copyHtml}
                className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Copy size={14} />
                Copy HTML
              </button>
              <button
                type="button"
                onClick={downloadHtml}
                className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Download size={14} />
                Download
              </button>

              {/* A preview is a browser rendering the markup. What matters is
                  what Gmail and Outlook do to it, and the only way to know that
                  is to send one and look. */}
              <div className="ml-auto flex items-center gap-1.5">
                <input
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="you@example.com"
                  className="w-48 rounded-md border border-gray-300 px-2.5 py-2 text-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
                <button
                  type="button"
                  onClick={sendTest}
                  disabled={testing || !testTo.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  <Send size={14} />
                  {testing ? "Sending…" : "Send test"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            {/* Two tabs: what the shop has saved, and the ready-made set to start
                from. A template is only ever created from a default -- picking
                one builds a new draft rather than editing the default itself. */}
            <div className="mb-4 flex gap-1 border-b border-gray-200">
              {[
                { id: "defaults", label: `Default Templates (${EMAIL_PRESETS.length})` },
                { id: "mine", label: `My Templates${templates.length ? ` (${templates.length})` : ""}` },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
                    tab === id ? "border-lime-600 text-lime-700" : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "defaults" && EMAIL_PRESETS.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {PRESET_CATEGORIES.map((name) => (
                  <button
                    key={name}
                    onClick={() => setCategory(name)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
                      category === name ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {loading && tab === "mine" ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-lime-500" />
              </div>
            ) : tab === "defaults" ? (
              EMAIL_PRESETS.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                  <LayoutTemplate size={32} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-600">No default templates yet</p>
                  <p className="mt-1 text-xs text-gray-400">
                    The ones GrabAtoZ keeps as its defaults will live here.
                  </p>
                </div>
              ) : (
              <>
              <p className="mb-4 rounded-lg bg-gray-100 px-4 py-2.5 text-xs text-gray-600">
                These never change. Picking one starts a new template from it — your edits are saved into
                <span className="font-semibold"> My Templates</span>, and the default stays as it is.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {EMAIL_PRESETS.filter((p) => category === "All" || p.category === category || p.id === "blank").map(
                  (preset) => {
                    const built = preset.build()
                    return (
                      <div
                        key={preset.id}
                        className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                      >
                        {/* A live render rather than a screenshot: the card can
                            never show a layout the builder no longer produces. */}
                        <div className="relative h-56 overflow-hidden border-b border-gray-100 bg-gray-50">
                          {built.blocks.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-gray-300">
                              <Plus size={36} />
                            </div>
                          ) : (
                            <iframe
                              title={preset.name}
                              srcDoc={renderEmailHtml(built.blocks, built.settings)}
                              sandbox=""
                              scrolling="no"
                              className="pointer-events-none border-0"
                              style={{
                                width: 600,
                                height: 1120,
                                transform: "scale(0.42)",
                                transformOrigin: "top left",
                              }}
                            />
                          )}
                          <button
                            onClick={() => startFromPreset(preset)}
                            className="absolute inset-0 flex items-center justify-center bg-lime-600/0 opacity-0 transition-all group-hover:bg-lime-600/80 group-hover:opacity-100"
                          >
                            <span className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-lime-700">
                              Use this template
                            </span>
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-900">{preset.name}</p>
                          <p className="mt-0.5 text-xs leading-snug text-gray-500">{preset.description}</p>
                        </div>
                      </div>
                    )
                  },
                )}
              </div>
              </>
              )
            ) : templates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <Mail size={32} className="mx-auto text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-600">No templates saved yet</p>
                <p className="mt-1 text-xs text-gray-400">Build one from scratch, or import an email you already have.</p>
                <button
                  onClick={() => setEditing("choose")}
                  className="mt-3 rounded-md bg-lime-500 px-4 py-2 text-sm font-medium text-white hover:bg-lime-600"
                >
                  New template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((tpl) => (
                  <div key={tpl._id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
                    <div className="relative h-56 overflow-hidden border-b border-gray-100 bg-gray-50">
                      <iframe
                        title={tpl.name}
                        srcDoc={tpl.html}
                        sandbox=""
                        scrolling="no"
                        className="pointer-events-none border-0"
                        style={{ width: 600, height: 1120, transform: "scale(0.42)", transformOrigin: "top left" }}
                      />
                      <button
                        onClick={() => startEdit(tpl)}
                        className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all group-hover:bg-gray-900/70 group-hover:opacity-100"
                      >
                        <span className="flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900">
                          <Pencil size={14} />
                          Edit
                        </span>
                      </button>
                      <span className="absolute left-2 top-2 flex gap-1">
                        {tpl.isDraft && (
                          <span className="inline-flex items-center rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            Draft
                          </span>
                        )}
                        {tpl.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded bg-lime-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            <Star size={10} className="fill-white" />
                            Default
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-gray-900">{tpl.name}</p>
                      {tpl.subject && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">{tpl.subject}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                          {TYPE_LABELS[tpl.type] || tpl.type}
                        </span>
                        <div className="flex items-center gap-1">
                          {!tpl.isDefault && (
                            <button
                              onClick={() => setDefault(tpl._id)}
                              title="Set as default"
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-lime-700"
                            >
                              <Star size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTemplate(tpl._id)}
                            title="Delete"
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <ImageManager open={libraryOpen} onClose={() => setLibraryOpen(false)} />

        {/* Leaving with unsaved work. Three ways out, because there are three
            honest answers: keep going, keep the work but do not call it
            finished, or throw it away. Discard is last and plainly worded --
            it is the only one that loses anything. */}
        {leaving && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900">You have unsaved changes</h3>
              <p className="mt-1.5 text-sm leading-snug text-gray-600">
                {form.name.trim() ? `"${form.name.trim()}"` : "This template"} has changes that are not saved yet.
                Save it as a draft to come back to it later, or discard it.
              </p>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => save(null, { asDraft: true, thenClose: true })}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-lime-500 px-4 py-2.5 font-medium text-white hover:bg-lime-600 disabled:opacity-60"
                >
                  <FileUp size={16} />
                  {saving ? "Saving…" : "Save as draft and close"}
                </button>
                <button
                  type="button"
                  onClick={() => setLeaving(false)}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Discard my changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The constructor takes over the screen: a side panel plus an admin
            sidebar plus the email leaves nothing for the email itself. */}
        {isEditingTemplate && mode === "builder" && (
          <EmailBuilder
            blocks={form.blocks}
            settings={form.settings}
            onChange={({ blocks, settings }) => setForm({ ...form, blocks, settings })}
            meta={{ name: form.name, type: form.type, isDefault: form.isDefault, fromDefault: form.fromDefault }}
            onMetaChange={(patch) => setForm({ ...form, ...patch })}
            onSave={() => save()}
            onClose={requestClose}
            saving={saving}
            dirty={dirty}
            extraActions={
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={copyHtml}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Copy size={13} />
                    Copy HTML
                  </button>
                  <button
                    type="button"
                    onClick={downloadHtml}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Download size={13} />
                    Download
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-lime-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={sendTest}
                    disabled={testing || !testTo.trim()}
                    className="flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-40"
                  >
                    <Send size={12} />
                    {testing ? "…" : "Test"}
                  </button>
                </div>
                {error && <p className="text-[11px] leading-snug text-red-600">{error}</p>}
                {notice && <p className="text-[11px] leading-snug text-green-700">{notice}</p>}
              </div>
            }
          />
        )}
      </div>
    </div>
  )
}

export default AdminEmailTemplates
