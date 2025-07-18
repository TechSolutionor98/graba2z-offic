"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ProductForm from "../../components/admin/ProductForm"
import { useToast } from "../../context/ToastContext"
import { Plus, Edit, Trash2, Search, Tag, Eye, EyeOff } from "lucide-react"

import config from "../../config/config"
const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const PRODUCTS_PER_PAGE = 20
  const { showToast } = useToast()

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
  }, [page, searchTerm, filterCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()

      if (!token) {
        setError("Authentication required. Please login again.")
        return
      }

      // Build query params for search, category, pagination
      const params = { limit: PRODUCTS_PER_PAGE, page }
      if (searchTerm.trim() !== "") params.search = searchTerm.trim()
      if (filterCategory && filterCategory !== "all") params.parentCategory = filterCategory

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
      setEditingProduct(null)
      setError(null)
      showToast("Product saved successfully", "success")
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

  // Add useEffect to refetch products when searchTerm or filterCategory changes
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterCategory]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>

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
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search name, sku, brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="relative md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag size={18} className="text-gray-400" />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                            Stock
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
                              <tr key={product._id} className="hover:bg-gray-50">
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
                                  <div className="text-sm text-gray-900">{product.countInStock}</div>
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
                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
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
