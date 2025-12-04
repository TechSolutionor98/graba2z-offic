import { useState, useEffect } from "react"
import axios from "axios"
import { X, Search, Plus, Check } from "lucide-react"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"

const ProductVariationModal = ({ isOpen, onClose, onSelectProducts, selectedVariations = [], currentProductId, currentProductName = "" }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12
  const [variationTexts, setVariationTexts] = useState({})
  const [reverseText, setReverseText] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
      fetchCategories()
      // Initialize with already selected variations
      setSelectedProducts([...selectedVariations])
      // Initialize variation texts
      const initialTexts = {}
      selectedVariations.forEach(variation => {
        if (variation.variationText) {
          initialTexts[variation._id] = variation.variationText
        }
      })
      setVariationTexts(initialTexts)
      // Reset reverse text
      setReverseText("")
    }
  }, [isOpen, selectedVariations])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
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

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      let url = `${config.API_URL}/api/products/admin`
      const params = new URLSearchParams()
      
      // Add high limit to load all products for variation selection
      params.append("limit", "1000")
      
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      if (selectedCategory) {
        params.append("category", selectedCategory)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      // The admin route returns { products, totalCount }, so extract products array
      const productsList = data.products || data
      
      // Filter out the current product being edited
      const filteredProducts = productsList.filter(p => p._id !== currentProductId)
      
      // Debug: Log products with hideFromShop status
      console.log('[Variation Modal] Loaded products:', filteredProducts.length)
      console.log('[Variation Modal] Hidden products:', filteredProducts.filter(p => p.hideFromShop).length)
      
      setProducts(filteredProducts)
    } catch (error) {
      console.error("Failed to load products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts()
      }, 500)

      return () => clearTimeout(delayDebounceFn)
    }
  }, [searchTerm, selectedCategory])

  const toggleProductSelection = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p._id === product._id)
      if (exists) {
        return prev.filter((p) => p._id !== product._id)
      } else {
        return [...prev, product]
      }
    })
  }

  const handleConfirm = () => {
    // Add variation text to each selected product
    const productsWithText = selectedProducts.map(product => ({
      ...product,
      variationText: variationTexts[product._id] || ""
    }))
    onSelectProducts(productsWithText, reverseText)
    onClose()
  }

  const isProductSelected = (productId) => {
    return selectedProducts.some((p) => p._id === productId)
  }

  const handleTextChange = (productId, text) => {
    setVariationTexts(prev => ({
      ...prev,
      [productId]: text
    }))
  }

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(products.length / productsPerPage)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Select Product Variations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Current Product Reverse Text */}
        {currentProductName && (
          <div className="p-6 border-b bg-blue-50">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Custom text for <span className="text-blue-600">{currentProductName}</span> when shown on variation pages:
            </label>
            <input
              type="text"
              placeholder="e.g., 512GB - 16GB"
              value={reverseText}
              onChange={(e) => setReverseText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
            <p className="text-xs text-gray-600 mt-2">
              This text will appear on each selected variation's product page, linking back to this product.
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-6 border-b space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
              
              {/* Text inputs for selected products */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Add custom text for variations:</p>
                {selectedProducts.map(product => (
                  <div key={product._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={getFullImageUrl(product.image) || "/placeholder.svg"} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Text for ${product.name.slice(0, 30)}...`}
                        value={variationTexts[product._id] || ""}
                        onChange={(e) => handleTextChange(product._id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentProducts.map((product) => {
                  const selected = isProductSelected(product._id)
                  const isHidden = product.hideFromShop === true
                  return (
                    <div
                      key={product._id}
                      onClick={() => toggleProductSelection(product)}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                      {isHidden && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                          Hidden
                        </div>
                      )}
                      <div className="aspect-square mb-3 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={getFullImageUrl(product.image) || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">SKU: {product.sku || "N/A"}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                          {product.offerPrice > 0 
                            ? `${product.offerPrice.toFixed(2)} AED`
                            : `${product.price.toFixed(2)} AED`
                          }
                        </span>
                        {product.countInStock <= 0 && (
                          <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add {selectedProducts.length} Variation{selectedProducts.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductVariationModal
