"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Minus } from "lucide-react"
import axios from "axios"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useCart } from "../context/CartContext"
import HomeStyleProductCard from "../components/HomeStyleProductCard"
import ProductSchema from "../components/ProductSchema"
import SEO from "../components/SEO"
import productCache from "../services/productCache"
import { generateShopURL, parseShopURL, createSlug } from "../utils/urlUtils"
import { createMetaDescription, generateSEOTitle } from "../utils/seoHelpers"

import config from "../config/config"
import "rc-slider/assets/index.css"
import Slider from "rc-slider"

const API_BASE_URL = `${config.API_URL}`

const bounceStyle = {
  animation: "bounce 1s infinite",
}
const bounceKeyframes = `@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }`
if (typeof document !== "undefined" && !document.getElementById("bounce-keyframes")) {
  const style = document.createElement("style")
  style.id = "bounce-keyframes"
  style.innerHTML = bounceKeyframes
  document.head.appendChild(style)
}

// Right-anchored custom dropdown to avoid right overflow
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

const Shop = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [actualSearchQuery, setActualSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [maxPrice, setMaxPrice] = useState(10000)
  const [globalMaxPrice, setGlobalMaxPrice] = useState(null)
  const [sortBy, setSortBy] = useState("newest")
  const [brandSearch, setBrandSearch] = useState("")
  const [subCategories, setSubCategories] = useState([])
  const [selectedSubCategories, setSelectedSubCategories] = useState([])
  const [selectedSubCategory2, setSelectedSubCategory2] = useState(null)
  const [selectedSubCategory3, setSelectedSubCategory3] = useState(null)
  const [selectedSubCategory4, setSelectedSubCategory4] = useState(null)
  const [currentSubCategoryName, setCurrentSubCategoryName] = useState(null)
  const [currentSubCategory2Name, setCurrentSubCategory2Name] = useState(null)
  const [currentSubCategory3Name, setCurrentSubCategory3Name] = useState(null)
  const [currentSubCategory4Name, setCurrentSubCategory4Name] = useState(null)
  // Add state for full subcategory objects with SEO data
  const [subCategory2Data, setSubCategory2Data] = useState(null)
  const [subCategory3Data, setSubCategory3Data] = useState(null)
  const [subCategory4Data, setSubCategory4Data] = useState(null)
  const [stockFilters, setStockFilters] = useState({ inStock: false, outOfStock: false, onSale: false })
  const [minPrice, setMinPrice] = useState(0)

  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(true)
  const [showBrandFilter, setShowBrandFilter] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const [productsToShow, setProductsToShow] = useState(20)
  const [delayedLoading, setDelayedLoading] = useState(false)
  const fetchTimeout = useRef()
  const loadingTimeout = useRef()

  // Progressive search function
  const performProgressiveSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setActualSearchQuery("")
      return []
    }

    const words = searchTerm.trim().split(/\s+/)

    for (let i = words.length; i > 0; i--) {
      const currentSearchTerm = words.slice(0, i).join(" ")

      try {
        const allProducts = await productCache.getProducts()
        if (!allProducts || allProducts.length === 0) {
          continue
        }

        const stockStatusFilters = []
        if (stockFilters.inStock) stockStatusFilters.push("inStock")
        if (stockFilters.outOfStock) stockStatusFilters.push("outOfStock")
        if (stockFilters.onSale) stockStatusFilters.push("onSale")

        const filters = {
          parent_category: selectedCategory !== "all" ? selectedCategory : null,
          category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
          subcategory2: selectedSubCategory2,
          subcategory3: selectedSubCategory3,
          subcategory4: selectedSubCategory4,
          brand: selectedBrands.length > 0 ? selectedBrands : null,
          search: currentSearchTerm,
          priceRange: priceRange,
          stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
          sortBy: sortBy,
        }

        const filteredProducts = productCache.filterProducts(allProducts, filters)

        if (filteredProducts.length > 0) {
          setActualSearchQuery(currentSearchTerm)
          return filteredProducts
        }
      } catch (err) {
        console.error("Error in progressive search:", err)
      }
    }

    const trimmed = searchTerm.trim()
    for (let len = trimmed.length - 1; len >= 3; len--) {
      const currentSearchTerm = trimmed.slice(0, len)
      try {
        const allProducts = await productCache.getProducts()
        if (!allProducts || allProducts.length === 0) continue

        const stockStatusFilters = []
        if (stockFilters.inStock) stockStatusFilters.push("inStock")
        if (stockFilters.outOfStock) stockStatusFilters.push("outOfStock")
        if (stockFilters.onSale) stockStatusFilters.push("onSale")

        const filters = {
          parent_category: selectedCategory !== "all" ? selectedCategory : null,
          category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
          subcategory2: selectedSubCategory2,
          subcategory3: selectedSubCategory3,
          subcategory4: selectedSubCategory4,
          brand: selectedBrands.length > 0 ? selectedBrands : null,
          search: currentSearchTerm,
          priceRange: priceRange,
          stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
          sortBy: sortBy,
        }

        const filteredProducts = productCache.filterProducts(allProducts, filters)
        if (filteredProducts.length > 0) {
          setActualSearchQuery(currentSearchTerm)
          return filteredProducts
        }
      } catch (err) {
        console.error("Error in char-trim search:", err)
      }
    }

    setActualSearchQuery(searchTerm)
    return []
  }

  const loadAndFilterProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const allProducts = await productCache.getProducts()

      if (!allProducts || allProducts.length === 0) {
        setError("No products available")
        setLoading(false)
        return
      }

      let filteredProducts = []

      if (searchQuery && searchQuery.trim() !== "") {
        filteredProducts = await performProgressiveSearch(searchQuery)
      } else {
        setActualSearchQuery("")

        const stockStatusFilters = []
        if (stockFilters.inStock) stockStatusFilters.push("inStock")
        if (stockFilters.outOfStock) stockStatusFilters.push("outOfStock")
        if (stockFilters.onSale) stockStatusFilters.push("onSale")

        const filters = {
          parent_category: selectedCategory !== "all" ? selectedCategory : null,
          category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
          subcategory2: selectedSubCategory2,
          subcategory3: selectedSubCategory3,
          subcategory4: selectedSubCategory4,
          brand: selectedBrands.length > 0 ? selectedBrands : null,
          search: null,
          priceRange: priceRange,
          stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
          sortBy: sortBy,
        }

        filteredProducts = productCache.filterProducts(allProducts, filters)
      }

      if (filteredProducts.length > 0) {
        const prices = filteredProducts.map((p) => p.price || 0)
        const minProductPrice = Math.min(...prices)
        const filteredMax = Math.max(...prices)
        if (priceRange[0] === 0 && priceRange[1] === 10000) {
          setPriceRange([minProductPrice, globalMaxPrice != null ? globalMaxPrice : filteredMax])
        }
        setMinPrice(minProductPrice)
      }

      setProducts(filteredProducts)
      setLoading(false)
    } catch (err) {
      setError("Error loading products")
      setLoading(false)
    }
  }

  const filterProductsFromCache = async () => {
    try {
      const allProducts = await productCache.getProducts()
      if (!allProducts || allProducts.length === 0) {
        await loadAndFilterProducts()
        return
      }

      let filteredProducts = []

      if (searchQuery && searchQuery.trim() !== "") {
        filteredProducts = await performProgressiveSearch(searchQuery)
      } else {
        setActualSearchQuery("")

        const stockStatusFilters = []
        if (stockFilters.inStock) stockStatusFilters.push("inStock")
        if (stockFilters.outOfStock) stockStatusFilters.push("outOfStock")
        if (stockFilters.onSale) stockStatusFilters.push("onSale")

        const filters = {
          parent_category: selectedCategory !== "all" ? selectedCategory : null,
          category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
          subcategory2: selectedSubCategory2,
          subcategory3: selectedSubCategory3,
          subcategory4: selectedSubCategory4,
          brand: selectedBrands.length > 0 ? selectedBrands : null,
          search: null,
          priceRange: priceRange,
          stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
          sortBy: sortBy,
        }

        console.log("Applying filters in filterProductsFromCache:", filters)
        filteredProducts = productCache.filterProducts(allProducts, filters)
        console.log("Filtered products count from cache:", filteredProducts.length)
      }

      if (filteredProducts.length > 0) {
        const prices = filteredProducts.map((p) => p.price || 0)
        const minProductPrice = Math.min(...prices)
        const filteredMax = Math.max(...prices)
        if (priceRange[0] === 0 && priceRange[1] === 10000) {
          setPriceRange([minProductPrice, globalMaxPrice != null ? globalMaxPrice : filteredMax])
        }
        setMinPrice(minProductPrice)
      }

      setProducts(filteredProducts)
    } catch (err) {
      await loadAndFilterProducts()
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    fetchBanners()
    loadAndFilterProducts()
  }, [])

  useEffect(() => {
    const computeGlobalMax = async () => {
      try {
        const allProducts = await productCache.getProducts()
        if (allProducts && allProducts.length > 0) {
          const prices = allProducts.map((p) => p.price || 0)
          const globalMax = Math.max(...prices)
          setGlobalMaxPrice(globalMax)
          setMaxPrice(globalMax)
          if (priceRange[0] === 0 && priceRange[1] === 10000) {
            setPriceRange([0, globalMax])
          }
        }
      } catch (e) {
        // ignore; keep fallback maxPrice
      }
    }
    computeGlobalMax()
  }, [])

  useEffect(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current)

    fetchTimeout.current = setTimeout(() => {
      filterProductsFromCache()
    }, 100)
    return () => {
      clearTimeout(fetchTimeout.current)
    }
  }, [
    selectedCategory,
    selectedBrands,
    searchQuery,
    priceRange,
    selectedSubCategories,
    selectedSubCategory2,
    selectedSubCategory3,
    selectedSubCategory4,
    stockFilters,
    sortBy,
  ])

  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search)
    if (categories.length > 0) {
      const foundCategory = categories.find(
        (cat) =>
          cat._id === urlParams.parentCategory ||
          cat.slug === urlParams.parentCategory ||
          createSlug(cat.name) === urlParams.parentCategory,
      )
      setSelectedCategory(foundCategory ? foundCategory._id : "all")

      setSelectedSubCategories([])
      setSelectedSubCategory2(null)
      setSelectedSubCategory3(null)
      setSelectedSubCategory4(null)
      setCurrentSubCategoryName(null)
      setCurrentSubCategory2Name(null)
      setCurrentSubCategory3Name(null)
      setCurrentSubCategory4Name(null)
    }
  }, [location.pathname, location.search, categories])

  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      fetchSubCategories()
    } else {
      setSubCategories([])
      setSelectedSubCategories([])
    }
  }, [selectedCategory])

  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search)
    console.log("Parsed URL params:", urlParams)
    console.log("Current selectedSubCategory2 state:", selectedSubCategory2)

    const fetchAndSetSubcategoryIds = async () => {
      try {
        const { data: allSubs } = await axios.get(`${API_BASE_URL}/api/subcategories`)
        console.log("All subcategories fetched:", allSubs.length)

        if (urlParams.subcategory) {
          // Match by exact slug first, then ID, then name
          const foundSub = allSubs.find((sub) => sub.slug === urlParams.subcategory) ||
                          allSubs.find((sub) => sub._id === urlParams.subcategory) ||
                          allSubs.find((sub) => createSlug(sub.name) === urlParams.subcategory)
          if (foundSub) {
            setCurrentSubCategoryName(foundSub.name)
            // Always set Level 1 subcategory for hierarchical filtering
            setSelectedSubCategories([foundSub._id])
          } else {
            setSelectedSubCategories([])
            setCurrentSubCategoryName(urlParams.subcategory)
          }
        } else {
          setSelectedSubCategories([])
          setCurrentSubCategoryName(null)
        }

        if (urlParams.subcategory2) {
          // Match by exact slug first, then ID, then name
          const found2 = allSubs.find((sub) => sub.slug === urlParams.subcategory2) ||
                         allSubs.find((sub) => sub._id === urlParams.subcategory2) ||
                         allSubs.find((sub) => createSlug(sub.name) === urlParams.subcategory2)
          console.log("Found subcategory2:", found2)
          console.log("Setting selectedSubCategory2 to:", found2 ? found2._id : urlParams.subcategory2)
          setSelectedSubCategory2(found2 ? found2._id : urlParams.subcategory2)
          setSubCategory2Data(found2 || null) // Store full data object
          setCurrentSubCategory2Name(found2 ? found2.name : urlParams.subcategory2)
          // Keep Level 1 for hierarchical filtering (already set above)
        } else {
          setSelectedSubCategory2(null)
          setSubCategory2Data(null)
          setCurrentSubCategory2Name(null)
        }

        if (urlParams.subcategory3) {
          // Match by exact slug first, then ID, then name
          const found3 = allSubs.find((sub) => sub.slug === urlParams.subcategory3) ||
                         allSubs.find((sub) => sub._id === urlParams.subcategory3) ||
                         allSubs.find((sub) => createSlug(sub.name) === urlParams.subcategory3)
          setSelectedSubCategory3(found3 ? found3._id : urlParams.subcategory3)
          setSubCategory3Data(found3 || null) // Store full data object
          setCurrentSubCategory3Name(found3 ? found3.name : urlParams.subcategory3)
          // Keep Level 1 for hierarchical filtering (already set above)
        } else {
          setSelectedSubCategory3(null)
          setSubCategory3Data(null)
          setCurrentSubCategory3Name(null)
        }

        if (urlParams.subcategory4) {
          // Match by exact slug first, then ID, then name
          const found4 = allSubs.find((sub) => sub.slug === urlParams.subcategory4) ||
                         allSubs.find((sub) => sub._id === urlParams.subcategory4) ||
                         allSubs.find((sub) => createSlug(sub.name) === urlParams.subcategory4)
          setSelectedSubCategory4(found4 ? found4._id : urlParams.subcategory4)
          setSubCategory4Data(found4 || null) // Store full data object
          setCurrentSubCategory4Name(found4 ? found4.name : urlParams.subcategory4)
          // Keep Level 1 for hierarchical filtering (already set above)
        } else {
          setSelectedSubCategory4(null)
          setSubCategory4Data(null)
          setCurrentSubCategory4Name(null)
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error)
        setSelectedSubCategory2(urlParams.subcategory2 || null)
        setSelectedSubCategory3(urlParams.subcategory3 || null)
        setSelectedSubCategory4(urlParams.subcategory4 || null)
        setCurrentSubCategory2Name(urlParams.subcategory2 || null)
        setCurrentSubCategory3Name(urlParams.subcategory3 || null)
        setCurrentSubCategory4Name(urlParams.subcategory4 || null)
      }
    }

    fetchAndSetSubcategoryIds()
  }, [location.pathname, location.search])

  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search)
    if (brands.length > 0 && urlParams.brand) {
      const foundBrand = brands.find(
        (brand) => brand.name === urlParams.brand || createSlug(brand.name) === createSlug(urlParams.brand),
      )
      if (foundBrand) {
        setSelectedBrands([foundBrand._id])
      } else {
        setSelectedBrands([])
      }
    }
  }, [location.pathname, location.search, brands])

  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search)
    if (urlParams.search) {
      setSearchQuery(urlParams.search)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (categories.length > 0) {
      console.log(
        "All loaded categories:",
        categories.map((c) => ({ name: c.name, slug: c.slug, _id: c._id })),
      )
    }
  }, [categories])

  useEffect(() => {
    if (subCategories.length > 0) {
      console.log(
        "All loaded subcategories:",
        subCategories.map((s) => ({ name: s.name, slug: s.slug, _id: s._id })),
      )
    }
  }, [subCategories])

  useEffect(() => {
    setProductsToShow(20)
  }, [selectedCategory, selectedBrands, searchQuery, priceRange, selectedSubCategories, stockFilters, products.length])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/categories`)

      const validCategories = data.filter((cat) => {
        const isValid =
          cat &&
          typeof cat === "object" &&
          cat.name &&
          typeof cat.name === "string" &&
          cat.name.trim() !== "" &&
          cat.isActive !== false &&
          !cat.isDeleted &&
          !cat.name.match(/^[0-9a-fA-F]{24}$/) &&
          !cat.parentCategory

        return isValid
      })

      setCategories(validCategories)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/brands`)

      const validBrands = data.filter((brand) => {
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

      setBrands(validBrands)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchBanners = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/banners`)
      setBanners(data)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchSubCategories = async () => {
    try {
      const catObj = categories.find((cat) => cat._id === selectedCategory)
      if (!catObj) return

      const { data } = await axios.get(`${API_BASE_URL}/api/subcategories?category=${catObj._id}`)

      const validSubCategories = data.filter((subCat) => {
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

      setSubCategories(validSubCategories)
    } catch (err) {
      // Handle error silently
    }
  }

  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedSubCategories([])
    setCurrentSubCategoryName(null)
    setCurrentSubCategory2Name(null)
    setCurrentSubCategory3Name(null)
    setCurrentSubCategory4Name(null)

    const categoryObj = categories.find((cat) => cat._id === categoryId)
    const categoryName = categoryObj ? categoryObj.name : categoryId

    const url = generateShopURL({
      parentCategory: categoryId !== "all" ? categoryName : null,
      brand: selectedBrands.length > 0 ? brands.find((b) => b._id === selectedBrands[0])?.name : null,
      search: searchQuery || null,
    })

    navigate(url)
  }

  const handleSubCategoryChange = (subCatId) => {
    setSelectedSubCategories([subCatId])
    const subcatObj = subCategories.find((sub) => sub._id === subCatId)
    let parentId
    if (subcatObj) {
      parentId = typeof subcatObj.category === "object" ? subcatObj.category._id : subcatObj.category
    } else {
      parentId = selectedCategory
    }
    setSelectedCategory(parentId)

    const categoryObj = categories.find((cat) => cat._id === parentId)
    const subcategoryObj = subCategories.find((sub) => sub._id === subCatId)

    const categoryName = categoryObj ? categoryObj.name : parentId
    const subcategoryName = subcategoryObj ? subcategoryObj.name : subCatId

    const url = generateShopURL({
      parentCategory: parentId !== "all" ? categoryName : null,
      subcategory: subcategoryName,
      brand: selectedBrands.length > 0 ? brands.find((b) => b._id === selectedBrands[0])?.name : null,
      search: searchQuery || null,
    })

    console.log("handleSubCategoryChange called with:", { subCatId, parentId, subcatObj, url, subCategories })
    navigate(url)
  }

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) => (prev.includes(brandId) ? prev.filter((b) => b !== brandId) : [...prev, brandId]))

    const newSelectedBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((b) => b !== brandId)
      : [...selectedBrands, brandId]

    const categoryObj = categories.find((cat) => cat._id === selectedCategory)
    const subcategoryObj =
      selectedSubCategories.length > 0 ? subCategories.find((sub) => sub._id === selectedSubCategories[0]) : null

    const url = generateShopURL({
      parentCategory: selectedCategory !== "all" ? categoryObj?.name || selectedCategory : null,
      subcategory: subcategoryObj?.name || selectedSubCategories[0] || null,
      brand: newSelectedBrands.length > 0 ? brands.find((b) => b._id === newSelectedBrands[0])?.name : null,
      search: searchQuery || null,
    })

    navigate(url)
  }

  const handleStockFilterChange = (key) => {
    setStockFilters((prev) => {
      const newState = { inStock: false, outOfStock: false, onSale: false }
      newState[key] = true
      return newState
    })
  }

  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value
    setSearchQuery(newSearchQuery)

    const categoryObj = categories.find((cat) => cat._id === selectedCategory)
    const subcategoryObj =
      selectedSubCategories.length > 0 ? subCategories.find((sub) => sub._id === selectedSubCategories[0]) : null

    const url = generateShopURL({
      parentCategory: selectedCategory !== "all" ? categoryObj?.name || selectedCategory : null,
      subcategory: subcategoryObj?.name || selectedSubCategories[0] || null,
      brand: selectedBrands.length > 0 ? brands.find((b) => b._id === selectedBrands[0])?.name : null,
      search: newSearchQuery || null,
    })

    navigate(url)
  }

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedBrands([])
    setSelectedSubCategories([])
    setPriceRange([0, maxPrice])
    setSearchQuery("")
    setActualSearchQuery("")
    setStockFilters({ inStock: false, outOfStock: false, onSale: false })
    navigate("/shop")
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/g.png" alt="Loading..." style={{ width: 180, height: 180, animation: "bounce 1s infinite" }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const selectedSubCategoryObj = subCategories.find((sub) => sub._id === selectedSubCategories[0])

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const buildCanonicalPath = () => {
    const path = location.pathname || "/shop"
    return path
  }

  const categoryObj = categories.find((cat) => cat._id === selectedCategory)
  const subcategoryObj =
    selectedSubCategories.length > 0 ? subCategories.find((s) => s._id === selectedSubCategories[0]) : null

  // Determine which subcategory level to use for SEO (deepest level takes priority)
  const activeSubcategoryForSEO = subCategory4Data || subCategory3Data || subCategory2Data || subcategoryObj

  const seoContent = activeSubcategoryForSEO?.seoContent || categoryObj?.seoContent || ""

  const customMetaTitle = activeSubcategoryForSEO?.metaTitle || categoryObj?.metaTitle || ""
  const customMetaDescription = activeSubcategoryForSEO?.metaDescription || categoryObj?.metaDescription || ""

  const seoTitle =
    customMetaTitle ||
    (seoContent
      ? generateSEOTitle(activeSubcategoryForSEO?.name || categoryObj?.name || "", seoContent)
      : activeSubcategoryForSEO
        ? `${activeSubcategoryForSEO.name} — Shop`
        : categoryObj
          ? `${categoryObj.name} — Shop`
          : searchQuery?.trim()
            ? `Search: ${searchQuery.trim()} — Shop`
            : "Shop — Grabatoz")

  const seoDescription =
    customMetaDescription ||
    (seoContent
      ? createMetaDescription(seoContent, 160)
      : activeSubcategoryForSEO
        ? `Browse ${activeSubcategoryForSEO.name} products at great prices.`
        : categoryObj
          ? `Explore top ${categoryObj.name} products.`
          : "Explore our catalog and find your next purchase at Grabatoz.")

  const buildBreadcrumbPath = () => {
    const parts = [categoryObj?.name]
    if (currentSubCategoryName) parts.push(currentSubCategoryName)
    if (currentSubCategory2Name) parts.push(currentSubCategory2Name)
    if (currentSubCategory3Name) parts.push(currentSubCategory3Name)
    if (currentSubCategory4Name) parts.push(currentSubCategory4Name)
    return parts.filter(Boolean).join(" > ")
  }

  const breadcrumbPath = buildBreadcrumbPath()
  const showBreadcrumb = selectedSubCategory2 || selectedSubCategory3 || selectedSubCategory4

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={seoTitle} description={seoDescription} canonicalPath={buildCanonicalPath()} />
      <ProductSchema products={products} type="list" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 hidden md:block">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {showBreadcrumb && (
                <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-lime-900">Current Path:</p>
                  <p className="text-sm text-lime-800 mt-1 break-words">{breadcrumbPath}</p>
                </div>
              )}

              <div className="border-b pb-4">
                <button
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                >
                  Price Range
                  {showPriceFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                </button>
                {showPriceFilter && (
                  <div className="mt-4 space-y-4">
                    <PriceFilter
                      min={minPrice}
                      max={maxPrice}
                      initialRange={priceRange}
                      onApply={(range) => setPriceRange(range)}
                    />
                  </div>
                )}
              </div>

              <div className="border-b pb-4">
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                >
                  Categories
                  {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                </button>
                {showCategoryFilter && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center cursor-pointer" onClick={() => handleCategoryChange("all")}>
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="category-group"
                          checked={selectedCategory === "all"}
                          readOnly
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                            selectedCategory === "all" ? "border-lime-600 bg-lime-600" : "border-gray-300"
                          }`}
                        >
                          {selectedCategory === "all" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">All Categories</span>
                    </div>

                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center cursor-pointer"
                        onClick={() => handleCategoryChange(category._id)}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="category-group"
                            checked={selectedCategory === category._id}
                            readOnly
                            className="absolute opacity-0 w-0 h-0"
                          />
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                              selectedCategory === category._id ? "border-lime-600 bg-lime-600" : "border-gray-300"
                            }`}
                          >
                            {selectedCategory === category._id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="flex flex-row justify-between items-center mb-6 relative z-10">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {searchQuery.trim() ? (
                    <>
                      Results for "{searchQuery.trim()}"
                      {actualSearchQuery && actualSearchQuery !== searchQuery.trim() && (
                        <span className="text-sm text-gray-500 block mt-1">
                          Showing results for "{actualSearchQuery}" instead
                        </span>
                      )}
                    </>
                  ) : (
                    currentSubCategory4Name ||
                    currentSubCategory3Name ||
                    currentSubCategory2Name ||
                    currentSubCategoryName ||
                    categories.find((cat) => cat._id === selectedCategory)?.name ||
                    "All Products"
                  )}
                </h1>
                <p className="text-gray-600 mt-1">{products.length} products found</p>
              </div>

              <div className="hidden md:block mt-0 flex-shrink-0 relative z-20">
                <SortDropdown value={sortBy} onChange={handleSortChange} />
              </div>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.slice(0, productsToShow).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                </div>
                {productsToShow < products.length && (
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
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No products found</div>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content Display - Full Width After Products */}
        {seoContent && !searchQuery.trim() && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-8">
            <div 
              className="prose prose-lg max-w-none text-gray-700 
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-gray-900
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-gray-800
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-800
                [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-gray-700
                [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-gray-700
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:space-y-2
                [&_li]:text-gray-700 [&_li]:leading-relaxed
                [&_strong]:font-bold [&_strong]:text-gray-900
                [&_em]:italic
                [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
                [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-4
                [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-semibold
                [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2"
              dangerouslySetInnerHTML={{ __html: seoContent }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
