// import { Link } from "react-router-dom"
// import { Heart, Star, ShoppingBag } from "lucide-react"
// import { useWishlist } from "../context/WishlistContext"
// import { useCart } from "../context/CartContext"
// import { useToast } from "../context/ToastContext"
// import { getImageUrl } from "../utils/imageUtils"

// const getStatusColor = (status) => {
//   if (status === "Available Product" || status === "Available") return "bg-green-600"
//   if (status === "Stock Out" || status === "Out of Stock") return "bg-red-600"
//   if (status === "Pre-Order") return "bg-yellow-400 text-black"
//   return "bg-gray-400"
// }

// const HomeStyleProductCard = ({ product }) => {
//   const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
//   const { addToCart } = useCart()
//   const { showToast } = useToast()
//   const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
//   // Treat both 'Available' and 'Available Product' as available
//   const isAvailable = (product.stockStatus === "Available" || product.stockStatus === "Available Product" || (!product.stockStatus && product.countInStock > 0))
//   const stockStatus = isAvailable ? "Available" : (product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock"))
//   const basePrice = Number(product.price) || 0
//   const offerPrice = Number(product.offerPrice) || 0
  
//   // Show offer price if it exists and is less than base price
//   const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
//   const showOldPrice = hasValidOffer
  
//   // Determine which price to display
//   let priceToShow = 0
//   if (hasValidOffer) {
//     priceToShow = offerPrice
//   } else if (basePrice > 0) {
//     priceToShow = basePrice
//   } else if (offerPrice > 0) {
//     priceToShow = offerPrice
//   }
//   const rating = product.rating || 0
//   const numReviews = product.numReviews || 0
//   const categoryName = product.category?.name || "Unknown"
  
//   // Debug product images


//   return (
//     <div className="border p-2 h-[400px] flex flex-col justify-between bg-white">
//       <div className="relative mb-2 flex h-[180px] justify-center items-cente">
//         <Link to={`/product/${product.slug || product._id}`}>
//           <img
//             src={getImageUrl(product)}
//             alt={product.name}
//             className="w-full h-full cover object-contain rounded mx-auto"
//             onError={(e) => {
//               e.target.src = "/placeholder.svg?height=120&width=120"
//             }}
//           />
//         </Link>
//         <button
//           className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
//           onClick={(e) => {
//             e.preventDefault()
//             e.stopPropagation()
//             isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
//           }}
//           aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
//         >
//           <Heart size={12} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
//         </button>
//       </div>
//       <div className="mb-1 flex items-center gap-2 ">
//         <div
//           className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-xs  inline-block mr-1`}
//         >
//           {stockStatus}
//         </div>
//         {discount && (
//           <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs  inline-block">{discount}</div>
//         )}
//       </div>
//       <Link to={`/product/${product.slug || product._id}`}>
//         <h3 className="text-xs font-sm text-gray-900  line-clamp-4 hover:text-blue-600 h-[65px]">{product.name}</h3>
//       </Link>
//       {product.category && <div className="text-xs text-yellow-600 ">Category: {categoryName}</div>}
//       <div className="text-xs text-green-600">Inclusive VAT</div>
//       <div className="flex items-center gap-2">
//         <div className="text-red-600 font-bold text-sm">
//           {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
//         </div>
//         {showOldPrice && (
//           <div className="text-gray-400 line-through text-xs font-medium">
//             {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
//           </div>
//         )}
//       </div>
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star
//             key={i}
//             size={14}
//             className={`${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
//           />
//         ))}
//         <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
//       </div>
//       <button
//         onClick={(e) => {
//           e.preventDefault()
//           e.stopPropagation()
//           // Immediate visual feedback
//           e.target.style.transform = 'scale(0.95)'
//           setTimeout(() => {
//             if (e.target) e.target.style.transform = 'scale(1)'
//           }, 100)
//           addToCart(product)
//         }}
//         className="mt-2 w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
//         disabled={stockStatus === "Out of Stock"}
//       >
//         <ShoppingBag size={12} />
//         Add to Cart
//       </button>
//     </div>
//   )
// }

// export default HomeStyleProductCard



// =========================

"use client"

import { Link } from "react-router-dom"
import { Heart, Star, ShoppingBag } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"
import { useCart } from "../context/CartContext"
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
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Treat both 'Available' and 'Available Product' as available
  const isAvailable =
    product.stockStatus === "Available" ||
    product.stockStatus === "Available Product" ||
    (!product.stockStatus && product.countInStock > 0)
  const stockStatus = isAvailable
    ? "Available"
    : product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
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
  const categoryName = product.category?.name || "Unknown"

  // Debug product reviews
  console.log("HomeStyleProductCard - Product:", product.name, "Rating:", rating, "NumReviews:", numReviews)

  return (
    <div className="border p-2 h-[400px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex h-[180px] justify-center items-cente">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={getImageUrl(product) || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full cover object-contain rounded mx-auto"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=120&width=120"
            }}
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
          <Heart size={12} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
      </div>
      <div className="mb-1 flex items-center gap-2 ">
        <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-xs  inline-block mr-1`}>
          {stockStatus}
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs  inline-block">{discount}</div>
        )}
      </div>
      <Link to={`/product/${product.slug || product._id}`}>
        <h3 className="text-xs font-sm text-gray-900  line-clamp-4 hover:text-blue-600 h-[65px]">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-yellow-600 ">Category: {categoryName}</div>}
      <div className="text-xs text-green-600">Inclusive VAT</div>
      <div className="flex items-center gap-2">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed */}
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={`${i < Math.round(Number(product.rating) || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({Number(product.numReviews) || 0})</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Immediate visual feedback
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => {
            if (e.target) e.target.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className="w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        Add to Cart
      </button>
    </div>
  )
}

export default HomeStyleProductCard
