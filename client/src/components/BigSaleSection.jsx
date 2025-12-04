"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart, Star, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"
import { useWishlist } from "../context/WishlistContext"
import { useCart } from "../context/CartContext"
import { getFullImageUrl } from "../utils/imageUtils"

// Reusable product card component used in both desktop and mobile views
const ProductCard = ({ product, isMobile = false }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  const basePrice = Number(product.price) || 0
  const offerPrice = Number(product.offerPrice) || 0

  // Show offer price if it exists and is less than base price
  const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
  const showOldPrice = hasValidOffer

  // Determine which price to display
  let priceToShow = 0
  if (hasValidOffer) {
    priceToShow = offerPrice
  } else if (basePrice > 0) {
    priceToShow = basePrice
  } else if (offerPrice > 0) {
    priceToShow = offerPrice
  }

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0
  const categoryName = product.category?.name || ""

  const cardClasses = isMobile
    ? "bg-white rounded-lg p-4 shadow-md relative h-full flex flex-col"
    : "bg-white rounded-lg p-4 shadow-lg relative"
  const imageContainerClasses = isMobile ? "w-full h-40 mb-2" : "p-1 w-full h-[180px] mb-2"
  const imageClasses = isMobile ? "w-full h-full object-contain rounded" : "w-full h-full cover rounded mb-5"
  const titleClasses = isMobile
    ? "text-sm font-medium text-black mb-1 line-clamp-2 hover:text-blue-400 flex-grow"
    : "text-xs font-medium text-black mb-2 line-clamp-2 hover:text-blue-400"

  return (
    <div className="border p-2 h-[360px] flex flex-col justify-between bg-white w-full box-border">
      <div className="relative mb-2 flex h-[150px] justify-center items-cente">
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`}>
          <img
            src={getFullImageUrl(product.image) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            className="w-full h-full cover object-contain rounded mx-auto"
          />
        </Link>
        <button
          className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
          }}
          aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={11} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
      </div>
      <div className="mb-1 flex items-center gap-2 ">
        <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-[10px]  inline-block mr-1`}>
          {stockStatus}
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-[10px]  inline-block">{discount}</div>
        )}
      </div>
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`}>
        <h3 className="text-[11px] font-sm text-gray-900  line-clamp-3 hover:text-blue-600 h-[45px]">{product.name}</h3>
      </Link>
      {product.category && <div className="text-[10px] text-yellow-600 ">Category: {categoryName}</div>}
      <div className="text-[10px] text-green-600">Inclusive VAT</div>
      <div className="flex items-center gap-2">
        <div className="text-red-600 font-bold text-xs">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-[10px] font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed */}
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={`${i < Math.round(Number(product.rating) || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-[10px] text-gray-500 ml-1">({Number(product.numReviews) || 0})</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Immediate visual feedback
          e.target.style.transform = "scale(1)"
          setTimeout(() => {
            if (e.target) e.target.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className="mt-2 w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-[10px] font-medium py-1.5 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={11} />
        Add to Cart
      </button>
    </div>
  )
}

// Helper function to determine status color
const getStatusColor = (status) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes("available")) return "bg-green-600 hover:bg-green-700"
  if (statusLower.includes("out of stock") || statusLower.includes("outofstock")) return "bg-red-600 hover:bg-red-700"
  if (statusLower.includes("pre-order") || statusLower.includes("preorder")) return "bg-blue-600 hover:bg-blue-700"
  if (statusLower.includes("limited") || statusLower.includes("low stock")) return "bg-yellow-500 hover:bg-yellow-600"
  return "bg-gray-600 hover:bg-gray-700"
}

