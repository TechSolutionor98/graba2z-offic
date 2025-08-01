"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingCart, Heart, Star } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"
import { useToast } from "../context/ToastContext"

const CampaignProductCard = ({ product }) => {
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
  const showOldPrice = hasValidOffer || hasDiscount
  
  // Determine which price to display
  let priceToShow = 0
  if (hasValidOffer) {
    priceToShow = offerPrice
  } else if (basePrice > 0) {
    priceToShow = basePrice
  } else if (offerPrice > 0) {
    priceToShow = offerPrice
  }

  const stockStatus = product.stockStatus || (product.countInStock > 0 ? 'Available Product' : 'Out of Stock')
  // If stockStatus is explicitly set, use it. Otherwise, check countInStock
  const isOutOfStock = product.stockStatus 
    ? stockStatus === 'Out of Stock'
    : (product.countInStock <= 0)

  // Get category name
  const categoryName = product.category?.name || product.parentCategory?.name || 'N/A'

  // Get specifications to display
  const getSpecifications = () => {
    if (!product.specifications || product.specifications.length === 0) {
      return []
    }
    
    // Common spec keys to look for
    const commonSpecs = ['Processor', 'RAM', 'Storage', 'Graphics', 'Display', 'Screen', 'OS', 'Operating System']
    
    return product.specifications
      .filter(spec => commonSpecs.some(key => spec.key.toLowerCase().includes(key.toLowerCase())))
      .slice(0, 6) // Show max 6 specs
  }

  const specs = getSpecifications()

  return (
    <Link to={productUrl} className="block">
      <div className="bg-white rounded-lg border-4 border-lime-500 overflow-hidden hover:shadow-lg transition-all duration-300 max-w-sm mx-auto">
        <div className="relative bg-gray-50 p-6">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-contain mx-auto"
          />
          
          {/* Wishlist button */}
          <button
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500 transition-colors"
            onClick={e => {
              e.preventDefault(); e.stopPropagation();
              if (isInWishlist(product._id)) {
                removeFromWishlist(product._id);
                showToast && showToast("Removed from wishlist", "info");
              } else {
                addToWishlist(product);
                showToast && showToast("Added to wishlist", "success");
              }
            }}
            aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={24} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
          </button>
        </div>
        
        <div className="p-4">
          {/* Stock status badge */}
          <div className={`inline-block px-3 py-1 rounded text-sm font-bold mb-3 ${
            stockStatus === 'Available Product' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {stockStatus}
          </div>
          
          {/* Product Name */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-3 leading-tight">
            {product.name}
          </h3>
          
          {/* Category */}
          <div className="text-sm text-orange-500 mb-2 font-medium">
            Category: {categoryName}
          </div>
          
          {/* VAT Info */}
          <div className="text-sm text-gray-600 mb-3">
            Inclusive VAT
          </div>
          
          {/* Pricing */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-600 text-xl">
                {priceToShow > 0 ? formatPrice(priceToShow) : 'Contact for Price'}
              </span>
              {showOldPrice && basePrice > 0 && (
                <span className="text-gray-400 line-through text-base">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">({product.numReviews || 0})</span>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={isOutOfStock ? undefined : handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 font-semibold flex items-center justify-center gap-2 ${
              isOutOfStock 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <ShoppingCart size={18} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default CampaignProductCard