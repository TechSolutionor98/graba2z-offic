"use client"

import { useEffect, useMemo, useState } from "react"
import { adminAPI } from "../../services/api"
import { Search, Eye, RefreshCw, PauseCircle, PlayCircle, ArrowRightCircle } from "lucide-react"
import AdminOrderDetailsModal from "../../components/admin/AdminOrderDetailsModal"
import { askToEmailCustomer } from "../../utils/customerEmail"

const formatPrice = (price) => `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

// Draft and Hold are both still here waiting; Converted has already become a
// real order and is kept only as a record.
const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "Draft", label: "Draft" },
  { id: "Hold", label: "On Hold" },
  { id: "Converted", label: "Moved to Orders" },
]

const statusChipClass = (status) => {
  if (status === "Converted") return "bg-green-100 text-green-700"
  if (status === "Hold") return "bg-orange-100 text-orange-700"
  return "bg-yellow-100 text-yellow-700"
}

const statusLabel = (status) => {
  if (status === "Converted") return "Moved to Orders"
  if (status === "Hold") return "On Hold"
  return "Draft"
}

export default function RecentQuotation() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [busyId, setBusyId] = useState(null)
  const [selectedQuotation, setSelectedQuotation] = useState(null)

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getQuotations()
      setQuotations(Array.isArray(data) ? data : [])
      setError("")
    } catch (e) {
      setError(e?.message || "Failed to load quotations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  const replaceRow = (updated) =>
    setQuotations((prev) => prev.map((q) => (q._id === updated._id ? { ...q, ...updated } : q)))

  // Hold parks a document; releasing puts it back in the working pile. Neither
  // touches the Orders queues.
  const changeStatus = async (quotation, nextStatus) => {
    try {
      setBusyId(quotation._id)
      setError("")
      // Hold and Release are internal bookkeeping. The customer is never mailed
      // about them, so there is nothing to ask.
      const updated = await adminAPI.setQuotationStatus(quotation._id, nextStatus)
      replaceRow(updated)
    } catch (e) {
      setError(e?.message || "Could not change the status. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  // The one door into the Orders section. Until this runs, nothing created on
  // the Create Order/Quotation screen is visible to the warehouse.
  const moveToOrders = async (quotation) => {
    const who = quotation.shippingAddress?.name || "this customer"
    if (
      !window.confirm(
        `Move #${quotation._id.slice(-6)} for ${who} into Orders?\n\n` +
          `It will appear in New Orders at ${formatPrice(quotation.totalPrice)} and can be fulfilled. ` +
          `This cannot be undone.`,
      )
    ) {
      return
    }

    try {
      setBusyId(quotation._id)
      setError("")
      const sendCustomerEmail = askToEmailCustomer("Moved to Orders", quotation)
      const response = await adminAPI.convertQuotation(quotation._id, { sendCustomerEmail })
      replaceRow(response?.quotation || { ...quotation, quotationStatus: "Converted" })
    } catch (e) {
      setError(e?.message || "Could not move this document to Orders. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return quotations.filter((it) => {
      const status = it.quotationStatus || "Draft"
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (!q) return true
      const id = it._id?.slice?.(-6)?.toLowerCase?.() || ""
      const name = it.shippingAddress?.name?.toLowerCase?.() || ""
      const email = it.shippingAddress?.email?.toLowerCase?.() || ""
      return id.includes(q) || name.includes(q) || email.includes(q)
    })
  }, [quotations, search, statusFilter])

  const countFor = (tabId) =>
    tabId === "all"
      ? quotations.length
      : quotations.filter((q) => (q.quotationStatus || "Draft") === tabId).length

  return (
    <div className="ml-64 p-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Recent Quotation</h1>
        <button
          onClick={fetchQuotations}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Everything created on the Create Order/Quotation screen is held here. Use{" "}
        <span className="font-medium">Move to Orders</span> when a document is ready to be fulfilled.
      </p>

      {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex rounded-md border overflow-hidden text-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 ${
                statusFilter === tab.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label} ({countFor(tab.id)})
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quotation #, customer, email"
            className="pl-9 pr-3 py-2 border rounded w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading quotations...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Quotation ID</th>
                <th className="px-4 py-3 text-left">Created as</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const status = q.quotationStatus || "Draft"
                const isConverted = status === "Converted"
                const busy = busyId === q._id
                return (
                  <tr key={q._id} className="border-t">
                    <td className="px-4 py-3 font-medium text-blue-700">#{q._id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {q.stagedAs === "order" ? "Order" : "Quotation"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>{q.shippingAddress?.name || "N/A"}</div>
                      <div className="text-gray-500">{q.shippingAddress?.email || "N/A"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusChipClass(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(q.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedQuotation(q)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Eye size={16} /> View
                        </button>

                        {!isConverted && (
                          <>
                            {status === "Hold" ? (
                              <button
                                onClick={() => changeStatus(q, "Draft")}
                                disabled={busy}
                                className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 disabled:opacity-50"
                                title="Put this document back in the working pile"
                              >
                                <PlayCircle size={16} /> Release
                              </button>
                            ) : (
                              <button
                                onClick={() => changeStatus(q, "Hold")}
                                disabled={busy}
                                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 disabled:opacity-50"
                                title="Park this document without moving it to Orders"
                              >
                                <PauseCircle size={16} /> Hold
                              </button>
                            )}

                            <button
                              onClick={() => moveToOrders(q)}
                              disabled={busy}
                              className="inline-flex items-center gap-1 text-lime-700 hover:text-lime-800 disabled:opacity-50"
                              title="Create a real order from this document"
                            >
                              <ArrowRightCircle size={16} /> Move to Orders
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    {statusFilter === "all"
                      ? "No quotations found."
                      : `Nothing ${statusFilter === "Hold" ? "on hold" : statusLabel(statusFilter).toLowerCase()}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedQuotation && (
        <AdminOrderDetailsModal
          isOpen={!!selectedQuotation}
          order={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          isQuotation={true}
          onUpdate={(updatedQuotation) => {
            replaceRow(updatedQuotation)
            if (selectedQuotation && selectedQuotation._id === updatedQuotation._id) {
              setSelectedQuotation(updatedQuotation)
            }
          }}
        />
      )}
    </div>
  )
}
