"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Truck,
  Headphones,
  CheckCircle,
  Zap,
  Shield,
  Award,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import BannerSlider from "../components/BannerSlider"
import CategorySlider from "../components/CategorySlider"
import { useWishlist } from "../context/WishlistContext"

import config from "../config/config"

const API_BASE_URL = `${config.API_URL}`

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [heroBanners, setHeroBanners] = useState([])
  const [mobileBanners, setMobileBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [categorySlide, setCategorySlide] = useState(0)
  const [mobileProductSlide, setMobileProductSlide] = useState(0)
  const navigate = useNavigate()
  const [brands, setBrands] = useState([])
  const [brandSlide, setBrandSlide] = useState(0)
  const [hpProducts, setHpProducts] = useState([])
  const [dellProducts, setDellProducts] = useState([])
  const [accessoriesProducts, setAccessoriesProducts] = useState([])
  const [acerProducts, setAcerProducts] = useState([])
  const [asusProducts, setAsusProducts] = useState([])
  const [networkingProducts, setNetworkingProducts] = useState([])
  const [msiProducts, setMsiProducts] = useState([])
  const [lenovoProducts, setLenovoProducts] = useState([])
  const [appleProducts, setAppleProducts] = useState([])
  const [samsungProducts, setSamsungProducts] = useState([])
  const [upgradeFeatures, setUpgradeFeatures] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [brandCurrentIndex, setBrandCurrentIndex] = useState(0)
  const sliderRef = useRef(null)
  const [scrollX, setScrollX] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [deviceType, setDeviceType] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'Mobile' : 'Desktop';
    }
    return 'Desktop';
  });

  useEffect(() => {
    function handleResize() {
      setDeviceType(window.innerWidth < 768 ? 'Mobile' : 'Desktop');
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bounceStyle = {
    animation: "bounce 1s infinite",
  }

  const bounceKeyframes = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }
  
  @keyframes infiniteScroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  `
  if (typeof document !== "undefined" && !document.getElementById("bounce-keyframes")) {
    const style = document.createElement("style")
    style.id = "bounce-keyframes"
    style.innerHTML = bounceKeyframes
    document.head.appendChild(style)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse, brandsResponse, bannersResponse, upgradeFeaturesResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/api/products`),
            axios.get(`${API_BASE_URL}/api/categories`),
            axios.get(`${API_BASE_URL}/api/brands`),
            axios.get(`${API_BASE_URL}/api/banners?active=true`),
            axios.get(`${API_BASE_URL}/api/upgrade-features?active=true`).catch(() => ({ data: [] })),
          ])

        const products = productsResponse.data
        const categoriesData = categoriesResponse.data
        const brandsData = brandsResponse.data
        const bannersData = bannersResponse.data
        const upgradeFeaturesData = upgradeFeaturesResponse.data

        console.log("All Products fetched:", products)
        console.log("Categories fetched:", categoriesData)
        console.log("Brands fetched:", brandsData)

        // Filter and validate categories - ensure they have proper structure
        const validCategories = Array.isArray(categoriesData)
          ? categoriesData.filter((cat) => {
              const isValid =
                cat &&
                typeof cat === "object" &&
                cat.name &&
                typeof cat.name === "string" &&
                cat.name.trim() !== "" &&
                cat.isActive !== false &&
                !cat.isDeleted &&
                !cat.name.match(/^[0-9a-fA-F]{24}$/) // Not an ID

              if (!isValid) {
                console.warn("Invalid category found:", cat)
              }
              return isValid
            })
          : []

        // Filter and validate brands - ensure they have proper structure and names
        const validBrands = Array.isArray(brandsData)
          ? brandsData.filter((brand) => {
              const isValid =
                brand &&
                typeof brand === "object" &&
                brand.name &&
                typeof brand.name === "string" &&
                brand.name.trim() !== "" &&
                brand.isActive !== false &&
                !brand.name.match(/^[0-9a-fA-F]{24}$/) && // Not an ID
                brand.logo && // Has logo
                brand.logo.trim() !== ""

              if (!isValid) {
                console.warn("Invalid brand found:", brand)
              }
              return isValid
            })
          : []

        // Create brand lookup maps
        const brandIdToName = {}
        validBrands.forEach((brand) => {
          if (brand && brand._id && brand.name) {
            brandIdToName[brand._id] = brand.name
          }
        })

        // Create category lookup maps
        const categoryIdToName = {}
        validCategories.forEach((category) => {
          if (category && category._id && category.name) {
            categoryIdToName[category._id] = category.name
          }
        })

        // Filter hero banners
        const heroData = bannersData.filter((banner) => banner.position === "hero")
        console.log("All Banners:", bannersData)
        console.log("Hero Banners:", heroData)
        const promotionalBanners = bannersData.filter((banner) => banner.position === "promotional")
        const mobileData = bannersData.filter((banner) => banner.position === "mobile")

        // Filter featured products
        const featured = products.filter((product) => product.featured).slice(0, 12)

        // Enhanced brand filtering function
        const filterProductsByBrand = (products, brandName) => {
          return products.filter((product) => {
            if (!product.brand) return false

            let productBrandName = ""

            if (typeof product.brand === "string") {
              if (brandIdToName[product.brand]) {
                productBrandName = brandIdToName[product.brand]
              } else {
                productBrandName = product.brand
              }
            } else if (typeof product.brand === "object" && product.brand?.name) {
              productBrandName = product.brand.name
            }

            return productBrandName.toLowerCase().includes(brandName.toLowerCase())
          })
        }

        // Enhanced category filtering function
        const filterProductsByCategory = (products, categoryName) => {
          return products.filter((product) => {
            if (!product.category) return false

            let productCategoryName = ""

            if (typeof product.category === "string") {
              if (categoryIdToName[product.category]) {
                productCategoryName = categoryIdToName[product.category]
              } else {
                productCategoryName = product.category
              }
            } else if (typeof product.category === "object" && product.category?.name) {
              productCategoryName = product.category.name
            }

            return productCategoryName.toLowerCase().includes(categoryName.toLowerCase())
          })
        }

        // Enhanced main category filtering function
        const filterProductsByMainCategory = (products, mainCategoryName) => {
          return products.filter((product) => {
            if (!product.parentCategory) return false;
            let mainCatName = "";
            if (typeof product.parentCategory === "string") {
              mainCatName = categoryIdToName[product.parentCategory] || product.parentCategory;
            } else if (typeof product.parentCategory === "object" && product.parentCategory?.name) {
              mainCatName = product.parentCategory.name;
            }
            return mainCatName.toLowerCase().includes(mainCategoryName.toLowerCase());
          });
        };

        // Get brand products
        const hpData = filterProductsByBrand(products, "HP").slice(0, 3)
        const dellData = filterProductsByBrand(products, "Dell").slice(0, 3)
        const acerData = filterProductsByBrand(products, "Acer").slice(0, 3)
        const asusData = filterProductsByBrand(products, "ASUS").slice(0, 3)

        // Get category products
        const accessoriesData = filterProductsByMainCategory(products, "Accessories").slice(0, 6)

        // Get Networking products
        let networkingData = filterProductsByCategory(products, "Networking").slice(0, 6)
        console.log("Networking Products found:", networkingData)

        // Get MSI products
        let msiData = filterProductsByBrand(products, "MSI").slice(0, 3)
        console.log("MSI Products found:", msiData)

        // Get Lenovo products
        let lenovoData = filterProductsByBrand(products, "Lenovo").slice(0, 3)
        console.log("Lenovo Products found:", lenovoData)

        // Get Apple products
        let appleData = filterProductsByBrand(products, "Apple").slice(0, 3)
        console.log("Apple Products found:", appleData)

        // Get Samsung products
        let samsungData = filterProductsByBrand(products, "Samsung").slice(0, 3)
        console.log("Samsung Products found:", samsungData)

        // Alternative search if no networking products found
        if (networkingData.length === 0) {
          console.log("No Networking products found, trying alternative search...")
          networkingData = products
            .filter((p) => {
              const categoryId = typeof p.category === "string" ? p.category : p.category?._id
              const categoryName = categoryIdToName[categoryId] || p.category?.name || p.category
              const productName = p.name?.toLowerCase() || ""
              return (
                categoryName &&
                (categoryName.toLowerCase().includes("network") ||
                  categoryName.toLowerCase().includes("router") ||
                  categoryName.toLowerCase().includes("switch") ||
                  productName.includes("router") ||
                  productName.includes("switch") ||
                  productName.includes("network"))
              )
            })
            .slice(0, 6)
        }

        // Alternative search for MSI if no products found
        if (msiData.length === 0) {
          console.log("No MSI products found, trying alternative search...")
          msiData = products
            .filter((p) => {
              const brandId = typeof p.brand === "string" ? p.brand : p.brand?._id
              const brandName = brandIdToName[brandId] || p.brand?.name || p.brand
              const productName = p.name?.toLowerCase() || ""
              return (brandName && brandName.toLowerCase().includes("msi")) || productName.includes("msi")
            })
            .slice(0, 3)
        }

        // Alternative search for Lenovo if no products found
        if (lenovoData.length === 0) {
          console.log("No Lenovo products found, trying alternative search...")
          lenovoData = products
            .filter((p) => {
              const brandId = typeof p.brand === "string" ? p.brand : p.brand?._id
              const brandName = brandIdToName[brandId] || p.brand?.name || p.brand
              const productName = p.name?.toLowerCase() || ""
              return (brandName && brandName.toLowerCase().includes("lenovo")) || productName.includes("lenovo")
            })
            .slice(0, 3)
        }

        // Alternative search for Apple if no products found
        if (appleData.length === 0) {
          console.log("No Apple products found, trying alternative search...")
          appleData = products
            .filter((p) => {
              const brandId = typeof p.brand === "string" ? p.brand : p.brand?._id
              const brandName = brandIdToName[brandId] || p.brand?.name || p.brand
              const productName = p.name?.toLowerCase() || ""
              return (
                (brandName && brandName.toLowerCase().includes("apple")) ||
                productName.includes("apple") ||
                productName.includes("iphone") ||
                productName.includes("ipad") ||
                productName.includes("mac") ||
                productName.includes("macbook") ||
                productName.includes("airpods")
              )
            })
            .slice(0, 3)
        }

        // Alternative search for Samsung if no products found
        if (samsungData.length === 0) {
          console.log("No Samsung products found, trying alternative search...")
          samsungData = products
            .filter((p) => {
              const brandId = typeof p.brand === "string" ? p.brand : p.brand?._id
              const brandName = brandIdToName[brandId] || p.brand?.name || p.brand
              const productName = p.name?.toLowerCase() || ""
              return (
                (brandName && brandName.toLowerCase().includes("samsung")) ||
                productName.includes("samsung") ||
                productName.includes("galaxy") ||
                productName.includes("note") ||
                productName.includes("tab")
              )
            })
            .slice(0, 3)
        }

        setFeaturedProducts(featured)
        setCategories(validCategories)
        setBanners(promotionalBanners)
        setHeroBanners(heroData)
        setMobileBanners(mobileData)
        // Add log after setting hero banners
        console.log("[DEBUG] deviceType:", deviceType)
        console.log("[DEBUG] heroBanners:", heroData)
        setBrands(validBrands)
        setHpProducts(hpData)
        setDellProducts(dellData)
        setAccessoriesProducts(accessoriesData)
        setAcerProducts(acerData)
        setAsusProducts(asusData)
        setNetworkingProducts(networkingData)
        setMsiProducts(msiData)
        setLenovoProducts(lenovoData)
        setAppleProducts(appleData)
        setSamsungProducts(samsungData)
        setUpgradeFeatures(upgradeFeaturesData)
        setLoading(false)

        console.log("Final Categories:", validCategories)
        console.log("Final Brands:", validBrands)
        console.log("Final HP Products:", hpData)
        console.log("Final Dell Products:", dellData)
        console.log("Final Networking Products:", networkingData)
        console.log("Final MSI Products:", msiData)
        console.log("Final Lenovo Products:", lenovoData)
        console.log("Final Apple Products:", appleData)
        console.log("Final Samsung Products:", samsungData)
        console.log("Final Upgrade Features:", upgradeFeaturesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Infinite loop pixel-based auto-scroll for brands
  useEffect(() => {
    if (!brands.length) return
    let animationFrameId
    let lastTimestamp = null
    const speed = 0.5 // px per frame, adjust for faster/slower scroll

    function step(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp
      const elapsed = timestamp - lastTimestamp
      lastTimestamp = timestamp
      if (!sliderRef.current) return
      const track = sliderRef.current
      const totalWidth = track.scrollWidth / 2 // width of one set
      let nextScrollX = scrollX + speed
      if (nextScrollX >= totalWidth) {
        // Instantly reset to the start (no animation)
        track.style.transition = "none"
        setScrollX(0)
        // Force reflow, then restore transition
        setTimeout(() => {
          if (track) track.style.transition = "transform 0.3s linear"
        }, 20)
        animationFrameId = requestAnimationFrame(step)
        return
      }
      setScrollX(nextScrollX)
      animationFrameId = requestAnimationFrame(step)
    }

    if (isAutoScrolling) {
      animationFrameId = requestAnimationFrame(step)
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
    // eslint-disable-next-line
  }, [brands.length, isAutoScrolling, scrollX])

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${scrollX}px)`
    }
  }, [scrollX])

  // Handle infinite loop transitions
  useEffect(() => {
    if (brandCurrentIndex === brands.length) {
      setTimeout(() => {
        setIsTransitioning(false)
        setBrandCurrentIndex(0)
      }, 300)
    } else if (brandCurrentIndex === -1) {
      setTimeout(() => {
        setIsTransitioning(false)
        setBrandCurrentIndex(brands.length - 1)
      }, 300)
    } else {
      setIsTransitioning(true)
    }
  }, [brandCurrentIndex, brands.length])

  const handleCategoryClick = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName)
    if (category && category._id) {
      navigate(`/shop?parentCategory=${category._id}`)
    } else {
      navigate(`/shop`)
    }
  }

  const handleBrandClick = (brandName) => {
    navigate(`/shop?brand=${encodeURIComponent(brandName)}`)
  }

  const nextSlide = () => {
    if (currentSlide < featuredProducts.length - 4) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const nextCategorySlide = () => {
    const itemsPerSlide = window.innerWidth >= 1024 ? 8 : window.innerWidth >= 768 ? 6 : 4
    const maxSlides = Math.ceil(categories.length / itemsPerSlide) - 1
    if (categorySlide < maxSlides) {
      setCategorySlide(categorySlide + 1)
    }
  }

  const prevCategorySlide = () => {
    if (categorySlide > 0) {
      setCategorySlide(categorySlide - 1)
    }
  }

  const nextMobileProductSlide = () => {
    if (mobileProductSlide < featuredProducts.length - 3) {
      setMobileProductSlide(mobileProductSlide + 1)
    }
  }

  const prevMobileProductSlide = () => {
    if (mobileProductSlide > 0) {
      setMobileProductSlide(mobileProductSlide - 1)
    }
  }

  const nextBrandSlide = () => {
    setBrandCurrentIndex((prev) => (prev + 1) % brands.length)
  }

  const prevBrandSlide = () => {
    setBrandCurrentIndex((prev) => (prev - 1 + brands.length) % brands.length)
  }

  // Calculate how many brands are visible at once
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 4
      if (window.innerWidth < 1024) return 6
    }
    return 8
  }
  const visibleCount = getVisibleCount()
  const totalBrands = brands.length
  const totalSlides = totalBrands * 2

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <img src="/g.png" alt="Loading..." style={{ width: 80, height: 80, ...bounceStyle }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white mt-1">
      <BannerSlider banners={heroBanners.filter(banner => banner.deviceType && banner.deviceType.toLowerCase() === deviceType.toLowerCase())} />
      {/* Categories Section - Infinite Loop Scroll */}
      <CategorySlider categories={categories} onCategoryClick={handleCategoryClick} />

      {/* Three Cards Section - Simple Mobile Grid */}
      <div className="m-3">
        {/* Desktop & Tablet - Grid Layout */}
        <div className="hidden md:flex justify-between gap-4">
          <div className="w-1/3 lg:w-1/3">
            <img src="Untitled-1.png" alt="Image 1" className="w-full h-auto rounded-lg cover" />
          </div>
          <div className="w-1/3 lg:w-1/3">
            <img src="Untitled-123.png" alt="Image 2" className="w-full h-auto rounded-lg cover" />
          </div>
          <div className="w-1/3 lg:w-1/3 hidden lg:block">
            <img src="asus-2.png" alt="Image 3" className="w-full h-auto rounded-lg cover" />
          </div>
        </div>

        {/* Mobile - Simple Grid */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          <div>
            <img src="Untitled-1.png" alt="Image 1" className="w-full h-auto rounded-lg cover" />
          </div>
          <div>
            <img src="Untitled-123.png" alt="Image 2" className="w-full h-auto rounded-lg cover" />
          </div>
        </div>
      </div>

      {/* Big Sale Section - Hidden on Mobile */}
      <section className="relative my-6 hidden md:block bg-red-300 ">
        <div className="absolute inset-0 ">
          <div
            className="bg-[url('http://grabatoz.ae/wp-content/uploads/2025/06/slider-2-2.png')] bg-cover w-full"
            style={{ height: "420px" }}
          ></div>
        </div>

        <div className="relative max-w-8xl px-5">
          <div className="flex justify-end">
            <div className="w-2/3 relative">
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
                disabled={currentSlide >= featuredProducts.length - 4}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-200"
                style={{ marginRight: "-20px" }}
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>

              <div className="overflow-hidden my-5">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 25}%)` }}
                >
                  {featuredProducts.map((product, index) => (
                    <div key={product._id} className="w-1/4  flex-shrink-0">
                      <GrabatezSaleCard product={product} index={index % 4} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center space-x-2 mt-4">
                {Array.from({ length: Math.max(0, featuredProducts.length - 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === index ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - Mobile Grid */}
      <section className="py-6 mx-3 md:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Featured Products</h2>
          <button className="text-green-600 hover:text-green-800 font-medium text-sm">View All</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredProducts.slice(0, 6).map((product, index) => (
            <MobileProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* HP Dell Banner - Desktop/Mobile Responsive */}
      <div className="rounded-lg shadow-lg mx-3">
        <img
          src={window.innerWidth < 768 ? "hp-banner.jpg" : "hp-dell-new-1536x288 (1).png"}
          alt="HP Dell Banner"
          className="w-full h-full cover"
        />
      </div>

      {/* HP and Dell Section - Mobile shows only HP */}
      <section className="py-8 mx-3">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* HP Products */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">HP Products</h2>
              </div>
              <button
                onClick={() => handleBrandClick("HP")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                View All HP
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 h-full">
              {hpProducts.length > 0 ? (
                hpProducts
                  .slice(0, window.innerWidth < 1024 ? 2 : 3)
                  .map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-2  lg:col-span-3 text-center py-8 text-gray-500">No HP products available</div>
              )}
            </div>
          </div>

          {/* Dell Products - Hidden on Mobile */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Dell Products</h2>
              </div>
              <button
                onClick={() => handleBrandClick("Dell")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                View All Dell
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {dellProducts.length > 0 ? (
                dellProducts.map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">No Dell products available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Accessories Banner - Desktop/Mobile Responsive */}
      <div className="mx-3 my-4">
        <img
          src={window.innerWidth < 768 ? "Accessories-1480x560-100-1-600x227.jpg" : "./Accessories-new-1-1536x288.jpg"}
          alt="Accessories Promotion Banner"
          className="w-full h-full cover rounded-lg"
        />
      </div>

      {/* Accessories Section - Mobile shows 2 products */}
      <section className="py-8 mx-3">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Accessories</h2>
          <button
            onClick={() => handleCategoryClick("Accessories")}
            className="text-green-600 hover:text-green-800 font-medium flex items-center"
          >
            See All Products
            <ChevronRight className="ml-1" size={16} />
          </button>
        </div>

        {accessoriesProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {accessoriesProducts
              .slice(0, window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 6)
              .map((product) => (
                <AccessoriesProductCard key={product._id} product={product} />
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No accessories products available</p>
          </div>
        )}
      </section>

      {/* ASUS Banner - Desktop/Mobile Responsive */}
      <div className="w-full p-4 bg-white">
        <img
          src={window.innerWidth < 768 ? "/asus.png" : "./asus-2-1536x288.png"}
          alt="ASUS Banner"
          className="w-full h-auto"
        />
      </div>

      {/* Acer and ASUS Section - Mobile shows only ASUS */}
      <section className="py-8 mx-3">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Acer Products - Hidden on Mobile */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Shop Acer</h2>
              </div>
              <button
                onClick={() => handleBrandClick("Acer")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {acerProducts.length > 0 ? (
                acerProducts.map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">No Acer products available</div>
              )}
            </div>
          </div>

          {/* ASUS Products */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Shop Asus</h2>
              </div>
              <button
                onClick={() => handleBrandClick("ASUS")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {asusProducts.length > 0 ? (
                asusProducts
                  .slice(0, window.innerWidth < 1024 ? 2 : 3)
                  .map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
                  No ASUS products available
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Networking Banner - Desktop/Mobile Responsive */}
      <div className="w-full p-4 bg-white">
        <img
          src={window.innerWidth < 768 ? "dddd-768x291.png" : "./Networking-new-1-1536x288.jpg"}
          alt="Networking Banner"
          className="w-full h-auto"
        />
      </div>

      {/* Networking Products Section - Mobile shows 2 products */}
      <section className="py-8 mx-3">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Networking</h2>
          <button
            onClick={() => handleCategoryClick("Networking")}
            className="text-green-600 hover:text-green-800 font-medium flex items-center"
          >
            See All Products
            <ChevronRight className="ml-1" size={16} />
          </button>
        </div>

        {networkingProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 ">
            {networkingProducts
              .slice(0, window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 6)
              .map((product) => (
                <AccessoriesProductCard key={product._id} product={product} />
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No networking products available</p>
          </div>
        )}
      </section>

      {/* MSI & Lenovo Banner - Desktop/Mobile Responsive */}
      <div className="w-full p-4 bg-white">
        <img
          src={window.innerWidth < 768 ? "msi.png" : "./MSI-LENOVO-1.jpg"}
          alt="MSI Lenovo Banner"
          className="w-full h-auto"
        />
      </div>

      {/* MSI and Lenovo Products Section - Mobile shows only MSI */}
      <section className="py-8 mx-3">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* MSI Products */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Shop MSI</h2>
              </div>
              <button
                onClick={() => handleBrandClick("MSI")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {msiProducts.length > 0 ? (
                msiProducts
                  .slice(0, window.innerWidth < 1024 ? 2 : 3)
                  .map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-2 lg:col-span-3 text-center py-8 text-gray-500">No MSI products available</div>
              )}
            </div>
          </div>

          {/* Lenovo Products - Hidden on Mobile */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Shop Lenovo</h2>
              </div>
              <button
                onClick={() => handleBrandClick("Lenovo")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {lenovoProducts.length > 0 ? (
                lenovoProducts.map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">No Lenovo products available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Apple & Samsung Banner - Desktop/Mobile Responsive */}
      <div className="w-full p-4 bg-white">
        <img
          src={window.innerWidth < 768 ? "apple-banner-768x290.jpg" : "./Apple-Samsung.psd-new-1536x288.png"}
          alt="Apple Samsung Banner"
          className="w-full h-auto"
        />
      </div>

      {/* Apple and Samsung Products Section - Mobile shows only Apple */}
      <section className="py-8 mx-3">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Apple Products */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Shop Apple</h2>
              </div>
              <button
                onClick={() => handleBrandClick("Apple")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {appleProducts.length > 0 ? (
                appleProducts
                  .slice(0, window.innerWidth < 1024 ? 2 : 3)
                  .map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
                  No Apple products available
                </div>
              )}
            </div>
          </div>

          {/* Samsung Products - Hidden on Mobile */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Shop Samsung</h2>
              </div>
              <button
                onClick={() => handleBrandClick("Samsung")}
                className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
              >
                See All
                <ChevronRight className="ml-1" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {samsungProducts.length > 0 ? (
                samsungProducts.map((product) => <DynamicBrandProductCard key={product._id} product={product} />)
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">No Samsung products available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Features Section - Responsive */}
      {upgradeFeatures.length > 0 && (
        <section className="py-8 md:py-12 bg-gradient-to-br from-blue-50 to-indigo-100 mx-3 rounded-lg my-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Upgrade Features</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the latest technology upgrades and premium features available for your devices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {upgradeFeatures.map((feature) => (
                <UpgradeFeatureCard key={feature._id} feature={feature} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Brands Section - Infinite Loop Scroll */}
      {brands.length > 0 && (
        <section className="bg-white py-8">
          <div className="max-w-8xl mx-auto">
            <div className="relative mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">Featured Brands</h2>
            </div>
            <div className="relative mx-3 md:mx-5">
              <div className="overflow-hidden">
                <div
                  ref={sliderRef}
                  className="flex"
                  style={{
                    width: `${brands.length * 2 * 140}px`, // 140px per brand card, adjust as needed
                    transition: "transform 0.3s linear",
                  }}
                >
                  {[...brands, ...brands].map((brand, index) => (
                    <div
                      key={`${brand._id}-${index}`}
                      className="flex-shrink-0"
                      style={{
                        width: "180px", // adjust to match card width
                      }}
                    >
                      <div className="px-2 md:px-3">
                        <button
                          onClick={() => {
                            setSelectedBrand(brand._id)
                            handleBrandClick(brand.name)
                          }}
                          className="flex flex-col items-center group transition-all duration-300 p-2 md:p-4 hover:bg-gray-50 rounded-lg w-full border-4 border-green-500"
                        >
                          <div className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 overflow-hidden  mb-2 md:mb-3 flex items-center justify-center border border-gray-100 rounded-lg">
                            <img
                              src={brand.logo || "/placeholder.svg"}
                              alt={brand.name}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-green-600 text-center line-clamp-1">
                            {brand.name}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core Service Section - Responsive: Desktop(4 in row), Mobile(2x2 grid) */}
      <section className="py-8 md:py-10 bg-white mt-2">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Core Service Aspects
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <CreditCard className="w-8 h-8 md:w-12 md:h-12 text-lime-500" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2">Secure Payment Method</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Available Different secure Payment Methods
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <Truck className="w-8 h-8 md:w-12 md:h-12 text-lime-500" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2">Extreme Fast Delivery</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Fast and convenient From door to door delivery
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <Heart className="w-8 h-8 md:w-12 md:h-12 text-lime-500" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2">Quality & Savings</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Comprehensive quality control and affordable price
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <Headphones className="w-8 h-8 md:w-12 md:h-12 text-lime-500" />
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2">Professional Support</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Efficient customer support from passionate team
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const GrabatezSaleCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
  const hasOffer = product.offerPrice && Number(product.offerPrice) > 0
  const showOldPrice = hasOffer && Number(product.basePrice) > Number(product.offerPrice)
  const priceToShow = hasOffer ? product.offerPrice : product.basePrice || product.price
  // Use dynamic reviews
  const rating = product.rating || 0
  const numReviews = product.numReviews || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg relative" style={{ height: "370px", width: "210px" }}>
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
        }}
        aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={16} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
      </button>
      <div className="p-1 w-ful h-[180px] mb-2">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={product.image || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            className="w-full h-full cover  rounded mb-5"
          />
        </Link>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`${getStatusColor(stockStatus)} text-white px-2 py-1 rounded text-xs font-bold inline-block mb-1`}
        >
          {stockStatus}
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold inline-block ml-1">
            {discount}
          </div>
        )}
      </div>
      <Link to={`/product/${product.slug || product._id}`}>
        <h3 className="text-xs font-medium text-black mb-2 line-clamp-2 hover:text-blue-400">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-gray-500 mb-1">Category: {categoryName}</div>}
      <div className="text-xs text-gray-400 mb-2">Inclusive VAT</div>
      <div className=" flex items-center gap-2">
        <div className="text-red-600 font-bold">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs">
            {Number(product.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>
      <div className="flex items-center">
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

const MobileProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
  const hasOffer = product.offerPrice && Number(product.offerPrice) > 0
  const showOldPrice = hasOffer && Number(product.basePrice) > Number(product.offerPrice)
  const priceToShow = hasOffer ? product.offerPrice : product.basePrice || product.price
  // Use dynamic reviews
  const rating = product.rating || 0
  const numReviews = product.numReviews || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="bg-white rounded-lg p-3 shadow-md relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
        }}
        aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={12} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
      </button>
      <Link to={`/product/${product.slug || product._id}`}>
        <img
          src={product.image || "/placeholder.svg?height=80&width=80"}
          alt={product.name}
          className="w-full h-[200px] cover rounded mb-2"
        />
      </Link>
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-xs font-bold inline-block mb-1`}
        >
          {stockStatus}
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs font-bold inline-block ml-1">
            {discount}
          </div>
        )}
      </div>
      <Link to={`/product/${product.slug || product._id}`}>
        <h3 className="text-xs font-medium text-black mb-1 line-clamp-2 hover:text-blue-400">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-gray-500 mb-1">Category: {categoryName}</div>}
      <div className="text-xs text-gray-400 mb-1">Inclusive VAT</div>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs">
            {Number(product.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={8}
            className={`${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
      </div>
    </div>
  )
}

const DynamicBrandProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
  const hasOffer = product.offerPrice && Number(product.offerPrice) > 0
  const showOldPrice = hasOffer && Number(product.basePrice) > Number(product.offerPrice)
  const priceToShow = hasOffer ? product.offerPrice : product.basePrice || product.price
  // Use dynamic reviews
  const rating = product.rating || 0
  const numReviews = product.numReviews || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border p-2 h-[340px] flex flex-col justify-between">
      <div className="relative mb-2 flex h-[180px] justify-center items-center">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={product.image || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            className="w-full h-full cover rounded mx-auto"
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
      <div className="mb-1 flex items-center gap-2">
        <div
          className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-xs font-bold inline-block mr-1`}
        >
          {stockStatus}
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs font-bold inline-block">{discount}</div>
        )}
      </div>
      <Link to={`/product/${product.slug || product._id}`}>
        <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-gray-500 mb-1">Category: {categoryName}</div>}
      <div className="text-xs text-gray-500 mb-1">Inclusive VAT</div>
      <div className="mb-1 flex items-center gap-2">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs">
            {Number(product.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>
      <div className="flex items-center mt-auto">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={8}
            className={`${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
      </div>
    </div>
  )
}

const AccessoriesProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
  const hasOffer = product.offerPrice && Number(product.offerPrice) > 0
  const showOldPrice = hasOffer && Number(product.basePrice) > Number(product.offerPrice)
  const priceToShow = hasOffer ? product.offerPrice : product.basePrice || product.price
  // Use dynamic reviews
  const rating = product.rating || 0
  const numReviews = product.numReviews || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border  rounded-lg p-3 mx-1 hover:shadow-md transition-shadow lg:min-h-[340px] lg:max-h-[360px] lg:min-w-[210px] lg:max-w-[220px] flex flex-col justify-between">
      <div className="relative  mb-3 flex justify-center items-center min-h-[155px] lg:max-h-[170px] ">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={product.image || "/placeholder.svg?height=150&width=150"}
            alt={product.name}
            className="w-full h-[165px] cover rounded mx-auto"
          />
        </Link>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
          }}
          aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} className={isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400"} />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`${getStatusColor(stockStatus)} text-white px-2 py-1 rounded text-xs font-bold inline-block mr-1`}
        >
          {stockStatus}
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold inline-block">{discount}</div>
        )}
      </div>
      <Link to={`/product/${product.slug || product._id}`}>
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-gray-500 mb-1">Category: {categoryName}</div>}
      <div className="text-xs text-gray-500 mb-2">Inclusive VAT</div>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-red-600 font-bold text-base md:text-lg">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-sm">
            {Number(product.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>
      <div className="flex items-center mt-auto bg-white">
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

const UpgradeFeatureCard = ({ feature }) => {
  const getIconComponent = (iconName) => {
    const iconMap = {
      zap: Zap,
      shield: Shield,
      award: Award,
      "check-circle": CheckCircle,
      star: Star,
      heart: Heart,
      truck: Truck,
      "credit-card": CreditCard,
      headphones: Headphones,
    }

    const IconComponent = iconMap[iconName?.toLowerCase()] || Zap
    return <IconComponent className="w-6 h-6 md:w-8 md:h-8" />
  }

  return (
    <div className="rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="flex items-start space-x-4">
        <div
          className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${
            feature.iconColor || "bg-blue-100"
          } group-hover:scale-110 transition-transform duration-300`}
        >
          <div className={`${feature.iconTextColor || "text-blue-600"}`}>{getIconComponent(feature.icon)}</div>
        </div>

        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{feature.description}</p>

          {feature.features && feature.features.length > 0 && (
            <ul className="space-y-1 mb-4">
              {feature.features.map((item, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {feature.price && (
            <div className="flex items-center justify-between">
              <div className="text-base md:text-lg font-bold text-gray-900">
                {feature.price}
                {feature.originalPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">{feature.originalPrice}</span>
                )}
              </div>

              {feature.ctaText && (
                <button className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  {feature.ctaText}
                </button>
              )}
            </div>
          )}

          {feature.badge && (
            <div className="mt-3">
              <span
                className={`inline-block px-2 py-1 md:px-3 md:py-1 text-xs font-medium rounded-full ${
                  feature.badgeColor || "bg-green-100 text-green-800"
                }`}
              >
                {feature.badge}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const getStatusColor = (status) => {
  if (status === "Available Product" || status === "Available") return "bg-green-600"
  if (status === "Stock Out" || status === "Out of Stock") return "bg-red-600"
  if (status === "Pre-Order") return "bg-yellow-400 text-black"
  return "bg-gray-400"
}

export default Home
