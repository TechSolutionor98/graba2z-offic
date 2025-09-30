"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingCart, Heart, Star, ShoppingBag } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"
import { useToast } from "../context/ToastContext"

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    showToast && showToast("Added to cart", "success")
  }

  const formatPrice = (price) => {
    return `AED ${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  // Use slug if available, otherwise fall back to ID
  const productUrl = `/product/${product.slug || product._id}`

  // Determine which price to show
  const hasDiscount = product.discount && Number(product.discount) > 0
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
  
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0

  return (
    <div className="card group border rounded-lg overflow-hidden bg-white h-full flex flex-col">
      <Link to={productUrl} className="block flex-1 flex flex-col">
        <div className="relative overflow-hidden flex-shrink-0">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold">
              {Number(product.discount)}% Off
            </span>
          )}
          {/* Stock status badge */}
          <span
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${stockStatus === "Available" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {stockStatus}
          </span>
          <button
            className="absolute top-2 right-10 z-10 bg-white rounded-full p-2 shadow hover:bg-red-50"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (isInWishlist(product._id)) {
                removeFromWishlist(product._id)
                showToast && showToast("Removed from wishlist", "info")
              } else {
                addToWishlist(product)
                showToast && showToast("Added to wishlist", "success")
              }
            }}
            aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={20} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
          </button>
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              className="bg-white text-gray-900 py-2 px-4 rounded-full font-medium flex items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2">{product.brand?.name || product.brand || "N/A"}</p>

          {/* Rating and Reviews Section - Updated */}
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
          </div>

          <div className="mb-1">
            <span className="font-bold text-red-600 text-lg">{formatPrice(priceToShow)}</span>
          </div>
          {showOldPrice && (
            <div className="text-xs text-gray-400 line-through font-medium mb-1">{formatPrice(basePrice)}</div>
          )}
          <div className="text-xs text-gray-500 mb-1">Inclusive VAT</div>
          
          {/* Mobile Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="mt-auto w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-sm font-medium py-2 px-2 rounded flex items-center justify-center gap-1 transition-all duration-200 md:hidden"
            disabled={stockStatus === "Out of Stock"}
          >
            <ShoppingBag size={14} />
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard