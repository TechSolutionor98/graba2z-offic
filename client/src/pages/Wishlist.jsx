import { useWishlist } from "../context/WishlistContext"
import { Link } from "react-router-dom"
import { Trash2 } from "lucide-react"

const Wishlist = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlist()

  if (loading) return <div className="max-w-3xl mx-auto py-12 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist</h1>
      {Array.isArray(wishlist) && wishlist.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Your wishlist is empty.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(Array.isArray(wishlist) ? wishlist : []).map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <Link to={`/product/${product.slug || product._id}`} className="flex-1 flex flex-col items-center">
                <img src={product.image || "/placeholder.svg"} alt={product.name} className="h-[150px] cover rounded mb-4" />
                <div className="font-medium text-gray-900 text-center mb-1">{product.name.length > 40 ? product.name.slice(0, 40) + "..." : product.name}</div>
                <div className="text-gray-500 text-sm mb-2">{product.brand?.name || product.brand || ""}</div>
                {product.category && (
                  <div className="text-xs text-gray-500 mb-1">Category: {product.category?.name || product.category || 'N/A'}</div>
                )}
                {product.subCategory && (
                  <div className="text-xs text-gray-500 mb-1">Subcategory: {product.subCategory?.name || product.subCategory || 'N/A'}</div>
                )}
                <div className="text-lg font-bold text-red-600 mb-2">
                  {product.price ? `AED ${product.price.toLocaleString()}` : ""}
                </div>
              </Link>
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="mt-2 text-red-500 hover:text-red-700 flex items-center justify-center border border-red-200 rounded px-3 py-1"
                aria-label="Remove from wishlist"
              >
                <Trash2 size={18} className="mr-1" /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
