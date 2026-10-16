"use client"

import { Search, X } from "lucide-react"

import {
  PRICING_FILTERS,
  SORTS,
  STOCK_FILTERS,
  selectClass,
} from "./inventoryShared"

/**
 * The filter row both inventory pages carry.
 *
 * One row that wraps, rather than a panel to open: the point is changing a
 * filter quickly and watching the totals above move with it.
 */
const InventoryFilterBar = ({ filters, setFilter, clearFilters, hasFilters, categories, brands, levelOptions }) => (
  <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          placeholder="Search name, SKU, barcode or GTIN"
          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"
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

      {levelOptions.category.length > 0 && (
        <select value={filters.category} onChange={(e) => setFilter("category", e.target.value)} className={selectClass}>
          <option value="">All subcategories</option>
          {levelOptions.category.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
      )}

      {levelOptions.subCategory2.length > 0 && (
        <select value={filters.subCategory2} onChange={(e) => setFilter("subCategory2", e.target.value)} className={selectClass}>
          <option value="">All level 2</option>
          {levelOptions.subCategory2.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
      )}

      {levelOptions.subCategory3.length > 0 && (
        <select value={filters.subCategory3} onChange={(e) => setFilter("subCategory3", e.target.value)} className={selectClass}>
          <option value="">All level 3</option>
          {levelOptions.subCategory3.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
      )}

      {levelOptions.subCategory4.length > 0 && (
        <select value={filters.subCategory4} onChange={(e) => setFilter("subCategory4", e.target.value)} className={selectClass}>
          <option value="">All level 4</option>
          {levelOptions.subCategory4.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
      )}

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

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilter("minPrice", e.target.value)}
          placeholder="Min"
          className="w-20 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilter("maxPrice", e.target.value)}
          placeholder="Max"
          className="w-20 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"
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
)

export default InventoryFilterBar
