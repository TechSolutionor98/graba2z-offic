import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { productsAPI } from "../services/api"
import CampaignProductCard from "../components/CampaignProductCard"

// Helper function to determine status color
const getStatusColor = (status) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('available')) return 'bg-green-600 hover:bg-green-700'
  if (statusLower.includes('out of stock') || statusLower.includes('outofstock')) return 'bg-red-600 hover:bg-red-700'
  if (statusLower.includes('pre-order') || statusLower.includes('preorder')) return 'bg-blue-600 hover:bg-blue-700'
  if (statusLower.includes('limited') || statusLower.includes('low stock')) return 'bg-yellow-500 hover:bg-yellow-600'
  return 'bg-gray-600 hover:bg-gray-700'
}

const BackToSchoolGaming = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false) // Start with false for instant display
  const [error, setError] = useState(null)

  // Gaming laptop SKUs
  const gamingSkus = [
    "NH.QTREM.001",
    "NH.QTQEM.001"
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch ONLY the specific products by SKU
        const gamingProducts = await productsAPI.getBySkus(gamingSkus)

        console.log('Gaming products found:', gamingProducts.length)
        console.log('Found products:', gamingProducts.map(p => ({ sku: p.sku, name: p.name })))

        setProducts(gamingProducts)
      } catch (err) {
        console.error("Error fetching gaming products:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-">
      {/* Banner Section */}
      <div className="">
        {/* Background Image */}
        <div className=" inset-0">
          <img
            src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754030807/acer_2_d5wwif.png"
            alt="Acer Gaming Laptops"
            className="w-full h-[200px] lg:h-full bg-cover mt-2"
          />
        </div>


      </div>


      {/* Punchline Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto  text-center">
          <h2 className="text-2xl md:text-5xl font-bold text-lime-500 mb-6">
            Empowered by Play, Driven by Purpose
          </h2>
          <p>Elevate the Fight. Transcend the Game</p>
        </div>

        {/* Banner Image - Full Width */}
        <div className="mt-8">
          <img
            src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754135972/gaming_banner_ynj5s5.png"
            alt="Gaming Banner"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>


      <div className="container mx-auto  text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
          Best Gaming Laptops
        </h2>
      </div>

      {/* Professional Laptops Collection Section */}
      <section className="relative my-6 overflow-hidden" style={{ minHeight: '420px' }}>

        {/* Content Container */}
        <div className="relative max-w-8xl px-2">
          <div className="flex justify-center md:justify-center">
            <div className="w-full 2xl:max-w-[1170px] max-w-[900px] relative">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-white text-xl mb-4">No gaming laptops found</div>
                  <p className="text-gray-200">Please check back later or contact us for availability.</p>
                </div>
              ) : (
                <div className="overflow-hidden my-5">
                  <div className="flex gap-2 justify-center">
                    {products.slice(0, 2).map((product) => (
                      <div key={product._id} className="flex-shrink-0">
                        <div className="border p-2  flex flex-col justify-between bg-white" style={{ width: "190px" }}>
                          <div className="relative mb-2 flex h-[] justify-center items-center">
                            <Link to={`/product/${product.slug || product._id}`}>
                              <img
                                src={product.image || "/placeholder.svg?height=120&width=120"}
                                alt={product.name}
                                className="rounded w-full h-full mx-auto"
                              />
                            </Link>
                          </div>
                          <div className="mb-1 flex items-center gap-2">
                            <div className={`${getStatusColor(product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock"))} text-white px-1 py-0.5 rounded text-xs inline-block mr-1`}>
                              {(product.stockStatus && product.stockStatus.replace(/^\d+\s*/, '').trim()) || (product.countInStock > 0 ? "Available" : "Out of Stock")}
                            </div>
                            {product.discount && Number(product.discount) > 0 && (
                              <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs inline-block">{product.discount}% Off</div>
                            )}
                          </div>
                          <Link to={`/product/${product.slug || product._id}`}>
                            <h3 className="text-xs font-sm text-gray-900 line-clamp-4 hover:text-blue-600 h-[65px]">{product.name}</h3>
                          </Link>
                          {product.category && <div className="text-xs text-yellow-600">Category: {product.category?.name || product.category}</div>}
                          <div className="text-xs text-green-600">Inclusive VAT</div>
                          <div className="flex items-center gap-2">
                            <div className="text-red-600 font-bold text-sm">
                              {Number(product.offerPrice && product.offerPrice < product.price ? product.offerPrice : product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
                            </div>
                            {product.offerPrice && product.offerPrice < product.price && (
                              <div className="text-gray-400 line-through text-xs font-medium">
                                {Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
                              </div>
                            )}
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({product.numReviews || 0})</span>
                          </div>
                          <Link
                            to={`/product/${product.slug || product._id}`}
                            className="mt-2 w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose Acer Gaming Laptops?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">High Performance</h3>
              <p className="text-gray-600">
                Powered by Intel Core i7 processors and NVIDIA RTX graphics for ultimate gaming performance.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">165Hz Display</h3>
              <p className="text-gray-600">
                Ultra-smooth 165Hz refresh rate for fluid gameplay and reduced motion blur.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Backlit Keyboard</h3>
              <p className="text-gray-600">
                RGB backlit keyboard for gaming in any lighting condition with customizable colors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Professional Laptops Banner */}
      <Link to="/backtoschool-acer-professional" className="block md:hidden">
        <div className="relative h-48 overflow-hidden group cursor-pointer">
          {/* Background Image for Mobile */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: 'url("https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754296232/professional_f9wntl.png")'
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white transform transition-all duration-300 group-hover:scale-110">
              <h2 className="text-2xl font-bold mb-4">
                Shop Professional Laptops
              </h2>
              <div className="w-16 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>
      </Link>

      {/* Desktop Professional Laptops Banner */}
      <Link to="/backtoschool-acer-professional" className="hidden md:block">
        <div className="relative h-80 overflow-hidden group cursor-pointer">
          {/* Background Image for Desktop */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: 'url("https://res.cloudinary.com/dyfhsu5v6/image/upload/v1754034599/acer_3_aoqkw2.png")'
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white transform transition-all duration-300 group-hover:scale-110">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                Shop Professional Laptops
              </h2>
              <div className="w-24 h-1 bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"></div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default BackToSchoolGaming