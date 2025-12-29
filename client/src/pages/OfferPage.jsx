import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import ProductCard from "../components/ProductCard"
import { Helmet } from "react-helmet-async"
import { ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, X } from "lucide-react"
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
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate max-w-[46vw] sm:max-w-none">{current}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          className="absolute right-0 mt-1 w-56 max-w-[80vw] bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
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

const OfferPage = () => {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [offerPage, setOfferPage] = useState(null)
  const [products, setProducts] = useState([])
  
  // Separate state for sliders (offer-specific) and filters (all items)
  const [sliderBrands, setSliderBrands] = useState([])
  const [sliderCategories, setSliderCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  
  const [error, setError] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const brandsScrollRef = useRef(null)
  const categoriesScrollRef = useRef(null)
  
  // Filter states from Shop page
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [maxPrice, setMaxPrice] = useState(100000)
  const [minPrice, setMinPrice] = useState(0)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [stockFilters, setStockFilters] = useState({ inStock: false, outOfStock: false })
  const [brandSearch, setBrandSearch] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [showBrandFilter, setShowBrandFilter] = useState(false)
  const [allSubcategories, setAllSubcategories] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  
  // State for tracking full hierarchy path
  const [selectedParentCategory, setSelectedParentCategory] = useState(null)
  const [selectedSubCategory1, setSelectedSubCategory1] = useState(null)
  const [selectedSubCategory2, setSelectedSubCategory2] = useState(null)
  const [selectedSubCategory3, setSelectedSubCategory3] = useState(null)
  const [selectedSubCategory4, setSelectedSubCategory4] = useState(null)
  const [parentCategoryName, setParentCategoryName] = useState(null)
  const [subCategory1Name, setSubCategory1Name] = useState(null)
  const [subCategory2Name, setSubCategory2Name] = useState(null)
  const [subCategory3Name, setSubCategory3Name] = useState(null)
  const [subCategory4Name, setSubCategory4Name] = useState(null)

  useEffect(() => {
    fetchOfferPageData()
  }, [slug])

  const fetchOfferPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch offer page details by slug
      const pageResponse = await axios.get(`${config.API_URL}/api/offer-pages/slug/${slug}`)
      const pageData = pageResponse.data

      if (!pageData.isActive) {
        setError("This offer is currently not available.")
        setLoading(false)
        return
      }

      setOfferPage(pageData)

      // Fetch associated products, brands, and categories in parallel
      // Also fetch ALL categories and brands to ensure complete data
      const [productsRes, brandsRes, categoriesRes, allCategoriesRes, allBrandsRes, allSubcategoriesRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/offer-products/page/${slug}`),
        axios.get(`${config.API_URL}/api/offer-brands/page/${slug}`),
        axios.get(`${config.API_URL}/api/offer-categories/page/${slug}`),
        axios.get(`${config.API_URL}/api/categories`),
        axios.get(`${config.API_URL}/api/brands`),
        axios.get(`${config.API_URL}/api/subcategories`)
      ])

      console.log('Offer Page Data:', pageData)
      console.log('Card Images:', pageData.cardImages)
      console.log('Card Images Length:', pageData.cardImages?.length)
      console.log('Card Images Detail:', JSON.stringify(pageData.cardImages, null, 2))
      console.log('Offer Products Response:', productsRes.data)
      console.log('Offer Brands Response:', brandsRes.data)
      console.log('Offer Categories Response:', categoriesRes.data)
      console.log('All Categories:', allCategoriesRes.data)
      console.log('All Brands:', allBrandsRes.data)

      // Filter only active items and ensure product data exists
      const activeProducts = productsRes.data.filter(item => {
        console.log('Product Item:', item)
        return item.isActive && item.product && item.product._id
      })
      
      console.log('Filtered Active Products:', activeProducts)
      
      // Create lookup maps for brands and categories from ALL data
      const brandMap = {}
      const categoryMap = {}
      
      // First add from offer-specific brands
      brandsRes.data.forEach(item => {
        if (item.brand && item.brand._id) {
          brandMap[item.brand._id] = item.brand
        }
      })
      
      // Then add from all brands (won't override existing)
      allBrandsRes.data.forEach(brand => {
        if (brand && brand._id && !brandMap[brand._id]) {
          brandMap[brand._id] = brand
        }
      })
      
      // First add from offer-specific categories
      categoriesRes.data.forEach(item => {
        if (item.category && item.category._id) {
          categoryMap[item.category._id] = item.category
        }
      })
      
      // Then add from all categories (this ensures we have complete data)
      allCategoriesRes.data.forEach(category => {
        if (category && category._id && !categoryMap[category._id]) {
          categoryMap[category._id] = category
        }
      })
      
      console.log('Brand Map:', brandMap)
      console.log('Category Map:', categoryMap)
      
      // Enrich products with full brand and category objects
      const enrichedProducts = activeProducts.map(item => {
        const product = { ...item.product }
        
        console.log('Before enrichment - Product:', product.name)
        console.log('Category before:', product.category)
        console.log('Brand before:', product.brand)
        
        // Replace brand ID with full brand object if needed
        if (product.brand && typeof product.brand === 'string') {
          if (brandMap[product.brand]) {
            product.brand = brandMap[product.brand]
            console.log('Brand enriched to:', product.brand)
          } else {
            console.warn('Brand ID not found in map:', product.brand)
          }
        }
        
        // Replace category ID with full category object if needed
        if (product.category && typeof product.category === 'string') {
          if (categoryMap[product.category]) {
            product.category = categoryMap[product.category]
            console.log('Category enriched to:', product.category)
          } else {
            console.warn('Category ID not found in map:', product.category)
          }
        }
        
        // Also check subcategory, parentCategory, etc.
        if (product.subcategory && typeof product.subcategory === 'string' && categoryMap[product.subcategory]) {
          product.subcategory = categoryMap[product.subcategory]
        }
        
        if (product.parentCategory && typeof product.parentCategory === 'string' && categoryMap[product.parentCategory]) {
          product.parentCategory = categoryMap[product.parentCategory]
        }
        
        console.log('After enrichment - Category:', product.category)
        console.log('After enrichment - Brand:', product.brand)
        
        return { ...item, product }
      })
      
      console.log('Enriched Products:', enrichedProducts)
      
      setProducts(enrichedProducts)
      setFilteredProducts(enrichedProducts)
      
      // Set OFFER-SPECIFIC brands and categories for the SLIDERS ONLY
      setSliderBrands(brandsRes.data.filter(item => item.isActive && item.brand))
      setSliderCategories(categoriesRes.data.filter(item => item.isActive && item.category))
      
      // Use ALL brands and categories for the SIDEBAR FILTERS (not just offer-specific ones)
      const validBrands = allBrandsRes.data.filter(brand => {
        const isValid =
          brand &&
          typeof brand === "object" &&
          brand.name &&
          typeof brand.name === "string" &&
          brand.name.trim() !== "" &&
          brand.isActive !== false &&
          !brand.name.match(/^[0-9a-fA-F]{24}$/)
        return isValid
      })
      
      const validCategories = allCategoriesRes.data.filter(cat => {
        const isValid =
          cat &&
          typeof cat === "object" &&
          cat.name &&
          typeof cat.name === "string" &&
          cat.name.trim() !== "" &&
          cat.isActive !== false &&
          !cat.isDeleted &&
          !cat.name.match(/^[0-9a-fA-F]{24}$/)
        return isValid
      })
      
      // Process subcategories
      const validSubcategories = allSubcategoriesRes.data.filter(subCat => {
        const isValid =
          subCat &&
          typeof subCat === "object" &&
          subCat.name &&
          typeof subCat.name === "string" &&
          subCat.name.trim() !== "" &&
          subCat.isActive !== false &&
          !subCat.isDeleted &&
          !subCat.name.match(/^[0-9a-fA-F]{24}$/)
        return isValid
      })
      
      // Map to match the structure expected by the sidebar (with .brand and .category wrappers)
      setBrands(validBrands.map(brand => ({ brand, isActive: true, _id: brand._id })))
      setCategories(validCategories.map(category => ({ category, isActive: true, _id: category._id })))
      setAllSubcategories(validSubcategories)

      setLoading(false)
    } catch (error) {
      console.error("Error fetching offer page:", error)
      console.error("Error details:", error.response?.data)
      setError("Offer page not found.")
      setLoading(false)
    }
  }

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleBrandClick = (brandId) => {
    // Toggle the brand in the selectedBrands array (for sidebar filters)
    setSelectedBrands(prev => {
      if (prev.includes(brandId)) {
        return prev.filter(id => id !== brandId)
      } else {
        return [...prev, brandId]
      }
    })
    
    // Toggle the brand for slider active state
    setSelectedBrand(prev => prev === brandId ? null : brandId)
  }

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
      setSelectedParentCategory(null)
      setSelectedSubCategory1(null)
      setSelectedSubCategory2(null)
      setSelectedSubCategory3(null)
      setSelectedSubCategory4(null)
      setParentCategoryName(null)
      setSubCategory1Name(null)
      setSubCategory2Name(null)
      setSubCategory3Name(null)
      setSubCategory4Name(null)
    } else {
      setSelectedCategory(categoryId)
      
      // Check if it's a parent category or subcategory
      const parentCategory = categories.find(c => c.category._id === categoryId)
      
      if (parentCategory) {
        // It's a parent category
        setSelectedParentCategory(categoryId)
        setParentCategoryName(parentCategory.category.displayName || parentCategory.category.name)
        setSelectedSubCategory1(null)
        setSelectedSubCategory2(null)
        setSelectedSubCategory3(null)
        setSelectedSubCategory4(null)
        setSubCategory1Name(null)
        setSubCategory2Name(null)
        setSubCategory3Name(null)
        setSubCategory4Name(null)
      } else {
        // It's a subcategory - trace back the full hierarchy
        const subcategory = allSubcategories.find(s => s._id === categoryId)
        if (subcategory) {
          const hierarchy = traceHierarchy(subcategory)
          
          // Set parent category
          if (hierarchy.parentCategoryId) {
            setSelectedParentCategory(hierarchy.parentCategoryId)
            const parentCat = categories.find(c => c.category._id === hierarchy.parentCategoryId)
            setParentCategoryName(parentCat ? (parentCat.category.displayName || parentCat.category.name) : null)
          }
          
          // Set Level 1
          if (hierarchy.level1Id) {
            setSelectedSubCategory1(hierarchy.level1Id)
            setSubCategory1Name(hierarchy.level1Name)
          } else {
            setSelectedSubCategory1(null)
            setSubCategory1Name(null)
          }
          
          // Set Level 2
          if (hierarchy.level2Id) {
            setSelectedSubCategory2(hierarchy.level2Id)
            setSubCategory2Name(hierarchy.level2Name)
          } else {
            setSelectedSubCategory2(null)
            setSubCategory2Name(null)
          }
          
          // Set Level 3
          if (hierarchy.level3Id) {
            setSelectedSubCategory3(hierarchy.level3Id)
            setSubCategory3Name(hierarchy.level3Name)
          } else {
            setSelectedSubCategory3(null)
            setSubCategory3Name(null)
          }
          
          // Set Level 4
          if (hierarchy.level4Id) {
            setSelectedSubCategory4(hierarchy.level4Id)
            setSubCategory4Name(hierarchy.level4Name)
          } else {
            setSelectedSubCategory4(null)
            setSubCategory4Name(null)
          }
        }
      }
      
      // Auto-expand parent hierarchy when subcategory is selected
      const expandParents = (subCatId) => {
        const subcat = allSubcategories.find(s => s._id === subCatId)
        if (!subcat) return
        
        const newExpanded = { ...expandedCategories }
        
        // Get parent category
        const parentCategoryId = typeof subcat.category === 'object' ? subcat.category._id : subcat.category
        if (parentCategoryId) {
          newExpanded[parentCategoryId] = true
        }
        
        // Trace back through parent subcategories
        let current = subcat
        while (current && current.parentSubCategory) {
          const parentId = typeof current.parentSubCategory === 'object' 
            ? current.parentSubCategory._id 
            : current.parentSubCategory
          
          if (parentId) {
            newExpanded[parentId] = true
            current = allSubcategories.find(s => s._id === parentId)
          } else {
            break
          }
        }
        
        setExpandedCategories(newExpanded)
      }
      
      // Check if selected category is a subcategory and expand its parents
      const isSubcategory = allSubcategories.find(s => s._id === categoryId)
      if (isSubcategory) {
        expandParents(categoryId)
      }
    }
  }
  
  // Helper function to trace the full hierarchy of a subcategory
  const traceHierarchy = (subcategory) => {
    const hierarchy = {
      parentCategoryId: null,
      level1Id: null,
      level2Id: null,
      level3Id: null,
      level4Id: null,
      level1Name: null,
      level2Name: null,
      level3Name: null,
      level4Name: null,
    }
    
    // Build array of subcategories from current to root
    const path = []
    let current = subcategory
    
    while (current) {
      path.unshift(current)
      
      const parentSubCategoryId = typeof current.parentSubCategory === 'object'
        ? current.parentSubCategory?._id
        : current.parentSubCategory
      
      if (parentSubCategoryId) {
        current = allSubcategories.find(s => s._id === parentSubCategoryId)
      } else {
        break
      }
    }
    
    // Get parent category from the root subcategory
    if (path.length > 0) {
      const rootSubcat = path[0]
      hierarchy.parentCategoryId = typeof rootSubcat.category === 'object'
        ? rootSubcat.category._id
        : rootSubcat.category
      
      // Assign levels
      if (path.length >= 1) {
        hierarchy.level1Id = path[0]._id
        hierarchy.level1Name = path[0].name
      }
      if (path.length >= 2) {
        hierarchy.level2Id = path[1]._id
        hierarchy.level2Name = path[1].name
      }
      if (path.length >= 3) {
        hierarchy.level3Id = path[2]._id
        hierarchy.level3Name = path[2].name
      }
      if (path.length >= 4) {
        hierarchy.level4Id = path[3]._id
        hierarchy.level4Name = path[3].name
      }
    }
    
    return hierarchy
  }

  const handleStockFilterChange = (key) => {
    setStockFilters(prev => {
      const newState = { inStock: false, outOfStock: false }
      newState[key] = true
      return newState
    })
  }

  const clearAllFilters = () => {
    setSelectedBrands([])
    setSelectedBrand(null)
    setSelectedCategory(null)
    setSelectedParentCategory(null)
    setSelectedSubCategory1(null)
    setSelectedSubCategory2(null)
    setSelectedSubCategory3(null)
    setSelectedSubCategory4(null)
    setParentCategoryName(null)
    setSubCategory1Name(null)
    setSubCategory2Name(null)
    setSubCategory3Name(null)
    setSubCategory4Name(null)
    setPriceRange([minPrice, maxPrice])
    setStockFilters({ inStock: false, outOfStock: false })
    setBrandSearch("")
  }

  const filteredBrands = brands.filter(item =>
    item.brand?.name?.toLowerCase().includes(brandSearch.toLowerCase())
  )

  // Helper function to check if a category is in the selected hierarchy path
  const isInSelectedPath = (categoryId) => {
    if (!selectedCategory) return false
    if (categoryId === selectedCategory) return true
    
    // Check if the selected category is a descendant of this category
    const selectedSubcat = allSubcategories.find(s => s._id === selectedCategory)
    if (!selectedSubcat) {
      // Selected is a parent category
      return false
    }
    
    // Trace back from selected to see if categoryId is in the path
    let current = selectedSubcat
    while (current) {
      const parentCategoryId = typeof current.category === 'object' ? current.category._id : current.category
      if (parentCategoryId === categoryId) return true
      
      const parentSubCategoryId = typeof current.parentSubCategory === 'object' 
        ? current.parentSubCategory?._id 
        : current.parentSubCategory
      
      if (parentSubCategoryId === categoryId) return true
      if (!parentSubCategoryId) break
      
      current = allSubcategories.find(s => s._id === parentSubCategoryId)
    }
    
    return false
  }

  // Helper function to get children of a category/subcategory
  const getChildren = (parentId, parentType = 'category') => {
    const children = allSubcategories.filter(sub => {
      const category = typeof sub.category === 'object' ? sub.category?._id : sub.category
      const parentSubCategory = typeof sub.parentSubCategory === 'object' ? sub.parentSubCategory?._id : sub.parentSubCategory
      
      if (parentType === 'category') {
        // For parent categories, get Level 1 subcategories (where category matches and parentSubCategory is null)
        return category === parentId && !parentSubCategory
      } else if (parentType === 'subcategory') {
        // For subcategories, get children where parentSubCategory matches
        return parentSubCategory === parentId
      }
      return false
    })
    
    return children
  }

  // Toggle category expansion
  const toggleExpanded = (id) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Brand filter (multiple brands)
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(item => {
        const productBrandId = item.product?.brand?._id || item.product?.brand
        return selectedBrands.includes(productBrandId)
      })
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => {
        // Check if product matches the category (parent category)
        if (item.product?.category?._id === selectedCategory || item.product?.category === selectedCategory) {
          return true
        }
        // Check if product matches any subcategory level
        if (item.product?.subcategory?._id === selectedCategory || item.product?.subcategory === selectedCategory) {
          return true
        }
        if (item.product?.subcategory2?._id === selectedCategory || item.product?.subcategory2 === selectedCategory) {
          return true
        }
        if (item.product?.subcategory3?._id === selectedCategory || item.product?.subcategory3 === selectedCategory) {
          return true
        }
        if (item.product?.subcategory4?._id === selectedCategory || item.product?.subcategory4 === selectedCategory) {
          return true
        }
        return false
      })
    }

    // Price filter
    filtered = filtered.filter(item => {
      const price = item.product?.salePrice || item.product?.regularPrice || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Stock filter
    if (stockFilters.inStock) {
      filtered = filtered.filter(item => item.product?.countInStock > 0)
    }
    if (stockFilters.outOfStock) {
      filtered = filtered.filter(item => item.product?.countInStock === 0)
    }

    // Apply sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const priceA = a.product?.salePrice || a.product?.regularPrice || 0
        const priceB = b.product?.salePrice || b.product?.regularPrice || 0
        return priceA - priceB
      })
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const priceA = a.product?.salePrice || a.product?.regularPrice || 0
        const priceB = b.product?.salePrice || b.product?.regularPrice || 0
        return priceB - priceA
      })
    } else if (sortBy === "name") {
      filtered.sort((a, b) => {
        const nameA = a.product?.name?.toLowerCase() || ""
        const nameB = b.product?.name?.toLowerCase() || ""
        return nameA.localeCompare(nameB)
      })
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.product?.createdAt || 0)
        const dateB = new Date(b.product?.createdAt || 0)
        return dateB - dateA
      })
    }

    setFilteredProducts(filtered)
  }

  // Update filters whenever filter criteria change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters()
    }
  }, [selectedBrands, selectedCategory, priceRange, stockFilters, sortBy, products])

  // Calculate price range when products load
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(item => item.product?.salePrice || item.product?.regularPrice || 0)
      const max = Math.max(...prices, 10000)
      const min = Math.min(...prices, 0)
      setMaxPrice(max)
      setMinPrice(min)
      setPriceRange([min, max])
    }
  }, [products])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offer...</p>
        </div>
      </div>
    )
  }

  if (error || !offerPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Offer Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The offer you're looking for doesn't exist."}</p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{offerPage.metaTitle || offerPage.name}</title>
        <meta name="description" content={offerPage.metaDescription || offerPage.description} />
        <link rel="canonical" href={`${window.location.origin}/offers/${slug}`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b z-10 px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filters</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Active Filters Section - Mobile */}
                {(selectedParentCategory || 
                  selectedSubCategory1 || 
                  selectedSubCategory2 || 
                  selectedSubCategory3 || 
                  selectedSubCategory4 || 
                  selectedBrands.length > 0 || 
                  stockFilters.inStock || 
                  stockFilters.outOfStock ||
                  priceRange[0] !== minPrice || 
                  priceRange[1] !== maxPrice) && (
                  <div className="border border-lime-200 rounded-lg p-4 bg-lime-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">Active Filters</h3>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2">
                      {/* Parent Category Filter */}
                      {selectedParentCategory && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Category:</span>{" "}
                            {parentCategoryName || "Selected"}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCategory(null)
                              setSelectedParentCategory(null)
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setParentCategoryName(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 1 Subcategory */}
                      {selectedSubCategory1 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Subcategory:</span> {subCategory1Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedParentCategory) {
                                setSelectedCategory(selectedParentCategory)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 2 Subcategory */}
                      {selectedSubCategory2 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Level 2:</span> {subCategory2Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory1) {
                                setSelectedCategory(selectedSubCategory1)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 3 Subcategory */}
                      {selectedSubCategory3 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Level 3:</span> {subCategory3Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory2) {
                                setSelectedCategory(selectedSubCategory2)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 4 Subcategory */}
                      {selectedSubCategory4 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Level 4:</span> {subCategory4Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory4(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory3) {
                                setSelectedCategory(selectedSubCategory3)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {selectedBrands.map(brandId => {
                        const brandItem = brands.find(b => b.brand._id === brandId)
                        return brandItem ? (
                          <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                            <span className="text-gray-700">
                              <span className="font-semibold">Brand:</span> {brandItem.brand.name}
                            </span>
                            <button
                              onClick={() => handleBrandClick(brandId)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}

                      {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Price:</span> ₹{priceRange[0]} - ₹{priceRange[1]}
                          </span>
                          <button
                            onClick={() => setPriceRange([minPrice, maxPrice])}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.inStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Stock:</span> In Stock
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.outOfStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Stock:</span> Out of Stock
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Filter - Mobile */}
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className={`flex items-center justify-between w-full text-left font-medium ${
                      priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                        ? "text-lime-500"
                        : "text-gray-900"
                    }`}
                  >
                    Price Range
                    {showPriceFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showPriceFilter && (
                    <div className="mt-4 space-y-4">
                      <Slider
                        range
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange}
                        onChange={(values) => setPriceRange(values)}
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
                      <div className="flex gap-2">
                        <input
                          type="number"
                          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
                          value={priceRange[0]}
                          min={minPrice}
                          max={priceRange[1]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || minPrice
                            setPriceRange([Math.max(minPrice, Math.min(val, priceRange[1])), priceRange[1]])
                          }}
                        />
                        <input
                          type="number"
                          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
                          value={priceRange[1]}
                          min={priceRange[0]}
                          max={maxPrice}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || maxPrice
                            setPriceRange([priceRange[0], Math.min(maxPrice, Math.max(val, priceRange[0]))])
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filter - Mobile */}
                {categories.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedCategory ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      Categories
                      {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showCategoryFilter && (
                      <div className="mt-4 space-y-1 max-h-64 overflow-y-auto">
                        {/* All Categories Option */}
                        <div className="flex items-center cursor-pointer py-1" onClick={() => setSelectedCategory(null)}>
                          <div className="relative flex items-center">
                            <input
                              type="radio"
                              name="category-group-mobile"
                              checked={!selectedCategory}
                              readOnly
                              className="absolute opacity-0 w-0 h-0"
                            />
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                !selectedCategory ? "border-lime-600 bg-lime-600" : "border-gray-300"
                              }`}
                            >
                              {!selectedCategory && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700">All Categories</span>
                        </div>

                        {/* Hierarchical Category Tree */}
                        {categories.map((item) => {
                          const category = item.category
                          const level1Children = getChildren(category._id, 'category')
                          const hasChildren = level1Children.length > 0
                          const isExpanded = expandedCategories[category._id]
                          const isSelected = selectedCategory === category._id
                          const isInPath = isInSelectedPath(category._id)

                          return (
                            <div key={item._id} className="space-y-1">
                              {/* Parent Category */}
                              <div className="flex items-center justify-between py-1 group">
                                <div 
                                  className="flex items-center cursor-pointer flex-1"
                                  onClick={() => handleCategoryClick(category._id)}
                                >
                                  <div className="relative flex items-center">
                                    <input
                                      type="radio"
                                      name="category-group-mobile"
                                      checked={isSelected}
                                      readOnly
                                      className="absolute opacity-0 w-0 h-0"
                                    />
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                        isInPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                      }`}
                                    >
                                      {isInPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                    </div>
                                  </div>
                                  <span className={`text-sm ${isInPath ? "text-lime-600 font-semibold" : "text-gray-700"}`}>
                                    {category.name}
                                  </span>
                                </div>
                                {hasChildren && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleExpanded(category._id)
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded ml-2"
                                  >
                                    {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                                  </button>
                                )}
                              </div>

                              {/* Nested subcategories would go here - simplified for mobile */}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Brand Filter - Mobile */}
                {brands.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedBrands.length > 0 ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        Brands
                        {selectedBrands.length > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-lime-500 rounded-full">
                            {selectedBrands.length}
                          </span>
                        )}
                      </span>
                      {showBrandFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showBrandFilter && (
                      <div className="mt-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredBrands.map((item) => (
                            <div key={item._id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`brand-mobile-${item.brand._id}`}
                                checked={selectedBrands.includes(item.brand._id)}
                                onChange={() => handleBrandClick(item.brand._id)}
                                className="w-4 h-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
                              />
                              <label htmlFor={`brand-mobile-${item.brand._id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                {item.brand.name}
                              </label>
                            </div>
                          ))}
                          {filteredBrands.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No brands found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Status Filter - Mobile */}
                <div className="border-b pb-4">
                  <div className={`font-medium mb-4 ${
                    stockFilters.inStock || stockFilters.outOfStock
                      ? "text-lime-500"
                      : "text-gray-900"
                  }`}>Stock Status</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-all-mobile"
                        name="stock-filter-mobile"
                        checked={!stockFilters.inStock && !stockFilters.outOfStock}
                        onChange={() => setStockFilters({ inStock: false, outOfStock: false })}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-all-mobile" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        All Products
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-in-mobile"
                        name="stock-filter-mobile"
                        checked={stockFilters.inStock}
                        onChange={() => handleStockFilterChange('inStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-in-mobile" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-out-mobile"
                        name="stock-filter-mobile"
                        checked={stockFilters.outOfStock}
                        onChange={() => handleStockFilterChange('outOfStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-out-mobile" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Out of Stock
                      </label>
                    </div>
                  </div>
                </div>

                {/* Apply & Clear Buttons - Mobile */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full px-4 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors font-semibold"
                  >
                    Show {filteredProducts.length} Products
                  </button>
                  <button
                    onClick={() => {
                      clearAllFilters()
                      setIsMobileFilterOpen(false)
                    }}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        {offerPage.heroImage && (
          <div className="relative">
            <div className="relative h-[170px] sm:h-[250px] md:h-[300px] lg:h-[310px] bg-gradient-to-r from-lime-600 to-green-600">
              <img
                src={offerPage.heroImage}
                alt={offerPage.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* <div className="text-center text-white px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{offerPage.name}</h1>
                  {offerPage.description && (
                    <p className="text-lg md:text-xl max-w-3xl mx-auto">{offerPage.description}</p>
                  )}
                </div> */}
              </div>
            </div>
            
            {/* Optional Bottom Images */}
            {offerPage.cardImages && offerPage.cardImages.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 pb-4">
                <div className="w-full hidden md:grid md:grid-cols-3 justify-items-center items-center px-2 sm:px-4 md:px-8 lg:px-12 gap-2 md:gap-4">
                  {offerPage.cardImages
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .filter(cardImage => cardImage.image)
                    .map((cardImage, index) => {
                      // Fix double slashes in image path
                      const imageUrl = cardImage.image.replace(/\/\//g, '/')
                      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${config.API_URL}${imageUrl}`
                      
                      return (
                        <div
                          key={index}
                          className="bg-white rounded-lg shadow-lg overflow-hidden w-full h-16 sm:h-20 md:h-30 lg:h-35 max-w-full"
                        >
                          <img
                            src={fullImageUrl}
                            alt={`Offer ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Title Section (if no hero image) */}
        {!offerPage.heroImage && (
          <div className="bg-gradient-to-r from-lime-600 to-green-600 py-12">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{offerPage.name}</h1>
              {offerPage.description && (
                <p className="text-lg md:text-xl max-w-3xl mx-auto">{offerPage.description}</p>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          {/* Main Layout: Sidebar + Products */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters (Desktop Only) */}
            <aside className="w-full lg:w-1/4 hidden md:block">
              <div className="bg-white rounded-lg p-6 space-y-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
                {/* Active Filters Section */}
                {(selectedParentCategory || 
                  selectedSubCategory1 || 
                  selectedSubCategory2 || 
                  selectedSubCategory3 || 
                  selectedSubCategory4 || 
                  selectedBrands.length > 0 || 
                  stockFilters.inStock || 
                  stockFilters.outOfStock ||
                  priceRange[0] !== minPrice || 
                  priceRange[1] !== maxPrice) && (
                  <div className="border border-lime-200 rounded-lg p-4 bg-lime-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">Active Filters</h3>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2">
                      {/* Parent Category Filter */}
                      {selectedParentCategory && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Category:</span>{" "}
                            {parentCategoryName || "Selected"}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCategory(null)
                              setSelectedParentCategory(null)
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setParentCategoryName(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 1 Subcategory */}
                      {selectedSubCategory1 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Subcategory:</span> {subCategory1Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory1(null)
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory1Name(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedParentCategory) {
                                setSelectedCategory(selectedParentCategory)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 2 Subcategory */}
                      {selectedSubCategory2 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Level 2:</span> {subCategory2Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory2(null)
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory2Name(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory1) {
                                setSelectedCategory(selectedSubCategory1)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 3 Subcategory */}
                      {selectedSubCategory3 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Level 3:</span> {subCategory3Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory3(null)
                              setSelectedSubCategory4(null)
                              setSubCategory3Name(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory2) {
                                setSelectedCategory(selectedSubCategory2)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Level 4 Subcategory */}
                      {selectedSubCategory4 && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Level 4:</span> {subCategory4Name}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSubCategory4(null)
                              setSubCategory4Name(null)
                              if (selectedSubCategory3) {
                                setSelectedCategory(selectedSubCategory3)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {selectedBrands.map(brandId => {
                        const brandItem = brands.find(b => b.brand._id === brandId)
                        return brandItem ? (
                          <div key={brandId} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                            <span className="text-gray-700">
                              <span className="font-semibold">Brand:</span> {brandItem.brand.name}
                            </span>
                            <button
                              onClick={() => handleBrandClick(brandId)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}

                      {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Price:</span> ₹{priceRange[0]} - ₹{priceRange[1]}
                          </span>
                          <button
                            onClick={() => setPriceRange([minPrice, maxPrice])}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.inStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Stock:</span> In Stock
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {stockFilters.outOfStock && (
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-semibold">Stock:</span> Out of Stock
                          </span>
                          <button
                            onClick={() => setStockFilters({ inStock: false, outOfStock: false })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Filter */}
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className={`flex items-center justify-between w-full text-left font-medium ${
                      priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                        ? "text-lime-500"
                        : "text-gray-900"
                    }`}
                  >
                    Price Range
                    {showPriceFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showPriceFilter && (
                    <div className="mt-4 space-y-4">
                      <Slider
                        range
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange}
                        onChange={(values) => setPriceRange(values)}
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
                      <div className="flex gap-2">
                        <input
                          type="number"
                          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
                          value={priceRange[0]}
                          min={minPrice}
                          max={priceRange[1]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || minPrice
                            setPriceRange([Math.max(minPrice, Math.min(val, priceRange[1])), priceRange[1]])
                          }}
                        />
                        <input
                          type="number"
                          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
                          value={priceRange[1]}
                          min={priceRange[0]}
                          max={maxPrice}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || maxPrice
                            setPriceRange([priceRange[0], Math.min(maxPrice, Math.max(val, priceRange[0]))])
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedCategory ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      Categories
                      {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showCategoryFilter && (
                      <div className="mt-4 space-y-1">
                        {/* All Categories Option */}
                        <div className="flex items-center cursor-pointer py-1" onClick={() => setSelectedCategory(null)}>
                          <div className="relative flex items-center">
                            <input
                              type="radio"
                              name="category-group"
                              checked={!selectedCategory}
                              readOnly
                              className="absolute opacity-0 w-0 h-0"
                            />
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                !selectedCategory ? "border-lime-600 bg-lime-600" : "border-gray-300"
                              }`}
                            >
                              {!selectedCategory && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700">All Categories</span>
                        </div>

                        {/* Hierarchical Category Tree */}
                        {categories.map((item) => {
                          const category = item.category
                          const level1Children = getChildren(category._id, 'category')
                          const hasChildren = level1Children.length > 0
                          const isExpanded = expandedCategories[category._id]
                          const isSelected = selectedCategory === category._id
                          const isInPath = isInSelectedPath(category._id)

                          return (
                            <div key={item._id} className="space-y-1">
                              {/* Parent Category */}
                              <div className="flex items-center justify-between py-1 group">
                                <div 
                                  className="flex items-center cursor-pointer flex-1"
                                  onClick={() => handleCategoryClick(category._id)}
                                >
                                  <div className="relative flex items-center">
                                    <input
                                      type="radio"
                                      name="category-group"
                                      checked={isSelected}
                                      readOnly
                                      className="absolute opacity-0 w-0 h-0"
                                    />
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                        isInPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                      }`}
                                    >
                                      {isInPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                    </div>
                                  </div>
                                  <span className={`text-sm ${isInPath ? "text-lime-600 font-semibold" : "text-gray-700"}`}>
                                    {category.name}
                                  </span>
                                </div>
                                {hasChildren && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleExpanded(category._id)
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded ml-2"
                                  >
                                    {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                                  </button>
                                )}
                              </div>

                              {/* Level 1 Subcategories */}
                              {isExpanded && level1Children.map((level1) => {
                                const level2Children = getChildren(level1._id, 'subcategory')
                                const hasLevel2 = level2Children.length > 0
                                const isLevel1Expanded = expandedCategories[level1._id]
                                const isLevel1Selected = selectedCategory === level1._id
                                const isLevel1InPath = isInSelectedPath(level1._id)

                                return (
                                  <div key={level1._id} className="ml-6 space-y-1">
                                    {/* Level 1 Item */}
                                    <div className="flex items-center justify-between py-1 group">
                                      <div
                                        className="flex items-center cursor-pointer flex-1"
                                        onClick={() => handleCategoryClick(level1._id)}
                                      >
                                        <div className="relative flex items-center">
                                          <input
                                            type="radio"
                                            checked={isLevel1Selected}
                                            readOnly
                                            className="absolute opacity-0 w-0 h-0"
                                          />
                                          <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                              isLevel1InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                            }`}
                                          >
                                            {isLevel1InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                          </div>
                                        </div>
                                        <span className={`text-sm ${isLevel1InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                          {level1.name}
                                        </span>
                                      </div>
                                      {hasLevel2 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleExpanded(level1._id)
                                          }}
                                          className="p-1 hover:bg-gray-100 rounded ml-2"
                                        >
                                          {isLevel1Expanded ? <Minus size={14} /> : <Plus size={14} />}
                                        </button>
                                      )}
                                    </div>

                                    {/* Level 2 Subcategories */}
                                    {isLevel1Expanded && level2Children.map((level2) => {
                                      const level3Children = getChildren(level2._id, 'subcategory')
                                      const hasLevel3 = level3Children.length > 0
                                      const isLevel2Expanded = expandedCategories[level2._id]
                                      const isLevel2Selected = selectedCategory === level2._id
                                      const isLevel2InPath = isInSelectedPath(level2._id)

                                      return (
                                        <div key={level2._id} className="ml-6 space-y-1">
                                          {/* Level 2 Item */}
                                          <div className="flex items-center justify-between py-1 group">
                                            <div
                                              className="flex items-center cursor-pointer flex-1"
                                              onClick={() => handleCategoryClick(level2._id)}
                                            >
                                              <div className="relative flex items-center">
                                                <input
                                                  type="radio"
                                                  checked={isLevel2Selected}
                                                  readOnly
                                                  className="absolute opacity-0 w-0 h-0"
                                                />
                                                <div
                                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                                    isLevel2InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                                  }`}
                                                >
                                                  {isLevel2InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                </div>
                                              </div>
                                              <span className={`text-sm ${isLevel2InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                                {level2.name}
                                              </span>
                                            </div>
                                            {hasLevel3 && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  toggleExpanded(level2._id)
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded ml-2"
                                              >
                                                {isLevel2Expanded ? <Minus size={14} /> : <Plus size={14} />}
                                              </button>
                                            )}
                                          </div>

                                          {/* Level 3 Subcategories */}
                                          {isLevel2Expanded && level3Children.map((level3) => {
                                            const level4Children = getChildren(level3._id, 'subcategory')
                                            const hasLevel4 = level4Children.length > 0
                                            const isLevel3Expanded = expandedCategories[level3._id]
                                            const isLevel3Selected = selectedCategory === level3._id
                                            const isLevel3InPath = isInSelectedPath(level3._id)

                                            return (
                                              <div key={level3._id} className="ml-6 space-y-1">
                                                {/* Level 3 Item */}
                                                <div className="flex items-center justify-between py-1 group">
                                                  <div
                                                    className="flex items-center cursor-pointer flex-1"
                                                    onClick={() => handleCategoryClick(level3._id)}
                                                  >
                                                    <div className="relative flex items-center">
                                                      <input
                                                        type="radio"
                                                        checked={isLevel3Selected}
                                                        readOnly
                                                        className="absolute opacity-0 w-0 h-0"
                                                      />
                                                      <div
                                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                                          isLevel3InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                                        }`}
                                                      >
                                                        {isLevel3InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                      </div>
                                                    </div>
                                                    <span className={`text-sm ${isLevel3InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                                      {level3.name}
                                                    </span>
                                                  </div>
                                                  {hasLevel4 && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleExpanded(level3._id)
                                                      }}
                                                      className="p-1 hover:bg-gray-100 rounded ml-2"
                                                    >
                                                      {isLevel3Expanded ? <Minus size={14} /> : <Plus size={14} />}
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Level 4 Subcategories */}
                                                {isLevel3Expanded && level4Children.map((level4) => {
                                                  const isLevel4Selected = selectedCategory === level4._id
                                                  const isLevel4InPath = isInSelectedPath(level4._id)

                                                  return (
                                                    <div key={level4._id} className="ml-6 flex items-center justify-between py-1 group">
                                                      <div
                                                        className="flex items-center cursor-pointer flex-1"
                                                        onClick={() => handleCategoryClick(level4._id)}
                                                      >
                                                        <div className="relative flex items-center">
                                                          <input
                                                            type="radio"
                                                            checked={isLevel4Selected}
                                                            readOnly
                                                            className="absolute opacity-0 w-0 h-0"
                                                          />
                                                          <div
                                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                                                              isLevel4InPath ? "border-lime-600 bg-lime-600" : "border-gray-300"
                                                            }`}
                                                          >
                                                            {isLevel4InPath && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                          </div>
                                                        </div>
                                                        <span className={`text-sm ${isLevel4InPath ? "text-lime-600 font-semibold" : "text-gray-600"}`}>
                                                          {level4.name}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className={`flex items-center justify-between w-full text-left font-medium ${
                        selectedBrands.length > 0 ? "text-lime-500" : "text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        Brands
                        {selectedBrands.length > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-lime-500 rounded-full">
                            {selectedBrands.length}
                          </span>
                        )}
                      </span>
                      {showBrandFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showBrandFilter && (
                      <div className="mt-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                        <div className="space-y-2">
                          {filteredBrands.map((item) => (
                            <div key={item._id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`brand-${item.brand._id}`}
                                checked={selectedBrands.includes(item.brand._id)}
                                onChange={() => handleBrandClick(item.brand._id)}
                                className="w-4 h-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
                              />
                              <label htmlFor={`brand-${item.brand._id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                {item.brand.name}
                              </label>
                            </div>
                          ))}
                          {filteredBrands.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No brands found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Status Filter */}
                <div className="border-b pb-4">
                  <div className={`font-medium mb-4 ${
                    stockFilters.inStock || stockFilters.outOfStock
                      ? "text-lime-500"
                      : "text-gray-900"
                  }`}>Stock Status</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-all"
                        name="stock-filter"
                        checked={!stockFilters.inStock && !stockFilters.outOfStock}
                        onChange={() => setStockFilters({ inStock: false, outOfStock: false })}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        All Products
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-in"
                        name="stock-filter"
                        checked={stockFilters.inStock}
                        onChange={() => handleStockFilterChange('inStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-in" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stock-out"
                        name="stock-filter"
                        checked={stockFilters.outOfStock}
                        onChange={() => handleStockFilterChange('outOfStock')}
                        className="w-4 h-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                      />
                      <label htmlFor="stock-out" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Out of Stock
                      </label>
                    </div>
                  </div>
                </div>

                {/* Clear All Button */}
                <div className="pt-4">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content Area - Categories, Brands, and Products */}
            <div className="flex-1 lg:w-3/4">
              {/* Mobile Filter Button */}
              <div className="md:hidden mb-4 flex gap-2">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors font-semibold shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {(selectedParentCategory || 
                    selectedSubCategory1 || 
                    selectedSubCategory2 || 
                    selectedSubCategory3 || 
                    selectedSubCategory4 || 
                    selectedBrands.length > 0 || 
                    stockFilters.inStock || 
                    stockFilters.outOfStock ||
                    priceRange[0] !== minPrice || 
                    priceRange[1] !== maxPrice) && (
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white text-lime-600 rounded-full">
                      {[
                        selectedParentCategory || selectedSubCategory1 || selectedSubCategory2 || selectedSubCategory3 || selectedSubCategory4,
                        selectedBrands.length,
                        stockFilters.inStock || stockFilters.outOfStock,
                        priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                      ].filter(Boolean).length}
                    </span>
                  )}
                </button>
                <div className="flex-shrink-0">
                  <SortDropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
                </div>
              </div>

              {/* Categories Slider - First Line */}
              {sliderCategories.length > 0 && (
                <section className="mb-8">
                  {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories...</h2> */}
                  <div className="relative">
                    <button
                      onClick={() => scrollSlider(categoriesScrollRef, 'left')}
                      className="absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={categoriesScrollRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {sliderCategories.map((item) => {
                        const catData = item.category
                        const displayName = catData?.displayName || catData?.name || 'N/A'
                        const displayImage = catData?.image
                        return (
                          <button
                            key={item._id}
                            onClick={() => handleCategoryClick(catData._id)}
                            className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center p-2 ${
                              selectedCategory === catData._id
                                ? 'bg-lime-100 border-2 border-lime-600'
                                : ''
                            }`}
                          >
                            <div className="flex-1 flex items-center justify-center w-full mb-2">
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={displayName}
                                  className="max-h-16 max-w-full object-contain"
                                />
                              ) : (
                                <span className="text-2xl">📦</span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2 w-full">
                              {displayName}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => scrollSlider(categoriesScrollRef, 'right')}
                      className="absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )}

              {/* Brands Slider - Second Line */}
              {sliderBrands.length > 0 && (
                <section className="mb-8">
                  {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Brands...</h2> */}
                  <div className="relative">
                    <button
                      onClick={() => scrollSlider(brandsScrollRef, 'left')}
                      className="absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={brandsScrollRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {sliderBrands.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => handleBrandClick(item.brand._id)}
                          className={`flex-shrink-0 w-32 rounded-lg transition-all flex flex-col items-center p-2 ${
                            selectedBrand === item.brand._id
                              ? 'bg-lime-100 border-2 border-lime-600'
                              : ''
                          }`}
                        >
                          <div className="flex-1 flex items-center justify-center w-full mb-2">
                            {item.brand.logo ? (
                              <img
                                src={item.brand.logo}
                                alt={item.brand.name}
                                className="max-h-16 max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-2xl">🏷️</span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2 w-full">
                            {item.brand.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => scrollSlider(brandsScrollRef, 'right')}
                      className="absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )}



              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Products</h2>
                    <div className="hidden md:block">
                      <SortDropdown value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((item, index) => (
                      <ProductCard key={item._id} product={item.product} offerPageName={offerPage?.name} cardIndex={index} />
                    ))}
                  </div>
                </section>
              )}

              {/* No Results State */}
              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">No products match your selected filters.</p>
                  <button
                    onClick={() => {
                      setSelectedBrand(null)
                      setSelectedCategory(null)
                      setFilteredProducts(products)
                    }}
                    className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OfferPage
