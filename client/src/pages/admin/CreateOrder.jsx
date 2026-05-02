"use client"

import { useEffect, useMemo, useState } from "react"
import { adminAPI, categoriesAPI, apiRequest, productsAdminAPI } from "../../services/api"
import { Search, User, Package, Percent, Plus, Minus, Trash2, Save, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"

const currency = (n) => `AED ${(Number(n) || 0).toLocaleString()}`

export default function CreateOrder() {
  const navigate = useNavigate()

  const [mode, setMode] = useState("order")
  const [sendCustomerEmail, setSendCustomerEmail] = useState(false)

  // Users
  const [userQuery, setUserQuery] = useState("")
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  // Editable shipping info for order
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [updateUserProfile, setUpdateUserProfile] = useState(false)

  // Products search/filters
  const [productQuery, setProductQuery] = useState("")
  const [parentCategories, setParentCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [brands, setBrands] = useState([])
  const [filters, setFilters] = useState({
    parentCategory: "",
    subcategory: "",
    brand: "",
  })
  const [productResults, setProductResults] = useState([])

  // Order items and pricing
  const [items, setItems] = useState([])
  const [shippingPrice, setShippingPrice] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)

  // Custom line item
  const [customName, setCustomName] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customQuantity, setCustomQuantity] = useState(1)

  const itemsPrice = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0),
    [items],
  )
  const taxPrice = useMemo(
    () => (Number(taxRate) > 0 ? (itemsPrice * Number(taxRate)) / 100 : 0),
    [itemsPrice, taxRate],
  )
  const totalPrice = useMemo(
    () => Math.max(0, itemsPrice + Number(shippingPrice || 0) + taxPrice - Number(discountAmount || 0)),
    [itemsPrice, shippingPrice, taxPrice, discountAmount],
  )

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        if (!userQuery?.trim()) {
          setUsers([])
          return
        }
        const data = await adminAPI.getUsers({ search: userQuery.trim() })
        setUsers(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error("[create-document] user search error:", e)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [userQuery])

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, subs, brandsRes] = await Promise.all([
          categoriesAPI.getAll(),
          apiRequest("/api/subcategories"),
          apiRequest("/api/brands"),
        ])
        setParentCategories(cats || [])
        setSubcategories(subs || [])
        setBrands(brandsRes || [])
      } catch (e) {
        console.error("[create-document] load filters error:", e)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const params = {}
        if (productQuery?.trim()) params.search = productQuery.trim()
        if (filters.parentCategory) params.parentCategory = filters.parentCategory
        if (filters.subcategory) params.subcategory = filters.subcategory
        if (filters.brand) {
          const brandObj = brands.find((b) => b._id === filters.brand)
          if (brandObj?.name) {
            params.search = params.search ? `${params.search} ${brandObj.name}` : brandObj.name
          }
        }
        if (!params.search && !params.parentCategory && !params.subcategory) {
          setProductResults([])
          return
        }
        const data = await productsAdminAPI.search({ ...params, limit: 20, page: 1 })
        setProductResults(data?.products || [])
      } catch (e) {
        console.error("[create-document] product search error:", e)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [productQuery, filters, brands])

  const onSelectUser = (u) => {
    setSelectedUser(u)
    setUsers([])
    setUserQuery("")
    setShipping({
      name: u?.name || "",
      email: u?.email || "",
      phone: u?.phone || "",
      address: u?.address?.street || "",
      city: u?.address?.city || "",
      state: u?.address?.state || "",
      zipCode: u?.address?.zipCode || "",
    })
  }

  const addProduct = (p) => {
    const price = Number(p.offerPrice || p.price || 0)
    const existing = items.find((it) => it.key === p._id)
    if (existing) {
      setItems((prev) => prev.map((it) => (it.key === p._id ? { ...it, quantity: (it.quantity || 0) + 1 } : it)))
    } else {
      setItems((prev) => [
        ...prev,
        {
          key: p._id,
          product: p._id,
          name: p.name,
          image: p.image || "/placeholder.svg",
          price,
          quantity: 1,
          sku: p.sku,
          isCustom: false,
        },
      ])
    }
  }

  const addCustomItem = () => {
    const name = customName.trim()
    const price = Number(customPrice)
    const quantity = Number(customQuantity)

    if (!name || Number.isNaN(price) || price <= 0 || Number.isNaN(quantity) || quantity <= 0) {
      alert("Please enter valid custom item name, price, and quantity")
      return
    }

    const key = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setItems((prev) => [
      ...prev,
      {
        key,
        product: null,
        name,
        image: "/placeholder.svg",
        price,
        quantity,
        sku: "CUSTOM",
        isCustom: true,
      },
    ])

    setCustomName("")
    setCustomPrice("")
    setCustomQuantity(1)
  }

  const updateQty = (itemKey, delta) => {
    setItems((prev) =>
      prev
        .map((it) => (it.key === itemKey ? { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) } : it))
        .filter((it) => (it.quantity || 1) > 0),
    )
  }

  const removeItem = (itemKey) => setItems((prev) => prev.filter((it) => it.key !== itemKey))

  const canSubmit = items.length > 0 && shipping.name && shipping.email && shipping.phone && shipping.address

  const handleCreate = async () => {
    try {
      if (updateUserProfile && selectedUser?._id) {
        await adminAPI.updateUser(selectedUser._id, {
          name: shipping.name,
          email: shipping.email,
          phone: shipping.phone,
          address: {
            street: shipping.address,
            city: shipping.city,
            state: shipping.state,
            zipCode: shipping.zipCode,
          },
        })
      }

      const payload = {
        userId: selectedUser?._id || null,
        documentType: mode,
        sendCustomerEmail,
        orderItems: items.map((it) => ({
          name: it.name,
          quantity: Number(it.quantity) || 1,
          image: it.image || "/placeholder.svg",
          price: Number(it.price) || 0,
          product: it.product || undefined,
        })),
        deliveryType: "home",
        shippingAddress: {
          name: shipping.name,
          email: shipping.email,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.zipCode,
        },
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: Number((Number(shippingPrice) || 0).toFixed(2)),
        taxPrice: Number(taxPrice.toFixed(2)),
        discountAmount: Number((Number(discountAmount) || 0).toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        paymentMethod: "Cash on Delivery",
        customerNotes: "",
        status: "New",
      }

      const created = await adminAPI.createOrder(payload)
      const label = mode === "quotation" ? "Quotation" : "Order"
      alert(`${label} created successfully. #${created?._id?.slice?.(-6) || ""}`)
      if (mode === "quotation") {
        navigate("/admin/orders/quotations")
      } else {
        navigate("/admin/orders/new")
      }
    } catch (e) {
      console.error("[create-document] create error:", e)
      alert(e?.message || "Failed to create document")
    }
  }

  return (
    <div className="ml-64 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Create Order / Create Quotation</h1>
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("order")}
            className={`px-4 py-2 text-sm ${mode === "order" ? "bg-lime-600 text-white" : "bg-white text-gray-700"}`}
          >
            Create Order
          </button>
          <button
            type="button"
            onClick={() => setMode("quotation")}
            className={`px-4 py-2 text-sm ${mode === "quotation" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Create Quotation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} />
            <h2 className="font-semibold">Users</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search users by name or email"
              className="w-full border rounded px-3 py-2 pr-8"
            />
            <Search className="absolute right-2 top-2.5 text-gray-400" size={18} />
          </div>
          {users.length > 0 && (
            <div className="border rounded mt-2 max-h-56 overflow-auto">
              {users.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  onClick={() => onSelectUser(u)}
                >
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Name"
                value={shipping.name}
                onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Email"
                value={shipping.email}
                onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Phone"
                value={shipping.phone}
                onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Address"
                value={shipping.address}
                onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                className="border rounded px-3 py-2 col-span-2"
              />
              <input
                placeholder="City"
                value={shipping.city}
                onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="State"
                value={shipping.state}
                onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Zip Code"
                value={shipping.zipCode}
                onChange={(e) => setShipping((s) => ({ ...s, zipCode: e.target.value }))}
                className="border rounded px-3 py-2"
              />
            </div>

            <label className="flex items-center gap-2 text-sm mt-2">
              <input
                type="checkbox"
                checked={updateUserProfile}
                onChange={(e) => setUpdateUserProfile(e.target.checked)}
              />
              Update user profile with above details
            </label>

            <label className="flex items-center gap-2 text-sm mt-2">
              <input
                type="checkbox"
                checked={sendCustomerEmail}
                onChange={(e) => setSendCustomerEmail(e.target.checked)}
              />
              Email Manually Set
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={18} />
            <h2 className="font-semibold">Products</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="relative md:col-span-3">
              <input
                type="text"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search by SKU or name"
                className="w-full border rounded px-3 py-2 pr-8"
              />
              <Search className="absolute right-2 top-2.5 text-gray-400" size={18} />
            </div>
            <select
              value={filters.parentCategory}
              onChange={(e) => setFilters((f) => ({ ...f, parentCategory: e.target.value, subcategory: "" }))}
              className="border rounded px-2 py-2"
            >
              <option value="">All Categories</option>
              {parentCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filters.subcategory}
              onChange={(e) => setFilters((f) => ({ ...f, subcategory: e.target.value }))}
              className="border rounded px-2 py-2"
            >
              <option value="">All Subcategories</option>
              {subcategories
                .filter(
                  (s) =>
                    !filters.parentCategory ||
                    s.category === filters.parentCategory ||
                    s.category?._id === filters.parentCategory,
                )
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <select
              value={filters.brand}
              onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
              className="border rounded px-2 py-2"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {productResults.length > 0 && (
            <div className="border rounded mt-3 max-h-56 overflow-auto">
              {productResults.map((p) => (
                <div key={p._id} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">SKU: {p.sku || "-"}</div>
                    <div className="text-xs text-gray-600">{currency(p.offerPrice || p.price || 0)}</div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 bg-lime-600 text-white text-sm px-3 py-1 rounded"
                    onClick={() => addProduct(p)}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} />
              <h3 className="font-semibold text-sm">Custom Line Item</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Product Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="border rounded px-2 py-2 md:col-span-2"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="border rounded px-2 py-2"
              />
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Qty"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                className="border rounded px-2 py-2"
              />
            </div>
            <button
              type="button"
              onClick={addCustomItem}
              className="mt-2 inline-flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1 rounded"
            >
              <Plus size={14} /> Add Custom Product
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Items</h2>
          {items.length === 0 ? (
            <div className="text-sm text-gray-500">No items selected yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.key} className="border-b">
                      <td className="py-2">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-gray-500">SKU: {it.sku || "-"}</div>
                        {it.isCustom && <div className="text-xs text-blue-600">Custom Item</div>}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => updateQty(it.key, -1)} className="p-1 border rounded">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center">{it.quantity}</span>
                          <button type="button" onClick={() => updateQty(it.key, 1)} className="p-1 border rounded">
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 text-right">{currency(it.price)}</td>
                      <td className="py-2 text-right">{currency((it.price || 0) * (it.quantity || 0))}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(it.key)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="py-2 text-xs text-gray-500">
                      Prices include VAT where applicable. You can add special discount below.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Totals</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{currency(itemsPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <input
                type="number"
                value={shippingPrice}
                onChange={(e) => setShippingPrice(e.target.value)}
                className="w-28 border rounded px-2 py-1 text-right"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-between items-center">
              <span>Tax rate (%)</span>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-28 border rounded px-2 py-1 text-right"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{currency(taxPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Percent size={14} />
                Special discount
              </span>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-28 border rounded px-2 py-1 text-right"
                min="0"
                step="0.01"
              />
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{currency(totalPrice)}</span>
            </div>
          </div>

          <button
            disabled={!canSubmit}
            onClick={handleCreate}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-white ${
              canSubmit ? "bg-lime-600 hover:bg-lime-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            title={!canSubmit ? "Add at least one item and fill shipping details" : `Create ${mode}`}
          >
            <Save size={16} />
            {mode === "quotation" ? "Create Quotation" : "Create Order"}
          </button>

          {discountAmount > 0 && (
            <p className="text-xs text-gray-500 mt-2">Note: Special discount will appear on the invoice.</p>
          )}
        </div>
      </div>
    </div>
  )
}
