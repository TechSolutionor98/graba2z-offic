import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import ProductCard from "../components/ProductCard"
import { Helmet } from "react-helmet-async"
import { ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, X, Filter } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const options = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A-Z" },
  ]

  const current = options.find((o) => o.value === value)?.label || "Sort"

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const handleSelect = (val) => {
    onChange?.({ target: { value: val } })
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
      >
        <span className="truncate max-w-[46vw] sm:max-w-none">{current}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 mt-1 w-56 max-w-[80vw] bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 ${
                  opt.value === value ? "font-semibold" : ""
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const PriceFilter = ({ min, max, onApply, initialRange }) => {
  const [range, setRange] = useState(initialRange || [min, max])
  const [inputMin, setInputMin] = useState(range[0])
  const [inputMax, setInputMax] = useState(range[1])

  const handleSliderChange = (values) => {
    setRange(values)
    setInputMin(values[0])
    setInputMax(values[1])
  }

  const handleInputMin = (e) => {
    const value = e.target.value
    if (value === "") {
      setInputMin("")
    } else if (!isNaN(value)) {
      const numericValue = Number(value)
      setInputMin(numericValue)
      setRange([numericValue, range[1]])
    }
  }

  const handleInputMax = (e) => {
    const value = e.target.value
    if (value === "") {
      setInputMax("")
    } else if (!isNaN(value)) {
      const numericValue = Number(value)
      setInputMax(numericValue)
      setRange([range[0], numericValue])
    }
  }

  const handleMinFocus = (e) => {
    setInputMin("")
  }

  const handleMaxFocus = (e) => {
    setInputMax("")
  }

  const handleApply = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const minValue = inputMin === "" ? 0 : Number(inputMin)
    const maxValue = inputMax === "" ? max : Number(inputMax)
    onApply([minValue, maxValue])
  }

  return (
    <div className="">
      <Slider
        range
        min={min}
        max={max}
        value={range}
        onChange={handleSliderChange}
        trackStyle={[{ backgroundColor: "#84cc16" }]}
        handleStyle={[
          { backgroundColor: "#84cc16", borderColor: "#84cc16" },
          { backgroundColor: "#84cc16", borderColor: "#84cc16" },
        ]}
        railStyle={{ backgroundColor: "#e5e7eb" }}
      />
      <div className="flex justify-between mt-4 mb-2 text-xs font-semibold">
        <span>MIN</span>
        <span>MAX</span>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMin}
          min={min}
          max={inputMax}
          onChange={handleInputMin}
          onFocus={handleMinFocus}
          onBlur={() => {
            if (inputMin === "") {
              setInputMin(0)
            }
          }}
        />
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMax}
          min={inputMin}
          max={max}
          onChange={handleInputMax}
          onFocus={handleMaxFocus}
          onBlur={() => {
            if (inputMax === "") {
              setInputMax(max)
            }
          }}
        />
      </div>
      <button
        type="button"
        className="w-full bg-white border border-lime-500 text-lime-600 rounded py-2 font-semibold hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 transition"
        onClick={handleApply}
      >
        Apply
      </button>
    </div>
  )
}

