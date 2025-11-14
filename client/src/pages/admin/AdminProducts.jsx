"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ProductForm from "../../components/admin/ProductForm"
import MoveProductsModal from "../../components/admin/MoveProductsModal"
import { useToast } from "../../context/ToastContext"
import { Plus, Edit, Trash2, Search, Tag, Eye, EyeOff, Download, CheckSquare, Square, MoveRight } from "lucide-react"

import config from "../../config/config"
import { exportProductsToExcel } from "../../utils/exportToExcel"
const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSubcategory, setFilterSubcategory] = useState("all")
  const [filterBrand, setFilterBrand] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all") // New filter for active/inactive
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const PRODUCTS_PER_PAGE = 20
  const { showToast } = useToast()
  const [justEditedId, setJustEditedId] = useState(null)
  const [highlightTimer, setHighlightTimer] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectAllMode, setSelectAllMode] = useState(false) // Track if "select all" is active
  const [allProductIds, setAllProductIds] = useState([]) // Store all product IDs for select all
  const [loadingSelectAll, setLoadingSelectAll] = useState(false) // Track select all loading
  const [brands, setBrands] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [filteredSubcategories, setFilteredSubcategories] = useState([])
  const [categoryProductCount, setCategoryProductCount] = useState(0)
  const [showMoveModal, setShowMoveModal] = useState(false)

  // Derived counters
  const totalSelected = useMemo(() => {
    return selectAllMode ? allProductIds.length : selectedIds.size
  }, [selectedIds, selectAllMode, allProductIds])

  // Get count of products for current category/subcategory filter
  const fetchFilteredCount = async () => {
    try {
      const token = getAdminToken()
      if (!token) return

      const params = {}
      if (filterCategory && filterCategory !== "all") {
        params.parentCategory = filterCategory
      }
      if (filterSubcategory && filterSubcategory !== "all") {
        params.category = filterSubcategory
      }
      
      const { data } = await axios.get(`${config.API_URL}/api/products/admin/count`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      
      setCategoryProductCount(data.totalCount || 0)
    } catch (error) {
      console.error("Failed to fetch product count:", error)
      setCategoryProductCount(0)
    }
  }

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString()}`
  }

  // Get admin token with proper validation
  const getAdminToken = () => {
    const adminToken = localStorage.getItem("adminToken")
    const regularToken = localStorage.getItem("token")

    console.log("🔍 Checking tokens:")
    console.log("Admin Token:", adminToken ? "Present" : "Missing")
    console.log("Regular Token:", regularToken ? "Present" : "Missing")

    // Use adminToken first, fallback to regular token
    const token = adminToken || regularToken

    if (token) {
      console.log("✅ Using token:", token.substring(0, 20) + "...")
      return token
    }

    console.log("❌ No valid token found")
    return null
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [page, searchTerm, filterCategory, filterSubcategory, filterBrand, filterStatus])

  useEffect(() => {
    fetchBrands()
    fetchSubcategories()
  }, [])

  // On mount, check if a product was edited on previous navigation
  useEffect(() => {
    const lastEdited = sessionStorage.getItem("lastEditedProductId")
    if (lastEdited) {
      setJustEditedId(lastEdited)
      sessionStorage.removeItem("lastEditedProductId")
    }
    return () => {
      if (highlightTimer) clearTimeout(highlightTimer)
    }
  }, [])

  // Filter subcategories based on selected category
  useEffect(() => {
    if (filterCategory === "all") {
      setFilteredSubcategories(subcategories)
    } else {
      setFilteredSubcategories(subcategories.filter(sub => sub.category && sub.category._id === filterCategory))
    }
    // Reset subcategory filter when category changes
    setFilterSubcategory("all")
    // Fetch new count when category changes
    fetchFilteredCount()
  }, [filterCategory, subcategories])

  // Update count when subcategory changes
  useEffect(() => {
    fetchFilteredCount()
  }, [filterSubcategory])

  // Selection helpers
  const toggleSelectOne = (id) => {
    if (selectAllMode) {
      // If in select all mode, switch to individual selection mode
      setSelectAllMode(false)
      setAllProductIds([])
      // Start with just this product deselected (or selected if it wasn't selected)
      const currentPageIds = new Set(products.map(p => p._id))
      currentPageIds.delete(id) // Remove the clicked item
      setSelectedIds(currentPageIds)
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id); else next.add(id)
        return next
      })
    }
  }

  const isAllOnPageSelected = useMemo(() => {
    if (!products || products.length === 0) return false
    if (selectAllMode) return true
    return products.every(p => selectedIds.has(p._id))
  }, [products, selectedIds, selectAllMode])

  const isAllProductsSelected = useMemo(() => {
    return selectAllMode
  }, [selectAllMode])

  const toggleSelectPage = () => {
    if (selectAllMode) {
      // If all are selected, deselect all
      setSelectAllMode(false)
      setSelectedIds(new Set())
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (isAllOnPageSelected) {
          products.forEach(p => next.delete(p._id))
        } else {
          products.forEach(p => next.add(p._id))
        }
        return next
      })
    }
  }

  const toggleSelectAll = async () => {
    if (selectAllMode) {
      // Deselect all
      setSelectAllMode(false)
      setSelectedIds(new Set())
      setAllProductIds([])
    } else {
      // Select all products across all pages - just get the count, not the actual IDs
      setLoadingSelectAll(true)
      try {
        const totalCount = await getProductCount()
        console.log('Total product count:', totalCount)
        setAllProductIds(new Array(totalCount).fill(null).map((_, i) => `temp_${i}`)) // Create temp IDs for count
        setSelectAllMode(true)
        setSelectedIds(new Set()) // Clear individual selections
        showToast(`Selected all ${totalCount} products`, 'success')
      } catch (error) {
        console.error('Error selecting all products:', error)
        showToast('Failed to select all products', 'error')
      }
      setLoadingSelectAll(false)
    }
  }

  const clearSelection = () => {
    setSelectAllMode(false)
    setSelectedIds(new Set())
  }

  // Export helpers
  const handleExport = (scope = "selected") => {
    const filenameBase = [
      "products",
      scope,
      filterCategory && filterCategory !== 'all' ? `cat-${filterCategory}` : null,
      searchTerm ? `q-${searchTerm.replace(/\s+/g, '-')}` : null,
      `p${page}`
    ].filter(Boolean).join('_')

    if (scope === "selected") {
      if (selectAllMode) {
        // Export all products with current filters (same as filtered results)
        handleExportByCurrentFilters()
      } else {
        // Export only selected products on current page
        exportProductsToExcel(products.filter(p => selectedIds.has(p._id)), `${filenameBase}.xlsx`)
      }
    } else if (scope === "page") {
      exportProductsToExcel(products, `${filenameBase}.xlsx`)
    } else if (scope === "all") {
      // Fetch all with current filters ignoring pagination
      fetchAllForExport().then(all => exportProductsToExcel(all, `${filenameBase}.xlsx`))
    }
  }

  const handleExportByCurrentFilters = async () => {
    const overrides = {}
    if (filterCategory && filterCategory !== 'all') overrides.parentCategory = filterCategory
    if (filterSubcategory && filterSubcategory !== 'all') overrides.category = filterSubcategory
    if (filterBrand && filterBrand !== 'all') overrides.brand = filterBrand
    if (filterStatus && filterStatus !== 'all') overrides.isActive = filterStatus === 'active'
    if (searchTerm.trim()) overrides.search = searchTerm.trim()
    
    const all = await fetchAllForExport(overrides)
    const fname = [
      'products_filtered',
      filterCategory && filterCategory !== 'all' ? `cat-${filterCategory}` : null,
      filterSubcategory && filterSubcategory !== 'all' ? `sub-${filterSubcategory}` : null,
      filterBrand && filterBrand !== 'all' ? `brand-${filterBrand}` : null,
      filterStatus && filterStatus !== 'all' ? `status-${filterStatus}` : null,
      searchTerm ? `search-${searchTerm.replace(/\s+/g, '-')}` : null,
    ].filter(Boolean).join('_') || 'products_current_filters'
    exportProductsToExcel(all, `${fname}.xlsx`)
  }

  const getProductCount = async () => {
    const token = getAdminToken()
    if (!token) return 0
    try {
      const params = {}
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
      if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand
      if (filterStatus && filterStatus !== "all") params.isActive = filterStatus === "active"
      
      const { data } = await axios.get(`${config.API_URL}/api/products/admin/count`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      
      return data.totalCount || 0
    } catch (e) {
      console.error('Get product count error', e)
      showToast('Failed to get product count', 'error')
      return 0
    }
  }

  const fetchAllForExport = async (overrides = {}) => {
    const token = getAdminToken()
    if (!token) return []
    try {
      const params = { limit: 1000, page: 1 }
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
      if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand
      if (filterStatus && filterStatus !== "all") params.isActive = filterStatus === "active"
      Object.assign(params, overrides)
      // We may need to loop if more than 1000
      let all = []
      let currentPage = 1
      while (true) {
        const { data } = await axios.get(`${config.API_URL}/api/products/admin`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...params, page: currentPage }
        })
        const batch = data.products || []
        all = all.concat(batch)
        if (!data.totalCount || all.length >= data.totalCount || batch.length === 0) break
        currentPage += 1
      }
      return all
    } catch (e) {
      console.error('Export fetchAll error', e)
      showToast('Failed to fetch all products for export', 'error')
      return []
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      // Build query params for search, category, subcategory, brand, pagination
      const params = { limit: PRODUCTS_PER_PAGE, page }
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
      if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand
      if (filterStatus && filterStatus !== "all") params.isActive = filterStatus === "active"

      const { data, headers } = await axios.get(`${config.API_URL}/api/products/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      })
      setProducts(data.products || [])
      const totalCount = data.totalCount || 0
      setTotalPages(Math.ceil(totalCount / PRODUCTS_PER_PAGE) || 1)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load products:", error)
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
        // Redirect to admin login
        window.location.href = "/grabiansadmin/login"
      } else {
        setError("Failed to load products. Please try again later.")
      }
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = getAdminToken()

      if (!token) {
        console.log("No token for categories fetch")
        return
      }

      const { data } = await axios.get(`${config.API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/brands`)
      setBrands(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load brands:", error)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/subcategories`)
      // Filter out subcategories without valid category reference
      const validSubcategories = Array.isArray(data) ? data.filter(sub => sub && sub.category && sub.category._id) : []
      setSubcategories(validSubcategories)
    } catch (error) {
      console.error("Failed to load subcategories:", error)
      setSubcategories([])
    }
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = getAdminToken()

        if (!token) {
          setError("Authentication required. Please login again.")
          return
        }

        await axios.delete(`${config.API_URL}/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setProducts(products.filter((product) => product._id !== productId))
        showToast("Product deleted successfully", "success")
      } catch (error) {
        console.error("Failed to delete product:", error)
        if (error.response?.status === 401) {
          setError("Authentication failed. Please login again.")
          window.location.href = "/grabiansadmin/login"
        } else {
          setError("Failed to delete product. Please try again.")
          showToast("Failed to delete product", "error")
        }
      }
    }
  }

  const handleToggleStatus = async (productId) => {
    try {
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      const product = products.find(p => p._id === productId)
      if (!product) return

      const newStatus = !product.isActive

      await axios.put(`${config.API_URL}/api/products/${productId}`, 
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Update the product in the local state
      setProducts(products.map(p => 
        p._id === productId ? { ...p, isActive: newStatus } : p
      ))

      showToast(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
    } catch (error) {
      console.error("Failed to toggle product status:", error)
      showToast("Failed to update product status", "error")
    }
  }

  const handleBulkMove = async (categoryData) => {
    try {
      const token = getAdminToken()

      if (!token) {
        showToast("Authentication required. Please login again.", "error")
        return
      }

      // Get product IDs to move
      let productIds
      if (selectAllMode) {
        // If all products are selected, fetch all IDs with current filters
        const params = {}
        if (searchTerm.trim() !== "") params.search = searchTerm.trim()
        if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory
        if (filterSubcategory && filterSubcategory !== "all") params.category = filterSubcategory
        if (filterBrand && filterBrand !== "all") params.brand = filterBrand
        if (filterStatus && filterStatus !== "all") params.isActive = filterStatus === "active"

        const { data } = await axios.get(`${config.API_URL}/api/products/admin`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...params, limit: 10000, page: 1 }
        })
        
        productIds = data.products.map(p => p._id)
      } else {
        productIds = Array.from(selectedIds)
      }

      if (productIds.length === 0) {
        showToast("No products selected", "error")
        return
      }

      // Make bulk move request
      await axios.put(
        `${config.API_URL}/api/products/bulk-move`,
        {
          productIds,
          ...categoryData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      showToast(`Successfully moved ${productIds.length} product(s)`, "success")
      
      // Clear selection and refresh products
      setSelectAllMode(false)
      setSelectedIds(new Set())
      setAllProductIds([])
      await fetchProducts()
    } catch (error) {
      console.error("Failed to move products:", error)
      showToast(error.response?.data?.message || "Failed to move products", "error")
    }
  }

  const handleFormSubmit = async (productData) => {
    try {
      console.log("🚀 Starting product submission...")
      console.log("📦 Product data:", productData)

      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        window.location.href = "/grabiansadmin/login"
        return
      }

      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

      console.log("🔧 Request config:", axiosConfig)

      let response
      if (editingProduct) {
        console.log("✏️ Updating existing product...")
        response = await axios.put(`${config.API_URL}/api/products/${editingProduct._id}`, productData, axiosConfig)
      } else {
        console.log("➕ Creating new product...")
        response = await axios.post(`${config.API_URL}/api/products`, productData, axiosConfig)
      }

      console.log("✅ Product saved successfully:", response.data)

      // Refresh product list
      await fetchProducts()
      setShowForm(false)
      // Determine the affected product id
      const affectedId = editingProduct ? editingProduct._id : response?.data?._id
      setEditingProduct(null)
      setError(null)
      showToast("Product saved successfully", "success")

      // Highlight the affected product row
      if (affectedId) {
        setJustEditedId(affectedId)
        sessionStorage.setItem("lastEditedProductId", affectedId)
        // Scroll into view once products are rendered
        setTimeout(() => {
          const el = document.getElementById(`product-row-${affectedId}`)
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 250)
        // Clear highlight after a few seconds
        const t = setTimeout(() => setJustEditedId(null), 3500)
        setHighlightTimer(t)
      }
    } catch (error) {
      console.error("❌ Failed to save product:", error)
      console.error("❌ Error response:", error.response?.data)
      console.error("❌ Error status:", error.response?.status)

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
        // Clear invalid tokens
        localStorage.removeItem("adminToken")
        localStorage.removeItem("token")
        window.location.href = "/grabiansadmin/login"
      } else {
        setError(`Failed to save product: ${error.response?.data?.message || error.message}`)
        showToast("Failed to save product", "error")
      }
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized"

    // Handle both string ID and object
    const id = typeof categoryId === "object" ? categoryId._id : categoryId
    const category = categories.find((cat) => cat._id === id)
    return category ? category.name : "Unknown"
  }

  // Helper to get parent category name from product
  const getParentCategoryName = (product) => {
    // Check if parentCategory is directly on the product
    if (product.parentCategory) {
      if (typeof product.parentCategory === 'object' && product.parentCategory.name) {
        return product.parentCategory.name;
      }
      const parent = categories.find(cat => cat._id === product.parentCategory);
      if (parent) return parent.name;
    }
    
    // Check if parent category is nested in the category object
    if (product.category && product.category.category) {
      if (typeof product.category.category === 'object' && product.category.category.name) {
        return product.category.category.name;
      }
      const parent = categories.find(cat => cat._id === product.category.category);
      if (parent) return parent.name;
    }
    
    return 'N/A';
  };

  // Update: Only filter on frontend for search by name, brand, or exact SKU (case-insensitive)
  // Remove filteredProducts and use products directly in rendering

  // Add useEffect to refetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterCategory, filterSubcategory, filterBrand, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
              {error.includes("Authentication") && (
                <button
                  onClick={() => (window.location.href = "/grabiansadmin/login")}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Login Again
                </button>
              )}
            </div>
          )}

          {showForm ? (
            <ProductForm product={editingProduct} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
          ) : (
            <>
              {/* Search and Filters Section */}
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter & Search Products</h3>
                
                {/* <!-- Filter Controls and Search --> */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                    <select
                      value={filterSubcategory}
                      onChange={(e) => setFilterSubcategory(e.target.value)}
                      disabled={filterCategory === "all"}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="all">{filterCategory === "all" ? "Select Category First" : "All Subcategories"}</option>
                      {filteredSubcategories.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Brands</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Products</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Name, SKU, Brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {(searchTerm || filterCategory !== "all" || filterSubcategory !== "all" || filterBrand !== "all" || filterStatus !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setFilterCategory("all")
                          setFilterSubcategory("all")
                          setFilterBrand("all")
                          setFilterStatus("all")
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleSelectAll}
                          disabled={loadingSelectAll}
                          className={`px-3 py-1 text-sm rounded border ${
                            selectAllMode 
                              ? 'bg-blue-50 border-blue-300 text-blue-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          } ${loadingSelectAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loadingSelectAll ? 'Loading...' : 'Select All Pages'}
                        </button>
                        
                        {totalSelected > 0 && (
                          <button
                            onClick={clearSelection}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>

                      {/* Show category/subcategory product count */}
                      {(filterCategory !== "all" || filterSubcategory !== "all") && (
                        <div className="text-sm text-gray-600">
                          {categoryProductCount} product{categoryProductCount !== 1 ? 's' : ''} in{' '}
                          {filterSubcategory !== "all" 
                            ? subcategories.find(s => s._id === filterSubcategory)?.name
                            : categories.find(c => c._id === filterCategory)?.name}
                        </div>
                      )}
                    </div>

                    {/* Download Options - Only show when there are products selected */}
                    {totalSelected > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-blue-700">
                          {selectAllMode ? `${totalSelected} products selected` : `${totalSelected} product${totalSelected > 1 ? 's' : ''} selected`}
                        </div>
                        <button
                          onClick={() => setShowMoveModal(true)}
                          className="inline-flex items-center gap-1 px-4 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                          <MoveRight size={14} /> Move
                        </button>
                        <button
                          onClick={() => handleExport('selected')}
                          className="inline-flex items-center gap-1 px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          <Download size={14} /> Export
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Move Products Modal */}
              <MoveProductsModal
                isOpen={showMoveModal}
                onClose={() => setShowMoveModal(false)}
                selectedCount={totalSelected}
                onMove={handleBulkMove}
              />

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={toggleSelectPage}
                                className={`inline-flex items-center rounded focus:outline-none ${
                                  isAllOnPageSelected ? 'text-lime-500 hover:text-lime-600' : 'text-gray-600 hover:text-gray-800'
                                }`}
                                title="Select/deselect current page"
                              >
                                {isAllOnPageSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                              </button>
                              {selectAllMode && (
                                <span className="text-xs text-blue-600 font-medium">ALL</span>
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Product
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Brand
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Category
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Parent Category
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            SKU
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.length > 0 ? (
                          products.map((product) => {
                            console.log('Product:', product);
                            console.log('Product.parentCategory:', product.parentCategory);
                            console.log('Product.category:', product.category);
                            console.log('Product.category.category:', product.category?.category);
                            console.log('Categories list:', categories);
                            return (
                              <tr
                                key={product._id}
                                id={`product-row-${product._id}`}
                className={`hover:bg-gray-50 transition-colors ${
                                  justEditedId === product._id
                  ? "bg-lime-100 ring-2 ring-lime-500 animate-pulse"
                                    : ""
                                }`}
                              >
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => toggleSelectOne(product._id)}
                                    className={`${(selectAllMode || selectedIds.has(product._id)) ? 'text-lime-500 hover:text-lime-600' : 'text-gray-600 hover:text-gray-800'} rounded focus:outline-none`}
                                  >
                                    {(selectAllMode || selectedIds.has(product._id)) ? <CheckSquare size={16} /> : <Square size={16} />}
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <img
                                        src={product.image || "/placeholder.svg"}
                                        alt={product.name}
                                        className="h-10 w-10 rounded-md object-cover"
                                      />
                                    </div>
                                   <div className="ml-4 max-w-[110px] overflow-hidden">
                                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                      {product.slug && <div className="text-sm text-gray-500">/{product.slug}</div>}
                                    </div>


                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{product.brand?.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {product.category?.name || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800">
                                    {getParentCategoryName(product)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                                  {product.oldPrice && (
                                    <div className="text-xs text-gray-500 line-through">
                                      {formatPrice(product.oldPrice)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{product.sku || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col space-y-1">
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                      {product.isActive ? (
                                        <>
                                          <Eye className="h-3 w-3 mr-1" />
                                          Active
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="h-3 w-3 mr-1" />
                                          Inactive
                                        </>
                                      )}
                                    </span>
                                    {product.featured && (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => exportProductsToExcel([product], `product_${product.sku || product._id}.xlsx`)}
                                      className="text-gray-700 hover:text-gray-900"
                                      title="Download this product"
                                    >
                                      <Download size={18} />
                                    </button>
                                 
                                    <button
                                      onClick={() => handleEdit(product)}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(product._id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 my-4">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  {/* Windowed Pagination Logic */}
                  {(() => {
                    const pages = [];
                    // Always show first page
                    pages.push(
                      <button
                        key={1}
                        className={`px-3 py-1 border rounded ${page === 1 ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => setPage(1)}
                      >
                        1
                      </button>
                    );

                    // Determine window
                    let start = Math.max(2, page);
                    let end = Math.min(totalPages - 1, page + 2);

                    // If on first or second page, show 2 and 3
                    if (page === 1) {
                      start = 2;
                      end = Math.min(totalPages - 1, 3);
                    } else if (page === 2) {
                      start = 2;
                      end = Math.min(totalPages - 1, 4);
                    }
                    // If on last or near-last page, show last-2, last-1
                    if (page >= totalPages - 2) {
                      start = Math.max(2, totalPages - 2);
                      end = totalPages - 1;
                    }

                    // Add ellipsis if needed
                    if (start > 2) {
                      pages.push(
                        <span key="start-ellipsis" className="px-2">...</span>
                      );
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`px-3 py-1 border rounded ${page === i ? 'bg-blue-500 text-white' : ''}`}
                          onClick={() => setPage(i)}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Add ellipsis if needed
                    if (end < totalPages - 1) {
                      pages.push(
                        <span key="end-ellipsis" className="px-2">...</span>
                      );
                    }

                    // Always show last page if more than 1
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          className={`px-3 py-1 border rounded ${page === totalPages ? 'bg-blue-500 text-white' : ''}`}
                          onClick={() => setPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProducts
