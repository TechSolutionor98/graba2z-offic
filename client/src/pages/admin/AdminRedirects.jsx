"use client"

import { useState, useEffect, useMemo } from "react"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Plus, Search, Edit, Trash2, ExternalLink, CornerDownRight, X, Check, AlertTriangle } from "lucide-react"
import { redirectsAPI } from "../../services/api"

// A redirect is two strings and a status, so the whole thing -- list, create,
// edit, delete -- lives on one screen. Sending the admin to a separate page to
// change one path would cost more clicks than the edit itself.
const BLANK = { redirectFrom: "", redirectTo: "", redirectType: "301", status: "Active", description: "" }

const TYPE_HELP = {
  301: "Permanent. Search engines move their ranking to the new address. Use this when the old page is gone for good.",
  302: "Temporary. Search engines keep the old address indexed. Use this for a sale page or a short campaign.",
  307: "Temporary, and the browser must not change POST into GET.",
  308: "Permanent, and the browser must not change POST into GET.",
}

const AdminRedirects = () => {
  const { showToast } = useToast()
  const [redirects, setRedirects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [form, setForm] = useState(null) // null = closed, object = open
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await redirectsAPI.getAll()
      setRedirects(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching redirects:", error)
      showToast("Could not load redirects", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Filtering happens here rather than on the server. The whole list arrives in
  // one request and these are short strings, so a round trip per keystroke
  // would be slower than the filter and would add load to the API for nothing.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return redirects.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false
      if (!q) return true
      return (
        (r.redirectFrom || "").toLowerCase().includes(q) ||
        (r.redirectTo || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      )
    })
  }, [redirects, search, statusFilter])

  const counts = useMemo(
    () => ({
      total: redirects.length,
      active: redirects.filter((r) => r.status === "Active").length,
      inactive: redirects.filter((r) => r.status !== "Active").length,
    }),
    [redirects],
  )

  // Caught here rather than by the server, because the server's answer for a
  // loop is a redirect that works once and then sends the visitor straight back.
  const formProblem = useMemo(() => {
    if (!form) return null
    const from = (form.redirectFrom || "").trim()
    const to = (form.redirectTo || "").trim()
    if (!from || !to) return null
    if (!from.startsWith("/")) return "The “from” path has to start with /"
    if (from.toLowerCase() === to.toLowerCase()) return "This sends the address to itself, which is a loop"
    const clash = redirects.find(
      (r) => r._id !== form._id && (r.redirectFrom || "").toLowerCase() === from.toLowerCase(),
    )
    if (clash) return `Another redirect already covers ${from} — it sends to ${clash.redirectTo}`
    return null
  }, [form, redirects])

  const save = async () => {
    const payload = {
      redirectFrom: (form.redirectFrom || "").trim(),
      redirectTo: (form.redirectTo || "").trim(),
      redirectType: form.redirectType,
      status: form.status,
      description: (form.description || "").trim(),
    }
    if (!payload.redirectFrom || !payload.redirectTo) {
      showToast("Both the from and to addresses are needed", "error")
      return
    }
    setSaving(true)
    try {
      if (form._id) {
        await redirectsAPI.update(form._id, payload)
        showToast("Redirect updated", "success")
      } else {
        await redirectsAPI.create(payload)
        showToast("Redirect created", "success")
      }
      setForm(null)
      await load()
    } catch (error) {
      showToast(error?.message || "Could not save the redirect", "error")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (row) => {
    try {
      await redirectsAPI.delete(row._id)
      showToast("Redirect deleted", "success")
      setConfirmDelete(null)
      await load()
    } catch (error) {
      showToast(error?.message || "Could not delete the redirect", "error")
    }
  }

  const toggleStatus = async (row) => {
    try {
      await redirectsAPI.update(row._id, { ...row, status: row.status === "Active" ? "Inactive" : "Active" })
      await load()
    } catch (error) {
      showToast("Could not change the status", "error")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Redirects</h1>
              <p className="text-gray-600 mt-2">
                Send an address that no longer exists to one that does — so a deleted blog or a renamed product keeps
                working for anyone holding the old link.
              </p>
            </div>
            <button
              onClick={() => setForm({ ...BLANK })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
            >
              <Plus size={20} />
              Add Redirect
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total", value: counts.total, tone: "text-gray-900" },
              { label: "Active", value: counts.active, tone: "text-green-600" },
              { label: "Inactive", value: counts.inactive, tone: "text-gray-400" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.tone}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by address or note..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="Active">Active only</option>
                <option value="Inactive">Inactive only</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <CornerDownRight className="mx-auto text-gray-300" size={40} />
                <p className="text-gray-500 mt-3">
                  {redirects.length === 0 ? "No redirects yet." : "Nothing matches that search."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <code className="text-sm text-gray-900 break-all">{r.redirectFrom}</code>
                          {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-1.5">
                            <CornerDownRight size={14} className="text-gray-400 mt-1 shrink-0" />
                            <code className="text-sm text-gray-700 break-all">{r.redirectTo}</code>
                            {/^https?:\/\//.test(r.redirectTo || "") && (
                              <ExternalLink size={12} className="text-gray-400 mt-1 shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              r.redirectType === "301" || r.redirectType === "308"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {r.redirectType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(r)}
                            title="Click to switch it on or off"
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                              r.status === "Active"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {r.status}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setForm({ ...r })}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(r)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filtered.length > 0 && (
            <p className="text-xs text-gray-500 mt-4">
              Showing {filtered.length} of {redirects.length}
            </p>
          )}
        </div>
      </div>

      {/* Create / edit */}
      {form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{form._id ? "Edit redirect" : "New redirect"}</h2>
              <button onClick={() => setForm(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From — the address people have</label>
                <input
                  type="text"
                  value={form.redirectFrom}
                  onChange={(e) => setForm({ ...form, redirectFrom: e.target.value })}
                  placeholder="/ae-en/blogs/an-old-post"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must start with <code>/</code>. Write the path only, not the domain.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To — where they should land</label>
                <input
                  type="text"
                  value={form.redirectTo}
                  onChange={(e) => setForm({ ...form, redirectTo: e.target.value })}
                  placeholder="/ae-en/blogs"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A path on this site, or a full https:// address somewhere else.
                </p>
              </div>

              {formProblem && (
                <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{formProblem}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.redirectType}
                    onChange={(e) => setForm({ ...form, redirectType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["301", "302", "307", "308"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                {TYPE_HELP[form.redirectType]}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Why this exists — e.g. blog removed Nov 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Worth filling in. In a year nobody remembers why a redirect was added.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setForm(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Check size={18} />
                {saving ? "Saving…" : form._id ? "Save changes" : "Create redirect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation. Deleting a redirect breaks every link that relies
          on it, and the row gives no hint of how many that is, so it asks. */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900">Delete this redirect?</h2>
            <p className="text-sm text-gray-600 mt-2">
              Anyone who follows <code className="text-gray-900">{confirmDelete.redirectFrom}</code> will get a “page
              not found” instead of being sent on.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Keep it
              </button>
              <button
                onClick={() => remove(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRedirects
