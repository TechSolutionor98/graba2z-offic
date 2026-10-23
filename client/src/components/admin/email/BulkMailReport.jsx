"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Ban, Mail, Search } from "lucide-react"

import config from "../../../config/config"
import { describeApiError } from "../../../utils/apiError"

/**
 * What went out, and who has opted out.
 *
 * Lives beside the campaigns rather than inside the template editor: somebody
 * asking "what did we send" is thinking about campaigns, not about the screen
 * where emails are designed.
 */

const SOURCE_LABELS = {
  users: "Users",
  newsletter: "Newsletter",
  callbacks: "Callbacks",
  bulk: "Bulk Purchase",
}

const getAdminToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"

const BulkMailReport = () => {
  const [tab, setTab] = useState("sent")
  const [error, setError] = useState("")

  const [logs, setLogs] = useState({ rows: [], total: 0, pages: 1, sent: 0, failed: 0 })
  const [logSearch, setLogSearch] = useState("")
  const [logStatus, setLogStatus] = useState("all")
  const [logPage, setLogPage] = useState(1)

  const [gone, setGone] = useState({ rows: [], total: 0, pages: 1 })
  const [goneSearch, setGoneSearch] = useState("")
  const [gonePage, setGonePage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState("")
  const [notice, setNotice] = useState("")

  const API = config.API_URL
  const authHeader = { headers: { Authorization: `Bearer ${getAdminToken()}` } }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // Held back briefly so typing a search does not fire a request per letter.
    const timer = setTimeout(() => {
      const request =
        tab === "sent"
          ? axios
              .get(`${API}/api/email-templates/logs`, {
                ...authHeader,
                params: { search: logSearch, status: logStatus, page: logPage, limit: 50 },
              })
              .then((r) => !cancelled && setLogs(r.data))
          : axios
              .get(`${API}/api/campaigns/suppression/list`, {
                ...authHeader,
                params: { search: goneSearch, page: gonePage, limit: 50 },
              })
              .then((r) => !cancelled && setGone(r.data))

      request
        .catch((e) => !cancelled && setError(describeApiError(e, "The report could not be loaded")))
        .finally(() => !cancelled && setLoading(false))
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, logSearch, logStatus, logPage, goneSearch, gonePage])

  useEffect(() => {
    setLogPage(1)
  }, [logSearch, logStatus])
  useEffect(() => {
    setGonePage(1)
  }, [goneSearch])

  /**
   * Put somebody back on the list, because they asked.
   *
   * One named address at a time and nothing else: an opt-out is only ever
   * undone at the person's own request, so there is no way to do it in bulk.
   */
  const resubscribe = async (email) => {
    if (!window.confirm(`Put ${email} back on the list?\n\nOnly do this if they have asked you to.`)) return
    setBusy(email)
    setError("")
    setNotice("")
    try {
      const { data } = await axios.delete(`${API}/api/campaigns/suppression`, { ...authHeader, params: { email } })
      setNotice(data.message)
      setGone({ ...gone, rows: gone.rows.filter((r) => r.email !== email), total: Math.max(0, gone.total - 1) })
    } catch (e) {
      setError(describeApiError(e, "That did not work"))
    } finally {
      setBusy("")
    }
  }

  const pager = (page, pages, total, setPage) =>
    pages > 1 && (
      <div className="flex items-center justify-between border-t border-gray-200 p-3 text-xs text-gray-500">
        <span>{total} in total</span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((n) => n - 1)}
            className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
          >
            Back
          </button>
          <span>
            {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((n) => n + 1)}
            className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </span>
      </div>
    )

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        Every email this shop has sent, and everyone who has opted out of marketing.
      </p>

      {notice && (
        <p className="mb-4 rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-800">{notice}</p>
      )}

      {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="mb-4 mt-6 flex gap-1 border-b border-gray-200">
            {[
              { id: "sent", label: `Sent mail${logs.total ? ` (${logs.sent + logs.failed})` : ""}` },
              { id: "gone", label: `Unsubscribed${gone.total ? ` (${gone.total})` : ""}` },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
                  tab === id ? "border-lime-500 text-lime-700" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ------------------------------------------------- sent mail */}
          {tab === "sent" ? (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
                <div className="relative min-w-[220px] flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search an address, subject or template"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {[
                  { key: "all", label: `All (${logs.sent + logs.failed})` },
                  { key: "sent", label: `Sent (${logs.sent})` },
                  { key: "failed", label: `Failed (${logs.failed})` },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setLogStatus(option.key)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                      logStatus === option.key ? "bg-lime-50 text-lime-700" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="p-10 text-center text-sm text-gray-500">Loading…</p>
              ) : logs.rows.length === 0 ? (
                <div className="py-16 text-center">
                  <Mail size={30} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-600">Nothing sent yet</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Tests, campaigns and order mail all appear here once they go out.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                          <th className="p-3">To</th>
                          <th className="p-3">Subject</th>
                          <th className="p-3">From</th>
                          <th className="p-3">Source</th>
                          <th className="p-3">When</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.rows.map((row) => (
                          <tr key={row._id} className="border-b border-gray-100 last:border-b-0">
                            <td className="p-3 font-medium text-gray-900">{row.to}</td>
                            <td className="max-w-[240px] truncate p-3 text-gray-700">{row.subject || "—"}</td>
                            <td className="p-3 text-xs text-gray-500">{row.from || row.sender || "—"}</td>
                            <td className="p-3 text-xs text-gray-500">
                              {row.source || "—"}
                              {row.templateName && (
                                <span className="block truncate text-gray-400">{row.templateName}</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap p-3 text-xs text-gray-500">
                              {new Date(row.createdAt).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  row.status === "sent" ? "bg-lime-100 text-lime-700" : "bg-red-100 text-red-700"
                                }`}
                              >
                                {row.status}
                              </span>
                              {row.error && (
                                <span className="mt-0.5 block max-w-[200px] truncate text-[11px] text-red-600">
                                  {row.error}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pager(logPage, logs.pages, logs.total, setLogPage)}
                </>
              )}
            </div>
          ) : (
            /* --------------------------------------------- unsubscribed */
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-3">
                <div className="relative max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={goneSearch}
                    onChange={(e) => setGoneSearch(e.target.value)}
                    placeholder="Search an address"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  These people are never sent a campaign. Put someone back on only if they have asked you to —
                  they can also do it themselves from the link in any of our emails, or by using the subscribe
                  box on the site.
                </p>
              </div>

              {loading ? (
                <p className="p-10 text-center text-sm text-gray-500">Loading…</p>
              ) : gone.rows.length === 0 ? (
                <div className="py-16 text-center">
                  <Ban size={30} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-600">Nobody has unsubscribed</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Anyone who opts out appears here and is never sent a campaign again.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                          <th className="p-3">Email</th>
                          <th className="p-3">On which lists</th>
                          <th className="p-3">Why</th>
                          <th className="p-3">When</th>
                          <th className="p-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {gone.rows.map((row) => (
                          <tr key={row._id} className="border-b border-gray-100 last:border-b-0">
                            <td className="p-3 font-medium text-gray-900">{row.email}</td>
                            <td className="p-3">
                              {row.sources?.length ? (
                                <span className="flex flex-wrap gap-1">
                                  {row.sources.map((key) => (
                                    <span
                                      key={key}
                                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                                    >
                                      {SOURCE_LABELS[key] || key}
                                    </span>
                                  ))}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Not on any list</span>
                              )}
                            </td>
                            <td className="p-3 text-xs text-gray-500">
                              <span className="capitalize">{row.reason || "unsubscribed"}</span>
                              {row.note && <span className="block text-gray-400">&ldquo;{row.note}&rdquo;</span>}
                            </td>
                            <td className="whitespace-nowrap p-3 text-xs text-gray-500">
                              {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => resubscribe(row.email)}
                                disabled={busy === row.email}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                {busy === row.email ? "Working…" : "Put back on"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pager(gonePage, gone.pages, gone.total, setGonePage)}
                </>
              )}
            </div>
      )}
    </div>
  )
}

export default BulkMailReport
