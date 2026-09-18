"use client"

import { useEffect, useMemo, useState } from "react"
import { adminAPI, categoriesAPI, apiRequest, productsAdminAPI } from "../../services/api"
import { Search, User, Package, Percent, Plus, Minus, Trash2, Save, FileText, PauseCircle } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

const currency = (n) =>
  `AED ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Line prices are edited as free text, so "" and "9." have to read as numbers
// without turning the running totals into NaN.
const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// Prices on this page are VAT-inclusive (the same figure the storefront shows),
// so the tax is extracted from the line total rather than added on top.
const PRICE_MODES = [
  { id: "regular", label: "Regular price" },
  { id: "wholesale", label: "Wholesale price" },
]

// Wholesale is optional per product -- fall back to the regular price rather
// than billing zero for a product nobody has set a wholesale price on.
const priceFor = (product, mode) => {
  const regular = num(product?.offerPrice || product?.price || 0)
  if (mode !== "wholesale") return regular
  const wholesale = product?.wholesalePrice
  return wholesale === null || wholesale === undefined || wholesale === "" ? regular : num(wholesale)
}

export default function CreateOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Set when a document was recalled from the Recent Quotation page: saving then
  // updates that document instead of raising a second copy of it.
  const recalledId = searchParams.get("id")
  const [recalledDoc, setRecalledDoc] = useState(null)
  // How many documents are parked. Drives the On Hold button in the header --
  // there is nothing to go and look at until at least one exists.
  const [heldCount, setHeldCount] = useState(0)
  const [loadingRecalled, setLoadingRecalled] = useState(Boolean(recalledId))
  const [loadError, setLoadError] = useState("")

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
  const [priceMode, setPriceMode] = useState("regular")

  // Order items and pricing
  const [items, setItems] = useState([])
  const [shippingPrice, setShippingPrice] = useState(0)
  const [taxRate, setTaxRate] = useState(5)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("cod")

  // Custom line item
  const [customName, setCustomName] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customQuantity, setCustomQuantity] = useState(1)

  // What the customer pays for the goods, VAT included -- the figure on the
  // line rows.
  const itemsGross = useMemo(
    () => items.reduce((sum, it) => sum + num(it.price) * num(it.quantity), 0),
    [items],
  )
  // The VAT already sitting inside itemsGross, backed out at the chosen rate.
  const taxPrice = useMemo(() => {
    const rate = num(taxRate)
    if (rate <= 0) return 0
    return itemsGross - itemsGross / (1 + rate / 100)
  }, [itemsGross, taxRate])
  // Goods before VAT. itemsNet + taxPrice === itemsGross, so the total below is
  // unchanged by how the rate is set -- only the split moves.
  const itemsNet = useMemo(() => itemsGross - taxPrice, [itemsGross, taxPrice])
  const totalPrice = useMemo(
    () => Math.max(0, itemsGross + num(shippingPrice) - num(discountAmount)),
    [itemsGross, shippingPrice, discountAmount],
  )

  useEffect(() => {
    let cancelled = false
    const loadHeldCount = async () => {
      try {
        const held = await adminAPI.getQuotations({ quotationStatus: "Hold" })
        if (!cancelled) setHeldCount(Array.isArray(held) ? held.length : 0)
      } catch (e) {
        // Not worth an error on screen -- the button simply stays hidden.
        console.error("[create-document] held count error:", e)
      }
    }
    loadHeldCount()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!recalledId) return

    let cancelled = false
    const load = async () => {
      try {
        setLoadingRecalled(true)
        setLoadError("")
        const doc = await adminAPI.getQuotation(recalledId)
        if (cancelled) return

        setRecalledDoc(doc)
        setMode(doc.stagedAs === "order" ? "order" : "quotation")
        setShipping({
          name: doc.shippingAddress?.name || "",
          email: doc.shippingAddress?.email || "",
          phone: doc.shippingAddress?.phone || "",
          address: doc.shippingAddress?.address || "",
          city: doc.shippingAddress?.city || "",
          state: doc.shippingAddress?.state || "",
          zipCode: doc.shippingAddress?.zipCode || "",
        })
        setSelectedUser(doc.user && typeof doc.user === "object" ? doc.user : null)
        setItems(
          (doc.orderItems || []).map((it, index) => {
            const price = num(it.price)
            const productId = typeof it.product === "object" ? it.product?._id : it.product
            return {
              key: productId || `recalled-${index}`,
              product: productId || null,
              name: it.name,
              image: it.image || "/placeholder.svg",
              price,
              quantity: num(it.quantity) || 1,
              sku: it.sku || (typeof it.product === "object" ? it.product?.sku : "") || "",
              isCustom: !productId,
              // The prices on a recalled document are the ones already agreed, so
              // both modes resolve to them -- flipping the toggle cannot quietly
              // reprice a quotation the customer has already seen.
              regularPrice: price,
              wholesalePrice: price,
              hasWholesale: true,
              priceEdited: false,
            }
          }),
        )
        setShippingPrice(num(doc.shippingPrice))
        setDiscountAmount(num(doc.discountAmount))
        setTaxRate(Number.isFinite(Number(doc.taxRate)) ? Number(doc.taxRate) : 5)
        setPaymentMethod(doc.actualPaymentMethod || doc.paymentMethod || "cod")
      } catch (e) {
        if (!cancelled) setLoadError(e?.message || "Could not open this document.")
      } finally {
        if (!cancelled) setLoadingRecalled(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [recalledId])

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
    const price = priceFor(p, priceMode)
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
          // Kept so switching the price mode can re-price this line, and so an
          // edited price can be told apart from the catalogue one.
          regularPrice: priceFor(p, "regular"),
          wholesalePrice: priceFor(p, "wholesale"),
          hasWholesale: !(p?.wholesalePrice === null || p?.wholesalePrice === undefined || p?.wholesalePrice === ""),
          priceEdited: false,
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

  // An edited price lives on this document only. Nothing here writes back to
  // the product, so the catalogue price is untouched.
  const updateItemPrice = (itemKey, value) =>
    setItems((prev) => prev.map((it) => (it.key === itemKey ? { ...it, price: value, priceEdited: true } : it)))

  const resetItemPrice = (itemKey) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key === itemKey && !it.isCustom
          ? { ...it, price: priceMode === "wholesale" ? it.wholesalePrice : it.regularPrice, priceEdited: false }
          : it,
      ),
    )

  // Switching the mode re-prices catalogue lines, but leaves a price the admin
  // typed by hand alone -- that edit was deliberate.
  const changePriceMode = (nextMode) => {
    setPriceMode(nextMode)
    setItems((prev) =>
      prev.map((it) =>
        it.isCustom || it.priceEdited
          ? it
          : { ...it, price: nextMode === "wholesale" ? it.wholesalePrice : it.regularPrice },
      ),
    )
  }

  const canSubmit = items.length > 0 && shipping.name && shipping.email && shipping.phone && shipping.address

  // Parking a document leaves the admin ready for the next one, so the form is
  // cleared rather than the page navigated away from.
  const resetForm = () => {
    setItems([])
    setSelectedUser(null)
    setShipping({ name: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "" })
    setShippingPrice(0)
    setDiscountAmount(0)
    setSendCustomerEmail(false)
    setUpdateUserProfile(false)
    setProductQuery("")
    setProductResults([])
    setFilters({ parentCategory: "", subcategory: "", brand: "" })
  }

  const handleCreate = async (hold = false) => {
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
        // Falls back to whoever the recalled document already belonged to, so
        // reopening and saving never quietly detaches it from its customer.
        userId: selectedUser?._id || recalledDoc?.user?._id || recalledDoc?.user || null,
        documentType: mode,
        // Held documents stay on the Recent Quotation page marked On Hold until
        // someone releases them.
        quotationStatus: hold ? "Hold" : "Draft",
        sendCustomerEmail,
        orderItems: items.map((it) => ({
          name: it.name,
          quantity: Number(it.quantity) || 1,
          image: it.image || "/placeholder.svg",
          price: num(it.price),
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
        itemsPrice: Number(itemsNet.toFixed(2)),
        shippingPrice: Number((Number(shippingPrice) || 0).toFixed(2)),
        taxPrice: Number(taxPrice.toFixed(2)),
        // Sent so the invoice can split each line at this rate rather than
        // assuming the store default.
        taxRate: num(taxRate),
        discountAmount: Number((Number(discountAmount) || 0).toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        paymentMethod: paymentMethod === "tabby" ? "card" : paymentMethod,
        actualPaymentMethod: paymentMethod,
        customerNotes: "",
        status: "New",
      }

      const created = recalledId
        ? await adminAPI.updateQuotation(recalledId, payload)
        : await adminAPI.createOrder(payload)
      const label = mode === "quotation" ? "Quotation" : "Order"
      // Both modes stage the document. It only reaches the Orders queues when
      // an admin moves it across from the Recent Quotation page.
      alert(
        `${label} ${recalledId ? "updated" : "created"} successfully. #${created?._id?.slice?.(-6) || ""}\n\n` +
          (hold
            ? 'It is parked On Hold. Use the "On Hold" button at the top of this page to recall it.'
            : 'It is saved on the Recent Quotation page. Use "Move to Orders" there when it is ready to be fulfilled.'),
      )

      // Parking a new document keeps the admin here, with the On Hold counter in
      // the header now one higher and the form ready for the next one. Everything
      // else goes to the staging list to be acted on.
      if (hold && !recalledId) {
        setHeldCount((count) => count + 1)
        resetForm()
        return
      }

      navigate("/admin/orders/quotations")
    } catch (e) {
      console.error("[create-document] create error:", e)
      alert(e?.message || "Failed to create document")
    }
  }

  return (
    <div className="ml-64 p-6">
      {recalledId && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="text-sm text-blue-900">
            {loadingRecalled ? (
              "Opening the saved document..."
            ) : loadError ? (
              <span className="text-red-700">{loadError}</span>
            ) : (
              <>
                Editing <span className="font-semibold">#{String(recalledDoc?._id || "").slice(-6)}</span>
                {recalledDoc?.quotationStatus === "Hold" && (
                  <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                    On Hold
                  </span>
                )}
                <span className="block text-xs text-blue-800">
                  Saving updates this document. It will not create a second copy.
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/orders/quotations")}
            className="rounded border border-blue-300 px-3 py-1.5 text-sm text-blue-800 hover:bg-blue-100"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{recalledId ? "Edit Order / Quotation" : "Create Order / Create Quotation"}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {heldCount > 0 && (
            <button
              type="button"
              onClick={() => navigate("/admin/orders/quotations?status=Hold")}
              className="inline-flex items-center gap-2 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-800 hover:bg-orange-100"
              title="Open the documents parked on hold, to recall or release them"
            >
              <PauseCircle size={16} />
              On Hold ({heldCount})
            </button>
          )}

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

            <label className="flex items-start gap-2 text-sm mt-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={sendCustomerEmail}
                onChange={(e) => setSendCustomerEmail(e.target.checked)}
              />
              <span>
                Email the customer a copy
                <span className="block text-xs text-gray-500">
                  Leave unticked to save it without sending anything.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Package size={18} />
              <h2 className="font-semibold">Products</h2>
            </div>
            <div className="inline-flex rounded-md border overflow-hidden text-sm">
              {PRICE_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => changePriceMode(m.id)}
                  className={`px-3 py-1.5 ${
                    priceMode === m.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-2 mb-3">
            {priceMode === "wholesale"
              ? "Products are added at their wholesale price. Anything without one falls back to the regular price."
              : "Products are added at their regular price."}
          </p>

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
                      <td className="py-2">
                        <div className="flex flex-col items-end gap-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={it.price}
                            onChange={(e) => updateItemPrice(it.key, e.target.value)}
                            className="w-28 border rounded px-2 py-1 text-right"
                            aria-label={`Price for ${it.name}`}
                          />
                          {it.priceEdited && !it.isCustom && (
                            <button
                              type="button"
                              onClick={() => resetItemPrice(it.key)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Edited &middot; reset
                            </button>
                          )}
                          {!it.priceEdited && !it.isCustom && priceMode === "wholesale" && !it.hasWholesale && (
                            <span className="text-xs text-amber-600">No wholesale price</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right">{currency(num(it.price) * num(it.quantity))}</td>
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
                      Prices include VAT. Editing a price changes this document only &mdash; the product
                      itself is never touched. You can add special discount below.
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
              <span>Items (excl. VAT)</span>
              <span>{currency(itemsNet)}</span>
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
              <span>Tax/Vat %</span>
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
              <span>Tax/Vat</span>
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
            <div className="flex justify-between items-center py-1">
              <span>Payment Method</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-40 border rounded px-2 py-1 text-right text-sm bg-white"
              >
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="card">Debit/Credit Card</option>
                <option value="tabby">Tabby (Pay Later)</option>
                <option value="tamara">Tamara (Split Payments)</option>
              </select>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{currency(totalPrice)}</span>
            </div>
          </div>

          <button
            disabled={!canSubmit}
            onClick={() => handleCreate(false)}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-white ${
              canSubmit ? "bg-lime-600 hover:bg-lime-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            title={!canSubmit ? "Add at least one item and fill shipping details" : `Create ${mode}`}
          >
            <Save size={16} />
            {recalledId
              ? `Update ${mode === "quotation" ? "Quotation" : "Order"}`
              : mode === "quotation"
                ? "Create Quotation"
                : "Create Order"}
          </button>

          <button
            disabled={!canSubmit}
            onClick={() => handleCreate(true)}
            className={`mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded border ${
              canSubmit
                ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                : "border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            title={
              !canSubmit
                ? "Add at least one item and fill shipping details"
                : "Save it parked on the Recent Quotation page"
            }
          >
            <PauseCircle size={16} />
            {recalledId ? "Save & keep On Hold" : "Save on Hold"}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            {recalledId ? (
              <>
                Saving keeps it on <span className="font-medium">Recent Quotation</span>. The plain save releases a
                held document back to Draft; use <span className="font-medium">Save &amp; keep On Hold</span> to
                leave it parked.
              </>
            ) : (
              <>
                Saved to <span className="font-medium">Recent Quotation</span> first. It reaches the Orders queues
                only when you move it there. <span className="font-medium">Save on Hold</span> parks it there
                instead, until you release it.
              </>
            )}
          </p>

          {discountAmount > 0 && (
            <p className="text-xs text-gray-500 mt-2">Note: Special discount will appear on the invoice.</p>
          )}
        </div>
      </div>
    </div>
  )
}
