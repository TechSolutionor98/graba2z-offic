"use client"

import { useEffect, useMemo, useState } from "react"
import { adminAPI } from "../../services/api"
import { Search, Eye, RefreshCw } from "lucide-react"
import AdminOrderDetailsModal from "../../components/admin/AdminOrderDetailsModal"

const formatPrice = (price) => `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

export default function RecentQuotation() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return quotations
    return quotations.filter((it) => {
      const id = it._id?.slice?.(-6)?.toLowerCase?.() || ""
      const name = it.shippingAddress?.name?.toLowerCase?.() || ""
      const email = it.shippingAddress?.email?.toLowerCase?.() || ""
      return id.includes(q) || name.includes(q) || email.includes(q)
    })
  }, [quotations, search])

  return (
    <div className="ml-64 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recent Quotation</h1>
        <button
          onClick={fetchQuotations}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

      <div className="mb-4 relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by quotation #, customer, email"
          className="pl-9 pr-3 py-2 border rounded w-full"
        />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading quotations...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Quotation ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q._id} className="border-t">
                  <td className="px-4 py-3 font-medium text-blue-700">#{q._id.slice(-6)}</td>
                  <td className="px-4 py-3">
                    <div>{q.shippingAddress?.name || "N/A"}</div>
                    <div className="text-gray-500">{q.shippingAddress?.email || "N/A"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        q.quotationStatus === "Converted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {q.quotationStatus || "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(q.totalPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedQuotation(q)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mr-3"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">No quotations found.</td>
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
            setQuotations(quotations.map((q) => (q._id === updatedQuotation._id ? updatedQuotation : q)))
            if (selectedQuotation && selectedQuotation._id === updatedQuotation._id) {
              setSelectedQuotation(updatedQuotation)
            }
          }}
        />
      )}
    </div>
  )
}
