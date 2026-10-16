"use client"

import { useEffect, useRef } from "react"
import { getFullImageUrl } from "../../../utils/imageUtils"

/**
 * The parts Store Stats and Create Labels have in common.
 *
 * The two pages list the same products and are read the same way, so someone
 * moving between them should not have to relearn the screen. They share the
 * filter row, the product cell, the tiles and the pagination from here; each
 * page writes its own columns, because that is the part where the jobs differ.
 */

export const PER_PAGE = 25

export const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
]

export const PRICING_FILTERS = [
  { value: "all", label: "All pricing" },
  { value: "offer", label: "On offer" },
  { value: "no-offer", label: "No offer price" },
  { value: "wholesale", label: "Wholesale set" },
  { value: "no-wholesale", label: "No wholesale price" },
]

export const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name A–Z" },
  { value: "stock-asc", label: "Stock: low to high" },
  { value: "stock-desc", label: "Stock: high to low" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

export const DEFAULT_FILTERS = {
  search: "",
  parentCategory: "",
  category: "",
  subCategory2: "",
  subCategory3: "",
  subCategory4: "",
  brand: "",
  stock: "all",
  pricing: "all",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
}

// Picking a level throws away everything below it: a level-3 subcategory belongs
// to one level-2 parent, so leaving it selected after its parent changes filters
// to a branch of the tree that does not exist.
export const CASCADE_RESETS = {
  parentCategory: ["category", "subCategory2", "subCategory3", "subCategory4"],
  category: ["subCategory2", "subCategory3", "subCategory4"],
  subCategory2: ["subCategory3", "subCategory4"],
  subCategory3: ["subCategory4"],
}

export const parentSubCategoryId = (sub) =>
  typeof sub?.parentSubCategory === "object" ? sub?.parentSubCategory?._id : sub?.parentSubCategory

export const money = (value) =>
  `AED ${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const units = (value) => (Number(value) || 0).toLocaleString()

export const sellingPrice = (product) =>
  Number(product?.offerPrice) > 0 ? Number(product.offerPrice) : Number(product?.price) || 0

export const stockValue = (product) => (Number(product?.countInStock) || 0) * sellingPrice(product)

export const stockTone = (product) => {
  const count = Number(product?.countInStock) || 0
  const limit = Number(product?.lowStockWarning ?? 5)
  if (count <= 0) return { label: "Out of stock", className: "bg-red-100 text-red-700" }
  if (count <= limit) return { label: "Low stock", className: "bg-amber-100 text-amber-800" }
  return { label: "In stock", className: "bg-lime-100 text-lime-800" }
}

/**
 * The code a label will carry. Barcode first, then GTIN, then SKU — most
 * specific to least. A product with none of the three cannot be labelled at all.
 */
export const labelCode = (product) => product?.barcode || product?.gtin || product?.sku || ""

export const getAdminToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

export const selectClass =
  "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"

export const SummaryTile = ({ icon: Icon, label, value, hint, tone = "default" }) => (
  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
      <Icon
        size={14}
        className={tone === "warn" ? "text-amber-500" : tone === "bad" ? "text-red-500" : "text-lime-600"}
      />
      {label}
    </div>
    <p className="mt-2 text-xl font-bold tabular-nums text-gray-900">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
  </div>
)

/**
 * A checkbox that can show the third state: some of this page is selected, but
 * not all of it.
 *
 * `indeterminate` is a property of the DOM element, not an attribute, so React
 * has no way to set it from JSX. Written declaratively it is simply ignored and
 * the box renders empty — which reads as "nothing is selected" at the exact
 * moment something is. It has to be assigned to the node.
 */
export const TriStateCheckbox = ({ checked, indeterminate, onChange, ariaLabel, disabled }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate) && !checked
  }, [indeterminate, checked])

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={ariaLabel}
      checked={Boolean(checked)}
      disabled={disabled}
      onChange={onChange}
      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-lime-600 focus:ring-lime-500 disabled:cursor-not-allowed disabled:opacity-40"
    />
  )
}

/** Image, name, brand/category and the flags that explain an odd stock figure. */
export const ProductCell = ({ product }) => (
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
)

export const Pagination = ({ page, pages, totalCount, onChange }) => {
  if (pages <= 1) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4">
      <p className="text-sm text-gray-600">
        Page <span className="font-semibold">{page}</span> of {pages} · {units(totalCount)} products
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onChange(Math.min(pages, page + 1))}
          disabled={page >= pages}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