const BigSaleSection = ({ products = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [is2XLScreen, setIs2XLScreen] = useState(false)
  const [isZoomed125, setIsZoomed125] = useState(false)
  const [isZoomed125Plus, setIsZoomed125Plus] = useState(false)
  const [cardsToDisplay, setCardsToDisplay] = useState(4)
  const [isZoomedOut, setIsZoomedOut] = useState(false)
  const containerRef = useRef(null)
  const [itemWidth, setItemWidth] = useState(0)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIs2XLScreen(window.innerWidth >= 1536) // 2xl breakpoint
    }

    // Set initial value
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Compute item pixel width from container - responsive to zoom levels
  useEffect(() => {
    const computeWidth = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const containerWidth = container.clientWidth
      
      // Detect zoom level
      const zoom = window.devicePixelRatio || 1
      let cardsToShow = 4 // Default at 100% zoom
      let isZoomed = false
      let isZoom125Plus = false
      let isZoomOut = false
      
      // Always show 4 cards at all zoom levels
      cardsToShow = 4
      
      if (zoom >= 1.2) {
        // 125%, 150%+ zoom: show 4 cards and show logo
        isZoomed = true
        isZoom125Plus = true
      } else if (zoom <= 0.9) {
        // 90%, 80%, 75% zoom out: show 4 cards
        isZoomOut = true
      }
      
      setIsZoomed125(isZoomed)
      setIsZoomed125Plus(isZoom125Plus)
      setIsZoomedOut(isZoomOut)
      setCardsToDisplay(cardsToShow)
      
      // Account for mx-3 (12px left + 12px right = 24px total)
      const availableWidth = containerWidth - 24
      
      // Calculate gaps between cards
      const gapTotal = (cardsToShow - 1) * 4 // gap-1 = 4px
      const computed = Math.floor((availableWidth - gapTotal) / cardsToShow)
      setItemWidth(computed > 0 ? computed : 0)
    }

    computeWidth()
    window.addEventListener('resize', computeWidth)
    const timer = setInterval(computeWidth, 500)
    return () => {
      window.removeEventListener('resize', computeWidth)
      clearInterval(timer)
    }
  }, [])

  const nextSlide = () => {
    if (currentSlide < products.length - 4) {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }

  // If no products, don't render anything
  if (!products || products.length === 0) return null

  // Only show on desktop (md and above)
  return (
    <section className="relative my-6 hidden md:block overflow-hidden" style={{ minHeight: "400px" }}>
      {/* Background image - hidden at 125%+ zoom */}
      {!isZoomed125Plus && (
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              // Different images for different zoom levels and screen sizes
              backgroundImage: 
                isZoomedOut
                  ? "url(discount.png)" // 90%, 80%, 75% zoom out
                  : cardsToDisplay === 2 
                    ? "url(resize00.png)" // 150%+ zoom - 2 cards
                    : cardsToDisplay === 3 
                      ? "url()" // 125% zoom - 3 cards
                      : is2XLScreen 
                        ? "url(discount2.png)" // 2xl screens at 100%
                        : "url(discount.png)", // Normal 100% zoom
              height: "100%",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              minHeight: "420px",
              "@media (min-width: 1024px)": {
                minHeight: "480px",
              },
              "@media (min-width: 1280px)": {
                minHeight: "520px",
              },
            }}
          ></div>
        </div>
      )}

      <div className={`relative w-full px-5 ${isZoomed125Plus ? 'bg-[#53a132]' : ''}`}>
        <div className="flex items-center gap-4">
          {/* Logo Section - 30% */}
          <div className="w-[30%] flex items-center justify-center py-8">
            <div className="w-full h-full flex items-center justify-center">
              {/* Logo - shown at 125%+ zoom, hidden before that */}
              {isZoomed125Plus && (
                <img 
                  src="discountshado.png" 
                  alt="" 
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              )}
            </div>
          </div>

          {/* Cards Section - 70% */}
          <div className="w-[70%] relative" ref={containerRef}>
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 translate-x-2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-200"
              style={{ marginLeft: "-20px" }}
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlide >= products.length - cardsToDisplay}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-200"
              style={{ marginRight: "-20px" }}
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>

            <div className="overflow-hidden my-5 mx-3">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-1"
                style={{ transform: `translateX(-${currentSlide * (itemWidth + 4)}px)` }}
              >
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex-shrink-0 box-border"
                    style={itemWidth ? { flex: `0 0 ${itemWidth}px`, maxWidth: `${itemWidth}px` } : { flex: '0 0 25%', maxWidth: '25%' }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BigSaleSection
