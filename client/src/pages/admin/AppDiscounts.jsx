"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Select from "react-select"
import { Plus, Edit, Trash2, Smartphone } from "lucide-react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import config from "../../config/config"

const DEFAULT_FORM = {
  name: "",
  description: "",
  isActive: true,
  appliesTo: "all",
  products: [],
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  onlyNewAppUsers: true,
  singleUsePerUser: true,
  startsAt: "",
  endsAt: "",
  priority: "0",
}

const AppDiscounts = () => {
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)

  const token = localStorage.getItem("adminToken")

  const fetchItems = async () => {
    const { data } = await axios.get(`${config.API_URL}/api/app-discounts/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setItems(Array.isArray(data) ? data : [])
  }

  const fetchProducts = async () => {
    const { data } = await axios.get(`${config.API_URL}/api/products?limit=500`)
    const list = Array.isArray(data) ? data : []
    setProducts(list)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchItems(), fetchProducts()])
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load app discounts")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const resetForm = () => {
    setFormData(DEFAULT_FORM)
    setEditingItem(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError("")

      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue || 0),
        minOrderAmount: Number(formData.minOrderAmount || 0),
        maxDiscountAmount: formData.maxDiscountAmount === "" ? "" : Number(formData.maxDiscountAmount || 0),
        priority: Number(formData.priority || 0),
      }

      if (editingItem) {
        await axios.put(`${config.API_URL}/api/app-discounts/${editingItem._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.post(`${config.API_URL}/api/app-discounts`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      await fetchItems()
      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save app discount")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this app discount?")) return
    try {
      await axios.delete(`${config.API_URL}/api/app-discounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchItems()
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete app discount")
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || "",
      description: item.description || "",
      isActive: Boolean(item.isActive),
      appliesTo: item.appliesTo || "all",
      products: (item.products || []).map((p) => p._id || p),
      discountType: item.discountType || "percentage",
      discountValue: String(item.discountValue ?? ""),
      minOrderAmount: String(item.minOrderAmount ?? ""),
      maxDiscountAmount: item.maxDiscountAmount == null ? "" : String(item.maxDiscountAmount),
      onlyNewAppUsers: item.onlyNewAppUsers !== false,
      singleUsePerUser: item.singleUsePerUser !== false,
      startsAt: item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 16) : "",
      endsAt: item.endsAt ? new Date(item.endsAt).toISOString().slice(0, 16) : "",
      priority: String(item.priority ?? 0),
    })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <div className="ml-64 p-8 flex items-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Smartphone size={22} /> App Discounts
            </h1>
            <p className="text-sm text-gray-600 mt-1">For newly registered app users (all products or selected products).</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-lime-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={16} /> Add App Discount
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Discount name"
                className="border rounded px-3 py-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <select
                className="border rounded px-3 py-2"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              className="border rounded px-3 py-2 w-full"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="border rounded px-3 py-2"
                value={formData.appliesTo}
                onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
              >
                <option value="all">All Products</option>
                <option value="products">Selected Products</option>
              </select>

              <select
                className="border rounded px-3 py-2"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Discount value"
                className="border rounded px-3 py-2"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                required
              />
            </div>

            {formData.appliesTo === "products" && (
              <Select
                isMulti
                options={products.map((product) => ({ value: product._id, label: `${product.name} (${product.sku || "No SKU"})` }))}
                value={products
                  .filter((product) => formData.products.includes(product._id))
                  .map((product) => ({ value: product._id, label: `${product.name} (${product.sku || "No SKU"})` }))}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    products: Array.isArray(selected) ? selected.map((s) => s.value) : [],
                  })
                }
                placeholder="Select products"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Min order amount"
                className="border rounded px-3 py-2"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Max discount"
                className="border rounded px-3 py-2"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
              />
              <input
                type="number"
                placeholder="Priority"
                className="border rounded px-3 py-2"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              />
              <select
                className="border rounded px-3 py-2"
                value={formData.onlyNewAppUsers ? "new" : "all"}
                onChange={(e) => setFormData({ ...formData, onlyNewAppUsers: e.target.value === "new" })}
              >
                <option value="new">Only New App Users</option>
                <option value="all">All App Users</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="datetime-local"
                className="border rounded px-3 py-2"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                required
              />
              <input
                type="datetime-local"
                className="border rounded px-3 py-2"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                required
              />
              <select
                className="border rounded px-3 py-2"
                value={formData.singleUsePerUser ? "single" : "repeat"}
                onChange={(e) => setFormData({ ...formData, singleUsePerUser: e.target.value === "single" })}
              >
                <option value="single">Single Use Per User</option>
                <option value="repeat">Multiple Uses Allowed</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="px-4 py-2 rounded border border-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-lime-500 text-white">
                {editingItem ? "Update" : "Create"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Scope</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Validity</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.description && <div className="text-gray-500">{item.description}</div>}
                  </td>
                  <td className="px-4 py-3">{item.appliesTo === "all" ? "All Products" : `${item.products?.length || 0} Products`}</td>
                  <td className="px-4 py-3">
                    {item.discountType === "percentage" ? `${item.discountValue}%` : `AED ${Number(item.discountValue || 0).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(item.startsAt).toLocaleDateString()} - {new Date(item.endsAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600" onClick={() => handleEdit(item)}>
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600" onClick={() => handleDelete(item._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={6}>
                    No app discounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AppDiscounts
