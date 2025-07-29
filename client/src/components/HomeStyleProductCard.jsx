import { Link } from "react-router-dom"
import { Heart, Star } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"
import { useToast } from "../context/ToastContext"
import { getImageUrl } from "../utils/imageUtils"

const getStatusColor = (status) => {
  if (status === "Available Product" || status === "Available") return "bg-green-600"
  if (status === "Stock Out" || status === "Out of Stock") return "bg-red-600"
  if (status === "Pre-Order") return "bg-yellow-400 text-black"
  return "bg-gray-400"
}

const HomeStyleProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { showToast } = useToast()
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Treat both 'Available' and 'Available Product' as available
  const isAvailable = (product.stockStatus === "Available" || product.stockStatus === "Available Product" || (!product.stockStatus && product.countInStock > 0))
  const stockStatus = isAvailable ? "Available" : (product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock"))
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
  const rating = product.rating || 0
  const numReviews = product.numReviews || 0
  const categoryName = product.category?.name || "Unknown"
  
  // Debug product images


  return (
    <div className="border bg-white rounded-lg p-3  hover:shadow-md transition-shadow min-h-[370px] max-h-[380px] min-w-[190px] max-w-[200px] flex flex-col justify-between">
      <div className="relative mb-2  flex justify-center items-center min-h-[160px] max-h-[160px]">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-full h-full cover rounded mx-auto"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=150&width=150"
            }}
          />
        </Link>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
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
          <Heart size={14} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        {isAvailable ? (
          <>
            <div className={`${getStatusColor("Available") } text-white px-2 py-1 rounded text-xs font-bold inline-block mr-1`}>
              Available
            </div>
            {discount && (
              <div className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold inline-block">{discount}</div>
            )}
          </>
        ) : (
          <>
            <div className={`${getStatusColor(stockStatus)} text-white px-2 py-1 rounded text-xs font-bold inline-block mr-1`}>
              {stockStatus}
            </div>
            {discount && (
              <div className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold inline-block">{discount}</div>
            )}
          </>
        )}
      </div>
      <Link to={`/product/${product.slug || product._id}`}>
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-gray-500 mb-1">Category: {categoryName}</div>}
      <div className="text-xs text-gray-500 mb-2">Inclusive VAT</div>
      <div className="mb-1">
        <div className="text-red-600 font-bold text-base md:text-lg">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-sm font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>
      <div className="flex items-center mt-auto">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={10}
            className={`${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
      </div>
    </div>
  )
}

export default HomeStyleProductCard
