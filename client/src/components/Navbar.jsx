"use client"

import { useState, useEffect, useRef } from "react"

import config from "../config/config"
import { Link, useNavigate, useLocation } from "react-router-dom"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  // Fetch categories and subcategories from API
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/categories`)
      setCategories(Array.isArray(data) ? data.filter((cat) => cat.isActive !== false) : [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchSubCategories = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/subcategories`)
      setSubCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching subcategories:", error)
    }
  }

  const getSubCategoriesForCategory = (categoryId) => {
    return subCategories.filter((sub) => sub.category?._id === categoryId)
  }

  const toggleMobileCategory = (categoryId) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryId ? null : categoryId)
  }

  // Instant search effect
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      setShowSearchDropdown(false)
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    const fetchResults = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`)
        setSearchResults(data)
        setShowSearchDropdown(true)
      } catch (err) {
        setSearchResults([])
        setShowSearchDropdown(false)
      } finally {
        setSearchLoading(false)
      }
    }
    const timeout = setTimeout(fetchResults, 250)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Hide dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchSubCategories()
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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchDropdown(false)
      // setSearchQuery("") // Optionally clear
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
                <img src="/admin-logo.svg" alt="Logo" className="w-full h-full" />
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
                      onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true) }}
                    />
                    {/* Loading spinner */}
                    {searchLoading && (
                      <span className="absolute right-36 top-1/2 transform -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-lime-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      </span>
                    )}
                    <button type="submit" className="px-4 py-4 bg-lime-500 text-white hover:bg-green-600">
                      <Search size={18} />
                    </button>
                  </div>
                  {/* Autocomplete Dropdown */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div ref={searchDropdownRef} className="absolute left-0 right-0 bg-white border border-gray-200 shadow-lg rounded z-50 mt-2 max-h-96 overflow-y-auto">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product.slug || product._id}`}
                          className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => setShowSearchDropdown(false)}
                        >
                          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-16 h-16 object-contain rounded" />
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
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-3 border border-black">
                  <User size={20} className="text-gray-600" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl z-20 border">
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
              {/* Dynamic Parent Categories with Subcategory Dropdowns */}
              {categories.map((parentCategory) => {
                const categorySubCategories = getSubCategoriesForCategory(parentCategory._id)

                return (
                  <div
                    key={parentCategory._id}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(parentCategory._id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      to={`/shop?parentCategory=${parentCategory._id}`}
                      className="text-white hover:text-green-200 font-medium whitespace-nowrap text-sm"
                    >
                      {parentCategory.name}
                    </Link>

                    {/* Dropdown for subcategories */}
                    {hoveredCategory === parentCategory._id && categorySubCategories.length > 0 && (
                      <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-md py-2 min-w-48 z-50 border border-gray-200">
                        {categorySubCategories.map((subCategory) => (
                          <Link
                            key={subCategory._id}
                            to={`/shop?parentCategory=${parentCategory._id}&subcategory=${subCategory._id}`}
                            className="block px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors duration-200 text-sm"
                            onClick={() => setHoveredCategory(null)}
                          >
                            {subCategory.name}
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
          <div className="w-full bg-white p-4 flex items-center gap-2 shadow-md relative">
            <form onSubmit={(e) => { handleSearch(e); handleMobileSearchClose(); }} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-lime-500"
                autoFocus
              />
              <button type="submit" className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-green-600">
                <Search size={18} />
              </button>
            </form>
            <button onClick={handleMobileSearchClose} className="ml-2 p-2" aria-label="Close search">
              <X size={24} className="text-gray-600" />
            </button>
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
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <UserCircle size={24} className="text-gray-600 mr-2" />
                <span className="text-gray-700 ">
                  {isAuthenticated ? `Hello, ${user?.name || "User"}` : "Hello, Sign in"}
                </span>
              </div>
              <button onClick={closeMobileMenu} className="p-1">
                <X size={24} className="text-gray-600" />
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
                  My Orders
                </Link>
                <Link
                  to="/track-order"
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <Truck size={20} className="mr-3" />
                  Track Order
                </Link>
                <Link
                  to="/help"
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg px-2"
                  onClick={closeMobileMenu}
                >
                  <HelpCircle size={20} className="mr-3" />
                  Help Center
                </Link>
              </div>

              {/* Shop by Category */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Shop by Category</h3>
                  <Link to="/shop" className="text-sm text-lime-600 hover:text-lime-700" onClick={closeMobileMenu}>
                    See All
                  </Link>
                </div>

                {/* Dynamic Categories List for Mobile */}
                <div className="space-y-2">
                  {/* All In One */}
                  <Link
                    to="/shop"
                    className="flex items-center justify-between py-3 px-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center">
                      <Grid3X3 size={16} className="mr-3" />
                      <span>All In One</span>
                    </div>
                    <span className="text-gray-400 text-2xl font-bold">›</span>
                  </Link>

                  {/* Dynamic Categories with Click-to-Expand */}
                  {categories.map((parentCategory) => {
                    const categorySubCategories = getSubCategoriesForCategory(parentCategory._id)
                    const isExpanded = expandedMobileCategory === parentCategory._id

                    return (
                      <div key={parentCategory._id}>
                        {/* Parent Category Item */}
                        <div className="flex items-center justify-between py-3 px-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                          <Link
                            to={`/shop?parentCategory=${parentCategory._id}`}
                            className="flex items-center flex-1"
                            onClick={closeMobileMenu}
                          >
                            <span>{parentCategory.name}</span>
                          </Link>

                          {/* Toggle button for subcategories */}
                          {categorySubCategories.length > 0 ? (
                            <button onClick={() => toggleMobileCategory(parentCategory._id)} className="p-1 ml-2">
                              {isExpanded ? (
                                <ChevronDown size={16} className="text-gray-400" />
                              ) : (
                                <ChevronRight size={16} className="text-gray-400" />
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
                                to={`/shop?parentCategory=${parentCategory._id}&subcategory=${subCategory._id}`}
                                className="block py-2 px-2 text-red-600 hover:bg-gray-50 rounded-lg text-sm"
                                onClick={closeMobileMenu}
                              >
                                {subCategory.name}
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
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
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
