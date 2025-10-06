"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { useWishlist } from "../context/WishlistContext"
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  MessageCircle,
  Phone,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  User,
  Heart,
  Truck,
  RotateCcw,
  Award,
  Mail,
  Percent,
} from "lucide-react"
import { productsAPI } from "../services/api.js"
import { trackProductView } from "../utils/gtmTracking"

import config from "../config/config"
import ProductSchema from "../components/ProductSchema"
import ReviewSection from "../components/ReviewSection"

import TabbyModal from "../components/payments/TabbyModal"
import TamaraModal from "../components/payments/TamaraModal"
import SEO from "../components/SEO"

const WHATSAPP_NUMBER = "971508604360" // Replace with your WhatsApp number

const ProductDetails = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("description")
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const thumbnailRowRef = useRef(null)
  const [thumbScroll, setThumbScroll] = useState(0)
  const [showRatingDropdown, setShowRatingDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const ratingDropdownRef = useRef(null)

  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })

  // New state variables
  const [frequentlyBought, setFrequentlyBought] = useState([])
  const [frequentlyBoughtLoading, setFrequentlyBoughtLoading] = useState(true)
  const [selectedBundleItems, setSelectedBundleItems] = useState({})

  const [showTabbyModal, setShowTabbyModal] = useState(false)
  const [showTamaraModal, setShowTamaraModal] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal || !product) return

      const productImages =
        product.galleryImages && product.galleryImages.length > 0
          ? [product.image, ...product.galleryImages.filter((img) => img)]
          : [product.image]

      if (e.key === "ArrowLeft") {
        setModalImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))
      } else if (e.key === "ArrowRight") {
        setModalImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))
      } else if (e.key === "Escape") {
        setShowImageModal(false)
        setIsImageZoomed(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showImageModal, product])

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle click outside to close dropdown on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        showRatingDropdown &&
        ratingDropdownRef.current &&
        !ratingDropdownRef.current.contains(event.target)
      ) {
        setShowRatingDropdown(false)
      }
    }

    if (isMobile && showRatingDropdown) {
      document.addEventListener("touchstart", handleClickOutside)
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("touchstart", handleClickOutside)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isMobile, showRatingDropdown])

  const [showCallbackModal, setShowCallbackModal] = useState(false)
  const [callbackForm, setCallbackForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "" })
  const [callbackLoading, setCallbackLoading] = useState(false)
  const [callbackSuccess, setCallbackSuccess] = useState(false)

  const [relatedLoading, setRelatedLoading] = useState(true)
  const [showCouponsModal, setShowCouponsModal] = useState(false)
  const [publicCoupons, setPublicCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [couponError, setCouponError] = useState(null)
  const [couponCopied, setCouponCopied] = useState(null)

  const formatPrice = (price) => {
    return `${Number(price).toLocaleString()}.00 AED`
  }

  const calculateDiscountedPrice = (price, discountPercent = 25) => {
    const numericPrice = typeof price === "number" ? price : Number(price) || 0
    return numericPrice * (1 - discountPercent / 100)
  }

  const formatDiscountedPrice = (price, discountPercent = 25) => {
    const discountedPrice = calculateDiscountedPrice(price, discountPercent)
    return formatPrice(discountedPrice)
  }

  const getEffectivePrice = () => {
    const basePrice = Number(product?.price) || 0
    const offerPrice = Number(product?.offerPrice) || 0
    const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
    if (hasValidOffer) return offerPrice
    return basePrice > 0 ? basePrice : offerPrice
  }
  const formatPerMonth = (n) =>
    `AED ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`

  const getRatingDistribution = () => {
    return reviewStats.ratingDistribution
  }

  // Handle rating interaction (hover for desktop, click for mobile)
  const handleRatingInteraction = () => {
    if (isMobile) {
      setShowRatingDropdown(!showRatingDropdown)
    }
  }

  const fetchReviewStats = async () => {
    if (!product?._id) return

    try {
      const response = await axios.get(`${config.API_URL}/api/reviews/product/${product._id}?page=1&limit=1`)
      if (response.data.stats) {
        setReviewStats({
          averageRating: response.data.stats.averageRating || 0,
          totalReviews: response.data.stats.totalReviews || 0,
          ratingDistribution: response.data.stats.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
      }
    } catch (error) {
      console.error("Error fetching review stats:", error)
    }
  }

  const scrollToReviewSection = () => {
    setActiveTab("reviews")
    // Small delay to ensure tab content is rendered
    setTimeout(() => {
      const reviewSection = document.querySelector("[data-review-section]")
      if (reviewSection) {
        reviewSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        })
      }
    }, 100)
    // Close the dropdown after clicking
    setShowRatingDropdown(false)
  }

  const handleStarRatingClick = (rating) => {
    scrollToReviewSection()
    // You could also filter reviews by rating here if needed
  }

  useEffect(() => {
    console.log("slug from useParams:", slug)
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  useEffect(() => {
    if (product) {
      fetchRelatedProducts()
      fetchReviewStats()
      fetchFrequentlyBought() // Add this line
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      console.log("Fetching product for slug:", slug)
      const data = await productsAPI.getBySlug(slug)
      console.log("API response for product:", data)
      setProduct(data)
      setError(null)

      // Add GTM tracking here - after product is successfully loaded
      if (data && data._id) {
        try {
          trackProductView(data)
        } catch (trackingError) {
          console.error("GTM tracking error:", trackingError)
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Failed to load product details. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    setRelatedLoading(true)
    try {
      // Try to get related products from the same category
      const { data } = await axios.get(`${config.API_URL}/api/products?category=${product.category._id}&limit=12`)
      let filtered = data.filter((p) => p._id !== product._id)
      if (filtered.length === 0) {
        // If no related products, fetch all products and pick random ones (excluding current)
        const allRes = await axios.get(`${config.API_URL}/api/products`)
        filtered = allRes.data.filter((p) => p._id !== product._id)
      }
      setRelatedProducts(filtered)
    } catch (error) {
      console.error("Error fetching related products:", error)
    } finally {
      setRelatedLoading(false)
    }
  }

  // Function to handle bundle item selection
  const handleBundleItemToggle = (itemId) => {
    console.log("Toggling bundle item:", itemId)
    setSelectedBundleItems((prev) => {
      const newState = {
        ...prev,
        [itemId]: !prev[itemId],
      }
      console.log("Updated selectedBundleItems:", newState)
      return newState
    })
  }

  // Function to calculate total bundle price
  const calculateBundleTotal = () => {
    let total = 0

    // Add current product if selected (no discount on main product)
    if (selectedBundleItems[product._id]) {
      total += product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price
    }

    // Add selected bundle items with 25% discount
    frequentlyBought.forEach((item) => {
      if (selectedBundleItems[item._id]) {
        const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
        const discountedPrice = calculateDiscountedPrice(originalPrice, 25)
        total += discountedPrice
      }
    })

    return total
  }

  // New function to calculate savings
  const calculateBundleSavings = () => {
    let originalTotal = 0
    let discountedTotal = 0

    // Add current product if selected
    if (selectedBundleItems[product._id]) {
      const productPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price
      originalTotal += productPrice
      discountedTotal += productPrice
    }

    // Add selected bundle items
    frequentlyBought.forEach((item) => {
      if (selectedBundleItems[item._id]) {
        const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
        const discountedPrice = calculateDiscountedPrice(originalPrice, 25)
        originalTotal += originalPrice
        discountedTotal += discountedPrice
      }
    })

    return {
      originalTotal,
      discountedTotal,
      savings: originalTotal - discountedTotal,
    }
  }

  // Replace your existing FrequentlyBoughtTogether component (around line 658)
  const FrequentlyBoughtTogether = () => {
    if (frequentlyBoughtLoading) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (!frequentlyBought || frequentlyBought.length === 0) {
      return null
    }

    const selectedCount = Object.values(selectedBundleItems).filter(Boolean).length
    const bundleTotals = calculateBundleSavings()

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Frequently Bought Together</h3>
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">25% OFF BUNDLE</div>
        </div>

        <div className="space-y-4">
          {/* Current Product - Always Selected */}
          <div className="flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="w-5 h-5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-yellow-600 font-semibold">
                {formatPrice(product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price)}
              </p>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Current Item</span>
            </div>
          </div>

          {/* Bundle Items with 25% Discount */}
          {frequentlyBought.map((item) => {
            const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
            const discountedPrice = calculateDiscountedPrice(originalPrice, 25)
            const savings = originalPrice - discountedPrice

            return (
              <div
                key={item._id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedBundleItems[item._id] || false}
                  onChange={() => handleBundleItemToggle(item._id)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-green-600 font-semibold">{formatDiscountedPrice(originalPrice, 25)}</p>
                    <p className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</p>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">Save 25%</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">You save {formatPrice(savings)}</p>

                  {/* Show original offer details if any */}
                  {item.offerPrice && item.offerPrice > 0 && item.offerPrice < item.price && (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="line-through">{formatPrice(item.price)}</span>
                      <span className="ml-2 text-blue-600">Already discounted</span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Total and Add to Cart */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-lg mb-2">
                <span className="text-gray-700">Bundle price: </span>
                <span className="font-bold text-xl text-green-600">{formatPrice(bundleTotals.discountedTotal)}</span>
                {bundleTotals.savings > 0 && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {formatPrice(bundleTotals.originalTotal)}
                  </span>
                )}
              </div>
              {bundleTotals.savings > 0 && (
                <div className="text-sm text-red-600 font-medium">
                  You save {formatPrice(bundleTotals.savings)} with bundle discount!
                </div>
              )}
              <div className="text-sm text-gray-600 mt-1">
                For {selectedCount} item{selectedCount !== 1 ? "s" : ""}
              </div>
            </div>

            <button
              data-add-bundle-btn
              onClick={handleAddBundleToCart}
              disabled={selectedCount === 0}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Add all {selectedCount} to Cart
              {bundleTotals.savings > 0 && (
                <span className="text-xs bg-white text-red-600 px-2 py-1 rounded-full">
                  Save {formatPrice(bundleTotals.savings)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (product.stockStatus === "Out of Stock") {
      showToast("Product is out of stock", "error")
      return
    }
    addToCart(product, quantity)
    showToast("Product added to cart!", "success")
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate("/cart")
  }

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta
      if (newQuantity < 1) return 1
      if (newQuantity > (product.maxPurchaseQty || 10)) return product.maxPurchaseQty || 10
      return newQuantity
    })
  }

  const handleImageClick = (index) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  // const fetchFrequentlyBought = async () => {
  //   setFrequentlyBoughtLoading(true)
  //   try {
  //     const complementaryProducts = []

  //     // Get product category and name to determine what accessories to show
  //     const productName = product.name?.toLowerCase() || ""
  //     const categoryName = product.category?.name?.toLowerCase() || ""
  //     const brandName = product.brand?.name?.toLowerCase() || ""

  //     console.log("Product details:", { productName, categoryName, brandName })

  //     // Define complementary product logic based on main product type
  //     if (categoryName.includes("laptop") || productName.includes("laptop")) {
  //       // For laptops, get exactly 2 diverse accessories - one from each category
  //       const accessoryCategories = [
  //         {
  //           name: "mouse",
  //           searches: ["wireless mouse", "bluetooth mouse", "gaming mouse"],
  //           keywords: ["mouse"],
  //         },
  //         {
  //           name: "headphones",
  //           searches: ["bluetooth headphones", "wireless headset", "gaming headset", "earbuds"],
  //           keywords: ["headphone", "headset", "earbuds", "earphone"],
  //         },
  //         {
  //           name: "keyboard",
  //           searches: ["wireless keyboard", "bluetooth keyboard", "mechanical keyboard"],
  //           keywords: ["keyboard"],
  //         },
  //         {
  //           name: "accessories",
  //           searches: ["laptop bag", "laptop stand", "cooling pad", "webcam", "usb hub", "portable speaker"],
  //           keywords: ["bag", "stand", "cooling", "webcam", "hub", "speaker", "charger"],
  //         },
  //       ]

  //       // Get one product from each category to ensure diversity - LIMIT TO 2
  //       for (const category of accessoryCategories) {
  //         let foundInCategory = false

  //         for (const searchTerm of category.searches) {
  //           if (foundInCategory) break

  //           try {
  //             const response = await axios.get(
  //               `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
  //             )
  //             const accessories = response.data.filter(
  //               (p) =>
  //                 p._id !== product._id &&
  //                 // Exclude main product categories
  //                 !p.name?.toLowerCase().includes("laptop") &&
  //                 !p.name?.toLowerCase().includes("desktop") &&
  //                 !p.name?.toLowerCase().includes("computer") &&
  //                 !p.name?.toLowerCase().includes("pc") &&
  //                 !p.name?.toLowerCase().includes("monitor") &&
  //                 !p.name?.toLowerCase().includes("aio") &&
  //                 // Include only relevant accessories
  //                 category.keywords.some(
  //                   (keyword) =>
  //                     p.name?.toLowerCase().includes(keyword) || p.category?.name?.toLowerCase().includes(keyword),
  //                 ),
  //             )

  //             if (accessories.length > 0) {
  //               // Add first matching product from this category
  //               complementaryProducts.push(accessories[0])
  //               foundInCategory = true
  //               console.log(`Found ${category.name}:`, accessories[0].name)
  //             }
  //           } catch (error) {
  //             console.log(`Search failed for: ${searchTerm}`)
  //           }
  //         }

  //         // Stop when we have exactly 2 diverse products
  //         if (complementaryProducts.length >= 2) break
  //       }
  //     } else if (categoryName.includes("desktop") || productName.includes("desktop")) {
  //       // For desktops, get exactly 2 accessories
  //       const desktopCategories = [
  //         {
  //           name: "monitor",
  //           searches: ["monitor", "display"],
  //           keywords: ["monitor", "display"],
  //         },
  //         {
  //           name: "keyboard",
  //           searches: ["wireless keyboard", "mechanical keyboard"],
  //           keywords: ["keyboard"],
  //         },
  //         {
  //           name: "mouse",
  //           searches: ["wireless mouse", "gaming mouse"],
  //           keywords: ["mouse"],
  //         },
  //       ]

  //       for (const category of desktopCategories) {
  //         let foundInCategory = false

  //         for (const searchTerm of category.searches) {
  //           if (foundInCategory) break

  //           try {
  //             const response = await axios.get(
  //               `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
  //             )
  //             const accessories = response.data.filter(
  //               (p) =>
  //                 p._id !== product._id &&
  //                 !p.name?.toLowerCase().includes("desktop") &&
  //                 !p.name?.toLowerCase().includes("laptop") &&
  //                 category.keywords.some((keyword) => p.name?.toLowerCase().includes(keyword)),
  //             )

  //             if (accessories.length > 0) {
  //               complementaryProducts.push(accessories[0])
  //               foundInCategory = true
  //             }
  //           } catch (error) {
  //             console.log(`Search failed for: ${searchTerm}`)
  //           }
  //         }

  //         // Stop when we have exactly 2 products
  //         if (complementaryProducts.length >= 2) break
  //       }
  //     } else if (categoryName.includes("mobile") || categoryName.includes("phone") || productName.includes("phone")) {
  //       // For phones, get exactly 2 phone accessories
  //       const phoneCategories = [
  //         {
  //           name: "case",
  //           searches: ["phone case", "mobile case"],
  //           keywords: ["case", "cover"],
  //         },
  //         {
  //           name: "charger",
  //           searches: ["wireless charger", "phone charger", "power bank"],
  //           keywords: ["charger", "power bank", "charging"],
  //         },
  //         {
  //           name: "audio",
  //           searches: ["wireless earbuds", "bluetooth headphones"],
  //           keywords: ["earbuds", "headphone", "earphone"],
  //         },
  //       ]

  //       for (const category of phoneCategories) {
  //         let foundInCategory = false

  //         for (const searchTerm of category.searches) {
  //           if (foundInCategory) break

  //           try {
  //             const response = await axios.get(
  //               `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
  //             )
  //             const accessories = response.data.filter(
  //               (p) =>
  //                 p._id !== product._id &&
  //                 !p.name?.toLowerCase().includes("phone") &&
  //                 !p.name?.toLowerCase().includes("mobile") &&
  //                 category.keywords.some((keyword) => p.name?.toLowerCase().includes(keyword)),
  //             )

  //             if (accessories.length > 0) {
  //               complementaryProducts.push(accessories[0])
  //               foundInCategory = true
  //             }
  //           } catch (error) {
  //             console.log(`Search failed for: ${searchTerm}`)
  //           }
  //         }

  //         // Stop when we have exactly 2 products
  //         if (complementaryProducts.length >= 2) break
  //       }
  //     }

  //     // Remove duplicates and ensure exactly 2 items
  //     const uniqueProducts = complementaryProducts
  //       .filter((product, index, self) => index === self.findIndex((p) => p._id === product._id))
  //       .slice(0, 2) // LIMIT TO EXACTLY 2 ACCESSORIES

  //     console.log("Found complementary products:", uniqueProducts.length)
  //     console.log(
  //       "Products:",
  //       uniqueProducts.map((p) => ({
  //         name: p.name,
  //         category: p.category?.name,
  //         type: p.name?.toLowerCase().includes("mouse")
  //           ? "mouse"
  //           : p.name?.toLowerCase().includes("keyboard")
  //             ? "keyboard"
  //             : p.name?.toLowerCase().includes("headphone") || p.name?.toLowerCase().includes("headset")
  //               ? "audio"
  //               : "other",
  //       })),
  //     )

  //     // If we don't have exactly 2, try fallback
  //     if (uniqueProducts.length < 2) {
  //       console.log(`Only found ${uniqueProducts.length} accessories, trying fallback...`)

  //       try {
  //         const fallbackResponse = await axios.get(`${config.API_URL}/api/products?limit=50`)
  //         const fallbackAccessories = fallbackResponse.data.filter(
  //           (p) =>
  //             p._id !== product._id &&
  //             (p.category?.name?.toLowerCase().includes("accessories") ||
  //               p.name?.toLowerCase().includes("mouse") ||
  //               p.name?.toLowerCase().includes("keyboard") ||
  //               p.name?.toLowerCase().includes("headphone") ||
  //               p.name?.toLowerCase().includes("speaker")) &&
  //             // Exclude main product categories
  //             !p.name?.toLowerCase().includes("laptop") &&
  //             !p.name?.toLowerCase().includes("desktop") &&
  //             !p.name?.toLowerCase().includes("computer") &&
  //             !p.name?.toLowerCase().includes("phone") &&
  //             !p.name?.toLowerCase().includes("tablet") &&
  //             !p.name?.toLowerCase().includes("monitor") &&
  //             !uniqueProducts.some((existing) => existing._id === p._id), // Don't duplicate
  //         )

  //         // Add fallback products to reach exactly 2 total
  //         const needed = 2 - uniqueProducts.length
  //         uniqueProducts.push(...fallbackAccessories.slice(0, needed))

  //         console.log(
  //           "Added fallback accessories:",
  //           fallbackAccessories.slice(0, needed).map((p) => p.name),
  //         )
  //       } catch (error) {
  //         console.error("Fallback accessories search failed:", error)
  //       }
  //     }

  //     // Final check - ensure we have exactly 2 or hide the section
  //     if (uniqueProducts.length === 0) {
  //       console.log("No accessories found at all, hiding section")
  //       setFrequentlyBought([])
  //       setSelectedBundleItems({})
  //       return
  //     }

  //     // Set the found products (limit to exactly 2)
  //     const finalProducts = uniqueProducts.slice(0, 2)
  //     setFrequentlyBought(finalProducts)

  //     console.log(
  //       "Final selected products:",
  //       finalProducts.map((p) => ({ name: p.name, category: p.category?.name })),
  //     )

  //     // Auto-select ALL bundle items (current product + exactly 2 accessories = 3 total)
  //     const autoSelectedItems = {
  //       [product._id]: true, // Current product always selected
  //     }

  //     // Auto-select all found accessories (exactly 2)
  //     finalProducts.forEach((item) => {
  //       autoSelectedItems[item._id] = true
  //     })

  //     console.log("Auto-selected bundle items (total 3):", autoSelectedItems)
  //     console.log("Bundle will have:", Object.keys(autoSelectedItems).length, "items total")
  //     setSelectedBundleItems(autoSelectedItems)
  //   } catch (error) {
  //     console.error("Error fetching frequently bought products:", error)
  //     setFrequentlyBought([])
  //   } finally {
  //     setFrequentlyBoughtLoading(false)
  //   }
  // }




































// CHANGE: replace frequently-bought logic with category-specific accessory mapping
  // const fetchFrequentlyBought = async () => {
  //   setFrequentlyBoughtLoading(true)
  //   try {
  //     if (!product) {
  //       setFrequentlyBought([])
  //       setSelectedBundleItems({})
  //       return
  //     }

  //     const name = (product.name || "").toLowerCase()
  //     const catName = (product.category?.name || "").toLowerCase()

  //     // Helper: check if a text includes any of the words
  //     const includesAny = (txt, words) => words.some((w) => txt.includes(w))

  //     // Map primary product types to targeted accessory groups
  //     const GROUPS = [
  //       {
  //         match: ["laptop", "notebook", "macbook"],
  //         suggestions: [
  //           {
  //             label: "keyboard",
  //             keywords: ["keyboard"],
  //             searches: ["keyboard", "wireless keyboard", "bluetooth keyboard", "mechanical keyboard"],
  //           },
  //           {
  //             label: "mouse",
  //             keywords: ["mouse"],
  //             searches: ["mouse", "wireless mouse", "gaming mouse", "bluetooth mouse"],
  //           },
  //           {
  //             label: "laptop bag",
  //             keywords: ["bag", "sleeve", "backpack"],
  //             searches: ["laptop bag", "laptop sleeve", "laptop backpack"],
  //           },
  //           { label: "mouse pad", keywords: ["pad", "mat"], searches: ["mouse pad", "gaming mouse pad", "mouse mat"] },
  //           {
  //             label: "headphones",
  //             keywords: ["headphone", "headset", "earbuds", "earphone"],
  //             searches: ["headphones", "headset", "earbuds"],
  //           },
  //           { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //         ],
  //         excludeMain: ["laptop", "desktop", "monitor", "aio", "computer", "pc"],
  //       },
  //       {
  //         match: ["printer"],
  //         suggestions: [
  //           { label: "usb cable", keywords: ["usb", "cable"], searches: ["usb cable", "printer cable"] },
  //           { label: "router", keywords: ["router"], searches: ["router"] },
  //           { label: "switch", keywords: ["switch"], searches: ["network switch", "gigabit switch"] },
  //           {
  //             label: "ethernet cable",
  //             keywords: ["ethernet", "lan", "network"],
  //             searches: ["ethernet cable", "lan cable", "network cable"],
  //           },
  //         ],
  //         excludeMain: ["printer"],
  //       },
  //       {
  //         match: ["monitor", "lcd", "led"],
  //         suggestions: [
  //           { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //           {
  //             label: "displayport cable",
  //             keywords: ["displayport", "dp"],
  //             searches: ["displayport cable", "dp cable"],
  //           },
  //           {
  //             label: "network cable",
  //             keywords: ["ethernet", "lan", "network"],
  //             searches: ["ethernet cable", "lan cable", "network cable"],
  //           },
  //           { label: "keyboard", keywords: ["keyboard"], searches: ["keyboard", "wireless keyboard"] },
  //           { label: "mouse", keywords: ["mouse"], searches: ["mouse", "wireless mouse"] },
  //         ],
  //         excludeMain: ["monitor", "laptop", "desktop", "aio", "computer", "pc"],
  //       },
  //       {
  //         match: ["desktop", "pc", "computer"],
  //         suggestions: [
  //           { label: "monitor", keywords: ["monitor", "display"], searches: ["monitor", "display"] },
  //           { label: "keyboard", keywords: ["keyboard"], searches: ["keyboard", "mechanical keyboard"] },
  //           { label: "mouse", keywords: ["mouse"], searches: ["mouse", "gaming mouse"] },
  //           { label: "ram", keywords: ["ram", "memory", "ddr"], searches: ["ram", "ddr4", "ddr5 memory"] },
  //           { label: "ssd", keywords: ["ssd", "nvme", "solid state"], searches: ["ssd", "nvme ssd"] },
  //           { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //           { label: "network cable", keywords: ["ethernet", "lan", "network"], searches: ["ethernet cable"] },
  //         ],
  //         excludeMain: ["desktop", "laptop", "monitor", "computer", "pc"],
  //       },
  //     ]

  //     // Determine which group applies
  //     const activeGroup = GROUPS.find((g) => includesAny(name, g.match) || includesAny(catName, g.match)) || null

  //     // If nothing matched, show a safe set of generic accessories
  //     const fallbackSuggestions = [
  //       { label: "mouse", keywords: ["mouse"], searches: ["mouse", "wireless mouse"] },
  //       { label: "keyboard", keywords: ["keyboard"], searches: ["keyboard"] },
  //       { label: "hdmi cable", keywords: ["hdmi"], searches: ["hdmi cable"] },
  //       { label: "network cable", keywords: ["ethernet", "lan", "network"], searches: ["ethernet cable"] },
  //     ]

  //     const suggestions = activeGroup?.suggestions || fallbackSuggestions
  //     const excludeWords = activeGroup?.excludeMain || []

  //     const results = []
  //     const seen = new Set()
  //     const MAX_ITEMS = 8

  //     // Helper: add product if unique and relevant
  //     const tryAddProduct = (p) => {
  //       if (!p || seen.has(p._id) || p._id === product._id) return
  //       const pname = (p.name || "").toLowerCase()
  //       const pcat = (p.category?.name || "").toLowerCase()
  //       // Exclude main-category items
  //       if (includesAny(pname, excludeWords) || includesAny(pcat, excludeWords)) return
  //       seen.add(p._id)
  //       results.push(p)
  //     }

  //     // For each suggestion, query with its search terms and filter by keywords to stay relevant
  //     for (const s of suggestions) {
  //       for (const term of s.searches) {
  //         if (results.length >= MAX_ITEMS) break
  //         try {
  //           const { data } = await axios.get(
  //             `${config.API_URL}/api/products?search=${encodeURIComponent(term)}&limit=20`,
  //           )
  //           data
  //             .filter((p) => {
  //               const pname = (p.name || "").toLowerCase()
  //               const pcat = (p.category?.name || "").toLowerCase()
  //               return s.keywords.some((kw) => pname.includes(kw) || pcat.includes(kw))
  //             })
  //             .forEach(tryAddProduct)
  //         } catch {
  //           // ignore individual search errors and continue
  //         }
  //         if (results.length >= MAX_ITEMS) break
  //       }
  //       if (results.length >= MAX_ITEMS) break
  //     }

  //     // If still empty, do a broad fallback scan
  //     if (results.length === 0) {
  //       try {
  //         const { data } = await axios.get(`${config.API_URL}/api/products?limit=100`)
  //         data
  //           .filter((p) => {
  //             const pname = (p.name || "").toLowerCase()
  //             const pcat = (p.category?.name || "").toLowerCase()
  //             return (
  //               [
  //                 "mouse",
  //                 "keyboard",
  //                 "headphone",
  //                 "earbuds",
  //                 "bag",
  //                 "hdmi",
  //                 "ethernet",
  //                 "router",
  //                 "switch",
  //                 "ssd",
  //                 "ram",
  //               ].some((kw) => pname.includes(kw) || pcat.includes(kw)) &&
  //               !includesAny(pname, excludeWords) &&
  //               !includesAny(pcat, excludeWords)
  //             )
  //           })
  //           .slice(0, MAX_ITEMS)
  //           .forEach(tryAddProduct)
  //       } catch {
  //         // ignore
  //       }
  //     }

  //     setFrequentlyBought(results)
  //     // Pre-select up to 3 accessories plus the current product
  //     const autoSelected = { [product._id]: true }
  //     results.slice(0, 3).forEach((p) => (autoSelected[p._id] = true))
  //     setSelectedBundleItems(autoSelected)
  //   } catch (err) {
  //     setFrequentlyBought([])
  //     setSelectedBundleItems({})
  //   } finally {
  //     setFrequentlyBoughtLoading(false)
  //   }
  // }





  const fetchFrequentlyBought = async () => {
  setFrequentlyBoughtLoading(true);
  try {
    if (!product) {
      setFrequentlyBought([]);
      setSelectedBundleItems({});
      return;
    }

    const productName = (product.name || "").toLowerCase();
    const categoryName = (product.category?.name || "").toLowerCase();
    const brandName = (product.brand?.name || "").toLowerCase();

    console.log("Finding accessories for:", { productName, categoryName, brandName });

    // Enhanced accessory mapping with multiple options for each category
    const ACCESSORY_MAPPING = {
      laptop: [
        // First combination set
        [
          {
            category: "mouse",
            searches: ["wireless mouse", "bluetooth mouse", "gaming mouse"],
            keywords: ["mouse", "wireless", "bluetooth"],
            exclude: ["laptop", "desktop", "computer", "monitor"],
          },
          {
            category: "laptop bag",
            searches: ["laptop bag", "laptop backpack", "laptop case"],
            keywords: ["bag", "backpack", "case", "sleeve"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "keyboard",
            searches: ["wireless keyboard", "bluetooth keyboard"],
            keywords: ["keyboard", "wireless", "bluetooth"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "headphones",
            searches: ["wireless headphones", "bluetooth headset"],
            keywords: ["headphone", "headset", "wireless"],
            exclude: ["laptop", "desktop", "monitor", "phone"],
          }
        ],
        // Third combination set
        [
          {
            category: "laptop stand",
            searches: ["laptop stand", "laptop cooler"],
            keywords: ["stand", "cooler", "cooling", "pad"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "usb hub",
            searches: ["usb hub", "type c hub", "docking station"],
            keywords: ["hub", "adapter", "docking", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Fourth combination set
        [
          {
            category: "mouse",
            searches: ["wireless mouse", "gaming mouse"],
            keywords: ["mouse", "wireless", "gaming"],
            exclude: ["laptop", "desktop", "computer", "monitor"],
          },
          {
            category: "usb hub",
            searches: ["usb hub", "type c hub"],
            keywords: ["hub", "adapter", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ],

      printer: [
        // First combination set
        [
          {
            category: "cables",
            searches: ["usb cable", "printer cable", "usb type b cable"],
            keywords: ["cable", "usb", "printer"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "ink",
            searches: ["printer ink", "ink cartridge"],
            keywords: ["ink", "cartridge", "toner"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "router",
            searches: ["wifi router", "wireless router"],
            keywords: ["router", "wifi", "wireless"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "paper",
            searches: ["a4 paper", "photo paper"],
            keywords: ["paper", "a4", "photo"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Third combination set
        [
          {
            category: "switch",
            searches: ["network switch", "ethernet switch"],
            keywords: ["switch", "network", "ethernet"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "cables",
            searches: ["power cable", "extension cord"],
            keywords: ["cable", "power", "extension"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ],

      lcd: [
        // First combination set
        [
          {
            category: "hdmi cable",
            searches: ["hdmi cable", "hdmi to hdmi"],
            keywords: ["hdmi", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "keyboard",
            searches: ["wired keyboard", "usb keyboard"],
            keywords: ["keyboard", "wired", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "vga cable",
            searches: ["vga cable", "vga to vga"],
            keywords: ["vga", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "mouse",
            searches: ["wired mouse", "usb mouse"],
            keywords: ["mouse", "wired", "usb"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Third combination set
        [
          {
            category: "network cable",
            searches: ["ethernet cable", "lan cable"],
            keywords: ["ethernet", "lan", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "monitor stand",
            searches: ["monitor stand", "vesa mount"],
            keywords: ["stand", "mount", "vesa"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ],

      desktop: [
        // First combination set
        [
          {
            category: "keyboard",
            searches: ["gaming keyboard", "mechanical keyboard"],
            keywords: ["keyboard", "gaming", "mechanical"],
            exclude: ["laptop", "desktop", "monitor"],
          },
          {
            category: "mouse",
            searches: ["gaming mouse", "optical mouse"],
            keywords: ["mouse", "gaming", "optical"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Second combination set
        [
          {
            category: "ram",
            searches: ["ddr4 ram", "desktop ram"],
            keywords: ["ram", "ddr4", "memory"],
            exclude: ["laptop", "monitor"],
          },
          {
            category: "ssd",
            searches: ["ssd", "solid state drive"],
            keywords: ["ssd", "solid state", "nvme"],
            exclude: ["laptop", "monitor"],
          }
        ],
        // Third combination set
        [
          {
            category: "monitor",
            searches: ["led monitor", "computer monitor"],
            keywords: ["monitor", "led", "display"],
            exclude: ["laptop", "desktop", "computer"],
          },
          {
            category: "hdmi cable",
            searches: ["hdmi cable", "hdmi 2.0"],
            keywords: ["hdmi", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ],
        // Fourth combination set
        [
          {
            category: "hard disk",
            searches: ["hard disk", "internal hdd"],
            keywords: ["hard disk", "hdd", "internal"],
            exclude: ["laptop", "monitor", "external"],
          },
          {
            category: "network cable",
            searches: ["ethernet cable", "lan cable"],
            keywords: ["ethernet", "lan", "cable"],
            exclude: ["laptop", "desktop", "monitor"],
          }
        ]
      ]
    };

    // Determine product type
    const getProductType = () => {
      if (productName.includes('laptop') || categoryName.includes('laptop')) {
        return 'laptop';
      } else if (productName.includes('printer') || categoryName.includes('printer')) {
        return 'printer';
      } else if (productName.includes('lcd') || productName.includes('led') || 
                 productName.includes('monitor') || categoryName.includes('monitor')) {
        return 'lcd';
      } else if (productName.includes('desktop') || categoryName.includes('desktop') ||
                 productName.includes('computer') && !productName.includes('laptop')) {
        return 'desktop';
      }
      return 'laptop';
    };

    const productType = getProductType();
    console.log(`Detected product type: ${productType}`);

    const complementaryProducts = [];
    const seenProductIds = new Set([product._id]);

    // Get all combination sets for this product type
    const combinationSets = ACCESSORY_MAPPING[productType] || ACCESSORY_MAPPING.laptop;
    
    // Rotate through different combinations (you can use timestamp, random, or store in state)
    const rotationIndex = Math.floor(Date.now() / 60000) % combinationSets.length; // Changes every minute
    // Alternative: const rotationIndex = Math.floor(Math.random() * combinationSets.length);
    
    const selectedCombination = combinationSets[rotationIndex];
    console.log(`Using combination set ${rotationIndex + 1} of ${combinationSets.length}`);

    // Find products for the selected combination
    for (const accessory of selectedCombination) {
      if (complementaryProducts.length >= 2) break;

      for (const searchTerm of accessory.searches) {
        if (complementaryProducts.length >= 2) break;

        try {
          const response = await axios.get(
            `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=8`
          );

          // Find the most relevant product from this search
          const relevantProduct = response.data.find(p => {
            if (!p || seenProductIds.has(p._id)) return false;
            
            const pName = (p.name || "").toLowerCase();
            const pCategory = (p.category?.name || "").toLowerCase();
            
            // Must match at least one keyword
            const matchesKeywords = accessory.keywords.some(keyword => 
              pName.includes(keyword) || pCategory.includes(keyword)
            );
            
            // Must NOT contain any excluded words
            const isExcluded = accessory.exclude.some(excludeWord =>
              pName.includes(excludeWord) || pCategory.includes(excludeWord)
            );

            const isRelevantPrice = p.price > 0 && p.price < 2000;

            return matchesKeywords && !isExcluded && isRelevantPrice;
          });

          if (relevantProduct) {
            complementaryProducts.push({
              ...relevantProduct,
              accessoryType: accessory.category
            });
            seenProductIds.add(relevantProduct._id);
            console.log(`Found ${accessory.category}: ${relevantProduct.name}`);
            break;
          }
        } catch (error) {
          console.log(`Search failed for: ${searchTerm}`, error);
        }
      }
    }

    // If we couldn't find both items from the selected combination, try other combinations
    if (complementaryProducts.length < 2) {
      console.log("Trying alternative combinations...");
      
      for (let i = 0; i < combinationSets.length && complementaryProducts.length < 2; i++) {
        if (i === rotationIndex) continue; // Skip the already tried combination
        
        const altCombination = combinationSets[i];
        
        for (const accessory of altCombination) {
          if (complementaryProducts.length >= 2) break;

          for (const searchTerm of accessory.searches) {
            if (complementaryProducts.length >= 2) break;

            try {
              const response = await axios.get(
                `${config.API_URL}/api/products?search=${encodeURIComponent(searchTerm)}&limit=8`
              );

              const relevantProduct = response.data.find(p => {
                if (!p || seenProductIds.has(p._id)) return false;
                
                const pName = (p.name || "").toLowerCase();
                const pCategory = (p.category?.name || "").toLowerCase();
                
                const matchesKeywords = accessory.keywords.some(keyword => 
                  pName.includes(keyword) || pCategory.includes(keyword)
                );
                
                const isExcluded = accessory.exclude.some(excludeWord =>
                  pName.includes(excludeWord) || pCategory.includes(excludeWord)
                );

                const isRelevantPrice = p.price > 0 && p.price < 2000;

                return matchesKeywords && !isExcluded && isRelevantPrice;
              });

              if (relevantProduct) {
                complementaryProducts.push({
                  ...relevantProduct,
                  accessoryType: accessory.category
                });
                seenProductIds.add(relevantProduct._id);
                console.log(`Found alternative ${accessory.category}: ${relevantProduct.name}`);
                break;
              }
            } catch (error) {
              console.log(`Alternative search failed for: ${searchTerm}`, error);
            }
          }
        }
      }
    }

    console.log("Final frequently bought together (1+2):", [
      { name: product.name, type: 'main' },
      ...complementaryProducts.map(p => ({
        name: p.name,
        accessoryType: p.accessoryType,
        price: p.price
      }))
    ]);

    setFrequentlyBought(complementaryProducts);

    // Auto-select current product + found accessories
    const autoSelectedItems = {
      [product._id]: true,
    };

    complementaryProducts.forEach(item => {
      autoSelectedItems[item._id] = true;
    });

    setSelectedBundleItems(autoSelectedItems);

  } catch (error) {
    console.error("Error fetching frequently bought products:", error);
    setFrequentlyBought([]);
  } finally {
    setFrequentlyBoughtLoading(false);
  }
};






































































































  const handleAddBundleToCart = async () => {
    console.log("=== Add Bundle to Cart Started ===")
    console.log("Selected bundle items:", selectedBundleItems)

    const selectedItems = []
    const bundleId = `bundle_${product._id}_${Date.now()}`

    // Add current product if selected (no discount)
    if (selectedBundleItems[product._id]) {
      selectedItems.push({
        ...product,
        bundleId,
        isBundleItem: false,
        bundleDiscount: false,
      })
    }

    // Add selected bundle items with 25% discount
    frequentlyBought.forEach((item) => {
      if (selectedBundleItems[item._id]) {
        const originalPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
        const discountedPrice = calculateDiscountedPrice(originalPrice, 25)

        selectedItems.push({
          ...item,
          price: discountedPrice,
          originalPrice: originalPrice,
          bundleId,
          isBundleItem: true,
          bundleDiscount: true,
          bundlePrice: discountedPrice,
        })
      }
    })

    if (selectedItems.length === 0) {
      showToast("No items selected", "error")
      return
    }

    try {
      for (const item of selectedItems) {
        addToCart(item, 1, bundleId)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      showToast(`${selectedItems.length} items added to cart with bundle discount!`, "success")
    } catch (error) {
      console.error("Error adding bundle to cart:", error)
      showToast("Failed to add items to cart", "error")
    }
  }

  const handleCallbackSubmit = async (e) => {
    e.preventDefault()
    setCallbackLoading(true)

    try {
      await axios.post(`${config.API_URL}/api/callback-requests`, {
        ...callbackForm,
        productId: product._id,
        productName: product.name,
      })
      setCallbackSuccess(true)
      setTimeout(() => {
        setShowCallbackModal(false)
        setCallbackSuccess(false)
        setCallbackForm({ name: user?.name || "", email: user?.email || "", phone: "" })
      }, 2000)
    } catch (error) {
      console.error("Error submitting callback request:", error)
      showToast("Failed to submit callback request", "error")
    } finally {
      setCallbackLoading(false)
    }
  }

  const handleCallbackChange = (e) => {
    const { name, value } = e.target
    setCallbackForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleOpenCouponsModal = async () => {
    setShowCouponsModal(true)
    setLoadingCoupons(true)
    setCouponError(null)

    try {
      const response = await axios.get(`${config.API_URL}/api/coupons/public`)
      setPublicCoupons(response.data)
    } catch (error) {
      console.error("Error fetching coupons:", error)
      setCouponError("Failed to load coupons")
    } finally {
      setLoadingCoupons(false)
    }
  }

  const handleCloseCouponsModal = () => {
    setShowCouponsModal(false)
    setPublicCoupons([])
    setCouponCopied(null)
  }

  const handleCopyCoupon = async (code, couponId) => {
    try {
      await navigator.clipboard.writeText(code)
      setCouponCopied(couponId)
      showToast("Coupon code copied!", "success")
      setTimeout(() => setCouponCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy coupon:", error)
      showToast("Failed to copy coupon code", "error")
    }
  }

  // Helper function for shuffling array
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Add coupon colors constant
  const COUPON_COLORS = [
    {
      main: "bg-gradient-to-r from-yellow-100 to-yellow-200",
      stub: "bg-yellow-300",
      border: "border-yellow-400",
      text: "text-yellow-800",
      barcode: "bg-yellow-200",
    },
    {
      main: "bg-gradient-to-r from-blue-100 to-blue-200",
      stub: "bg-blue-300",
      border: "border-blue-400",
      text: "text-blue-800",
      barcode: "bg-blue-200",
    },
    {
      main: "bg-gradient-to-r from-green-100 to-green-200",
      stub: "bg-green-300",
      border: "border-green-400",
      text: "text-green-800",
      barcode: "bg-green-200",
    },
    {
      main: "bg-gradient-to-r from-purple-100 to-purple-200",
      stub: "bg-purple-300",
      border: "border-purple-400",
      text: "text-purple-800",
      barcode: "bg-purple-200",
    },
  ]

  console.log("Render: loading =", loading, ", product =", product, ", error =", error)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <img src="/g.png" alt="Loading" className="w-24 h-24 animate-bounce" style={{ animationDuration: "1.5s" }} />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Product not found"}</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    )
  }

  const pdTitle = `${product.name} — Grabatoz`
  const pdDescription =
    (product.shortDescription &&
      String(product.shortDescription)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)) ||
    (product.description &&
      String(product.description)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)) ||
    `${product.name} available at Grabatoz.`

  const pdCanonicalPath = `/product/${product.slug || product._id}`

  const productImages =
    product.galleryImages && product.galleryImages.length > 0
      ? [product.image, ...product.galleryImages.filter((img) => img)]
      : [product.image]

  // Helper function to get stock badge
  const getStockBadge = () => {
    // Unified badge style for all stock statuses
    const baseClass =
      "inline-flex items-center justify-center min-h-[32px] px-4 py-1 rounded-md text-sm font-bold leading-none";
    switch (product.stockStatus) {
      case "Available Product":
        return (
          <span className={baseClass + " bg-lime-500 text-white"}>In Stock</span>
        );
      case "Out of Stock":
        return (
          <span className={baseClass + " bg-red-500 text-white"}>Out of Stock</span>
        );
      case "PreOrder":
        return (
          <span className={baseClass + " bg-orange-400 text-white"}>Pre-order</span>
        );
      default:
        return null;
    }
  } // end getStockBadge

  // Helper function to get discount badge
  const getDiscountBadge = () => {
    const basePrice = Number(product.price) || 0;
    const offerPrice = Number(product.offerPrice) || 0;
    const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice;
    // Unified badge style for discount
    const badgeClass =
      "inline-flex items-center justify-center min-h-[32px] px-4 py-1 rounded-md text-sm font-bold leading-none bg-red-600 text-white";
    if (hasValidOffer) {
      const discountPercentage = Math.round(((basePrice - offerPrice) / basePrice) * 100);
      return (
        <span className={badgeClass}>
          -{discountPercentage}%
        </span>
      );
    } else if (product.discount > 0) {
      // Fallback if only discount percentage is provided
      return (
        <span className={badgeClass}>
          -{product.discount}%
        </span>
      );
    }
    return null;
  } // end getDiscountBadge

  return (
    <div className="bg-white min-h-screen">
      <SEO title={pdTitle} description={pdDescription} canonicalPath={pdCanonicalPath} image={product.image} />
      <div className="max-w-8xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-green-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-green-600">
            Shop
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${product.category?.name || product.category || ""}`}
            className="hover:text-green-600"
          >
            {product.category?.name || product.category || "N/A"}
          </Link>
          <span>/</span>
          <span className="text-black block truncate max-w-[120px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product Images and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Product Images - Left Side */}
          <div className="lg:col-span-4">
            <div className="rounded-lg ">
              {/* Main Image */}
              <div className="relative rounded-lg p-4 group mb-4">
                <img
                  src={productImages[selectedImage] || "/placeholder.svg?height=400&width=400"}
                  alt={product.name}
                  className="w-full h-96 object-contain cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleImageClick(selectedImage)}
                />

                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={16} />
                </div>

                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((selectedImage + 1) % productImages.length)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="relative w-full">
                  {/* Left Arrow */}
                  {thumbScroll > 0 && (
                    <button
                      className="absolute  left-0 top-1/2 -translate-y-1/2 z-10 bg-lime-500  shadow rounded-full p-1"
                      onClick={() => {
                        if (thumbnailRowRef.current) {
                          thumbnailRowRef.current.scrollBy({ left: -100, behavior: "smooth" })
                        }
                      }}
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                  )}
                  {/* Thumbnails Row */}
                  <div
                    ref={thumbnailRowRef}
                    className="flex space-x-2 overflow-x-auto hide-scrollbar w-full"
                    onScroll={(e) => setThumbScroll(e.target.scrollLeft)}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all  ${
                          selectedImage === index
                            ? "border-green-500 ring-2 ring-green-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg?height=64&width=64"}
                          alt={`${product.name} - view ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                  {/* Right Arrow */}
                  {thumbnailRowRef.current &&
                    thumbnailRowRef.current.scrollLeft + thumbnailRowRef.current.offsetWidth <
                      thumbnailRowRef.current.scrollWidth && (
                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-lime-500 shadow rounded-full p-1"
                        onClick={() => {
                          if (thumbnailRowRef.current) {
                            thumbnailRowRef.current.scrollBy({ left: 100, behavior: "smooth" })
                          }
                        }}
                      >
                        <ChevronRight size={20} className="text-white" />
                      </button>
                    )}
                  <style>{`
                    .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                  `}</style>
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Middle */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg p-2">
              {/* Status Badges */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {getStockBadge()}
                  {getDiscountBadge()}
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Brand and Category */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-gray-600">
                  Brand:{" "}
                  <span className="font-medium text-green-600">{product.brand?.name || product.brand || "N/A"}</span>
                </span>
                <span className="text-gray-600">
                  Category:{" "}
                  <span className="font-medium text-green-600">
                    {product.category?.name || product.category || "N/A"}
                  </span>
                </span>
                <span className="text-gray-600">
                  SKU: <span className="font-medium text-green-600">{product.sku || "N/A"}</span>
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div
                  ref={ratingDropdownRef}
                  className={`flex items-center relative ${isMobile ? "cursor-pointer" : ""}`}
                  onMouseEnter={() => !isMobile && setShowRatingDropdown(true)}
                  onMouseLeave={() => !isMobile && setShowRatingDropdown(false)}
                  onClick={handleRatingInteraction}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={`${
                        i < Math.floor(reviewStats.averageRating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      } cursor-pointer  hover:scale-110 transition-transform duration-200`}
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the parent div's onClick
                        scrollToReviewSection()
                      }}
                    />
                  ))}

                  {/* Rating Breakdown Dropdown */}
                  {showRatingDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
                      <div className="text-sm font-medium text-gray-700 mb-2">Rating Breakdown</div>
                      {(() => {
                        const distribution = getRatingDistribution()
                        return [5, 4, 3, 2, 1].map((rating) => (
                          <div
                            key={rating}
                            className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors"
                            onClick={() => handleStarRatingClick(rating)}
                          >
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">({distribution[rating] || 0})</span>
                          </div>
                        ))
                      })()}
                      {isMobile && <div className="text-xs text-gray-500 mt-2 border-t pt-2">Tap outside to close</div>}
                    </div>
                  )}
                </div>
                <span
                  className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={scrollToReviewSection}
                >
                  ({reviewStats.totalReviews || 0} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {(() => {
                  const basePrice = Number(product.price) || 0
                  const offerPrice = Number(product.offerPrice) || 0
                  const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice

                  let priceToShow = 0
                  if (hasValidOffer) {
                    priceToShow = offerPrice
                  } else if (basePrice > 0) {
                    priceToShow = basePrice
                  } else if (offerPrice > 0) {
                    priceToShow = offerPrice
                  }

                  return (
                    <>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-3xl font-bold text-red-600">{formatPrice(priceToShow)}</div>
                        {hasValidOffer && (
                          <div className="text-xl text-gray-500 line-through font-medium">{formatPrice(basePrice)}</div>
                        )}
                      </div>
                      <div className="text-md text-black">Including VAT</div>
                      {hasValidOffer && (
                        <div className="text-lg text-emerald-800 font-medium">
                          You Save {formatPrice(basePrice - priceToShow)}
                          {product.discount > 0 && ` (${product.discount}%)`}
                        </div>
                      )}
                      {product.discount > 0 && !hasValidOffer && (
                        <div className="text-sm text-green-600 font-medium">You Save {product.discount}%</div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div
                  className={`font-medium text-lg ${
                    product.stockStatus === "Available Product"
                      ? "text-green-600"
                      : product.stockStatus === "Out of Stock"
                        ? "text-red-600"
                        : "text-orange-600"
                  }`}
                >
                  {product.stockStatus === "Available Product" && "Available in stock"}
                  {product.stockStatus === "Out of Stock" && "Currently out of stock"}
                  {product.stockStatus === "PreOrder" && "Available for pre-order"}
                </div>
              </div>

              {/* Key Features */}
              {product.shortDescription && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Key Features:</h3>
                  <div
                    className="text-sm text-gray-700 prose prose-sm max-w-none line-clamp-5 sm:line-clamp-none"
                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                  />
                </div>
              )}

              {/* Tabby/Tamara info rows (triggers) */}
              <div className="space-y-3 mb-4">
                {/* Tamara row */}
                 <button
                      type="button"
                      onClick={() => setShowTamaraModal(true)}
                      className="ml-2 font-medium text-gray-900 hover:text-black"
                    >
                <div className="border rounded-xl p-3 bg-white">
                  
                  <div className="text-sm text-gray-700">
                    Or split in 4 payments of{" "}
                    <span className="font-semibold text-gray-900">{formatPerMonth(getEffectivePrice() / 4)}</span>
                     - No 
                    late fees,
                    
                     Sharia compliant! <br /> More options
                 
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-gray-900 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 align-middle">
                      tamara
                    </span>
                  </div>
                </div>
                   </button>




                {/* Tabby row */}
                     <button
                      type="button"
                      onClick={() => setShowTabbyModal(true)}
                      className="font-medium text-gray-900 hover:text-black"
                    >
                <div className="border rounded-xl p-3 bg-white">
                  <div className="text-sm text-gray-700 flex items-center gap-2 flex-wrap">
                    <span>
                      As low as{" "}
                      <span className="font-semibold text-gray-900">{formatPerMonth(getEffectivePrice() / 12)}</span> or
                      4 interest-free payments.
                    </span>
               
                      Learn more
                    
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-extrabold text-white bg-emerald-600">
                      tabby
                    </span>
                  </div>
                </div>
                </button>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2 ">
                  <div className="flex items-center border-2 border-black  rounded-lg bg-yellow-300">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 border-l border-r border-black min-w-[60px] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 text-gray-600 hover:text-green-600  transition-colors"
                      disabled={quantity >= (product.maxPurchaseQty || 10)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center  w-full ">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stockStatus === "Out of Stock"}
                      className=" bg-lime-500 hover:bg-lime-600 disabled:bg-gray-400 text-white py-3 px-9 rounded-lg font-medium transition-colors"
                    >
                      <ShoppingCart size={22} className="mr-2" />
                    </button>
                    {/* Heart btn */}
                    <button
                      onClick={() =>
                        isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
                      }
                      className={`ml-1 flex items-center px-9 py-3 rounded-lg border transition-colors ${
                        isInWishlist(product._id)
                          ? "bg-red-500 border-red-500 hover:bg-red-600"
                          : "bg-white border-red-500 hover:bg-gray-50"
                      }`}
                      aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        size={20}
                        className={isInWishlist(product._id) ? "text-red-500 fill-white" : "text-white fill-red-400"}
                      />
                      <span className="">{isInWishlist(product._id) ? "" : ""}</span>
                    </button>
                    <button
                      disabled={product.stockStatus === "Out of Stock"}
                      className="hidden sm:block w-full ml-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-3 py-3 rounded-lg font-medium transition-colors"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                <button
                  disabled={product.stockStatus === "Out of Stock"}
                  className=" md:hidden lg:hidden w-full ml-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-3 py-3 rounded-lg font-medium transition-colors"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 text-center">
                {/* WhatsApp Chat */}
                <div className="border-2 border-gray-300 rounded-lg p-2 transition-transform duration-200 hover:scale-105 hover:shadow-md group overflow-hidden">
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-green-600 w-full"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20help%20with%20this%20product%3A%20${encodeURIComponent(product.name)}`,
                        "_blank",
                      )
                    }
                  >
                    <MessageCircle
                      size={24}
                      className="mb-2 text-lime-500 transform transition-transform duration-300 group-hover:-translate-y-1"
                    />
                    <span className="text-xs text-black font-medium group-hover:text-lime-500">
                      Chat With Specialist
                    </span>
                  </button>
                </div>

                {/* Callback Request */}
                <div className="border-2 border-gray-300 rounded-lg p-2 transition-transform duration-200 hover:scale-105 hover:shadow-md group overflow-hidden">
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-blue-600 w-full"
                    onClick={() => setShowCallbackModal(true)}
                  >
                    <Phone
                      size={24}
                      className="mb-2 text-lime-500 transform transition-transform duration-300 group-hover:-translate-y-1"
                    />
                    <span className="text-xs text-black font-medium group-hover:text-lime-500">Request a Callback</span>
                  </button>
                </div>

                {/* Bulk Purchase */}
                <div className="border-2 border-gray-300 rounded-lg p-2 transition-transform duration-200 hover:scale-105 hover:shadow-md group overflow-hidden">
                  <button
                    type="button"
                    className="flex flex-col items-center w-full focus:outline-none group"
                    onClick={() => navigate("/bulk-purchase")}
                  >
                    <Shield
                      className="mx-auto mb-2 text-lime-500 transform transition-transform duration-300 group-hover:-translate-y-1"
                      size={24}
                    />
                    <span className="text-xs font-medium group-hover:text-lime-500 transition-colors">
                      Request Bulk Purchase
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Features - Right Side */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-3 space-y-6">
              {/* Get My Coupon */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 text-md mb-2 flex items-center">🎯 Get My Coupon</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Free shipping when you spend AED500 & above. Unlimited destinations in Dubai and Abu Dhabi
                </p>
                <button
                  className="w-full bg-yellow-400 text-black py-2 px-4 rounded font-bold text-sm hover:bg-yellow-500 transition-colors"
                  onClick={handleOpenCouponsModal}
                >
                  Get Coupons
                </button>
              </div>

              {/* Delivery Info */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Truck className="text-green-600 mt-1" size={60} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Express Delivery</h4>
                    <p className="text-xs text-gray-700">
                      Free shipping when you spend AED500 & above. Unlimited destinations in Dubai and Abu Dhabi
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <RotateCcw className="text-green-600 mt-1" size={60} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Delivery & Returns Policy</h4>
                    <p className="text-xs text-gray-700">
                      Delivery in remote areas will be considered as normal delivery which takes place with 1 working
                      day delivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="text-green-600 mt-1" size={33} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Warranty Information</h4>
                    <p className="text-xs text-gray-700">
                      {product.warranty || "Standard warranty applies as per manufacturer terms"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border-t pt-4">
                <h4 className="font-bold text-white p-2 rounded-lg bg-red-600 text-center text-md mb-3">
                  Payment Methods :{" "}
                </h4>
                <div className=" ml-8 items-center space-x-2 flex-wrap gap-2">
                  <div className="px-2 py-1 rounded flex items-center ">
                    <img
                      src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757919726/1st_logo_v8x2hc.webp"
                      alt="master"
                      className="w-auto"
                    />
                  </div>
                  <div className="px-2 py-1 rounded flex items-center ">
                    <img
                      src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757937381/2nd_logo_x6jzhz.webp"
                      alt="visa"
                      className="w-auto"
                    />
                  </div>
                  <div className="px-2 py-1 rounded flex items-center ">
                    <img
                      src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757937401/3rd_logo_fmwdkp.webp"
                      alt="tamara"
                      className="w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Frequently Bought Together Section Here */}
        <FrequentlyBoughtTogether />

        {/* Tabs Section */}
        {/* <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="border-b bg-lime-500">
            <div className="flex  space-x-8 px-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 px-2 border-b-2 font-bold text-md transition-colors ${
                  activeTab === "description"
                    ? "border-white text-white"
                    : "border-transparent text-black hover:text-gray-700"
                }`}
              >
                Product Description
              </button>
              <button
                onClick={() => setActiveTab("information")}
                className={`py-4 px-2 border-b-2 font-bold text-md transition-colors ${
                  activeTab === "information"
                    ? "border-white text-white"
                    : "border-transparent text-black hover:text-gray-700"
                }`}
              >
                More Information
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-2 border-b-2 font-bold text-md transition-colors ${
                  activeTab === "reviews"
                    ? "border-white text-white"
                    : "border-transparent text-black hover:text-gray-700"
                }`}
              >
                Reviews ({reviewStats.totalReviews || 0})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <h3 className="text-lg font-bold mb-4">Product Description</h3>
                <div className="prose max-w-none">
                  <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              </div>
            )}

            {activeTab === "information" && (
              <div>
                <h3 className="text-lg font-bold mb-4">More Information</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Brand</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">
                          {product.brand?.name || product.brand || "N/A"}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                          Model Number
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.sku || "N/A"}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Category</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">
                          {product.category?.name || product.category || "N/A"}
                        </td>
                      </tr>
                      {product.warranty && (
                        <tr className="bg-white">
                          <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Warranty</td>
                          <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.warranty}</td>
                        </tr>
                      )}

                      {product.specifications &&
                        product.specifications.length > 0 &&
                        product.specifications.map((spec, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                              {spec.key}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-gray-700">{spec.value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div data-review-section>
                <ReviewSection productId={product._id} onStatsUpdate={setReviewStats} />
              </div>
            )}
          </div>
        </div> */}









<div className="bg-white rounded-lg shadow-sm mt-8">
  <div className="border-b bg-lime-500">
    <div className="flex px-2 py-2">
      <button
        onClick={() => setActiveTab("description")}
        className={`flex-1 py-3 px-2 mx-1 rounded-lg font-bold text-sm sm:text-md transition-all whitespace-nowrap ${
          activeTab === "description"
            ? "bg-white text-lime-700 shadow-md"
            : "bg-lime-700 text-white hover:bg-lime-800"
        }`}
      >
        <span className="hidden sm:inline">Product </span>Description
      </button>
      <button
        onClick={() => setActiveTab("information")}
        className={`flex-1 py-3 px-2 mx-1 rounded-lg font-bold text-sm sm:text-md transition-all whitespace-nowrap ${
          activeTab === "information"
            ? "bg-white text-lime-700 shadow-md"
            : "bg-lime-700 text-white hover:bg-lime-800"
        }`}
      >
        <span className="hidden sm:inline">More </span>Information
      </button>
      <button
        onClick={() => setActiveTab("reviews")}
        className={`flex-1 py-3 px-2 mx-1  rounded-lg font-bold text-sm sm:text-md transition-all whitespace-nowrap ${
          activeTab === "reviews"
            ? "bg-white text-lime-700 shadow-md"
            : "bg-lime-700 text-white hover:bg-lime-800"
        }`}
      >
        Reviews ({reviewStats.totalReviews || 0})
      </button>
    </div>
  </div>
  <div className="p-6">
    {activeTab === "description" && (
      <div>
        <h3 className="text-lg font-bold mb-4">Product Description</h3>
        <div className="prose max-w-none">
          <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      </div>
    )}

    {activeTab === "information" && (
      <div>
        <h3 className="text-lg font-bold mb-4">More Information</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Brand</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                  {product.brand?.name || product.brand || "N/A"}
                </td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                  Model Number
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.sku || "N/A"}</td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Category</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                  {product.category?.name || product.category || "N/A"}
                </td>
              </tr>
              {product.warranty && (
                <tr className="bg-white">
                  <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Warranty</td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.warranty}</td>
                </tr>
              )}

              {product.specifications &&
                product.specifications.length > 0 &&
                product.specifications.map((spec, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                      {spec.key}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">{spec.value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {activeTab === "reviews" && (
      <div data-review-section>
        <ReviewSection productId={product._id} onStatsUpdate={setReviewStats} />
      </div>
    )}
  </div>
</div>












































































        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          {relatedLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {shuffleArray(relatedProducts)
                .slice(0, 6)
                .map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="bg-white rounded-lg shadow-sm p-4 border hover:shadow-md transition-shadow"
                  >
                    <Link to={`/product/${relatedProduct.slug || relatedProduct._id}`}>
                      <img
                        src={relatedProduct.image || "/placeholder.svg?height=128&width=128"}
                        alt={relatedProduct.name}
                        className="w-full h-32 object-contain mb-2"
                      />
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{relatedProduct.name}</h3>
                      <div className="text-red-600 font-bold text-sm">
                        {relatedProduct.offerPrice > 0
                          ? formatPrice(relatedProduct.offerPrice)
                          : formatPrice(relatedProduct.price)}
                      </div>
                      {relatedProduct.offerPrice > 0 && (
                        <div className="text-gray-400 line-through text-xs">{formatPrice(relatedProduct.price)}</div>
                      )}
                    </Link>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No related products found. Check back later for more recommendations!
            </div>
          )}
        </div>
      </div>

      {/* ADD ONLY THIS LINE */}
      <ProductSchema product={product} />

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowImageModal(false)
              setIsImageZoomed(false)
            }
          }}
        >
          <div className="relative flex h-[90vh] w-[90vw] max-w-7xl bg-white rounded-lg overflow-hidden">
            {/* Sidebar with all images (vertical on desktop, horizontal on mobile) */}
            <div className="hidden md:block w-64 bg-gray-100 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">All Images</h3>
              <div className="space-y-2">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                      index === modalImageIndex ? "border-lime-500" : "border-gray-300"
                    }`}
                    onClick={() => {
                      setModalImageIndex(index)
                      setIsImageZoomed(false)
                    }}
                  >
                    <img
                      src={image || "/placeholder.svg?height=150&width=150"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Horizontal thumbnails for mobile */}
            <div className="md:hidden absolute bottom-0 left-0 w-full bg-gray-100 p-2 flex space-x-2 overflow-x-auto z-10">
              {productImages.map((image, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${
                    index === modalImageIndex ? "border-lime-500" : "border-gray-300"
                  }`}
                  onClick={() => {
                    setModalImageIndex(index)
                    setIsImageZoomed(false)
                  }}
                >
                  <img
                    src={image || "/placeholder.svg?height=64&width=64"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Main image area */}
            <div className="flex-1 flex items-center justify-center relative">
              <img
                src={productImages[modalImageIndex] || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                className={`object-contain bg-white cursor-pointer transition-transform duration-300 ${
                  isImageZoomed ? "max-h-none max-w-none scale-150" : "max-h-full max-w-full"
                }`}
                style={{
                  transformOrigin: isImageZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : "center",
                }}
                onClick={(e) => {
                  if (!isImageZoomed) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    setMousePosition({ x, y })
                  }
                  setIsImageZoomed(!isImageZoomed)
                }}
                onMouseMove={(e) => {
                  if (isImageZoomed) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    setMousePosition({ x, y })
                  }
                }}
              />

              {/* Navigation arrows */}
              <button
                onClick={() => setModalImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setModalImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setShowImageModal(false)
                setIsImageZoomed(false)
              }}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      {/* <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors">
          <MessageCircle size={4} />
        </button>
      </div> */}

      {showCallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm sm:max-w-sm md:max-w-sm lg:max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCallbackModal(false)}
            >
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-1 w-full">
                <h2 className="text-xl  text-center font-bold mb-4">Request a Callback</h2>
                {callbackSuccess ? (
                  <div className="text-green-600 font-medium text-center">Request submitted successfully!</div>
                ) : (
                  <form onSubmit={handleCallbackSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-9">Name</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <User size={26} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={callbackForm.name}
                          onChange={handleCallbackChange}
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-9">Email</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <Mail size={26} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={callbackForm.email}
                          onChange={handleCallbackChange}
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-9">Phone Number</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <Phone size={26} />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={callbackForm.phone}
                          onChange={handleCallbackChange}
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-lime-500 text-white py-2 rounded-md font-medium"
                      disabled={callbackLoading}
                    >
                      {callbackLoading ? "Submitting..." : "Submit Request"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Modal */}
      {showCouponsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseCouponsModal}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Available Coupons</h2>
            {loadingCoupons ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : couponError ? (
              <div className="text-red-500 text-center">{couponError}</div>
            ) : publicCoupons.length === 0 ? (
              <div className="text-gray-500 text-center">No coupons available at the moment.</div>
            ) : (
              <div className="space-y-4">
                {publicCoupons.map((coupon, idx) => {
                  const color = COUPON_COLORS[idx % COUPON_COLORS.length]
                  const categories =
                    coupon.categories && coupon.categories.length > 0
                      ? coupon.categories.map((cat) => cat.name || cat).join(", ")
                      : "All Categories"
                  return (
                    <div key={coupon._id} className="relative flex items-center w-full">
                      {/* Ticket Style - Horizontal Layout */}
                      <div
                        className={`w-full flex shadow-md relative overflow-visible transition-all duration-500 ease-out opacity-0 translate-y-8 animate-fadeInUp ${color.border}`}
                        style={{ minHeight: 100, animationDelay: `${idx * 80}ms`, animationFillMode: "forwards" }}
                      >
                        {/* Left stub - Compact */}
                        <div
                          className={`flex flex-col items-center justify-center py-2 px-2 ${color.stub} border-l-2 border-t-2 border-b-2 ${color.border} rounded-l-lg relative`}
                          style={{ minWidth: 60 }}
                        >
                          <span
                            className="text-[8px] font-bold tracking-widest text-gray-700 rotate-180"
                            style={{ writingMode: "vertical-rl" }}
                          >
                            DISCOUNT
                          </span>
                          {/* Barcode effect - Smaller */}
                          <div
                            className={`w-4 h-6 mt-1 flex flex-col justify-between ${color.barcode}`}
                            style={{ borderRadius: 2 }}
                          >
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-0.5 ${i % 2 === 0 ? "bg-gray-700" : "bg-gray-400"} w-full rounded`}
                              ></div>
                            ))}
                          </div>
                        </div>
                        {/* Main ticket - Responsive Layout */}
                        <div
                          className={`flex-1 ${color.main} border-r-2 border-t-2 border-b-2 ${color.border} rounded-r-lg p-3 flex flex-col md:flex-row md:items-center relative overflow-hidden`}
                        >
                          {/* Cut edges */}
                          <div
                            className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 ${color.border}`}
                          ></div>
                          <div
                            className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 ${color.border}`}
                          ></div>

                          {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
                          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 flex-1">
                            {/* Discount Info */}
                            <div className="flex items-center justify-between md:flex-col md:items-center md:justify-center">
                              <span className="text-xs font-semibold text-gray-500 tracking-widest">GIFT COUPON</span>
                              <span className={`text-xl font-bold flex items-center ${color.text}`}>
                                {coupon.discountType === "percentage" && <Percent className="w-4 h-4 mr-1" />}
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountValue}`
                                  : `AED ${coupon.discountValue}`}
                              </span>
                            </div>

                            {/* Promo Code */}
                            <div className="flex flex-col items-center flex-1">
                              <span className="block text-sm font-bold text-gray-900 mb-2">PROMO CODE</span>
                              <div className="flex items-center w-full justify-center">
                                <span
                                  className={`inline-block bg-white border ${color.border} rounded px-3 py-1 font-mono text-sm font-bold ${color.text} tracking-widest`}
                                >
                                  {coupon.code}
                                </span>
                                <button
                                  className={`ml-2 px-2 py-1 text-xs ${color.stub} hover:brightness-110 text-black rounded transition-colors font-semibold border ${color.border} focus:outline-none focus:ring-2 focus:ring-yellow-300`}
                                  onClick={() => handleCopyCoupon(coupon.code, coupon._id)}
                                >
                                  {couponCopied === coupon._id ? "Copied!" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Details - Mobile: Full width, Desktop: Right aligned */}
                          <div className="flex flex-col md:items-end text-left md:text-right space-y-1 mt-3 md:mt-0">
                            <div className="text-xs text-gray-600 md:max-w-xs">{coupon.description}</div>
                            <div className="flex flex-col md:items-end space-y-1">
                              <div className="text-xs text-gray-500">Min: AED {coupon.minOrderAmount || 0}</div>
                              <div className="text-xs text-gray-500">
                                Valid: {new Date(coupon.validFrom).toLocaleDateString()} -{" "}
                                {new Date(coupon.validUntil).toLocaleDateString()}
                              </div>
                              <div className="text-xs font-semibold text-gray-700">{categories}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <style>{`
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(32px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeInUp {
                animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
              }
            `}</style>
          </div>
        </div>
      )}

      {showTamaraModal && <TamaraModal amount={getEffectivePrice()} onClose={() => setShowTamaraModal(false)} />}
      {showTabbyModal && <TabbyModal amount={getEffectivePrice()} onClose={() => setShowTabbyModal(false)} />}
    </div>
  )
}

export default ProductDetails
