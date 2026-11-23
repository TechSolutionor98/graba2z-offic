import { useEffect, useState } from "react"
import {
  Bell,
  Mail,
  MessageCircle,
  Search,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Phone,
  Tag,
} from "lucide-react"

import ConfirmDialog from "../../components/admin/ConfirmDialog"
import { backInStockAPI } from "../../services/api"
import { downloadCsv } from "../../utils/csvExport"
import { useToast } from "../../context/ToastContext"

const formatDateTime = (value) => {
  if (!value) return "N/A"
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const timeAgo = (value) => {
  if (!value) return ""
  const diffMs = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const AdminNotifyMe = () => {
  const { showToast } = useToast()

  const [subscriptions, setSubscriptions] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, notified: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // 'all', 'pending', 'notified'
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modals / Actions
  const [deleteId, setDeleteId] = useState(null)
  const [triggerItem, setTriggerItem] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await backInStockAPI.getAdminList({
        page,
        limit: 20,
        search: debouncedSearch,
        status: statusFilter,
      })
      setSubscriptions(data.subscriptions || [])
      setTotalPages(data.pages || 1)
      setTotalCount(data.total || 0)
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error("Failed to load back-in-stock alerts:", err)
      showToast(err.message || "Failed to load restock alerts", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [page, debouncedSearch, statusFilter])

  // Direct WhatsApp click-to-chat with customer
  const handleOpenWhatsApp = (sub) => {
    if (!sub.phone) return
    const cleanPhone = String(sub.phone).replace(/[^0-9]/g, "")
    const productName = sub.metadata?.productName || sub.product?.name || "Product"
    const productUrl = `${window.location.origin}/product/${encodeURIComponent(
      sub.metadata?.slug || sub.product?.slug || sub.product?._id,
    )}`

    const message = [
      `Hi ${sub.name || "Customer"},`,
      `Thank you for your interest in *${productName}* on Grabatoz.`,
      sub.variant ? `Option: *${sub.variant}*` : null,
      `Product Link: ${productUrl}`,
      ``,
      `We're happy to assist you with availability and order placement. Let us know how we can help!`,
    ]
      .filter(Boolean)
      .join("\n")

    const isMobileDevice =
      typeof navigator !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const waUrl = isMobileDevice
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    window.open(waUrl, "_blank", "noopener,noreferrer")
  }

  // Trigger manual alert email
  const handleConfirmTrigger = async () => {
    if (!triggerItem) return
    try {
      setActionLoading(true)
      await backInStockAPI.triggerSingleAlert(triggerItem._id)
      showToast("Restock alert email sent successfully!", "success")
      setTriggerItem(null)
      fetchSubscriptions()
    } catch (err) {
      showToast(err.message || "Failed to send alert email", "error")
    } finally {
      setActionLoading(false)
    }
  }

  // Delete subscription
  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      setActionLoading(true)
      await backInStockAPI.deleteSubscription(deleteId)
      showToast("Subscription deleted", "success")
      setDeleteId(null)
      fetchSubscriptions()
    } catch (err) {
      showToast(err.message || "Failed to delete subscription", "error")
    } finally {
      setActionLoading(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (!subscriptions.length) {
      showToast("No data to export", "error")
      return
    }

    const rows = subscriptions.map((s) => ({
      ID: s._id,
      "Customer Name": s.name,
      Email: s.email,
      Phone: s.phone,
      Country: s.country || "AE",
      "Product Name": s.metadata?.productName || s.product?.name || "N/A",
      SKU: s.metadata?.sku || s.product?.sku || "N/A",
      "Requested Option": s.variant || "Standard",
      Status: s.notified ? "Notified" : "Pending",
      "Requested At": formatDateTime(s.createdAt),
      "Notified At": s.notifiedAt ? formatDateTime(s.notifiedAt) : "N/A",
    }))

    downloadCsv(`grabatoz-restock-alerts-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  return (
    <div className="ml-64 p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-lime-100 p-2.5 text-lime-700 shadow-sm">
            <Bell className="h-6 w-6 text-lime-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restock Alerts / Notify Me</h1>
            <p className="text-sm text-gray-500">
              Customers waiting for out-of-stock electronics & variant restocks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={subscriptions.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => fetchSubscriptions()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-lime-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-lime-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Requests</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending (Waitlist)</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notified (Alert Sent)</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{stats.notified}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Filters / Search Bar */}
        <div className="border-b border-gray-200 p-4 bg-gray-50/70 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, phone, product..."
              className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-gray-200/70 p-1">
            {[
              { key: "all", label: "All Requests" },
              { key: "pending", label: "Pending" },
              { key: "notified", label: "Notified" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key)
                  setPage(1)
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Option / Variant</th>
                <th className="px-6 py-4">Requested Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-500">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-lime-500 border-t-transparent" />
                    Loading restock alerts...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-500">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <Bell className="h-7 w-7" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">No restock alerts found</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Requests will appear here when customers subscribe to out-of-stock products.
                    </p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const productName = sub.metadata?.productName || sub.product?.name || "Product"
                  const productImg = sub.metadata?.productImage || sub.product?.image || "/placeholder.png"
                  const sku = sub.metadata?.sku || sub.product?.sku || ""
                  const slug = sub.metadata?.slug || sub.product?.slug || sub.product?._id

                  return (
                    <tr key={sub._id} className="transition-colors hover:bg-gray-50/80">
                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{sub.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                          <a href={`mailto:${sub.email}`} className="hover:text-blue-600 hover:underline">
                            {sub.email}
                          </a>
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-gray-600">
                          <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="rounded bg-gray-100 px-1 py-0.2 text-[10px] font-semibold text-gray-700 uppercase">
                            {sub.country || "AE"}
                          </span>
                          <span>{sub.phone}</span>
                        </p>
                      </td>

                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={productImg}
                            alt={productName}
                            className="h-12 w-12 rounded-lg border border-gray-200 bg-white object-contain p-1 shrink-0"
                            onError={(e) => {
                              e.target.src = "/placeholder.png"
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="line-clamp-1 font-medium text-gray-900">{productName}</p>
                            {sku && <p className="font-mono text-xs text-gray-400">SKU: {sku}</p>}
                            <a
                              href={`/product/${encodeURIComponent(slug)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-lime-600 hover:underline"
                            >
                              View product <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Variant / Option */}
                      <td className="px-6 py-4">
                        {sub.variant ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                            <Tag className="h-3 w-3 text-gray-500" />
                            {sub.variant}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Whole Product</span>
                        )}
                      </td>

                      {/* Requested Date */}
                      <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                        <p className="font-medium text-gray-800">{formatDateTime(sub.createdAt)}</p>
                        <p className="mt-0.5 text-gray-400">{timeAgo(sub.createdAt)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sub.notified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            Notified ({timeAgo(sub.notifiedAt)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Chat Button */}
                          <button
                            onClick={() => handleOpenWhatsApp(sub)}
                            title="Chat with Customer on WhatsApp"
                            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>

                          {/* Send Alert Email */}
                          <button
                            onClick={() => setTriggerItem(sub)}
                            title={sub.notified ? "Resend restock email" : "Send restock alert email"}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>

                          {/* Delete Lead */}
                          <button
                            onClick={() => setDeleteId(sub._id)}
                            title="Delete lead"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between text-xs text-gray-600">
            <p>
              Showing page <span className="font-bold text-gray-900">{page}</span> of{" "}
              <span className="font-bold text-gray-900">{totalPages}</span> ({totalCount} total)
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message="Are you sure you want to delete this restock alert lead? This action cannot be undone."
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!triggerItem}
        onClose={() => setTriggerItem(null)}
        onConfirm={handleConfirmTrigger}
        title="Send Restock Email Alert"
        message={`Send an immediate restock alert email to ${triggerItem?.email} for "${
          triggerItem?.metadata?.productName || "this product"
        }"?`}
        confirmText="Send Email Now"
        loading={actionLoading}
      />
    </div>
  )
}

export default AdminNotifyMe