const GamingZonePage = () => {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [gamingZonePage, setGamingZonePage] = useState(null)
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [gamingZoneCategories, setGamingZoneCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [brands, setBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [maxPrice, setMaxPrice] = useState(100000)
  const [minPrice, setMinPrice] = useState(0)
  const [stockFilters, setStockFilters] = useState({ inStock: false, outOfStock: false })
  const [brandSearch, setBrandSearch] = useState("")
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(true)
  const [showBrandFilter, setShowBrandFilter] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Brand slider state
  const brandSliderRef = useRef(null)
  const [brandScrollState, setBrandScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false
  })

  const [productsToShow, setProductsToShow] = useState(20)

  useEffect(() => {
    fetchGamingZoneData()
  }, [slug])

  useEffect(() => {
    applyFiltersAndSort()
  }, [sortBy, allProducts, selectedCategories, selectedBrands, priceRange, stockFilters])

  useEffect(() => {
    setProductsToShow(20)
  }, [selectedCategories, selectedBrands, priceRange, stockFilters, sortBy, filteredProducts.length])

  const fetchGamingZoneData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch gaming zone page details
      const pageResponse = await axios.get(`${config.API_URL}/api/gaming-zone-pages/slug/${slug}`)
      const pageData = pageResponse.data

      if (!pageData.isActive) {
        setError("This gaming zone is currently not available.")
        setLoading(false)
        return
      }

      setGamingZonePage(pageData)

      // Fetch admin-selected categories for this gaming zone
      const categoriesResponse = await axios.get(
        `${config.API_URL}/api/gaming-zone-categories/page/${slug}`
      )
      const activeCategories = categoriesResponse.data.filter(cat => cat.isActive)
      setGamingZoneCategories(activeCategories)

      // Fetch all products for this gaming zone (no pagination)
      const productsResponse = await axios.get(
        `${config.API_URL}/api/gaming-zone-pages/slug/${slug}/products?page=1&limit=10000`
      )

      const fetchedProducts = productsResponse.data.products || []
      setAllProducts(fetchedProducts)
      setProducts(fetchedProducts)
      setFilteredProducts(fetchedProducts)
      setTotalProducts(fetchedProducts.length)

      // Calculate price range
      if (fetchedProducts.length > 0) {
        const prices = fetchedProducts.map(p => p.price || 0)
        const min = Math.floor(Math.min(...prices))
        const max = Math.ceil(Math.max(...prices))
        setMinPrice(min)
        setMaxPrice(max)
        setPriceRange([min, max])
      }

      // Extract unique brands from products
      const uniqueBrands = [...new Set(
        fetchedProducts
          .filter(p => p.brand && p.brand.name)
          .map(p => JSON.stringify({ _id: p.brand._id, name: p.brand.name }))
      )].map(b => JSON.parse(b))
      
      setBrands(uniqueBrands)

    } catch (err) {
      console.error("Error fetching gaming zone data:", err)
      setError("Failed to load gaming zone. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...allProducts]

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.some(catId => 
          product.parentCategory?._id === catId ||
          product.category?._id === catId ||
          product.subCategory2?._id === catId
        )
      )
    }

    // Filter by selected brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand?._id)
      )
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const price = product.price || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Filter by stock status
    if (stockFilters.inStock && !stockFilters.outOfStock) {
      filtered = filtered.filter(p => p.stockStatus !== "Out of Stock")
    } else if (!stockFilters.inStock && stockFilters.outOfStock) {
      filtered = filtered.filter(p => p.stockStatus === "Out of Stock")
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    setFilteredProducts(filtered)
    setTotalProducts(filtered.length)
  }

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleBrandToggle = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([minPrice, maxPrice])
    setStockFilters({ inStock: false, outOfStock: false })
    setBrandSearch("")
  }

  // Brand slider handlers
  const updateBrandScrollState = () => {
    const container = brandSliderRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setBrandScrollState({
      canScrollPrev: scrollLeft > 0,
      canScrollNext: scrollLeft < scrollWidth - clientWidth - 1
    })
  }

  const scrollBrandPrev = () => {
    if (brandSliderRef.current) {
      brandSliderRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollBrandNext = () => {
    if (brandSliderRef.current) {
      brandSliderRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Update brand slider scroll state when brands change
  useEffect(() => {
    if (brandSliderRef.current) {
      updateBrandScrollState()
    }
  }, [brands])

  const applySort = () => {
    // Sorting is now handled in applyFiltersAndSort()
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{gamingZonePage?.name || "Gaming Zone"} - Graba2z</title>
        <meta name="description" content={`Browse ${gamingZonePage?.name} products`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Image */}
        {gamingZonePage?.heroImage && (
          <div className="w-full h-[170px] sm:h-[250px] md:h-[300px] lg:h-[310px] overflow-hidden">
            <img
              src={getFullImageUrl(gamingZonePage.heroImage)}
              alt={gamingZonePage.name}
              className="w-full h-full bg-cover"
            />
          </div>
        )}

        {/* Card Images */}
        {gamingZonePage?.cardImages && gamingZonePage.cardImages.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <div className={`grid gap-4 ${
              gamingZonePage.cardImages.length === 1 ? 'grid-cols-1' :
              gamingZonePage.cardImages.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-3'
            }`}>
              {gamingZonePage.cardImages.map((card, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={getFullImageUrl(card.image)}
                    alt={`${gamingZonePage.name} card ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section with Sidebar */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                {/* Clear Filters */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>

                {/* Price Filter */}
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="font-medium text-gray-900">Price Range</span>
                    {showPriceFilter ? <Minus size={20} /> : <Plus size={20} />}
                  </button>
                  {showPriceFilter && (
                    <div className="mt-4">
                      <PriceFilter
                        min={minPrice}
                        max={maxPrice}
                        initialRange={priceRange}
                        onApply={(range) => setPriceRange(range)}
                      />
                    </div>
                  )}
                </div>

                {/* Categories Filter */}
                {gamingZoneCategories.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                      className="flex justify-between items-center w-full text-left"
                    >
                      <span className="font-medium text-gray-900">Categories</span>
                      {showCategoryFilter ? <Minus size={20} /> : <Plus size={20} />}
                    </button>
                    {showCategoryFilter && (
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        {gamingZoneCategories.map((cat) => (
                          <label key={cat._id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.category._id)}
                              onChange={() => handleCategoryToggle(cat.category._id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">{cat.category.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Brands Filter */}
                {brands.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className="flex justify-between items-center w-full text-left"
                    >
                      <span className="font-medium text-gray-900">Brands</span>
                      {showBrandFilter ? <Minus size={20} /> : <Plus size={20} />}
                    </button>
                    {showBrandFilter && (
                      <div className="mt-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {filteredBrands.map((brand) => (
                            <label key={brand._id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand._id)}
                                onChange={() => handleBrandToggle(brand._id)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm text-gray-700">{brand.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Status Filter */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Stock Status</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockFilters.inStock}
                        onChange={(e) =>
                          setStockFilters({ ...stockFilters, inStock: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockFilters.outOfStock}
                        onChange={(e) =>
                          setStockFilters({ ...stockFilters, outOfStock: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Out of Stock</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg z-40"
            >
              <Filter size={24} />
            </button>

            {/* Mobile Filter Overlay */}
            {isMobileFilterOpen && (
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <button onClick={() => setIsMobileFilterOpen(false)}>
                        <X size={24} />
                      </button>
                    </div>

                    {/* Same filters as desktop */}
                    <div className="space-y-6">
                      <button
                        onClick={clearAllFilters}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Clear All Filters
                      </button>

                      {/* Price Filter */}
                      <div className="border-b pb-4">
                        <button
                          onClick={() => setShowPriceFilter(!showPriceFilter)}
                          className="flex justify-between items-center w-full text-left"
                        >
                          <span className="font-medium text-gray-900">Price Range</span>
                          {showPriceFilter ? <Minus size={20} /> : <Plus size={20} />}
                        </button>
                        {showPriceFilter && (
                          <div className="mt-4">
                            <PriceFilter
                              min={minPrice}
                              max={maxPrice}
                              initialRange={priceRange}
                              onApply={(range) => setPriceRange(range)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Categories */}
                      {gamingZoneCategories.length > 0 && (
                        <div className="border-b pb-4">
                          <button
                            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                            className="flex justify-between items-center w-full text-left"
                          >
                            <span className="font-medium text-gray-900">Categories</span>
                            {showCategoryFilter ? <Minus size={20} /> : <Plus size={20} />}
                          </button>
                          {showCategoryFilter && (
                            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                              {gamingZoneCategories.map((cat) => (
                                <label key={cat._id} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.category._id)}
                                    onChange={() => handleCategoryToggle(cat.category._id)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className="text-sm text-gray-700">{cat.category.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Brands */}
                      {brands.length > 0 && (
                        <div className="border-b pb-4">
                          <button
                            onClick={() => setShowBrandFilter(!showBrandFilter)}
                            className="flex justify-between items-center w-full text-left"
                          >
                            <span className="font-medium text-gray-900">Brands</span>
                            {showBrandFilter ? <Minus size={20} /> : <Plus size={20} />}
                          </button>
                          {showBrandFilter && (
                            <div className="mt-4 space-y-2">
                              <input
                                type="text"
                                placeholder="Search brands..."
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                              />
                              <div className="max-h-48 overflow-y-auto space-y-2">
                                {filteredBrands.map((brand) => (
                                  <label key={brand._id} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedBrands.includes(brand._id)}
                                      onChange={() => handleBrandToggle(brand._id)}
                                      className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">{brand.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stock Status */}
                      <div className="border-b pb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Stock Status</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stockFilters.inStock}
                              onChange={(e) =>
                                setStockFilters({ ...stockFilters, inStock: e.target.checked })
                              }
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">In Stock</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stockFilters.outOfStock}
                              onChange={(e) =>
                                setStockFilters({ ...stockFilters, outOfStock: e.target.checked })
                              }
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">Out of Stock</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
  


  
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Brand Slider - Shows brands from currently displayed products */}
              {brands.length > 0 && (
                <section className="mb-8 ml-6">
                  <div className="relative">
                    <button
                      onClick={scrollBrandPrev}
                      className={`absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        brandScrollState.canScrollPrev 
                          ? 'bg-lime-500 text-white hover:bg-lime-600 cursor-pointer' 
                          : 'bg-white cursor-default opacity-50'
                      }`}
                      disabled={!brandScrollState.canScrollPrev}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={brandSliderRef}
                      onScroll={updateBrandScrollState}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {brands.map((brand) => (
                        <button
                          key={brand._id}
                          onClick={() => handleBrandToggle(brand._id)}
                          className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center justify-center p-3 gap-2 ${
                            selectedBrands.includes(brand._id)
                              ? 'bg-lime-100 border-2 border-lime-600'
                              : ''
                          }`}
                        >
                          {brand.logo ? (
                            <>
                              <div className="h-24 flex items-center justify-center">
                                <img
                                  src={getFullImageUrl(brand.logo)}
                                  alt={brand.name || "Brand"}
                                  className="max-h-full max-w-full bg-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                    const btn = e.currentTarget.closest("button")
                                    const fallback = btn?.querySelector("[data-brand-fallback]")
                                    if (fallback) fallback.classList.remove("hidden")
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2">
                                {brand.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-gray-700 text-center">
                              {brand.name}
                            </span>
                          )}
                          <span data-brand-fallback className="hidden text-sm font-semibold text-gray-700 text-center">
                            {brand.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={scrollBrandNext}
                      className={`absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 transition-colors ${
                        brandScrollState.canScrollNext 
                          ? 'bg-lime-500 text-white hover:bg-lime-600 cursor-pointer' 
                          : 'bg-white cursor-default opacity-50'
                      }`}
                      disabled={!brandScrollState.canScrollNext}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )}

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{gamingZonePage?.name}</h1>
                  <p className="text-gray-600">{totalProducts} products found</p>
                </div>
                <SortDropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No products match your filters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.slice(0, productsToShow).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  {productsToShow < filteredProducts.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setProductsToShow((prev) => prev + 20)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors font-semibold"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GamingZonePage
