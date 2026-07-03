"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Smartphone,
  Settings,
  Plus,
  Edit,
  Trash2,
  Percent,
  Calendar,
  Eye,
  EyeOff,
  X,
} from "lucide-react"
import Select from "react-select"
import AdminSidebar from "../../components/admin/AdminSidebar"
import config from "../../config/config"

const DEFAULT_COUPON_FORM = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  categories: [],
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
  visibility: "public",
}

const AppDiscountSettings = () => {
  const navigate = useNavigate()

  // App Discounts list state
  const [discounts, setDiscounts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  // Coupon (Add Discount) modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState(DEFAULT_COUPON_FORM)
  const [formError, setFormError] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const token = localStorage.getItem("adminToken")

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchDiscounts = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/app-discounts/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDiscounts(Array.isArray(data) ? data : [])
    } catch {
      setError("Failed to load app discounts.")
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/categories`)
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      console.error("Failed to load categories")
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchDiscounts(), fetchCategories()])
      setLoading(false)
    }
    load()
  }, [])

  // ── Coupon form handlers ─────────────────────────────────────────────────────
  const resetCouponForm = () => {
    setFormData(DEFAULT_COUPON_FORM)
    setEditingCoupon(null)
    setFormError(null)
  }

  const handleOpenAddModal = () => {
    resetCouponForm()
    setShowAddModal(true)
  }

  const handleEditDiscount = (item) => {
    setEditingCoupon(item)
    setFormData({
      code: item.code || "",
      description: item.description || "",
      discountType: item.discountType || "percentage",
      discountValue: item.discountValue?.toString() || "",
      categories: item.categories ? item.categories.map((c) => c._id || c) : [],
      minOrderAmount: item.minOrderAmount?.toString() || "",
      maxDiscountAmount: item.maxDiscountAmount?.toString() || "",
      usageLimit: item.usageLimit?.toString() || "",
      validFrom: item.validFrom ? new Date(item.validFrom).toISOString().split("T")[0] : "",
      validUntil: item.validUntil ? new Date(item.validUntil).toISOString().split("T")[0] : "",
      isActive: item.isActive !== false,
      visibility: item.visibility || "public",
    })
    setShowAddModal(true)
  }

  const handleCouponSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        categories: formData.categories.includes("ALL") ? [] : formData.categories,
      }

      if (editingCoupon) {
        await axios.put(`${config.API_URL}/api/coupons/${editingCoupon._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post(`${config.API_URL}/api/coupons`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      await fetchDiscounts()
      setShowAddModal(false)
      resetCouponForm()
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm("Delete this discount?")) return
    try {
      await axios.delete(`${config.API_URL}/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchDiscounts()
    } catch {
      setError("Failed to delete discount.")
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getStatusBadge = (item) => {
    const isExpired = item.validUntil && new Date(item.validUntil) < new Date()
    if (isExpired) {
      return (
        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          <EyeOff className="h-3 w-3 mr-1 mt-0.5" /> Expired
        </span>
      )
    }
    if (!item.isActive) {
      return (
        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
          <EyeOff className="h-3 w-3 mr-1 mt-0.5" /> Inactive
        </span>
      )
    }
    return (
      <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
        <Eye className="h-3 w-3 mr-1 mt-0.5" /> Active
      </span>
    )
  }

  const filteredDiscounts = discounts.filter((item) => {
    const isExpired = item.validUntil && new Date(item.validUntil) < new Date()
    const isActive = item.isActive && !isExpired
    if (filter === "active") return isActive
    if (filter === "expired") return isExpired || !item.isActive
    return true
  })

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Smartphone size={22} className="text-lime-600" />
              App Discount Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage app-exclusive discounts and configure the promotional popup.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/app-discount-settings/popup-settings")}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Settings size={16} />
              Popup Settings
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-lime-500 text-white font-medium hover:bg-lime-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Discount
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          {["all", "active", "expired"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-lime-500 text-white border-lime-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : "Expired / Disabled"}
            </button>
          ))}
        </div>

        {/* Discounts Table */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lime-500" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredDiscounts.length > 0 ? (
                    filteredDiscounts.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                              <Percent className="text-lime-600" size={16} />
                            </div>
                            <div>
                              <div className="font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded inline-block">
                                {item.code || item.name}
                              </div>
                              {item.description && (
                                <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[220px]">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            {!item.categories || item.categories.length === 0
                              ? "All Categories"
                              : item.categories.map((c) => c.name || c).join(", ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-800 font-medium">
                          {item.discountType === "percentage"
                            ? `${item.discountValue}%`
                            : `AED ${Number(item.discountValue || 0).toFixed(2)}`}
                          {item.minOrderAmount > 0 && (
                            <p className="text-xs text-gray-400 font-normal">
                              Min: AED {item.minOrderAmount}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {item.validFrom || item.startsAt ? (
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar size={12} className="text-gray-400" />
                              {new Date(item.validFrom || item.startsAt).toLocaleDateString()}
                              {" – "}
                              {new Date(item.validUntil || item.endsAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(item)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              onClick={() => handleEditDiscount(item)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors"
                              onClick={() => handleDeleteDiscount(item._id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                        No app discounts found.{" "}
                        <button
                          className="text-lime-600 font-medium hover:underline"
                          onClick={handleOpenAddModal}
                        >
                          Add one now
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Discount Modal ───────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCoupon ? "Edit Discount" : "Add Discount"}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); resetCouponForm() }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body — Reused Coupon Form */}
            <form onSubmit={handleCouponSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
                  {formError}
                </div>
              )}

              {/* Code + Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    placeholder="APPEXCLUSIVE10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <Select
                    isMulti
                    options={[
                      { value: "ALL", label: "All Categories" },
                      ...categories.map((c) => ({ value: c._id, label: c.name })),
                    ]}
                    value={
                      formData.categories.includes("ALL")
                        ? [{ value: "ALL", label: "All Categories" }]
                        : categories
                            .filter((c) => formData.categories.includes(c._id))
                            .map((c) => ({ value: c._id, label: c.name }))
                    }
                    onChange={(selected) => {
                      if (!selected || selected.length === 0) {
                        setFormData({ ...formData, categories: [] })
                      } else if (selected.some((o) => o.value === "ALL")) {
                        setFormData({ ...formData, categories: ["ALL"] })
                      } else {
                        setFormData({ ...formData, categories: selected.map((o) => o.value) })
                      }
                    }}
                    placeholder="Select categories..."
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <div className="flex gap-6">
                  {["public", "private"].map((v) => (
                    <label key={v} className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value={v}
                        checked={formData.visibility === v}
                        onChange={() => setFormData({ ...formData, visibility: v })}
                        className="h-4 w-4 text-lime-500"
                      />
                      <span className="ml-2 text-sm capitalize">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  placeholder="Describe the discount offer"
                  required
                />
              </div>

              {/* Type + Value + Min Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    placeholder={formData.discountType === "percentage" ? "10" : "50"}
                    min="0"
                    step={formData.discountType === "percentage" ? "1" : "0.01"}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formData.discountType === "percentage" ? "%" : "AED"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (AED)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Max Discount + Usage Limit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount (AED, optional)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                      placeholder="500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              {/* Valid From / Until */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded text-lime-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetCouponForm() }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm bg-lime-500 text-white rounded-md hover:bg-lime-600 disabled:opacity-50 font-medium"
                >
                  {formLoading ? "Saving..." : editingCoupon ? "Update Discount" : "Create Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppDiscountSettings
