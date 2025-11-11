 
"use client"

import { useState, useEffect, useRef } from "react"

import config from "../config/config"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { generateShopURL } from "../utils/urlUtils"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useWishlist } from "../context/WishlistContext"
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  Menu,
  X,
  Home,
  Grid3X3,
  UserCircle,
  HelpCircle,
  Package,
  ChevronDown,
  ChevronRight,
  Truck,
} from "lucide-react"
import axios from "axios"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { cartCount } = useCart()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef(null)
  const searchDropdownRef = useRef(null)
  const mobileSearchInputRef = useRef(null)
  const mobileSearchDropdownRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([]) // now contains nested tree nodes: { _id, name, slug, children: [] }
  const [flatSubCategories, setFlatSubCategories] = useState([]) // keep for backward compatibility / other components
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [hoveredSubCategory1, setHoveredSubCategory1] = useState(null) // For Level 2
  const [hoveredSubCategory2, setHoveredSubCategory2] = useState(null) // For Level 3
  const [hoveredSubCategory3, setHoveredSubCategory3] = useState(null) // For Level 4
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const profileRef = useRef(null)
  const profileButtonRef = useRef(null)
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(8)
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
  const moreDropdownTimeoutRef = useRef(null)
  const [hoveredMoreCategory, setHoveredMoreCategory] = useState(null)
  const moreCategoryTimeoutRef = useRef(null)
  // Timeout refs for delayed hover states
  const categoryTimeoutRef = useRef(null)
  const subCategory1TimeoutRef = useRef(null)
  const subCategory2TimeoutRef = useRef(null)
  const subCategory3TimeoutRef = useRef(null)
  // Tiny in-memory cache to speed up repeated candidate lookups during typing
  const liveSearchCacheRef = useRef(new Map())
  // Alignment for the first subcategory panel under a main category
  const [level1Align, setLevel1Align] = useState('left') // 'left' => left-0, 'right' => right-0

  // Direction states (simple midpoint rule: items left of screen center open right, else open left)
  const [level2Dir, setLevel2Dir] = useState('right')
  const [level3Dir, setLevel3Dir] = useState('right')
  const [level4Dir, setLevel4Dir] = useState('right')
  const [moreLevel1Dir, setMoreLevel1Dir] = useState('right')
  const [moreLevel2Dir, setMoreLevel2Dir] = useState('right')
  const [moreLevel3Dir, setMoreLevel3Dir] = useState('right')
  const [moreLevel4Dir, setMoreLevel4Dir] = useState('right')

  // Decide direction based on available space rather than midpoint
  const MIN_PANEL_WIDTH = 260 // px (matches min-w[240] + padding/margins)
  const computeRightDir = (rect) => {
    if (!rect) return 'right'
    const rightSpace = window.innerWidth - rect.right
    const leftSpace = rect.left
    if (rightSpace >= MIN_PANEL_WIDTH) return 'right'
    if (leftSpace >= MIN_PANEL_WIDTH) return 'left'
    return rightSpace >= leftSpace ? 'right' : 'left'
  }
  const computeLeftDir = (rect) => {
    if (!rect) return 'left'
    const leftSpace = rect.left
    const rightSpace = window.innerWidth - rect.right
    if (leftSpace >= MIN_PANEL_WIDTH) return 'left'
    if (rightSpace >= MIN_PANEL_WIDTH) return 'right'
    return leftSpace >= rightSpace ? 'left' : 'right'
  }


  // Fetch categories and subcategories from API
  const fetchCategoryTree = async () => {
    try {
      const [treeResp, subsResp] = await Promise.all([
        axios.get(`${config.API_URL}/api/categories/tree`),
        axios.get(`${config.API_URL}/api/subcategories`), // still used for any legacy logic (e.g., other pages)
      ])
      const treeData = Array.isArray(treeResp.data) ? treeResp.data : []
      setCategories(treeData)
      setFlatSubCategories(Array.isArray(subsResp.data) ? subsResp.data : [])
    } catch (error) {
      console.error("Error fetching category tree:", error)
    }
  }

  // Helpers now use tree structure
  const getSubCategoriesForCategory = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId)
    if (!cat || !Array.isArray(cat.children)) return []
    // Level 1 nodes: nodes with level === 1 OR no level property (import fallback)
    return cat.children.filter((n) => !n.level || n.level === 1)
  }

  const getChildSubCategories = (parentNodeId) => {
    // We need a lookup: flatten categories children recursively once (memoized by ref) OR derive by search each time for simplicity.
    // Simplicity approach: depth-first search for node id and return its children.
    const stack = []
    for (const c of categories) {
      if (Array.isArray(c.children)) stack.push(...c.children)
    }
    const visited = new Set()
    while (stack.length) {
      const node = stack.pop()
      if (!node || visited.has(node._id)) continue
      visited.add(node._id)
      if (node._id === parentNodeId) {
        return Array.isArray(node.children) ? node.children : []
      }
      if (Array.isArray(node.children) && node.children.length) {
        stack.push(...node.children)
      }
    }
    return []
  }

  const toggleMobileCategory = (categoryId) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryId ? null : categoryId)
  }

  // Handle "More" dropdown hover with delay to prevent flickering
  const handleMoreDropdownEnter = () => {
    if (moreDropdownTimeoutRef.current) {
      clearTimeout(moreDropdownTimeoutRef.current)
    }
    setIsMoreDropdownOpen(true)
  }

  const handleMoreDropdownLeave = () => {
    moreDropdownTimeoutRef.current = setTimeout(() => {
      setIsMoreDropdownOpen(false)
      setHoveredMoreCategory(null) // Also close any open subcategory dropdown
    }, 150) // Small delay to allow cursor movement to dropdown
  }

  // Handle subcategory dropdown hover within "More" dropdown
  const handleMoreCategoryEnter = (categoryId, e) => {
    if (moreCategoryTimeoutRef.current) {
      clearTimeout(moreCategoryTimeoutRef.current)
    }
    setHoveredMoreCategory(categoryId)
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      setMoreLevel1Dir(computeLeftDir(rect))
    }
  }

  const handleMoreCategoryLeave = () => {
    moreCategoryTimeoutRef.current = setTimeout(() => {
      setHoveredMoreCategory(null)
    }, 150) // Small delay to allow cursor movement to subcategory dropdown
  }

  // Function to check if search query matches a product's SKU (or name) exactly
  const findExactProductMatch = async (query) => {
    if (!query || query.trim().length === 0) return null

    const normalized = query.trim().toLowerCase()
    try {
      // 1) Try exact SKU lookup via dedicated endpoint (more reliable than fuzzy search)
      const skuCandidates = Array.from(
        new Set([query.trim(), query.trim().toUpperCase(), query.trim().toLowerCase()]),
      )
      try {
        const skuResp = await axios.post(`${config.API_URL}/api/products/by-skus`, { skus: skuCandidates })
        if (Array.isArray(skuResp.data) && skuResp.data.length > 0) {
          // Prefer exact case-insensitive match if multiple
          const exactSku = skuResp.data.find(
            (p) => p.sku && String(p.sku).trim().toLowerCase() === normalized,
          )
          return exactSku || skuResp.data[0]
        }
      } catch (e) {
        // ignore and fall back to search
      }

      // 2) Fallback to existing search endpoint and scan results
      const { data } = await axios.get(
        `${config.API_URL}/api/products?search=${encodeURIComponent(query.trim())}&limit=50`,
      )

      // First, try exact SKU match (case-insensitive)
      const exactSkuMatch = data.find(
        (product) => product.sku && String(product.sku).trim().toLowerCase() === normalized,
      )
      if (exactSkuMatch) return exactSkuMatch

      // Fallback: exact name match (to preserve prior behavior)
      const exactNameMatch = data.find(
        (product) => product.name && String(product.name).trim().toLowerCase() === normalized,
      )
      return exactNameMatch || null
    } catch (error) {
      console.error("Error finding exact product match:", error)
      return null
    }
  }

  // Instant search effect with progressive fallback (words → characters)
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length === 0) {
      setSearchResults([])
      setShowSearchDropdown(false)
      setSearchLoading(false)
      return
    }

    let cancelled = false
    setSearchLoading(true)

    // Build candidate queries: full, then drop trailing words, then drop trailing characters
    const buildCandidates = (input) => {
      const unique = new Set()
      const out = []
      const push = (s) => {
        const v = s.trim()
        if (v && !unique.has(v)) {
          unique.add(v)
          out.push(v)
        }
      }

      push(input)
      const words = input.split(/\s+/)
      // Word-prefix candidates (drop last word progressively)
      for (let i = words.length - 1; i >= 1; i--) {
        push(words.slice(0, i).join(" "))
        if (out.length >= 4) break
      }
      // Character-prefix candidates (strategic trims instead of letter-by-letter for speed)
      const base = words[0]
      if (base && base.length > 3) {
        const p70 = base.slice(0, Math.max(3, Math.floor(base.length * 0.7)))
        const p50 = base.slice(0, Math.max(3, Math.floor(base.length * 0.5)))
        push(p70)
        push(p50)
      }
      return out
    }

    const fetchResults = async () => {
      try {
        const candidates = buildCandidates(q)
        for (const cand of candidates) {
          try {
            // 1) Check tiny in-memory cache first
            const cached = liveSearchCacheRef.current.get(cand)
            if (cached) {
              if (!cancelled) {
                if (Array.isArray(cached) && cached.length > 0) {
                  setSearchResults(cached)
                  setShowSearchDropdown(true)
                  return
                }
              }
            }

            // 2) Fallback to API
            const { data } = await axios.get(`${config.API_URL}/api/products?search=${encodeURIComponent(cand)}&limit=5`)
            if (cancelled) return
            // Cache result (including empty) to speed up subsequent key strokes
            liveSearchCacheRef.current.set(cand, Array.isArray(data) ? data : [])
            // Simple cache pruning
            if (liveSearchCacheRef.current.size > 100) {
              liveSearchCacheRef.current.clear()
            }

            if (Array.isArray(data) && data.length > 0) {
              setSearchResults(data)
              setShowSearchDropdown(true)
              return
            }
          } catch (_) {
            // ignore and try next candidate
          }
        }
        // No candidates found
        setSearchResults([])
        setShowSearchDropdown(false)
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }

    const timeout = setTimeout(fetchResults, 180)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [searchQuery])

  // Hide dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      const clickedInside =
        (searchDropdownRef.current && searchDropdownRef.current.contains(e.target)) ||
        (searchInputRef.current && searchInputRef.current.contains(e.target)) ||
        (mobileSearchDropdownRef.current && mobileSearchDropdownRef.current.contains(e.target)) ||
        (mobileSearchInputRef.current && mobileSearchInputRef.current.contains(e.target))

      if (!clickedInside) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    fetchCategoryTree()
  }, [])

  // Responsive categories count based on screen size
  useEffect(() => {
    const updateVisibleCategories = () => {
      const width = window.innerWidth
      if (width >= 1536) {
        // 2xl screens
        setVisibleCategoriesCount(10)
      } else if (width >= 1280) {
        // xl screens
        setVisibleCategoriesCount(8)
      } else if (width >= 1024) {
        // lg screens
        setVisibleCategoriesCount(6)
      } else if (width >= 768) {
        // md screens
        setVisibleCategoriesCount(4)
      } else {
        setVisibleCategoriesCount(8) // mobile - show all in mobile menu
      }
    }

    updateVisibleCategories()
    window.addEventListener("resize", updateVisibleCategories)
    return () => window.removeEventListener("resize", updateVisibleCategories)
  }, [])

  // Close profile dropdown on outside click (desktop only)
  useEffect(() => {
    if (!isProfileOpen) return
    function handleProfileClick(e) {
      // Only run on md+ screens
      if (window.innerWidth < 768) return
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleProfileClick)
    return () => document.removeEventListener("mousedown", handleProfileClick)
  }, [isProfileOpen])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (moreDropdownTimeoutRef.current) {
        clearTimeout(moreDropdownTimeoutRef.current)
      }
      if (moreCategoryTimeoutRef.current) {
        clearTimeout(moreCategoryTimeoutRef.current)
      }
    }
  }, [])

  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin")

  // Don't render navbar for admin routes
  if (isAdminRoute) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsProfileOpen(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // First, check if the search query matches a product exactly
      const exactMatch = await findExactProductMatch(searchQuery.trim())

      if (exactMatch) {
        // Navigate to product details page
        navigate(`/product/${exactMatch.slug || exactMatch._id}`)
        setShowSearchDropdown(false)
        // Optionally clear search query
        // setSearchQuery("");
      } else {
        // Navigate to shop page with search results
        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
        setShowSearchDropdown(false)
        // setSearchQuery("") // Optionally clear
      }
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setExpandedMobileCategory(null) // Reset expanded category when menu closes
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setExpandedMobileCategory(null)
  }

  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true)
  }
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false)
  }

  return (
    <>
      {/* Desktop Navbar - Hidden on Mobile */}
      <header className="hidden md:block bg-white shadow-sm sticky top-0 pt-4 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Exact Grabatoz Style */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-48 h-  flex items-center justify-center">
                <img src="/new-logo.webp" alt="Logo" className="w-full h-full" />
              </div>
            </Link>

            {/* Search Bar - Exact Grabatoz Style */}
            <div className="flex-1 max-w-3xl justify-center items-center" style={{ paddingLeft: "140px" }}>
              <form onSubmit={handleSearch} className="relative">
                <div className="">
                  <div className="flex items-center gap-2 m-1">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-4 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-lime-500"
                      style={{ width: "80%" }}
                      ref={searchInputRef}
                      onFocus={() => {
                        if (searchResults.length > 0) setShowSearchDropdown(true)
                      }}
                    />
                    {/* Loading spinner */}
                    {searchLoading && (
                      <span className="absolute right-36 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="animate-spin h-5 w-5 text-lime-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      </span>
                    )}
                    <button type="submit" className="px-4 py-4 bg-lime-500 text-white hover:bg-green-600">
                      <Search size={18} />
                    </button>
                  </div>
                  {/* Autocomplete Dropdown */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div
                      ref={searchDropdownRef}
                      className="absolute left-0 right-0 bg-white border border-gray-200 shadow-lg rounded z-50 mt-2 max-h-96 overflow-y-auto"
                    >
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product.slug || product._id}`}
                          className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => setShowSearchDropdown(false)}
                        >
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-16 h-16 object-contain rounded"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-2">{product.description}</div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        to={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                        className="block text-center text-lime-600 hover:underline py-2 text-sm font-medium"
                        onClick={() => setShowSearchDropdown(false)}
                      >
                        View all results
                      </Link>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right Side Icons - Exact Grabatoz Style */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-3 border border-black" aria-label="Wishlist">
                <Heart size={20} className="text-gray-600" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-3 border border-black"
                  ref={profileButtonRef}
                >
                  <User size={20} className="text-gray-600" />
                </button>

                {isProfileOpen && (
                  <div
                    ref={profileRef}
                    className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl z-20 border"
                  >
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/track-order"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Track Order
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Register
                        </Link>
                        <Link
                          to="/track-order"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Track Order
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative p-3">
                <ShoppingCart size={30} className="text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Dynamic Categories with Dropdowns */}
        <div className="bg-lime-500 mt-4 flex relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center space-x-16 h-12">
              {/* Category Overflow Dropdown for md+ screens */}
              {categories.length > visibleCategoriesCount && (
                <div
                  className="relative hidden md:block"
                  onMouseEnter={handleMoreDropdownEnter}
                  onMouseLeave={handleMoreDropdownLeave}
                >
                  <button className="text-white font-medium whitespace-nowrap text-sm flex items-center">
                    More <ChevronDown size={18} className="ml-1" />
                  </button>
                  {isMoreDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md py-2 min-w-48 z-50 border">
                      {categories.slice(visibleCategoriesCount).map((parentCategory) => {
                        const categorySubCategories = getSubCategoriesForCategory(parentCategory._id)
                        return (
                          <div
                            key={parentCategory._id}
                            className="relative"
                            onMouseEnter={(e) => handleMoreCategoryEnter(parentCategory._id, e)}
                            onMouseLeave={handleMoreCategoryLeave}
                          >
                            <Link
                              to={generateShopURL({ parentCategory: parentCategory.name })}
                              className="flex items-center justify-between px-4 py-2 text-black font-medium whitespace-nowrap text-sm hover:bg-gray-100"
                              onClick={() => {
                                setIsMoreDropdownOpen(false)
                                setHoveredMoreCategory(null)
                              }}
                            >
                              <span className="mr-2">{parentCategory.name}</span>
                              {categorySubCategories.length > 0 && (
                                <ChevronRight size={16} className="text-gray-400" />
                              )}
                            </Link>
                            {/* Dropdown for subcategories */}
                            {hoveredMoreCategory === parentCategory._id && categorySubCategories.length > 0 && (
                              <div id="more-dropdown-level1" className={`absolute top-0 ${moreLevel1Dir === 'left' ? 'right-full mr-2' : 'left-full ml-2'} bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[60] border border-gray-100`}>
                                <div className="px-3 py-2 border-b border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subcategories</p>
                                </div>
                                {categorySubCategories.map((subCategory, index) => {
                                  const level2Subs = getChildSubCategories(subCategory._id)
                                  return (
                                    <div
                                      key={subCategory._id}
                                      className="group"
                                      onMouseEnter={(e) => {
                                        if (subCategory1TimeoutRef.current) {
                                          clearTimeout(subCategory1TimeoutRef.current)
                                        }
                                        setHoveredSubCategory1(subCategory._id)
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setMoreLevel2Dir(computeLeftDir(rect))
                                      }}
                                      onMouseLeave={() => {
                                        subCategory1TimeoutRef.current = setTimeout(() => {
                                          setHoveredSubCategory1(null)
                                          setHoveredSubCategory2(null)
                                          setHoveredSubCategory3(null)
                                        }, 1000)
                                      }}
                                    >
                                      <Link
                                        to={generateShopURL({
                                          parentCategory: parentCategory.name,
                                          subcategory: subCategory.name,
                                        })}
                                        className={`flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                                        onClick={() => {
                                          setIsMoreDropdownOpen(false)
                                          setHoveredMoreCategory(null)
                                          setHoveredSubCategory1(null)
                                          setHoveredSubCategory2(null)
                                          setHoveredSubCategory3(null)
                                        }}
                                      >
                                        <span className="font-medium flex-1">{subCategory.name}</span>
                                        {level2Subs.length > 0 && (
                                          <ChevronRight size={18} className="ml-2 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                                        )}
                                      </Link>

                                      {/* Level 2 subcategories */}
                                      {hoveredSubCategory1 === subCategory._id && level2Subs.length > 0 && (
                                        <div 
                                          id="more-dropdown-level2"
                                          className={`absolute top-0 ${moreLevel2Dir === 'left' ? 'right-full mr-2' : 'left-full ml-2'} bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[70] border border-gray-100`}
                                          onMouseEnter={() => {
                                            if (subCategory1TimeoutRef.current) {
                                              clearTimeout(subCategory1TimeoutRef.current)
                                            }
                                          }}
                                          onMouseLeave={() => {
                                            subCategory1TimeoutRef.current = setTimeout(() => {
                                              setHoveredSubCategory1(null)
                                              setHoveredSubCategory2(null)
                                              setHoveredSubCategory3(null)
                                            }, 1000)
                                          }}
                                        >
                                          <div className="px-3 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level 2</p>
                                          </div>
                                          {level2Subs.map((subCategory2, index2) => {
                                            const level3Subs = getChildSubCategories(subCategory2._id)
                                            return (
                                              <div
                                                key={subCategory2._id}
                                                className="group"
                                                onMouseEnter={(e) => {
                                                  if (subCategory2TimeoutRef.current) {
                                                    clearTimeout(subCategory2TimeoutRef.current)
                                                  }
                                                  setHoveredSubCategory2(subCategory2._id)
                                                  const rect = e.currentTarget.getBoundingClientRect()
                                                  setMoreLevel3Dir(computeLeftDir(rect))
                                                }}
                                                onMouseLeave={() => {
                                                  subCategory2TimeoutRef.current = setTimeout(() => {
                                                    setHoveredSubCategory2(null)
                                                    setHoveredSubCategory3(null)
                                                  }, 1000)
                                                }}
                                              >
                                                <Link
                                                  to={generateShopURL({ 
                                                    parentCategory: parentCategory.name, 
                                                    subcategory: subCategory.name,
                                                    subcategory2: subCategory2.name 
                                                  })}
                                                  className={`flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm ${index2 !== 0 ? 'border-t border-gray-50' : ''}`}
                                                  onClick={() => {
                                                    setIsMoreDropdownOpen(false)
                                                    setHoveredMoreCategory(null)
                                                    setHoveredSubCategory1(null)
                                                    setHoveredSubCategory2(null)
                                                    setHoveredSubCategory3(null)
                                                  }}
                                                >
                                                  <span className="font-medium flex-1">{subCategory2.name}</span>
                                                  {level3Subs.length > 0 && (
                                                    <ChevronRight size={18} className="ml-2 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                                                  )}
                                                </Link>

                                                {/* Level 3 subcategories */}
                                                {hoveredSubCategory2 === subCategory2._id && level3Subs.length > 0 && (
                                                  <div 
                                                    id="more-dropdown-level3"
                                                    className={`absolute top-0 ${moreLevel3Dir === 'left' ? 'right-full mr-2' : 'left-full ml-2'} bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[80] border border-gray-100`}
                                                    onMouseEnter={() => {
                                                      if (subCategory2TimeoutRef.current) {
                                                        clearTimeout(subCategory2TimeoutRef.current)
                                                      }
                                                    }}
                                                    onMouseLeave={() => {
                                                      subCategory2TimeoutRef.current = setTimeout(() => {
                                                        setHoveredSubCategory2(null)
                                                        setHoveredSubCategory3(null)
                                                      }, 1000)
                                                    }}
                                                  >
                                                    <div className="px-3 py-2 border-b border-gray-100">
                                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level 3</p>
                                                    </div>
                                                    {level3Subs.map((subCategory3, index3) => {
                                                      const level4Subs = getChildSubCategories(subCategory3._id)
                                                      return (
                                                        <div
                                                          key={subCategory3._id}
                                                          className="group"
                                                          onMouseEnter={(e) => {
                                                            if (subCategory3TimeoutRef.current) {
                                                              clearTimeout(subCategory3TimeoutRef.current)
                                                            }
                                                            setHoveredSubCategory3(subCategory3._id)
                                                            const rect = e.currentTarget.getBoundingClientRect()
                                                            setMoreLevel4Dir(computeLeftDir(rect))
                                                          }}
                                                          onMouseLeave={() => {
                                                            subCategory3TimeoutRef.current = setTimeout(() => {
                                                              setHoveredSubCategory3(null)
                                                            }, 1000)
                                                          }}
                                                        >
                                                          <Link
                                                            to={generateShopURL({ 
                                                              parentCategory: parentCategory.name, 
                                                              subcategory: subCategory.name,
                                                              subcategory2: subCategory2.name,
                                                              subcategory3: subCategory3.name
                                                            })}
                                                            className={`flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm ${index3 !== 0 ? 'border-t border-gray-50' : ''}`}
                                                            onClick={() => {
                                                              setIsMoreDropdownOpen(false)
                                                              setHoveredMoreCategory(null)
                                                              setHoveredSubCategory1(null)
                                                              setHoveredSubCategory2(null)
                                                              setHoveredSubCategory3(null)
                                                            }}
                                                          >
                                                            <span className="font-medium flex-1">{subCategory3.name}</span>
                                                            {level4Subs.length > 0 && (
                                                              <ChevronRight size={18} className="ml-2 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                                                            )}
                                                          </Link>

                                                          {/* Level 4 subcategories */}
                                                          {hoveredSubCategory3 === subCategory3._id && level4Subs.length > 0 && (
                                                            <div 
                                                              id="more-dropdown-level4"
                                                              className={`absolute top-0 ${moreLevel4Dir === 'left' ? 'right-full mr-2' : 'left-full ml-2'} bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[90] border border-gray-100`}
                                                              onMouseEnter={() => {
                                                                if (subCategory3TimeoutRef.current) {
                                                                  clearTimeout(subCategory3TimeoutRef.current)
                                                                }
                                                              }}
                                                              onMouseLeave={() => {
                                                                subCategory3TimeoutRef.current = setTimeout(() => {
                                                                  setHoveredSubCategory3(null)
                                                                }, 1000)
                                                              }}
                                                            >
                                                              <div className="px-3 py-2 border-b border-gray-100">
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level 4</p>
                                                              </div>
                                                              {level4Subs.map((subCategory4, index4) => (
                                                                <Link
                                                                  key={subCategory4._id}
                                                                  to={generateShopURL({ 
                                                                    parentCategory: parentCategory.name, 
                                                                    subcategory: subCategory.name,
                                                                    subcategory2: subCategory2.name,
                                                                    subcategory3: subCategory3.name,
                                                                    subcategory4: subCategory4.name
                                                                  })}
                                                                  className={`block px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm font-medium ${index4 !== 0 ? 'border-t border-gray-50' : ''}`}
                                                                  onClick={() => {
                                                                    setIsMoreDropdownOpen(false)
                                                                    setHoveredMoreCategory(null)
                                                                    setHoveredSubCategory1(null)
                                                                    setHoveredSubCategory2(null)
                                                                    setHoveredSubCategory3(null)
                                                                  }}
                                                                >
                                                                  {subCategory4.name}
                                                                </Link>
                                                              ))}
                                                            </div>
                                                          )}
                                                        </div>
                                                      )
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}

                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              {/* Show responsive number of categories (all on mobile) */}
              {(categories.length > visibleCategoriesCount
                ? categories.slice(0, visibleCategoriesCount)
                : categories
              ).map((parentCategory) => {
                const categorySubCategories = getSubCategoriesForCategory(parentCategory._id)
                return (
                  <div
                    key={parentCategory._id}
                    className="relative"
                    onMouseEnter={(e) => {
                      if (categoryTimeoutRef.current) {
                        clearTimeout(categoryTimeoutRef.current)
                      }
                      setHoveredCategory(parentCategory._id)
                      // Decide whether the level-1 panel should align left or right based on available space
                      const rect = e.currentTarget.getBoundingClientRect()
                      const rightSpaceFromLeft = window.innerWidth - rect.left
                      const PANEL = 280 // px
                      setLevel1Align(rightSpaceFromLeft >= PANEL ? 'left' : 'right')
                    }}
                    onMouseLeave={() => {
                      categoryTimeoutRef.current = setTimeout(() => {
                        setHoveredCategory(null)
                        setHoveredSubCategory1(null)
                        setHoveredSubCategory2(null)
                        setHoveredSubCategory3(null)
                      }, 1000)
                    }}
                  >
                    <Link
                      to={generateShopURL({ parentCategory: parentCategory.name })}
                      className="text-white  font-medium whitespace-nowrap text-sm"
                    >
                      {parentCategory.name}
                    </Link>
                    {/* Dropdown for Level 1 subcategories */}
                    {hoveredCategory === parentCategory._id && categorySubCategories.length > 0 && (
                      <div 
                        className={`absolute top-full ${level1Align === 'left' ? 'left-0' : 'right-0'} mt-2 bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[60] border border-gray-100`}
                        onMouseEnter={() => {
                          if (categoryTimeoutRef.current) {
                            clearTimeout(categoryTimeoutRef.current)
                          }
                        }}
                        onMouseLeave={() => {
                          categoryTimeoutRef.current = setTimeout(() => {
                            setHoveredCategory(null)
                            setHoveredSubCategory1(null)
                            setHoveredSubCategory2(null)
                            setHoveredSubCategory3(null)
                          }, 1000)
                        }}
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subcategories</p>
                        </div>
                        {categorySubCategories.map((subCategory, index) => {
                          const level2Subs = getChildSubCategories(subCategory._id)
                          return (
                            <div
                              key={subCategory._id}
                              className="group"
                              onMouseEnter={(e) => {
                                if (subCategory1TimeoutRef.current) {
                                  clearTimeout(subCategory1TimeoutRef.current)
                                }
                                setHoveredSubCategory1(subCategory._id)
                                const rect = e.currentTarget.getBoundingClientRect()
                                setLevel2Dir(computeRightDir(rect))
                              }}
                              onMouseLeave={() => {
                                subCategory1TimeoutRef.current = setTimeout(() => {
                                  setHoveredSubCategory1(null)
                                  setHoveredSubCategory2(null)
                                  setHoveredSubCategory3(null)
                                }, 1000)
                              }}
                            >
                              <Link
                                to={generateShopURL({ parentCategory: parentCategory.name, subcategory: subCategory.name })}
                                className={`flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                                onClick={() => {
                                  setHoveredCategory(null)
                                  setHoveredSubCategory1(null)
                                  setHoveredSubCategory2(null)
                                  setHoveredSubCategory3(null)
                                }}
                              >
                                <span className="font-medium flex-1">{subCategory.name}</span>
                                {level2Subs.length > 0 && (
                                  <ChevronRight size={18} className="ml-2 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                                )}
                              </Link>

                              {/* Dropdown for Level 2 subcategories */}
                              {hoveredSubCategory1 === subCategory._id && level2Subs.length > 0 && (
                                <div 
                                  id="dropdown-level2"
                                  className={`absolute top-0 ${level2Dir === 'right' ? 'left-full ml-2' : 'right-full mr-2'} bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[70] border border-gray-100`}
                                  onMouseEnter={() => {
                                    if (subCategory1TimeoutRef.current) {
                                      clearTimeout(subCategory1TimeoutRef.current)
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    subCategory1TimeoutRef.current = setTimeout(() => {
                                      setHoveredSubCategory1(null)
                                      setHoveredSubCategory2(null)
                                      setHoveredSubCategory3(null)
                                    }, 1000)
                                  }}
                                >
                                  <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level 2</p>
                                  </div>
                                  {level2Subs.map((subCategory2, index2) => {
                                    const level3Subs = getChildSubCategories(subCategory2._id)
                                    return (
                                      <div
                                        key={subCategory2._id}
                                        className="group"
                                        onMouseEnter={(e) => {
                                          if (subCategory2TimeoutRef.current) {
                                            clearTimeout(subCategory2TimeoutRef.current)
                                          }
                                          setHoveredSubCategory2(subCategory2._id)
                                          const rect = e.currentTarget.getBoundingClientRect()
                                          setLevel3Dir(computeRightDir(rect))
                                        }}
                                        onMouseLeave={() => {
                                          subCategory2TimeoutRef.current = setTimeout(() => {
                                            setHoveredSubCategory2(null)
                                            setHoveredSubCategory3(null)
                                          }, 1000)
                                        }}
                                      >
                                        <Link
                                          to={generateShopURL({ 
                                            parentCategory: parentCategory.name, 
                                            subcategory: subCategory.name,
                                            subcategory2: subCategory2.name 
                                          })}
                                          className={`flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm ${index2 !== 0 ? 'border-t border-gray-50' : ''}`}
                                          onClick={() => {
                                            setHoveredCategory(null)
                                            setHoveredSubCategory1(null)
                                            setHoveredSubCategory2(null)
                                            setHoveredSubCategory3(null)
                                          }}
                                        >
                                          <span className="font-medium flex-1">{subCategory2.name}</span>
                                          {level3Subs.length > 0 && (
                                            <ChevronRight size={18} className="ml-2 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                                          )}
                                        </Link>

                                        {/* Dropdown for Level 3 subcategories */}
                                        {hoveredSubCategory2 === subCategory2._id && level3Subs.length > 0 && (
                                          <div 
                                            id="dropdown-level3"
                                            className={`absolute top-0 ${level3Dir === 'right' ? 'left-full ml-2' : 'right-full mr-2'} bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[80] border border-gray-100`}
                                            onMouseEnter={() => {
                                              if (subCategory2TimeoutRef.current) {
                                                clearTimeout(subCategory2TimeoutRef.current)
                                              }
                                            }}
                                            onMouseLeave={() => {
                                              subCategory2TimeoutRef.current = setTimeout(() => {
                                                setHoveredSubCategory2(null)
                                                setHoveredSubCategory3(null)
                                              }, 1000)
                                            }}
                                          >
                                            <div className="px-3 py-2 border-b border-gray-100">
                                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level 3</p>
                                            </div>
                                            {level3Subs.map((subCategory3, index3) => {
                                              const level4Subs = getChildSubCategories(subCategory3._id)
                                              return (
                                                <div
                                                  key={subCategory3._id}
                                                  className="group"
                                                  onMouseEnter={(e) => {
                                                    if (subCategory3TimeoutRef.current) {
                                                      clearTimeout(subCategory3TimeoutRef.current)
                                                    }
                                                    setHoveredSubCategory3(subCategory3._id)
                                                    const rect = e.currentTarget.getBoundingClientRect()
                                                    setLevel4Dir(computeRightDir(rect))
                                                  }}
                                                  onMouseLeave={() => {
                                                    subCategory3TimeoutRef.current = setTimeout(() => {
                                                      setHoveredSubCategory3(null)
                                                    }, 1000)
                                                  }}
                                                >
                                                  <Link
                                                    to={generateShopURL({ 
                                                      parentCategory: parentCategory.name, 
                                                      subcategory: subCategory.name,
                                                      subcategory2: subCategory2.name,
                                                      subcategory3: subCategory3.name
                                                    })}
                                                    className={`flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm ${index3 !== 0 ? 'border-t border-gray-50' : ''}`}
                                                    onClick={() => {
                                                      setHoveredCategory(null)
                                                      setHoveredSubCategory1(null)
                                                      setHoveredSubCategory2(null)
                                                      setHoveredSubCategory3(null)
                                                    }}
                                                  >
                                                    <span className="font-medium flex-1">{subCategory3.name}</span>
                                                    {level4Subs.length > 0 && (
                                                      <ChevronRight size={18} className="ml-2 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                                                    )}
                                                  </Link>

                                                  {/* Dropdown for Level 4 subcategories */}
                                                  {hoveredSubCategory3 === subCategory3._id && level4Subs.length > 0 && (
                                                    <div 
                                                      id="dropdown-level4"
                                                      className={`absolute top-0 ${level4Dir === 'right' ? 'left-full ml-2' : 'right-full mr-2'} bg-white shadow-xl rounded-lg py-2 min-w-[240px] max-w-[280px] z-[90] border border-gray-100`}
                                                      onMouseEnter={() => {
                                                        if (subCategory3TimeoutRef.current) {
                                                          clearTimeout(subCategory3TimeoutRef.current)
                                                        }
                                                      }}
                                                      onMouseLeave={() => {
                                                        subCategory3TimeoutRef.current = setTimeout(() => {
                                                          setHoveredSubCategory3(null)
                                                        }, 1000)
                                                      }}
                                                    >
                                                      <div className="px-3 py-2 border-b border-gray-100">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level 4</p>
                                                      </div>
                                                      {level4Subs.map((subCategory4, index4) => (
                                                        <Link
                                                          key={subCategory4._id}
                                                          to={generateShopURL({ 
                                                            parentCategory: parentCategory.name, 
                                                            subcategory: subCategory.name,
                                                            subcategory2: subCategory2.name,
                                                            subcategory3: subCategory3.name,
                                                            subcategory4: subCategory4.name
                                                          })}
                                                          className={`block px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 text-sm font-medium ${index4 !== 0 ? 'border-t border-gray-50' : ''}`}
                                                          onClick={() => {
                                                            setHoveredCategory(null)
                                                            setHoveredSubCategory1(null)
                                                            setHoveredSubCategory2(null)
                                                            setHoveredSubCategory3(null)
                                                          }}
                                                        >
                                                          {subCategory4.name}
                                                        </Link>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navbar - Shown only on Mobile */}
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-50">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Hamburger Menu */}
          <button onClick={toggleMobileMenu} className="p-2">
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/admin-logo.svg" alt="Logo" className="h-8" />
          </Link>

          {/* Search Icon */}
          <button className="p-2" onClick={handleMobileSearchOpen} aria-label="Open search">
            <Search size={24} className="text-gray-700" />
          </button>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50">
          <div className="w-full bg-white p-4 shadow-md relative">
            <div className="flex items-center gap-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (searchQuery.trim()) {
                    // Check for exact match on mobile too
                    const exactMatch = await findExactProductMatch(searchQuery.trim())

                    if (exactMatch) {
                      navigate(`/product/${exactMatch.slug || exactMatch._id}`)
                    } else {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
                    }

                    handleMobileSearchClose()
                  }
                }}
                className="flex-1 relative"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-lime-500"
                    autoFocus
                    ref={mobileSearchInputRef}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true)
                    }}
                  />
                  {/* Loading spinner */}
                  {searchLoading && (
                    <span className="absolute right-16 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="animate-spin h-5 w-5 text-lime-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    </span>
                  )}
                  <button type="submit" className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-green-600">
                    <Search size={18} />
                  </button>
                </div>
                {/* Mobile Autocomplete Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div
                    ref={mobileSearchDropdownRef}
                    className="absolute left-0 right-0 bg-white border border-gray-200 shadow-lg rounded z-50 mt-2 max-h-96 overflow-y-auto overflow-x-hidden"
                  >
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product.slug || product._id}`}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => {
                          setShowSearchDropdown(false)
                          handleMobileSearchClose()
                        }}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 object-contain rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm break-words">{product.name}</div>
                          <div className="text-xs text-gray-500 break-words line-clamp-2">{product.description}</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                      className="block text-center text-lime-600 hover:underline py-2 text-sm font-medium"
                      onClick={() => {
                        setShowSearchDropdown(false)
                        handleMobileSearchClose()
                      }}
                    >
                      View all results
                    </Link>
                  </div>
                )}
              </form>
              <button onClick={handleMobileSearchClose} className="ml-2 p-2" aria-label="Close search">
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Side Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>

          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 bg-lime-500 text-white">
              <div className="flex items-center">
                <UserCircle size={24} className="text-white mr-2" />
                {isAuthenticated ? (
                  <span className="text-white">{`Hello, ${user?.name || "User"}`}</span>
                ) : (
                  <button
                    onClick={() => {
                      closeMobileMenu()
                      navigate('/login')
                    }}
                    className="text-white font-medium hover:text-white/90 transition-colors"
                  >
                    Hello, <span className="underline">Sign in</span>
                  </button>
                )}
              </div>
              <button onClick={closeMobileMenu} className="p-1">
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4">
              {/* Quick Actions */}
              <div className="mb-6">
                <Link
                  to="/orders"
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <Package size={20} className="mr-3" />
                  <strong>My Orders</strong>
                </Link>
                <Link
                  to="/track-order"
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <Truck size={20} className="mr-3" />
                  <strong>Track Order</strong>
                </Link>
                <Link
                  to="/help"
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <HelpCircle size={20} className="mr-3" />
                  <strong>Help Center</strong>
                </Link>
              </div>

              {/* Shop by Category */}
              <div>
                <div className="flex items-center justify-between mb-4 bg-lime-500 text-white rounded px-3 py-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <Grid3X3 size={18} className="text-white" />
                    All Category
                  </h3>
                  <Link to="/shop" className="text-sm text-white hover:text-white/90" onClick={closeMobileMenu}>
                    See All
                  </Link>
                </div>

                {/* Dynamic Categories List for Mobile */}
                <div className="space-y-2">
                  {/* All In One */}
                  {/* <Link
                    to="/shop"
                    className="flex items-center justify-between py-3 px-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center">
                      <Grid3X3 size={16} className="mr-3" />
                      <span>All Categories</span>
                    </div>
                    <span className="text-gray-400 text-2xl font-bold">›</span>
                  </Link> */}

                  {/* Dynamic Categories with Click-to-Expand */}
                  {categories.map((parentCategory) => {
                    const categorySubCategories = getSubCategoriesForCategory(parentCategory._id)
                    const isExpanded = expandedMobileCategory === parentCategory._id

                    return (
                      <div key={parentCategory._id}>
                        {/* Parent Category Item */}
            <div className="flex items-center justify-between py-3 px-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                          <Link
                            to={generateShopURL({ parentCategory: parentCategory.name })}
                            className="flex items-center flex-1"
                            onClick={closeMobileMenu}
                          >
              <strong>{parentCategory.name}</strong>
                          </Link>

                          {/* Toggle button for subcategories */}
                          {categorySubCategories.length > 0 ? (
                            <button
                              onClick={() => toggleMobileCategory(parentCategory._id)}
                              aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                              aria-expanded={isExpanded}
                              className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-lime-500 text-white shadow-sm hover:bg-lime-600 active:scale-95 transition"
                           >
                              {isExpanded ? (
                                <ChevronDown size={20} className="text-white" />
                              ) : (
                                <ChevronRight size={20} className="text-white" />
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-2xl font-bold">›</span>
                          )}
                        </div>

                        {/* Subcategories - Only show when expanded */}
                        {isExpanded && categorySubCategories.length > 0 && (
          <div className="ml-4 space-y-1 pb-2">
                            {categorySubCategories.map((subCategory) => (
                              <Link
                                key={subCategory._id}
                                to={generateShopURL({
                                  parentCategory: parentCategory.name,
                                  subcategory: subCategory.name,
                                })}
                                className="block py-2 px-2 text-red-600 hover:bg-gray-50 rounded-lg text-sm"
                                onClick={closeMobileMenu}
                              >
            <strong>{subCategory.name}</strong>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <Link to="/" className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-lime-500">
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>

          {/* Shop */}
          <Link to="/shop" className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-lime-500">
            <Grid3X3 size={20} />
            <span className="text-xs mt-1">Shop</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-lime-500 relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold hover:text-lime-500">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-lime-500 relative"
            aria-label="Wishlist"
          >
            <Heart size={20} className="" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
            <span className="text-xs mt-1">WishList</span>
          </Link>

          {/* Account */}
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-lime-500"
          >
            <UserCircle size={20} />
            <span className="text-xs mt-1">Account</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Navbar


