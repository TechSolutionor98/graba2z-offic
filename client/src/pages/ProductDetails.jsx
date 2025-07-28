"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Share2,
  Truck,
  RotateCcw,
  Award,
  Percent,
} from "lucide-react"
import { productsAPI } from "../services/api.js"

import config from "../config/config"

const WHATSAPP_NUMBER = '971508604360'; // Replace with your WhatsApp number

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal || !product) return

      const productImages = product.galleryImages && product.galleryImages.length > 0
        ? [product.image, ...product.galleryImages.filter((img) => img)]
        : [product.image]

      if (e.key === 'ArrowLeft') {
        setModalImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1)
      } else if (e.key === 'ArrowRight') {
        setModalImageIndex(prev => prev < productImages.length - 1 ? prev + 1 : 0)
      } else if (e.key === 'Escape') {
        setShowImageModal(false)
        setIsImageZoomed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, product])

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    name: user?.name || "",
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  const [relatedLoading, setRelatedLoading] = useState(true);
  const [showCouponsModal, setShowCouponsModal] = useState(false)
  const [publicCoupons, setPublicCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [couponError, setCouponError] = useState(null)
  const [couponCopied, setCouponCopied] = useState(null)

  const formatPrice = (price) => {
    return `${Number(price).toLocaleString()}.00 AED`
  }

  useEffect(() => {
    console.log('slug from useParams:', slug)
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  useEffect(() => {
    if (product) {
      fetchRelatedProducts()
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      console.log('Fetching product for slug:', slug)
      const data = await productsAPI.getBySlug(slug)
      console.log('API response for product:', data)
      setProduct(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Failed to load product details. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    setRelatedLoading(true);
    try {
      // Try to get related products from the same category
      let { data } = await axios.get(`${config.API_URL}/api/products?category=${product.category._id}&limit=12`);
      let filtered = data.filter((p) => p._id !== product._id);
      if (filtered.length === 0) {
        // If no related products, fetch all products and pick random ones (excluding current)
        const allRes = await axios.get(`${config.API_URL}/api/products`);
        filtered = allRes.data.filter((p) => p._id !== product._id);
      }
      setRelatedProducts(filtered);
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setRelatedLoading(false);
    }
  }

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value
    if (newQuantity > 0 && newQuantity <= (product.maxPurchaseQty || 10)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (product.stockStatus === "Out of Stock") {
      showToast("Product is out of stock", "error")
      return
    }
    addToCart(product, quantity)
  }

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleImageClick = (index) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  const handleModalNavigation = (direction) => {
    const totalImages = productImages.length
    if (direction === "next") {
      setModalImageIndex((prev) => (prev + 1) % totalImages)
    } else {
      setModalImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      showToast("Please login to write a review", "error")
      navigate("/login")
      return
    }

    if (!reviewData.comment.trim()) {
      showToast("Please write a comment", "error")
      return
    }

    try {
      setSubmittingReview(true)
      // Check both userToken and adminToken
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken")
      if (!token) {
        showToast("Please login to write a review", "error")
        navigate("/login")
        return
      }

      await axios.post(
        `${config.API_URL}/api/products/${product._id}/reviews`,
        {
          rating: reviewData.rating,
          comment: reviewData.comment,
          name: reviewData.name || user.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      showToast("Review submitted successfully!", "success")
      setShowReviewForm(false)
      setReviewData({ rating: 5, comment: "", name: user?.name || "" })
      fetchProduct()
    } catch (error) {
      console.error("Error submitting review:", error)
      showToast(error.response?.data?.message || "Failed to submit review", "error")
    } finally {
      setSubmittingReview(false)
    }
  }

  // Auto-slide images every 5 seconds
  useEffect(() => {
    if (product && productImages.length > 1) {
      const interval = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % productImages.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [product])

  const handleCallbackChange = (e) => {
    const { name, value } = e.target;
    setCallbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    setCallbackLoading(true);
    try {
      await axios.post('${config.API_URL}/api/request-callback', callbackForm);
      setCallbackSuccess(true);
      setTimeout(() => {
        setShowCallbackModal(false);
        setCallbackSuccess(false);
        setCallbackForm({ name: user?.name || '', email: user?.email || '', phone: '' });
      }, 2000);
    } catch (error) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setCallbackLoading(false);
    }
  };

  // Fisher-Yates shuffle for randomizing related products
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const fetchPublicCoupons = async () => {
    setLoadingCoupons(true)
    setCouponError(null)
    try {
      const { data } = await axios.get(`${config.API_URL}/api/coupons`)
      setPublicCoupons(data)
    } catch (err) {
      setCouponError("Failed to load coupons. Please try again later.")
    } finally {
      setLoadingCoupons(false)
    }
  }

  const handleOpenCouponsModal = () => {
    fetchPublicCoupons()
    setShowCouponsModal(true)
  }
  const handleCloseCouponsModal = () => setShowCouponsModal(false)

  // Copy coupon code to clipboard
  const handleCopyCoupon = useCallback((code, id) => {
    navigator.clipboard.writeText(code)
    setCouponCopied(id)
    setTimeout(() => setCouponCopied(null), 1200)
  }, [])

  // Coupon color palette
  const COUPON_COLORS = [
    {
      main: 'bg-yellow-100 border-yellow-400',
      stub: 'bg-yellow-300',
      text: 'text-yellow-700',
      border: 'border-yellow-400',
      barcode: 'bg-yellow-200',
    },
    {
      main: 'bg-blue-100 border-blue-400',
      stub: 'bg-blue-300',
      text: 'text-blue-700',
      border: 'border-blue-400',
      barcode: 'bg-blue-200',
    },
    {
      main: 'bg-green-100 border-green-400',
      stub: 'bg-green-300',
      text: 'text-green-700',
      border: 'border-green-400',
      barcode: 'bg-green-200',
    },
    {
      main: 'bg-pink-100 border-pink-400',
      stub: 'bg-pink-300',
      text: 'text-pink-700',
      border: 'border-pink-400',
      barcode: 'bg-pink-200',
    },
    {
      main: 'bg-orange-100 border-orange-400',
      stub: 'bg-orange-300',
      text: 'text-orange-700',
      border: 'border-orange-400',
      barcode: 'bg-orange-200',
    },
  ]

  console.log('Render: loading =', loading, ', product =', product, ', error =', error)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <img
          src="/g.png"
          alt="Loading"
          className="w-24 h-24 animate-bounce"
          style={{ animationDuration: "1.5s" }}
        />
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

  const productImages =
    product.galleryImages && product.galleryImages.length > 0
      ? [product.image, ...product.galleryImages.filter((img) => img)]
      : [product.image]

  const getStockBadge = () => {
    switch (product.stockStatus) {
      case "Available Product":
        return <span className="bg-lime-500 text-white px-3 py-1 rounded text-sm font-bold">In stock</span>
      case "Out of Stock":
        return <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">Out of stock</span>
      case "PreOrder":
        return <span className="bg-orange-500 text-white px-1 rounded text-sm font-medium">Pre Order</span>
      default:
        return null
    }
  }

  const getDiscountBadge = () => {
    if (product.discount > 0) {
      return (
        <span className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-bold">{product.discount}% Off</span>
      )
    }
    return null
  }

  return (
    <div className="bg-white min-h-screen">
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
          <Link to={`/shop?category=${product.category?.name || product.category || ''}`} className="hover:text-green-600">
            {product.category?.name || product.category || 'N/A'}
          </Link>
          <span>/</span>
          {/* <span className="text-black">{product.name}</span> */}
          <span className="text-black block truncate max-w-[120px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

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
                          thumbnailRowRef.current.scrollBy({ left: -100, behavior: 'smooth' })
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
                    onScroll={e => setThumbScroll(e.target.scrollLeft)}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all  ${selectedImage === index
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
                  {thumbnailRowRef.current && (thumbnailRowRef.current.scrollLeft + thumbnailRowRef.current.offsetWidth < thumbnailRowRef.current.scrollWidth) && (
                    <button
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-lime-500 shadow rounded-full p-1"
                      onClick={() => {
                        if (thumbnailRowRef.current) {
                          thumbnailRowRef.current.scrollBy({ left: 100, behavior: 'smooth' })
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
                {getStockBadge()}
                {getDiscountBadge()}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Brand and Category */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-gray-600">
                  Brand: <span className="font-medium text-green-600">{product.brand?.name || "N/A"}</span>
                </span>
                <span className="text-gray-600">
                  Category: <span className="font-medium text-green-600">{product.category?.name || product.category || 'N/A'}</span>
                </span>
                <span className="text-gray-600">
                  SKU: <span className="font-medium text-green-600">{product.sku || 'N/A'}</span>
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.numReviews || 0} {product.numReviews === 1 ? "review" : "reviews"})
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  {product.offerPrice > 0 && product.offerPrice < product.price ? (
                    <>
                      <div className="text-3xl font-bold text-red-600">{formatPrice(product.offerPrice)}</div>
                      <div className="text-xl text-gray-500 line-through">{formatPrice(product.price)}</div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-red-600">{formatPrice(product.price)}</div>
                  )}
                </div>
                <div className="text-sm text-gray-600">Including VAT</div>
                {product.discount > 0 && (
                  <div className="text-sm text-green-600 font-medium">You Save {product.discount}%</div>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div
                  className={`font-medium text-lg ${product.stockStatus === "Available Product"
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

              {/* Quantity and Add to Cart */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2 ">
                  <div className="flex items-center border-2 border-gray-300  rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[60px] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors"
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
                    <button
                      onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)}
                      className="ml-1 flex items-center px-9 py-3 rounded-lg border border-gray-300 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                      aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart size={20} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
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


              {/* <div className="grid grid-cols-3 gap-4 py-4 text-center">
                
                <div className="border-2 border-gray-300 rounded-lg p-2 transition-transform duration-200 hover:scale-105 hover:shadow-md">
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-green-600 w-full"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20help%20with%20this%20product%3A%20${encodeURIComponent(product.name)}`,
                        '_blank'
                      )
                    }
                  >
                    <MessageCircle size={24} className="mb-2 text-green-600" />
                    <span className="text-xs text-black font-medium">Chat With Specialist</span>
                  </button>
                </div>

              
                <div className="border-2 border-gray-300 rounded-lg p-2 transition-transform duration-200 hover:scale-105 hover:shadow-md">
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-blue-600 w-full"
                    onClick={() => setShowCallbackModal(true)}
                  >
                    <Phone size={24} className="mb-2 text-green-600" />
                    <span className="text-xs text-black font-medium">Request a Callback</span>
                  </button>
                </div>

                
                <div className="border-2 border-gray-300 rounded-lg p-2 transition-transform duration-200 hover:scale-105 hover:shadow-md">
                  <button
                    type="button"
                    className="flex flex-col items-center w-full focus:outline-none group"
                    onClick={() => navigate('/bulk-purchase')}
                  >
                    <Shield className="mx-auto mb-2 text-green-600 group-hover:text-lime-600 transition-colors" size={24} />
                    <span className="text-xs font-medium group-hover:text-lime-600 transition-colors">Request Bulk Purchase</span>
                  </button>
                </div>
              </div> */}


              <div className="grid grid-cols-3 gap-4 py-4 text-center">
                {/* WhatsApp Chat */}
                <div className="border-2 border-gray-300 rounded-lg p-2 transition-transform duration-200 hover:scale-105 hover:shadow-md group overflow-hidden">
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-green-600 w-full"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20help%20with%20this%20product%3A%20${encodeURIComponent(product.name)}`,
                        '_blank'
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
                    onClick={() => navigate('/bulk-purchase')}
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
                <h4 className="font-bold text-gray-900 text-sm mb-3">Payment Methods:</h4>
                {/* <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</div>
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">MASTER</div>
                  <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">COD</div>
                </div> */}
                <div className="flex ml-8 items-center space-x-2 flex-wrap gap-2">
                  <div className="px-2 py-1 rounded flex items-center gap-1">
                    <img src="/master.png" alt="master" className="w-10" />

                  </div>
                  <div className="px-2 py-1 rounded flex items-center gap-1">
                    <img src="/visa.png" alt="visa" className="w-12" />

                  </div>
                  <div className="px-2 py-1 rounded flex items-center gap-1">
                    <img src="/tamara.png" alt="tamara" className="w-20" />

                  </div>
                  <div className="px-2 py-1 rounded flex items-center gap-1">
                    <img src="/tabby.png" alt="tabby" className="w-16" />

                  </div>
                  <div className="px-2 py-1 rounded flex items-center gap-1">
                    <img src="/cod.png" alt="cod" className=" w-10" />

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "description"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Product Description
              </button>
              <button
                onClick={() => setActiveTab("information")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "information"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                More Information
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "reviews"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Reviews ({product.numReviews || 0})
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
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.brand?.name || product.brand || "N/A"}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                          Model Number
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.sku || "N/A"}</td>
                      </tr>
                      {/* <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Weight</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">
                          {product.weight || 0} {product.unit}
                        </td>
                      </tr> */}
                      <tr className="bg-white">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">Category</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-700">{product.category?.name || product.category || 'N/A'}</td>
                      </tr>
                      {/* {product.subCategory && (
                        <tr className="bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 w-1/4">
                            Sub Category
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-gray-700">
                            {product.subCategory?.name || product.subCategory || 'N/A'}
                          </td>
                        </tr>
                      )} */}
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
              <div>
                <div className="flex items-start space-x-8 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{product.rating || 0}</div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{product.numReviews || 0} Product Ratings</div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold mb-4">Ratings</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = product.reviews?.filter((r) => Math.floor(r.rating) === rating).length || 0
                        const percentage = product.numReviews > 0 ? (count / product.numReviews) * 100 : 0

                        return (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm w-4">{rating}</span>
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-4">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-blue-600 text-sm mb-4">
                      {product.numReviews === 0 ? "There are no reviews yet." : `${product.numReviews} reviews`}
                    </div>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-gray-900 text-white px-6 py-2 rounded font-medium hover:bg-gray-800 transition-colors"
                    >
                      Write a review
                    </button>
                  </div>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h4 className="text-lg font-bold mb-4">Write a Review</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewData({ ...reviewData, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                size={24}
                                className={star <= reviewData.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({reviewData.rating} stars)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={reviewData.name}
                          onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                        <textarea
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Write your review here..."
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="bg-gray-300 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Display Reviews */}
                {product.reviews && product.reviews.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold">Customer Reviews</h4>
                    {product.reviews.map((review, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{review.name}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              {shuffleArray(relatedProducts).slice(0, 6).map((relatedProduct) => (
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

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={e => {
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
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden ${index === modalImageIndex ? 'border-lime-500' : 'border-gray-300'
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
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${index === modalImageIndex ? 'border-lime-500' : 'border-gray-300'
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
                className={`object-contain bg-white cursor-pointer transition-transform duration-300 ${isImageZoomed
                    ? "max-h-none max-w-none scale-150"
                    : "max-h-full max-w-full"
                  }`}
                style={{
                  transformOrigin: isImageZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : 'center'
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
                onClick={() => setModalImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setModalImageIndex(prev => prev < productImages.length - 1 ? prev + 1 : 0)}
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
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors">
          <MessageCircle size={24} />
        </button>
      </div>

      {showCallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowCallbackModal(false)}>
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-shrink-0 flex flex-col items-center justify-center mb-4 md:mb-0">
                <img src="/pic.png" alt="Support" className="w-40 h-52 md:w-72 md:h-96 object-contain" />
              </div>
              <div className="flex-1 w-full">
                <h2 className="text-xl font-bold mb-4">Request a Callback</h2>
                {callbackSuccess ? (
                  <div className="text-green-600 font-medium text-center">Request submitted successfully!</div>
                ) : (
                  <form onSubmit={handleCallbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" name="name" value={callbackForm.name} onChange={handleCallbackChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" name="email" value={callbackForm.email} onChange={handleCallbackChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" name="phone" value={callbackForm.phone} onChange={handleCallbackChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <button type="submit" className="w-full bg-lime-500 text-white py-2 rounded-md font-medium" disabled={callbackLoading}>
                      {callbackLoading ? 'Submitting...' : 'Submit Request'}
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
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleCloseCouponsModal}>
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
                  const categories = coupon.categories && coupon.categories.length > 0
                    ? coupon.categories.map(cat => cat.name || cat).join(", ")
                    : "All Categories"
                  return (
                    <div key={coupon._id} className="relative flex items-center w-full">
                      {/* Ticket Style - Horizontal Layout */}
                      <div
                        className={`w-full flex shadow-md relative overflow-visible transition-all duration-500 ease-out opacity-0 translate-y-8 animate-fadeInUp ${color.border}`}
                        style={{ minHeight: 100, animationDelay: `${idx * 80}ms`, animationFillMode: 'forwards' }}
                      >
                        {/* Left stub - Compact */}
                        <div className={`flex flex-col items-center justify-center py-2 px-2 ${color.stub} border-l-2 border-t-2 border-b-2 ${color.border} rounded-l-lg relative`} style={{ minWidth: 60 }}>
                          <span className="text-[8px] font-bold tracking-widest text-gray-700 rotate-180" style={{ writingMode: 'vertical-rl' }}>DISCOUNT</span>
                          {/* Barcode effect - Smaller */}
                          <div className={`w-4 h-6 mt-1 flex flex-col justify-between ${color.barcode}`} style={{ borderRadius: 2 }}>
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`h-0.5 ${i % 2 === 0 ? 'bg-gray-700' : 'bg-gray-400'} w-full rounded`}></div>
                            ))}
                          </div>
                        </div>
                        {/* Main ticket - Responsive Layout */}
                        <div className={`flex-1 ${color.main} border-r-2 border-t-2 border-b-2 ${color.border} rounded-r-lg p-3 flex flex-col md:flex-row md:items-center relative overflow-hidden`}>
                          {/* Cut edges */}
                          <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 ${color.border}`}></div>
                          <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 ${color.border}`}></div>

                          {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
                          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 flex-1">
                            {/* Discount Info */}
                            <div className="flex items-center justify-between md:flex-col md:items-center md:justify-center">
                              <span className="text-xs font-semibold text-gray-500 tracking-widest">GIFT COUPON</span>
                              {/* <span className={`text-xl font-bold flex items-center ${color.text}`}>
                                <Percent className="w-4 h-4 mr-1" />
                                {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `AED ${coupon.discountValue}`}
                              </span> */}
                              <span className={`text-xl font-bold flex items-center ${color.text}`}>
                                {coupon.discountType === "percentage" && (
                                  <Percent className="w-4 h-4 mr-1" />
                                )}
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountValue}`
                                  : `AED ${coupon.discountValue}`}
                              </span>
                            </div>

                            {/* Promo Code */}
                            <div className="flex flex-col items-center flex-1">
                              <span className="block text-sm font-bold text-gray-900 mb-2">PROMO CODE</span>
                              <div className="flex items-center w-full justify-center">
                                <span className={`inline-block bg-white border ${color.border} rounded px-3 py-1 font-mono text-sm font-bold ${color.text} tracking-widest`}>{coupon.code}</span>
                                <button
                                  className={`ml-2 px-2 py-1 text-xs ${color.stub} hover:brightness-110 text-black rounded transition-colors font-semibold border ${color.border} focus:outline-none focus:ring-2 focus:ring-yellow-300`}
                                  onClick={() => handleCopyCoupon(coupon.code, coupon._id)}
                                >
                                  {couponCopied === coupon._id ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Details - Mobile: Full width, Desktop: Right aligned */}
                          <div className="flex flex-col md:items-end text-left md:text-right space-y-1 mt-3 md:mt-0">
                            <div className="text-xs text-gray-600 md:max-w-xs">{coupon.description}</div>
                            <div className="flex flex-col md:items-end space-y-1">
                              <div className="text-xs text-gray-500">
                                Min: AED {coupon.minOrderAmount || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                Valid: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                              </div>
                              <div className="text-xs font-semibold text-gray-700">
                                {categories}
                              </div>
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
    </div>
  )
}

export default ProductDetails
