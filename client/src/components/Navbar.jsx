 
"use client"

import { useState, useEffect, useRef } from "react"
import { getFullImageUrl } from "../utils/imageUtils"

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
  ChevronLeft,
} from "lucide-react"
import axios from "axios"

// Recursive component for mobile subcategory rendering
const MobileSubCategoryItem = ({ 
  subCategory, 
  parentCategory, 
  level, 
  expandedId, 
  onToggle, 
  closeMobileMenu,
  parentChain = []
}) => {
  // Helper to get children of current subcategory
  const getChildSubCategories = (parentNodeId) => {
    const stack = []
    // Get all categories from window context (we'll pass this data)
    const categories = window.__navbarCategories || []
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

  const nestedChildren = getChildSubCategories(subCategory._id)
  const hasNested = nestedChildren && nestedChildren.length > 0
  const isExpanded = Array.isArray(expandedId) ? expandedId.includes(subCategory._id) : expandedId === subCategory._id
  
  // Build the URL params based on level
  const buildUrlParams = () => {
    const params = { parentCategory: parentCategory.name }
    const chain = [...parentChain, subCategory.name]
    
    if (level === 1) params.subcategory = subCategory.name
    else if (level === 2) {
      params.subcategory = chain[0]
      params.subcategory2 = subCategory.name
    } else if (level === 3) {
      params.subcategory = chain[0]
      params.subcategory2 = chain[1]
      params.subcategory3 = subCategory.name
    } else if (level === 4) {
      params.subcategory = chain[0]
      params.subcategory2 = chain[1]
      params.subcategory3 = chain[2]
      params.subcategory4 = subCategory.name
    }
    
    return params
  }

  const textSizeClass = level === 1 ? 'text-sm' : level === 2 ? 'text-xs' : 'text-xs'
  const textColorClass = level === 1 ? 'text-red-600' : 'text-gray-700'
  
  // Visual hierarchy for arrow buttons based on level
  const getArrowButtonStyles = () => {
    switch(level) {
      case 1:
        return 'w-7 h-7 bg-lime-500 hover:bg-lime-600 shadow-sm'
      case 2:
        return 'w-6 h-6 bg-lime-400 hover:bg-lime-500 shadow-sm'
      case 3:
        return 'w-5 h-5 bg-lime-300 hover:bg-lime-400'
      default:
        return 'w-5 h-5 bg-lime-200 hover:bg-lime-300'
    }
  }
  
  const getArrowIconSize = () => {
    switch(level) {
      case 1:
        return 16
      case 2:
        return 14
      default:
        return 12
    }
  }

  return (
    <div className="space-y-1">
      <div className={`flex items-center justify-between py-2 px-2 ${textColorClass} hover:bg-gray-50 rounded-lg ${textSizeClass}`}>
        <Link
          to={generateShopURL(buildUrlParams())}
          className="flex-1"
          onClick={closeMobileMenu}
        >
          <strong>{subCategory.name}</strong>
        </Link>
        {hasNested && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggle(subCategory._id)
            }}
            className={`ml-2 inline-flex items-center justify-center rounded-full text-white focus:outline-none focus:ring-2 focus:ring-lime-500 active:scale-95 transition ${getArrowButtonStyles()}`}
            aria-expanded={isExpanded}
            aria-controls={`mobile-subcat-${subCategory._id}`}
          >
            {isExpanded ? (
              <ChevronDown size={getArrowIconSize()} />
            ) : (
              <ChevronRight size={getArrowIconSize()} />
            )}
          </button>
        )}
      </div>

      {hasNested && isExpanded && (
        <div id={`mobile-subcat-${subCategory._id}`} className="ml-4 space-y-1 pb-2">
          {nestedChildren.map((nested) => (
            <MobileSubCategoryItem
              key={nested._id}
              subCategory={nested}
              parentCategory={parentCategory}
              level={level + 1}
              expandedId={expandedId}
              onToggle={onToggle}
              closeMobileMenu={closeMobileMenu}
              parentChain={[...parentChain, subCategory.name]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

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
  const [isStaticCategoryHovered, setIsStaticCategoryHovered] = useState(false)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null)
  const [expandedMobileSubCategories, setExpandedMobileSubCategories] = useState([])
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDesktopCategoryDropdownOpen, setIsDesktopCategoryDropdownOpen] = useState(false)
  const [desktopCascadeIds, setDesktopCascadeIds] = useState([]) // [parentId, level1Id, level2Id, ...]
  const profileRef = useRef(null)
  const profileButtonRef = useRef(null)
  const desktopCategoryDropdownRef = useRef(null)
  const categoryScrollRef = useRef(null)
  const [categoryScrollState, setCategoryScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false,
  })
  // Timeout refs for delayed hover states
  const categoryTimeoutRef = useRef(null)
  const categoryOpenTimeoutRef = useRef(null)
  const subCategory1TimeoutRef = useRef(null)
  const subCategory2TimeoutRef = useRef(null)
  const subCategory3TimeoutRef = useRef(null)
  // Tiny in-memory cache to speed up repeated candidate lookups during typing
  const liveSearchCacheRef = useRef(new Map())
  // Direction states (simple midpoint rule: items left of screen center open right, else open left)
  const [level2Dir, setLevel2Dir] = useState('right')
  const [level3Dir, setLevel3Dir] = useState('right')
  const [level4Dir, setLevel4Dir] = useState('right')
  const [activeCategoryRect, setActiveCategoryRect] = useState(null)
  const megaContentRef = useRef(null)
  const [megaScrollState, setMegaScrollState] = useState({ canScrollLeft: false, canScrollRight: false })
  const MEGA_LABEL_LIMIT_CLASS = "whitespace-normal break-words //max-w-[23ch]"
  const CATEGORY_OPEN_DELAY = 220
  const CATEGORY_DROPDOWN_MARGIN = 16
  const CATEGORY_DROPDOWN_GAP = 6
  const MAX_CATEGORY_DROPDOWN_WIDTH = 1320

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

  const getPanelStyle = (rect, direction, width = 280, estimatedHeight = 300) => {
    if (!rect) return {}
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080
    
    // Vertical positioning - align to the top of the parent item
    const style = {
      top: rect.top
    }
    
    // Horizontal positioning - position inline, right next to the arrow
    const spaceRight = viewportWidth - rect.right
    if (direction === 'right' || spaceRight >= width) {
      // Open to the right, inline with the arrow
      style.left = rect.right + 4 // Small 4px gap for visual separation
    } else {
      // Open to the left if no space on right
      style.right = viewportWidth - rect.left + 4
    }
    
    return style
  }

  const getCategoryDropdownStyle = (rect) => {
    if (!rect) return {}
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080
    
    // Calculate padding based on screen size (matching the slider container)
    let horizontalPadding = 16 // Default: px-4 (4 * 4 = 16px on each side)
    if (viewportWidth >= 1536) {
      horizontalPadding = 48 // 2xl:px-12 (12 * 4 = 48px)
    } else if (viewportWidth >= 1280) {
      horizontalPadding = 32 // xl:px-8 (8 * 4 = 32px)
    }
    
    // The navbar container has max-w-[1920px] and is centered
    const maxContainerWidth = 1920
    const containerWidth = Math.min(viewportWidth, maxContainerWidth)
    
    // Calculate centering offset when viewport is wider than max container
    const containerOffset = viewportWidth > maxContainerWidth 
      ? (viewportWidth - maxContainerWidth) / 2 
      : 0
    
    // Match the slider container width exactly (container width minus padding)
    const dropdownWidth = containerWidth - (horizontalPadding * 2)
    const dropdownLeft = containerOffset + horizontalPadding
    
    // Use rect.bottom to position below the category bar, ensuring no overlap
    const dropdownTop = rect.bottom + 2
    
    return {
      left: `${dropdownLeft}px`,
      top: `${dropdownTop}px`,
      width: `${dropdownWidth}px`,
      height: "400px",
    }
  }

  const resetMegaMenu = () => {
    setHoveredCategory(null)
    setHoveredSubCategory1(null)
    setHoveredSubCategory2(null)
    setHoveredSubCategory3(null)
    setActiveCategoryRect(null)
  }

  const updateMegaScrollState = () => {
    const el = megaContentRef.current
    if (!el) {
      setMegaScrollState({ canScrollLeft: false, canScrollRight: false })
      return
    }
    const { scrollLeft, clientWidth, scrollWidth } = el
    setMegaScrollState({
      canScrollLeft: scrollLeft > 8,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 8,
    })
  }

  const handleMegaScroll = (direction) => {
    const el = megaContentRef.current
    if (!el) return
    const offset = direction === "left" ? -320 : 320
    el.scrollBy({ left: offset, behavior: "smooth" })
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
      // Store categories globally for mobile subcategory component
      if (typeof window !== 'undefined') {
        window.__navbarCategories = treeData
      }
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
    setExpandedMobileCategory((prev) => (prev === categoryId ? null : categoryId))
    setExpandedMobileSubCategories([])
  }

  const handleMobileSubCategoryToggle = (subCategoryId) => {
    setExpandedMobileSubCategories((prev) => {
      if (prev.includes(subCategoryId)) {
        // Remove this ID and all its children
        return prev.filter(id => id !== subCategoryId)
      } else {
        // Add this ID to the array
        return [...prev, subCategoryId]
      }
    })
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

  useEffect(() => {
    if (!hoveredCategory) {
      setMegaScrollState({ canScrollLeft: false, canScrollRight: false })
      return
    }

    const handleResize = () => updateMegaScrollState()
    const rafId = requestAnimationFrame(updateMegaScrollState)

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", handleResize)
    }
  }, [hoveredCategory])

  const updateCategoryScrollState = () => {
    const el = categoryScrollRef.current
    if (!el) return

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    const epsilon = 2
    const canScrollPrev = el.scrollLeft > epsilon
    const canScrollNext = el.scrollLeft < maxScrollLeft - epsilon

    setCategoryScrollState((prev) => {
      if (prev.canScrollPrev === canScrollPrev && prev.canScrollNext === canScrollNext) return prev
      return { canScrollPrev, canScrollNext }
    })
  }

  useEffect(() => {
    updateCategoryScrollState()

    const el = categoryScrollRef.current
    if (!el) return

    let ro
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateCategoryScrollState())
      ro.observe(el)
    }

    window.addEventListener("resize", updateCategoryScrollState)
    const rafId = requestAnimationFrame(updateCategoryScrollState)

    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener("resize", updateCategoryScrollState)
      cancelAnimationFrame(rafId)
    }
  }, [categories])

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

  // Close desktop category dropdown on outside click
  useEffect(() => {
    if (!isDesktopCategoryDropdownOpen) return
    function handleCategoryClick(e) {
      if (window.innerWidth < 768) return
      if (desktopCategoryDropdownRef.current && !desktopCategoryDropdownRef.current.contains(e.target)) {
        setIsDesktopCategoryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleCategoryClick)
    return () => document.removeEventListener("mousedown", handleCategoryClick)
  }, [isDesktopCategoryDropdownOpen])

  // Cleanup hover timeouts on unmount
  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current)
      if (categoryOpenTimeoutRef.current) clearTimeout(categoryOpenTimeoutRef.current)
      if (subCategory1TimeoutRef.current) clearTimeout(subCategory1TimeoutRef.current)
      if (subCategory2TimeoutRef.current) clearTimeout(subCategory2TimeoutRef.current)
      if (subCategory3TimeoutRef.current) clearTimeout(subCategory3TimeoutRef.current)
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

  const toggleDesktopCategoryDropdown = () => {
    setIsDesktopCategoryDropdownOpen((prev) => {
      const next = !prev
      if (next) setDesktopCascadeIds([])
      return next
    })
  }

  const closeDesktopCategoryDropdown = () => {
    setIsDesktopCategoryDropdownOpen(false)
    setDesktopCascadeIds([])
  }

  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true)
  }
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false)
  }

  const scrollPrev = () => {
    if (!categoryScrollState.canScrollPrev) return
    const el = categoryScrollRef.current
    if (!el) return
    const amount = Math.max(180, Math.round(el.clientWidth * 0.7))
    el.scrollBy({ left: -amount, behavior: "smooth" })
    resetMegaMenu()
    requestAnimationFrame(updateCategoryScrollState)
  }

  const scrollNext = () => {
    if (!categoryScrollState.canScrollNext) return
    const el = categoryScrollRef.current
    if (!el) return
    const amount = Math.max(180, Math.round(el.clientWidth * 0.7))
    el.scrollBy({ left: amount, behavior: "smooth" })
    resetMegaMenu()
    requestAnimationFrame(updateCategoryScrollState)
  }

  return (
    <>
      {/* Desktop Navbar - Hidden on Mobile */}
      <header className="hidden md:block bg-white shadow-sm sticky top-0 pt-4 z-50 w-full">
        <div className="w-full max-w-[1920px] mx-auto space-y-4">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-14 xl:h-18 2xl:h-20">
            {/* Logo - Exact Grabatoz Style */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-40 xl:w-44 2xl:w-48 h-auto flex items-center justify-center">
                <img src="/new-logo.webp" alt="Logo" className="w-full h-full" />
              </div>
            </Link>

            {/* Search Bar - Exact Grabatoz Style */}
            <div className="flex-1 max-w-2xl xl:max-w-3xl justify-center items-center px-6 xl:px-20 2xl:px-28">
              <form onSubmit={handleSearch} className="relative">
                <div className="">
                  <div className="flex items-center gap-2 m-1">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-3 xl:pl-4 pr-3 xl:pr-4 py-2 xl:py-2.5 2xl:py-3 border border-gray-300 focus:outline-none focus:border-lime-500 w-[75%] xl:w-[78%] 2xl:w-[80%] text-sm xl:text-base"
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
                    <button type="submit" className="px-3 xl:px-3.5 2xl:px-4 py-3 xl:py-3.5 2xl:py-4 bg-lime-500 text-white hover:bg-green-600">
                      <Search className="w-4 h-4 xl:w-[18px] xl:h-[18px] 2xl:w-5 2xl:h-5" />
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
                          to={`/product/${encodeURIComponent(product.slug || product._id)}`}
                          className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => setShowSearchDropdown(false)}
                        >
                          <img
                            src={getFullImageUrl(product.image) || "/placeholder.svg"}
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
            <div className="flex items-center space-x-2 xl:space-x-3 2xl:space-x-4">
              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 xl:p-2.5 2xl:p-3 border border-black" aria-label="Wishlist">
                <Heart className="w-[18px] h-[18px] xl:w-[19px] xl:h-[19px] 2xl:w-5 2xl:h-5 text-gray-600" />
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
                  className="p-2 xl:p-2.5 2xl:p-3 border border-black"
                  ref={profileButtonRef}
                >
                  <User className="w-[18px] h-[18px] xl:w-[19px] xl:h-[19px] 2xl:w-5 2xl:h-5 text-gray-600" />
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
              <Link to="/cart" className="relative p-2 xl:p-2.5 2xl:p-3">
                <ShoppingCart className="w-6 h-6 xl:w-7 xl:h-7 2xl:w-[30px] 2xl:h-[30px] text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Navigation Menu - Dynamic Categories with Dropdowns */}
          <div className="bg-lime-500 mt-3 xl:mt-3.5 2xl:mt-4 flex relative">
          <div className="w-full">
            <div className="grid grid-cols-[auto,auto,1fr,auto,auto] items-center h-10 xl:h-11 2xl:h-12 px-4 xl:px-8 2xl:px-12 gap-2 xl:gap-2.5 2xl:gap-3">
              {/* Toggle Button for All Categories */}
              <div className="relative" ref={desktopCategoryDropdownRef}>
                <button
                  type="button"
                  onClick={toggleDesktopCategoryDropdown}
                  className="hidden md:inline-flex items-center gap-2 px-3 xl:px-3.5 py-2 rounded-lg  text-white   transition text-sm font-semibold whitespace-nowrap shadow-sm"
                  aria-label="All categories"
                >
                  {/* <Grid3X3 className="w-4 h-4 text-white" /> */}
                  <span className="text-xs xl:text-sm">All Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
                </button>
                
                {/* Desktop Category Dropdown (horizontal cascade) */}
                {isDesktopCategoryDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 bg-white shadow-2xl rounded-lg z-[70] border border-gray-200 overflow-hidden max-w-[calc(100vw-32px)]"
                    onMouseLeave={() => setDesktopCascadeIds([])}
                  >
                    <div className="flex max-h-[calc(100vh-160px)] overflow-x-auto">
                      <div className="flex min-w-max">
                        {/* Column 0: Parent Categories */}
                        <div className="w-64 border-r border-gray-100 overflow-y-auto">
                          <div className="p-2">
                            {categories.map((parentCategory) => {
                              const level1 = getSubCategoriesForCategory(parentCategory._id)
                              const hasChildren = level1.length > 0
                              const isActive = desktopCascadeIds[0] === parentCategory._id
                              return (
                                <Link
                                  key={parentCategory._id}
                                  to={generateShopURL({ parentCategory: parentCategory.name })}
                                  onMouseEnter={() => setDesktopCascadeIds([parentCategory._id])}
                                  onClick={closeDesktopCategoryDropdown}
                                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-100 transition ${
                                    isActive ? "bg-gray-50" : ""
                                  }`}
                                >
                                  <span className="flex-1 pr-2">{parentCategory.name}</span>
                                  {hasChildren && <ChevronRight size={14} className="text-gray-400" />}
                                </Link>
                              )
                            })}
                          </div>
                        </div>

                        {(() => {
                          const cols = []
                          const activeParentId = desktopCascadeIds[0]
                          if (!activeParentId) return null
                          const parent = categories.find((c) => c._id === activeParentId)
                          if (!parent) return null

                          const buildParams = (chain) => {
                            const params = { parentCategory: parent.name }
                            const keys = ["subcategory", "subcategory2", "subcategory3", "subcategory4"]
                            for (let i = 0; i < Math.min(chain.length, keys.length); i++) {
                              params[keys[i]] = chain[i]
                            }
                            return params
                          }

                          const getNameById = (id) => {
                            if (!id) return ""
                            const stack = [...categories]
                            const visited = new Set()
                            while (stack.length) {
                              const node = stack.pop()
                              if (!node || visited.has(node._id)) continue
                              visited.add(node._id)
                              if (node._id === id) return node.name || ""
                              if (Array.isArray(node.children) && node.children.length) {
                                stack.push(...node.children)
                              }
                            }
                            return ""
                          }

                          const getItemsForLevel = (levelIndex) => {
                            if (levelIndex === 1) return getSubCategoriesForCategory(activeParentId)
                            const prevSelectedId = desktopCascadeIds[levelIndex - 1]
                            if (!prevSelectedId) return []
                            return getChildSubCategories(prevSelectedId)
                          }

                          for (let levelIndex = 1; levelIndex < 10; levelIndex++) {
                            const items = getItemsForLevel(levelIndex)
                            if (!Array.isArray(items) || items.length === 0) break
                            cols.push(
                              <div key={`col-${levelIndex}`} className="w-64 border-r border-gray-100 last:border-r-0 overflow-y-auto">
                                <div className="p-2">
                                  {items.map((node) => {
                                    const hasNested = Array.isArray(node.children) && node.children.length > 0
                                    const isActive = desktopCascadeIds[levelIndex] === node._id
                                    const chainPrefix = desktopCascadeIds
                                      .slice(1, levelIndex)
                                      .map(getNameById)
                                      .filter(Boolean)
                                    const params = buildParams([...chainPrefix, node.name])
                                    return (
                                      <Link
                                        key={node._id}
                                        to={generateShopURL(params)}
                                        onMouseEnter={() => {
                                          setDesktopCascadeIds((prev) => {
                                            const next = prev.slice(0, levelIndex)
                                            next[levelIndex] = node._id
                                            return next
                                          })
                                        }}
                                        onClick={closeDesktopCategoryDropdown}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition ${
                                          isActive ? "bg-gray-50" : ""
                                        }`}
                                      >
                                        <span className="flex-1 pr-2">{node.name}</span>
                                        {hasNested && <ChevronRight size={14} className="text-gray-400" />}
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>,
                            )
                          }
                          return cols
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={scrollPrev}
                className="hidden md:inline-flex items-center justify-center w-8 h-8 xl:w-8.5 xl:h-8.5 2xl:w-9 2xl:h-9 rounded-full bg-white text-lime-500 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!categoryScrollState.canScrollPrev}
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-4 h-4 xl:w-[17px] xl:h-[17px] 2xl:w-[18px] 2xl:h-[18px]" />
              </button>
              <div className="flex-1 min-w-0">
                <div
                  ref={categoryScrollRef}
                  className="flex items-center justify-start gap-4 px-2 overflow-x-auto hide-scrollbar scroll-smooth"
                  onScroll={updateCategoryScrollState}
                >
                  {categories.map((parentCategory) => {
                    const categorySubCategories = getSubCategoriesForCategory(parentCategory._id)
                    const isActiveCategory = hoveredCategory === parentCategory._id
                    return (
                      <div
                        key={parentCategory._id}
                        className="relative flex items-center h-full flex-shrink-0"
                        onMouseEnter={(e) => {
                          if (categoryTimeoutRef.current) {
                            clearTimeout(categoryTimeoutRef.current)
                          }
                          if (categoryOpenTimeoutRef.current) {
                            clearTimeout(categoryOpenTimeoutRef.current)
                          }
                          const target = e.currentTarget
                          categoryOpenTimeoutRef.current = setTimeout(() => {
                            setHoveredCategory(parentCategory._id)
                            const rect = target.getBoundingClientRect()
                            setActiveCategoryRect({
                              top: rect.top,
                              bottom: rect.bottom,
                              left: rect.left,
                              right: rect.right,
                              width: rect.width,
                            })
                            categoryOpenTimeoutRef.current = null
                          }, CATEGORY_OPEN_DELAY)
                        }}
                        onMouseLeave={() => {
                          if (categoryOpenTimeoutRef.current) {
                            clearTimeout(categoryOpenTimeoutRef.current)
                            categoryOpenTimeoutRef.current = null
                          }
                          categoryTimeoutRef.current = setTimeout(() => {
                            resetMegaMenu()
                          }, 1000)
                        }}
                      >
                        <Link
                          to={generateShopURL({ parentCategory: parentCategory.name })}
                          className={`text-white font-medium whitespace-nowrap text-[clamp(0.7rem,0.9vw,0.875rem)] px-1 py-2 text-center w-full leading-tight ${
                            isActiveCategory ? "font-semibold" : ""
                          }`}
                        >
                          {parentCategory.name}
                        </Link>
                        {isActiveCategory && (
                          <span className="pointer-events-none absolute bottom-0 left-1 right-1 h-1.5 rounded-full bg-white shadow-sm" />
                        )}
                        {/* Mega menu panel: show all level-1 columns with their level-2 items at once */}
                        {hoveredCategory === parentCategory._id && categorySubCategories.length > 0 && (
                          <div
                            className="fixed bg-white mt-1 shadow-2xl rounded-lg p-5 z-[60] border border-gray-100 overflow-y-auto"
                            role="menu"
                            aria-label={`${parentCategory.name} menu`}
                            style={{...getCategoryDropdownStyle(activeCategoryRect), maxWidth: 'calc(100vw - 32px)'}}
                            onMouseEnter={() => {
                              if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current)
                            }}
                            onMouseLeave={() => {
                              categoryTimeoutRef.current = setTimeout(() => {
                                resetMegaMenu()
                              }, 300)
                            }}
                          >
                            <div className="relative">
                              {megaScrollState.canScrollLeft && (
                                <button
                                  type="button"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow-md w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleMegaScroll("left")}
                                  aria-label="Scroll menu left"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                              )}
                              <div
                                ref={megaContentRef}
                                className="flex flex-nowrap items-start gap-4 overflow-x-auto hide-scrollbar px-6 py-2"
                                onScroll={updateMegaScrollState}
                              >
                                {categorySubCategories.map((subCategory) => {
                                  const level2Subs = getChildSubCategories(subCategory._id)
                                  const LEVEL2_ITEMS_PER_COLUMN = 14
                                  const firstColumnLevel2 = level2Subs.slice(0, LEVEL2_ITEMS_PER_COLUMN)
                                  const moreLevel2Items = level2Subs.slice(LEVEL2_ITEMS_PER_COLUMN)
                                  const hasMoreLevel2 = moreLevel2Items.length > 0
                                  
                                  return (
                                    <div key={subCategory._id} className="contents">
                                      {/* Main Column - First Level-2 items */}
                                      <div className="w-[150px] flex-shrink-0 flex flex-col gap-3">
                                        <Link
                                          to={generateShopURL({ parentCategory: parentCategory.name, subcategory: subCategory.name })}
                                          className={`block text-red-600 text-xs font-semibold hover:text-red-600 ${MEGA_LABEL_LIMIT_CLASS}`}
                                          onClick={() => resetMegaMenu()}
                                        >
                                          {subCategory.name}
                                        </Link>
                                        <ul className="flex flex-col gap-1 px-1 pb-1 bg-transparent border-none text-left">
                                          {firstColumnLevel2.map((sub2) => {
                                            const level3Subs = getChildSubCategories(sub2._id)
                                            const hasLevel3 = Array.isArray(level3Subs) && level3Subs.length > 0
                                            return (
                                              <li
                                                key={sub2._id}
                                                className="bg-transparent border-none p-0 m-0"
                                              >
                                                <Link
                                                  to={generateShopURL({
                                                    parentCategory: parentCategory.name,
                                                    subcategory: subCategory.name,
                                                    subcategory2: sub2.name,
                                                  })}
                                                  className={`block w-full text-xs text-gray-700 hover:text-red-600 hover:underline leading-snug ${MEGA_LABEL_LIMIT_CLASS}`}
                                                  onClick={() => resetMegaMenu()}
                                                >
                                                  <span className="flex-1 break-words leading-snug text-left">{sub2.name}</span>
                                                </Link>
                                              </li>
                                            )
                                          })}
                                        </ul>
                                      </div>

                                      {/* "More" Column - Remaining Level-2 items */}
                                      {hasMoreLevel2 && (
                                        <div className="w-[150px] flex-shrink-0 flex flex-col gap-3">
                                          <div className={`block text-lime-600 text-xs font-bold uppercase tracking-wide ${MEGA_LABEL_LIMIT_CLASS}`}>
                                            More
                                          </div>
                                          <ul className="flex flex-col gap-1 px-1 pb-1 bg-transparent border-none text-left">
                                            {moreLevel2Items.map((sub2) => {
                                              const level3Subs = getChildSubCategories(sub2._id)
                                              const hasLevel3 = Array.isArray(level3Subs) && level3Subs.length > 0
                                              return (
                                                <li
                                                  key={sub2._id}
                                                  className="bg-transparent border-none p-0 m-0"
                                                >
                                                  <Link
                                                    to={generateShopURL({
                                                      parentCategory: parentCategory.name,
                                                      subcategory: subCategory.name,
                                                      subcategory2: sub2.name,
                                                    })}
                                                    className={`block w-full text-xs text-gray-700 hover:text-red-600 hover:underline leading-snug ${MEGA_LABEL_LIMIT_CLASS}`}
                                                    onClick={() => resetMegaMenu()}
                                                  >
                                                    <span className="flex-1 break-words leading-snug text-left">{sub2.name}</span>
                                                  </Link>
                                                </li>
                                              )
                                            })}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              {megaScrollState.canScrollRight && (
                                <button
                                  type="button"
                                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow-md w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleMegaScroll("right")}
                                  aria-label="Scroll menu right"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Static Category - Add your custom category here */}
                  <div 
                    className="relative flex items-center h-full flex-shrink-0"
                    onMouseEnter={() => setIsStaticCategoryHovered(true)}
                    onMouseLeave={() => setIsStaticCategoryHovered(false)}
                  >
                    <a
                      href="/gaming-zone" // ← Change this to your custom link
                      className={`text-white font-medium whitespace-nowrap text-[clamp(0.7rem,0.9vw,0.875rem)] px-1 py-2 text-center w-full leading-tight ${
                        isStaticCategoryHovered ? "font-semibold" : ""
                      }`}
                    >
                      Gaming Zone {/* ← Change this to your desired name */}
                    </a>
                    {isStaticCategoryHovered && (
                      <span className="pointer-events-none absolute bottom-0 left-1 right-1 h-1.5 rounded-full bg-white shadow-sm" />
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={scrollNext}
                className="hidden md:inline-flex items-center justify-center w-8 h-8 xl:w-8.5 xl:h-8.5 2xl:w-9 2xl:h-9 rounded-full bg-white text-lime-500 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!categoryScrollState.canScrollNext}
                aria-label="Next categories"
              >
                <ChevronRight className="w-4 h-4 xl:w-[17px] xl:h-[17px] 2xl:w-[18px] 2xl:h-[18px]" />
              </button>

              {/* Crown Excel Button */}
              <a
                href="https://crownexcel.ae"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 pl-3 pr-3 xl:pr-4 2xl:pr-8 py-2 h-full self-stretch bg-[#2b3497] text-white  border-white transition text-sm font-medium whitespace-nowrap -mr-2 xl:-mr-4 2xl:-mr-8"
                aria-label="Crown Excel"
              >
                <span className="text-xs  xl:text-sm">CROWNYX</span>
              </a>
            </div>
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
                        to={`/product/${encodeURIComponent(product.slug || product._id)}`}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => {
                          setShowSearchDropdown(false)
                          handleMobileSearchClose()
                        }}
                      >
                        <img
                          src={getFullImageUrl(product.image) || "/placeholder.svg"}
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
                <a
                  href="https://crownexcel.ae"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <Grid3X3 size={20} className="mr-3" />
                  <strong>CROWNYX</strong>
                </a>
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
                            {categorySubCategories.map((subCategory) => {
                              return (
                                <MobileSubCategoryItem
                                  key={subCategory._id}
                                  subCategory={subCategory}
                                  parentCategory={parentCategory}
                                  level={1}
                                  expandedId={expandedMobileSubCategories}
                                  onToggle={handleMobileSubCategoryToggle}
                                  closeMobileMenu={closeMobileMenu}
                                />
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Static Category - Gaming Zone */}
                  <div className="flex items-center justify-between py-3 px-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <a
                      href="/gaming-zone"
                      className="flex items-center flex-1"
                      onClick={closeMobileMenu}
                    >
                      <strong>Gaming Zone</strong>
                    </a>
                    {/* <span className="text-gray-400 text-2xl font-bold">›</span> */}
                  </div>
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


