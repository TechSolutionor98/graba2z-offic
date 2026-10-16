"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"

import config from "../config/config"
import {
  CASCADE_RESETS,
  DEFAULT_FILTERS,
  PER_PAGE,
  getAdminToken,
  parentSubCategoryId,
} from "../components/admin/inventory/inventoryShared"

/**
 * The product list behind both Store Stats and Create Labels: filters, paging,
 * the category tree for the dropdowns, and the totals.
 *
 * The totals come from the server across the *whole* filtered set, never from
 * the rows on screen. A stock value that silently counted only the current page
 * would read as the real figure and be wrong by orders of magnitude, which is
 * worse than showing nothing at all.
 */
export default function useInventoryQuery() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  // The box is typed into; the query only follows once typing stops, so a
  // nine-character SKU does not cost nine round trips.
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

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...Object.fromEntries((CASCADE_RESETS[key] || []).map((field) => [field, ""])),
    }))
    if (key !== "search") setPage(1)
  }, [])

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
      // Rows with no parent reference cannot be placed under a category, so they
      // would only ever show as orphans in the list.
      .then(({ data }) => setSubcategories(Array.isArray(data) ? data.filter((sub) => sub?.category?._id) : []))
      .catch(() => setSubcategories([]))

    axios
      .get(`${config.API_URL}/api/brands`)
      .then(({ data }) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]))
  }, [])

  const fetchInventory = useCallback(async () => {
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
          subCategory2: filters.subCategory2 || undefined,
          subCategory3: filters.subCategory3 || undefined,
          subCategory4: filters.subCategory4 || undefined,
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
  }, [
    debouncedSearch,
    filters.parentCategory,
    filters.category,
    filters.subCategory2,
    filters.subCategory3,
    filters.subCategory4,
    filters.brand,
    filters.stock,
    filters.pricing,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    page,
  ])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // One dropdown per level of the category tree, each offering only what sits
  // under the level above it. Levels 3 and 4 fall back to the deepest level that
  // *is* chosen, because the catalogue does hang some deeper subcategories
  // straight off a shallower one.
  const levelOptions = useMemo(() => {
    const atLevel = (level, parentId) =>
      subcategories.filter((sub) => sub.level === level && parentSubCategoryId(sub) === parentId)

    const firstLevel = subcategories.filter(
      (sub) => sub.level === 1 && (!filters.parentCategory || sub.category._id === filters.parentCategory),
    )

    if (!filters.category) return { category: firstLevel, subCategory2: [], subCategory3: [], subCategory4: [] }

    return {
      category: firstLevel,
      subCategory2: atLevel(2, filters.category),
      subCategory3: atLevel(3, filters.subCategory2 || filters.category),
      subCategory4: atLevel(4, filters.subCategory3 || filters.subCategory2 || filters.category),
    }
  }, [subcategories, filters.parentCategory, filters.category, filters.subCategory2, filters.subCategory3])

  const hasFilters = useMemo(
    () => Object.keys(DEFAULT_FILTERS).some((key) => filters[key] !== DEFAULT_FILTERS[key]),
    [filters],
  )

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  return {
    filters,
    setFilter,
    clearFilters,
    hasFilters,
    page,
    setPage,
    pages,
    products,
    summary,
    totalCount,
    loading,
    error,
    refresh: fetchInventory,
    categories,
    brands,
    levelOptions,
  }
}
