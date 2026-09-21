"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, RefreshCw, X, AlertTriangle, PackageX, Boxes, Wallet } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

// Stock and pricing for every product on one screen.
//
// The list pages answer "what do we sell"; this answers "what do we hold and
// what is it worth". The totals come from the server across the whole filtered
// set rather than the page on screen -- a stock value that only counted the
// visible rows would read as the real figure and be wrong by orders of
// magnitude.

const PER_PAGE = 25

const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
]

const PRICING_FILTERS = [
  { value: "all", label: "All pricing" },
  { value: "offer", label: "On offer" },
  { value: "no-offer", label: "No offer price" },
  { value: "wholesale", label: "Wholesale set" },
  { value: "no-wholesale", label: "No wholesale price" },
]

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name A–Z" },
  { value: "stock-asc", label: "Stock: low to high" },
  { value: "stock-desc", label: "Stock: high to low" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

const DEFAULT_FILTERS = {
  search: "",
  parentCategory: "",
  category: "",
  brand: "",
  stock: "all",
  pricing: "all",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
}

const money = (value) =>
  `AED ${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const units = (value) => (Number(value) || 0).toLocaleString()

// A price of null has never been set, which is not the same as a price of zero
// -- and on a wholesale column that difference is the whole point of looking.
const priceCell = (value) => (value === null || value === undefined || value === "" ? "—" : money(value))

const sellingPrice = (product) =>
  Number(product?.offerPrice) > 0 ? Number(product.offerPrice) : Number(product?.price) || 0

const stockTone = (product) => {
  const count = Number(product?.countInStock) || 0
  const limit = Number(product?.lowStockWarning ?? 5)
  if (count <= 0) return { label: "Out of stock", className: "bg-red-100 text-red-700" }
  if (count <= limit) return { label: "Low stock", className: "bg-amber-100 text-amber-800" }
  return { label: "In stock", className: "bg-lime-100 text-lime-800" }
}

const getAdminToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

const SummaryTile = ({ icon: Icon, label, value, hint, tone = "default" }) => (
  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
      <Icon size={14} className={tone === "warn" ? "text-amber-500" : tone === "bad" ? "text-red-500" : "text-lime-600"} />
      {label}
    </div>
    <p className="mt-2 text-xl font-bold tabular-nums text-gray-900">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
  </div>
)

const Inventory = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  // The search box is typed into; the query only follows once typing stops, so
  // a nine-character SKU does not cost nine round trips.
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [brands, setBrands] = useState([])

  const requestRef = useRef(0)

  const setFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // A subcategory belongs to one category, so keeping it selected after the
      // category changes would filter to a pair that cannot match anything.
      ...(key === "parentCategory" ? { category: "" } : {}),
    }))
    if (key !== "search") setPage(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    const token = getAdminToken()
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }

    axios
      .get(`${config.API_URL}/api/categories`, { headers })
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))

    axios
      .get(`${config.API_URL}/api/subcategories`)
      .then(({ data }) =>
        // Rows without a parent reference cannot be placed under a category, so
        // they would only ever show as orphans in the list.
        setSubcategories(Array.isArray(data) ? data.filter((sub) => sub?.category?._id) : []),
      )
      .catch(() => setSubcategories([]))

    axios
      .get(`${config.API_URL}/api/brands`)
      .then(({ data }) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]))
  }, [])

  const fetchInventory = async () => {
    const requestId = ++requestRef.current
    const token = getAdminToken()

    if (!token) {
      setError("Authentication required. Please log in again.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.get(`${config.API_URL}/api/products/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: debouncedSearch || undefined,
          parentCategory: filters.parentCategory || undefined,
          category: filters.category || undefined,
          brand: filters.brand || undefined,
          stock: filters.stock,
          pricing: filters.pricing,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          sort: filters.sort,
          limit: PER_PAGE,
          page,
        },
      })

      // A slow first request must not overwrite the answer to a later one.
      if (requestId !== requestRef.current) return

      setProducts(data.products || [])
      setSummary(data.summary || null)
      setTotalCount(data.totalCount || 0)
      setPages(data.pages || 1)
      setError(null)
    } catch (err) {
      if (requestId !== requestRef.current) return
      console.error("Failed to load inventory:", err)
      setError(err.response?.data?.message || "Could not load inventory. Try again.")
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.parentCategory,
    filters.category,
    filters.brand,
    filters.stock,
    filters.pricing,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    page,
  ])

  // Only the subcategories under the chosen category, so the two dropdowns can
  // never describe a combination that holds no products. With no category
  // picked, every first-level subcategory is offered.
  const visibleSubcategories = useMemo(() => {
    const firstLevel = subcategories.filter((sub) => sub.level === 1)
    if (!filters.parentCategory) return firstLevel
    return firstLevel.filter((sub) => sub.category._id === filters.parentCategory)
  }, [subcategories, filters.parentCategory])

  const hasFilters = useMemo(
    () => Object.keys(DEFAULT_FILTERS).some((key) => filters[key] !== DEFAULT_FILTERS[key]),
    [filters],
  )

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const selectClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="mt-1 text-gray-600">Stock held and what it is worth, across every product.</p>
          </div>
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-lime-500 px-4 py-2 text-white transition-colors hover:bg-lime-600 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* The totals answer the question the page exists for, so they sit above
            the rows rather than under them. They follow the filters: narrow to a
            brand and the value shown is that brand's. */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <SummaryTile icon={Boxes} label="Products" value={units(summary?.skus)} hint={`${units(summary?.units)} units in stock`} />
          <SummaryTile
            icon={Wallet}
            label="Stock value"
            value={money(summary?.sellingValue)}
            hint="At today's selling price"
          />
          <SummaryTile
            icon={Wallet}
            label="Wholesale value"
            value={money(summary?.wholesaleValue)}
            hint="Products with no wholesale price count as zero"
          />
          <SummaryTile icon={AlertTriangle} label="Low stock" value={units(summary?.lowStock)} hint="At or below its warning level" tone="warn" />
          <SummaryTile icon={PackageX} label="Out of stock" value={units(summary?.outOfStock)} tone="bad" />
        </div>

        {/* Filters in the header, as one row that wraps rather than a panel to
            open -- the whole point is changing them quickly and seeing the
            totals move. */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Search by name, SKU, barcode or GTIN..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            <select value={filters.parentCategory} onChange={(e) => setFilter("parentCategory", e.target.value)} className={selectClass}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
              className={selectClass}
              disabled={visibleSubcategories.length === 0}
            >
              <option value="">
                {filters.parentCategory && visibleSubcategories.length === 0
                  ? "No subcategories"
                  : "All subcategories"}
              </option>
              {visibleSubcategories.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>

            <select value={filters.brand} onChange={(e) => setFilter("brand", e.target.value)} className={selectClass}>
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <select value={filters.stock} onChange={(e) => setFilter("stock", e.target.value)} className={selectClass}>
              {STOCK_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select value={filters.pricing} onChange={(e) => setFilter("pricing", e.target.value)} className={selectClass}>
              {PRICING_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => setFilter("minPrice", e.target.value)}
                placeholder="Min AED"
                className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => setFilter("maxPrice", e.target.value)}
                placeholder="Max AED"
                className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)} className={selectClass}>
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-md bg-red-50 p-4 text-red-600">
            <span>{error}</span>
            <button onClick={fetchInventory} className="text-sm font-medium underline">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-lime-500" />
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Product", "SKU / Codes", "Stock", "Wholesale", "Price", "Offer", "Discount", "Stock value"].map((heading) => (
                      <th
                        key={heading}
                        className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${
                          ["Product", "SKU / Codes"].includes(heading) ? "text-left" : "text-right"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                        No products match these filters.
                        {hasFilters && (
                          <button onClick={clearFilters} className="ml-2 font-medium text-lime-600 hover:underline">
                            Clear them
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const tone = stockTone(product)
                      const value = (Number(product.countInStock) || 0) * sellingPrice(product)

                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image ? (
                                <img
                                  src={getFullImageUrl(product.image)}
                                  alt=""
                                  className="h-10 w-10 shrink-0 rounded object-cover ring-1 ring-gray-200"
                                />
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded bg-gray-100 ring-1 ring-gray-200" />
                              )}
                              <div className="min-w-0">
                                <p className="line-clamp-2 max-w-md text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {[product.brand?.name, product.parentCategory?.name].filter(Boolean).join(" · ") || "—"}
                                  {!product.isActive && <span className="ml-2 text-red-500">Inactive</span>}
                                  {product.onHold && <span className="ml-2 text-amber-600">On hold</span>}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-mono text-sm text-gray-900">{product.sku || "—"}</p>
                            {(product.barcode || product.gtin) && (
                              <p className="mt-0.5 font-mono text-xs text-gray-500">{product.barcode || product.gtin}</p>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-semibold tabular-nums text-gray-900">{units(product.countInStock)}</p>
                            <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${tone.className}`}>
                              {tone.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right text-sm tabular-nums text-gray-700">
                            {priceCell(product.wholesalePrice)}
                          </td>

                          <td className="px-6 py-4 text-right text-sm tabular-nums text-gray-900">{money(product.price)}</td>

                          <td className="px-6 py-4 text-right text-sm tabular-nums">
                            {Number(product.offerPrice) > 0 ? (
                              <span className="font-medium text-lime-700">{money(product.offerPrice)}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right text-sm tabular-nums text-gray-700">
                            {Number(product.discount) > 0 ? `${product.discount}%` : "—"}
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-gray-900">
                            {money(value)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4">
                <p className="text-sm text-gray-600">
                  Page <span className="font-semibold">{page}</span> of {pages} · {units(totalCount)} products
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((current) => Math.min(pages, current + 1))}
                    disabled={page >= pages}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory
