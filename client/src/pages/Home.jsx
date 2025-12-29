"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import axios from "axios"
import productCache from "../services/productCache"
import { generateShopURL } from "../utils/urlUtils"
import { getFullImageUrl } from "../utils/imageUtils"

import BigSaleSection from "../components/BigSaleSection"
import {
  Star,
  Heart,
  ChevronRight,
  CreditCard,
  Truck,
  Headphones,
  CheckCircle,
  Zap,
  Shield,
  Award,
  Bell,
  Tag,
  Calendar,
  ShoppingBag,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import BannerSlider from "../components/BannerSlider"
import CategorySlider from "../components/CategorySlider"
import CategorySliderUpdated from "../components/CategorySliderUpdated"
import { useWishlist } from "../context/WishlistContext"
import { useCart } from "../context/CartContext"
import BrandSlider from "../components/BrandSlider"
import SEO from "../components/SEO"
import DynamicSection from "../components/DynamicSection"


import config from "../config/config"


const API_BASE_URL = `${config.API_URL}`

const NOTIF_POPUP_KEY = "notif_popup_shown"

const NEWSLETTER_OPTIONS = [
  { label: "Updates", value: "all", icon: <Bell className="inline mr-2 w-4 h-4" /> },
  { label: "Promotions", value: "promotions", icon: <Tag className="inline mr-2 w-4 h-4" /> },
  { label: "Events", value: "events", icon: <Calendar className="inline mr-2 w-4 h-4" /> },
]

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
  const [brandIndex, setBrandIndex] = useState(0) // <-- moved here
  const sliderRef = useRef(null)
  const [scrollX, setScrollX] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [settings, setSettings] = useState(null)
  const [homeSections, setHomeSections] = useState([])
  const [deviceType, setDeviceType] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "Mobile" : "Desktop"
    }
    return "Desktop"
  })
  const brandUrls = useMemo(
    () => ({
      HP: generateShopURL({ brand: "HP" }),
      Dell: generateShopURL({ brand: "Dell" }),
      ASUS: generateShopURL({ brand: "ASUS" }),
      Acer: generateShopURL({ brand: "Acer" }),
      MSI: generateShopURL({ brand: "MSI" }),
      Lenovo: generateShopURL({ brand: "Lenovo" }),
      Apple: generateShopURL({ brand: "Apple" }),
      Samsung: generateShopURL({ brand: "Samsung" }),
    }),
    [],
  )

  // Notification popup state
  const [showNotifPopup, setShowNotifPopup] = useState(false)
  const [notifStep, setNotifStep] = useState("ask") // 'ask' | 'email'
  const [notifEmail, setNotifEmail] = useState("")
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifError, setNotifError] = useState("")
  const [notifSuccess, setNotifSuccess] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState([])

  useEffect(() => {
    function handleResize() {
      setDeviceType(window.innerWidth < 768 ? "Mobile" : "Desktop")
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!localStorage.getItem(NOTIF_POPUP_KEY)) {
      setTimeout(() => setShowNotifPopup(true), 1200)
    }
  }, [])

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

  // Helper function to render dynamic section by position
  const renderDynamicSection = (position) => {
    const section = homeSections.find(s => s.isActive && s.order === position)
    if (section) {
      // Create a unique key that includes settings to force re-render when settings change
      const settingsKey = section.settings ? JSON.stringify(section.settings) : 'no-settings'
      const uniqueKey = `${section._id}-${section.sectionType}-${settingsKey}`
      console.log(`🔴 CLIENT RENDER: Rendering section at position ${position}:`, {
        name: section.name,
        sectionType: section.sectionType,
        settings: section.settings,
        uniqueKey: uniqueKey
      })
      return <DynamicSection key={uniqueKey} section={section} />
    }
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get products from cache or API
        const products = await productCache.getProducts()

        const [categoriesResponse, brandsResponse, bannersResponse, upgradeFeaturesResponse, settingsResponse, sectionsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/categories`),
          axios.get(`${API_BASE_URL}/api/brands`),
          axios.get(`${API_BASE_URL}/api/banners?active=true`),
          axios.get(`${API_BASE_URL}/api/upgrade-features?active=true`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/settings`).catch(() => ({ 
            data: { 
              homeSections: { 
                categoryCards: true, 
                brandsCards: true, 
                productsCards: true, 
                flashSaleCards: true, 
                limitedSaleCards: true 
              } 
            } 
          })),
          axios.get(`${API_BASE_URL}/api/home-sections/active`).catch(() => ({ data: [] })),
        ])

        const categoriesData = categoriesResponse.data
        const brandsData = brandsResponse.data
        const bannersData = bannersResponse.data
        const upgradeFeaturesData = upgradeFeaturesResponse.data
        const settingsData = settingsResponse.data
        const sectionsData = sectionsResponse.data

        console.log("All Products loaded:", products.length)
        console.log("Categories fetched:", categoriesData)
        console.log("Brands fetched:", brandsData)
        console.log("Settings fetched:", settingsData)
        console.log("Home Sections fetched:", sectionsData)
        console.log("Sections with order:", sectionsData.map(s => ({ name: s.name, order: s.order })))
        console.log('🔴 CLIENT: Sections with full settings:', sectionsData.map(s => ({ 
          name: s.name, 
          order: s.order, 
          sectionType: s.sectionType,
          settings: s.settings 
        })))

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

        // Filter featured products and sort by stock status (in-stock first)
        const featured = products
          .filter((product) => product.featured)
          .sort((a, b) => {
            // Check if products are in stock or pre-order
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)

            const aPreOrder = a.stockStatus === "PreOrder"
            const bPreOrder = b.stockStatus === "PreOrder"

            // Priority: In-stock first, then pre-order, then others
            if (aInStock && !bInStock && !bPreOrder) return -1
            if (!aInStock && !aPreOrder && (bInStock || bPreOrder)) return 1
            if (aPreOrder && !bInStock && !bPreOrder) return -1
            if (!aInStock && !aPreOrder && bPreOrder) return 1

            // If both have same priority level, sort by updatedAt (newest first)
            const aUpdated = new Date(a.updatedAt || a.createdAt || 0)
            const bUpdated = new Date(b.updatedAt || b.createdAt || 0)
            return bUpdated - aUpdated
          })
          .slice(0, 12)

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
            if (!product.parentCategory) return false
            let mainCatName = ""
            if (typeof product.parentCategory === "string") {
              mainCatName = categoryIdToName[product.parentCategory] || product.parentCategory
            } else if (typeof product.parentCategory === "object" && product.parentCategory?.name) {
              mainCatName = product.parentCategory.name
            }
            return mainCatName.toLowerCase().includes(mainCategoryName.toLowerCase())
          })
        }

        // Get brand products and sort by stock status (in-stock first)
        const hpData = filterProductsByBrand(products, "HP")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && a.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)
        const dellData = filterProductsByBrand(products, "Dell")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)
        const acerData = filterProductsByBrand(products, "Acer")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)
        const asusData = filterProductsByBrand(products, "ASUS")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)

        // Get category products and sort by stock status (in-stock first)
        const accessoriesData = filterProductsByMainCategory(products, "Accessories")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 8)

        // Get Networking products (DYNAMIC CATEGORY ID BY NAME)
        const networkingCategory = validCategories.find(
          (cat) => cat.name && cat.name.trim().toLowerCase() === "networking",
        )
        let networkingData = []
        if (networkingCategory) {
          networkingData = products
            .filter((product) => {
              return (
                (typeof product.category === "string" && product.category === networkingCategory._id) ||
                (typeof product.category === "object" && product.category?._id === networkingCategory._id) ||
                (typeof product.parentCategory === "string" && product.parentCategory === networkingCategory._id) ||
                (typeof product.parentCategory === "object" && product.parentCategory?._id === networkingCategory._id)
              )
            })
            .sort((a, b) => {
              const aInStock =
                a.stockStatus === "Available" ||
                a.stockStatus === "Available Product" ||
                (!a.stockStatus && a.countInStock > 0)
              const bInStock =
                b.stockStatus === "Available" ||
                b.stockStatus === "Available Product" ||
                (!b.stockStatus && b.countInStock > 0)
              if (aInStock && !bInStock) return -1
              if (!aInStock && bInStock) return 1
              return 0
            })
            .slice(0, 8)
        }
        console.log("Networking Products found:", networkingData)

        // Get MSI products and sort by stock status (in-stock first)
        let msiData = filterProductsByBrand(products, "MSI")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)
        console.log("MSI Products found:", msiData)

        // Get Lenovo products and sort by stock status (in-stock first)
        let lenovoData = filterProductsByBrand(products, "Lenovo")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)
        console.log("Lenovo Products found:", lenovoData)

        // Get Apple products and sort by stock status (in-stock first)
        let appleData = filterProductsByBrand(products, "Apple")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)
        console.log("Apple Products found:", appleData)

        // Get Samsung products and sort by stock status (in-stock first)
        let samsungData = filterProductsByBrand(products, "Samsung")
          .sort((a, b) => {
            const aInStock =
              a.stockStatus === "Available" ||
              a.stockStatus === "Available Product" ||
              (!a.stockStatus && a.countInStock > 0)
            const bInStock =
              b.stockStatus === "Available" ||
              b.stockStatus === "Available Product" ||
              (!b.stockStatus && b.countInStock > 0)
            if (aInStock && !bInStock) return -1
            if (!aInStock && bInStock) return 1
            return 0
          })
          .slice(0, 3)
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
        setSettings(settingsData)
        setHomeSections(sectionsData) // Don't pre-sort, let each zone handle its own sorting
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
      const nextScrollX = scrollX + speed
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

  const handleCategoryClick = (categoryOrItem) => {
    // Handle if called with string (legacy compatibility) or object (new format)
    if (typeof categoryOrItem === 'string') {
      // Legacy: string name passed
      const category = categories.find((cat) => cat.name === categoryOrItem)
      if (category && category.name) {
        navigate(generateShopURL({ parentCategory: category.name }))
      } else {
        navigate(`/shop`)
      }
    } else if (categoryOrItem && typeof categoryOrItem === 'object') {
      // New format: full item object passed from CategorySliderUpdated
      const item = categoryOrItem
      
      // Check if this is a subcategory (has category or parentSubCategory fields)
      const isSubcategory = item.category || item.parentSubCategory
      
      if (isSubcategory) {
        // This is a subcategory - need to find its parent category and build proper URL
        const parentCategoryId = typeof item.category === 'object' ? item.category._id : item.category
        const parentCategory = categories.find((cat) => cat._id === parentCategoryId)
        
        if (parentCategory) {
          // Navigate with both parent category and subcategory
          navigate(generateShopURL({ 
            parentCategory: parentCategory.name,
            subcategory: item.name
          }))
        } else {
          // Fallback: just navigate to the subcategory name
          navigate(generateShopURL({ subcategory: item.name }))
        }
      } else {
        // This is a main category
        navigate(generateShopURL({ parentCategory: item.name }))
      }
    }
  }

  const handleBrandClick = (brandName) => {
    navigate(generateShopURL({ brand: brandName }))
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
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return 4
      if (window.innerWidth < 1024) return 6
    }
    return 8
  }
  const visibleCount = getVisibleCount()
  // Remove duplicate totalBrands declaration; use the one for featured brands section only
  const totalBrands = brands.length
  const getVisibleBrands = () => {
    if (!brands.length) return []
    const visible = []
    for (let i = 0; i < visibleCount; i++) {
      visible.push(brands[(brandIndex + i) % totalBrands])
    }
    return visible
  }
  const handlePrevBrand = () => {
    setBrandIndex((prev) => (prev - 1 + totalBrands) % totalBrands)
  }
  const handleNextBrand = () => {
    setBrandIndex((prev) => (prev + 1) % totalBrands)
  }

  const handleNotifDeny = () => {
    setShowNotifPopup(false)
    localStorage.setItem(NOTIF_POPUP_KEY, "1")
  }
  const handleNotifAllow = () => {
    setNotifStep("email")
  }
  const handleNotifEmailChange = (e) => setNotifEmail(e.target.value)
  const handleNotifPrefChange = (value) => {
    setNotifPrefs((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }
  const handleNotifEmailSubmit = async (e) => {
    e.preventDefault()
    setNotifError("")
    if (!notifPrefs.length) {
      setNotifError("Please select at least one preference.")
      return
    }
    setNotifLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email: notifEmail, preferences: notifPrefs })
      setNotifSuccess(true)
      localStorage.setItem(NOTIF_POPUP_KEY, "1")
      setTimeout(() => setShowNotifPopup(false), 2000)
    } catch (err) {
      setNotifError("Failed to subscribe. Please try again.")
    }
    setNotifLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <img src="/load.gif" alt="Loading..." style={{ width: 300, height: 175, ...bounceStyle }} />
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
      {/* SEO Meta Tags for Home Page */}
      <SEO
        title="Buy Laptops, Mobiles & Electronics Online in UAE | Grabatoz"
        description="Discover the best deals on laptops, desktops, mobiles, and gaming products in UAE. Grabatoz is your trusted electronics shop in Dubai."
        canonicalPath="/"
      />
      
      {/* Notification/Newsletter Popup */}
      {showNotifPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative animate-fadeInUp">
            {notifStep === "ask" && (
              <>
                <div className="flex items-center mb-4">
                  <img src="/g.png" alt="Logo" className="w-16 h-18 rounded-full mr-4" />
                  <div>
                    <h2 className="text-lg font-bold text-black mb-1">
                      This website would like to send you awesome updates and offers!
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Notifications can be turned off anytime from browser settings.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button className="px-4 py-2 rounded bg-gray-200 text-black font-semibold" onClick={handleNotifDeny}>
                    Don't Allow
                  </button>
                  <button className="px-4 py-2 rounded bg-lime-500 text-white font-semibold" onClick={handleNotifAllow}>
                    Allow
                  </button>
                </div>
              </>
            )}
            {notifStep === "email" && !notifSuccess && (
              <form onSubmit={handleNotifEmailSubmit}>
                <div className="flex items-center  mb-4">
                  <img src="/g.png" alt="Logo" className="w-14 h-14 rounded-full mr-4" />
                  <div>
                    <h2 className="text-lg font-bold text-black mb-1">Subscribe to our newsletter</h2>
                    <p className="text-gray-600 text-sm">Enter your email to get the best offers and updates!</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    placeholder="Enter your email"
                    value={notifEmail}
                    onChange={handleNotifEmailChange}
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-lime-500 text-white font-semibold"
                    disabled={notifLoading}
                  >
                    {notifLoading ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
                {/* Preferences checkboxes */}
                <div className="flex flex-col md:flex-row gap-6 mb-2">
                  {NEWSLETTER_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center text-black font-normal cursor-pointer">
                      <input
                        type="checkbox"
                        value={opt.value}
                        checked={notifPrefs.includes(opt.value)}
                        onChange={() => handleNotifPrefChange(opt.value)}
                        className="mr-2"
                      />
                      {opt.icon}
                      {opt.label}
                    </label>
                  ))}
                </div>
                {notifError && <div className="text-red-500 text-sm mb-2">{notifError}</div>}
                <div className="flex justify-end">
                  <button type="button" className="px-3 py-1 text-xs text-gray-500 underline" onClick={handleNotifDeny}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {notifSuccess && (
              <div className="flex flex-col items-center justify-center py-6">
                <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-full mb-3 border border-gray-200" />
                <h2 className="text-lg font-bold text-black mb-2">Thank you for subscribing!</h2>
                <p className="text-gray-600 text-sm">A confirmation email has been sent to {notifEmail}.</p>
              </div>
            )}
          </div>
        </div>
      )}
      <BannerSlider
        banners={heroBanners.filter(
          (banner) => banner.deviceType && banner.deviceType.toLowerCase() === deviceType.toLowerCase(),
        )}
      />
      {/* Categories Section - Admin Controlled Slider */}
      <CategorySliderUpdated onCategoryClick={handleCategoryClick} />

     
      {/* Three Cards Section - Simple Mobile Grid */}
      <div className="m-3">
        {/* Desktop & Tablet - Grid Layout */}
        <div className="hidden md:flex justify-between gap-4">
          <div className="w-1/3 lg:w-1/3">
            <Link to="product-category/laptops" aria-label="Browse Lenovo products">
              <img
                src="laptop00.png"
                alt="Lenovo Banner"
                className="w-full h-auto rounded-lg cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
          <div className="w-1/3 lg:w-1/3">
            <Link to="/product-category/electronics" aria-label="Browse Acer products">
              <img
                src="electronoc resixe.png"
                alt="Acer Banner"
                className="w-full h-auto rounded-lg cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
          <div className="w-1/3 lg:w-1/3">
            <Link to="/product-category/camera" aria-label="Browse Asus products">
              <img
                src="camera (2).png"
                alt="Asus Banner"
                className="w-full h-auto rounded-lg cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
        </div>

        {/* Mobile - Simple Grid */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          <div>
            <Link to="/product-category/electronics" aria-label="Browse Lenovo products">
              <img
                src="electronoc resixe.png"
                alt="Lenovo Banner"
                className="w-full h-auto rounded-lg cover hover:opacity-95 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
          <div>
            <Link to="/product-category/camera" aria-label="Browse Acer products">
              <img
                src="camera (2).png"
                alt="Acer Banner"
                className="w-full h-auto rounded-lg cover hover:opacity-95 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
        </div>
      </div>
      {/* <div className=" flex items-center justify-center mt-2 mx-2">
        <img src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757761484/tamara_tabby_kooxbn.webp" alt="" className="w-full  sm:mx-4 h-auto rounded-lg" />
      </div> */}

      {/* Dynamic Section Position 1 */}
      {/* {renderDynamicSection(1)} */}

      {/* Big Sale Section - Handles both mobile and desktop views */}
      <BigSaleSection products={featuredProducts} />

      {/* Featured Products Section - Mobile Grid */}
      <section className="py-6 mx-3 md:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Featured Products</h2>
          <button className="text-green-600 hover:text-green-800 font-medium text-sm">View All</button>
        </div>
         
        <div className="grid grid-cols-2 gap-3">
          {featuredProducts.slice(0, 4).map((product, index) => (
            <MobileProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      </section>



      {/* Dynamic Section Position 2 */}
      {/* {renderDynamicSection(2)} */}



      {/* Mobile Banner (now clickable linking to HP brand page) */}
      <div className="md:hidden rounded-lg shadow-lg mx-3 h-[160px]">
  <Link to={brandUrls.HP} aria-label="Browse HP products">
          <img
          //  src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753939738/hp_ntmpcm.png"
           src="11.png" 
          alt="HP Products Banner Mobile"
            className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

     
      {/* Desktop Banner - Two separate images side by side */}
      <div className="hidden md:flex gap-2 mx-3 h-[270px]">
        <div className="w-1/2">
          <Link to={brandUrls.HP}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753854476/hp_half_side_1_iqvlks.png"
             src="hp.png"
             alt="HP Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
        <div className="w-1/2">
          <Link to={brandUrls.Dell}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753854475/dell_half_side_6_igop3u.png"
             src="dell1.png"
             alt="Dell Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
      </div>

      {/* HP and Dell Section - Mobile shows only HP */}
      <section className="py-8 mx-3">
        <div className="flex flex-col md:flex-row gap-6">
          {/* HP Products */}
          <div className="w-full md:w-1/2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
              {hpProducts.length > 0 ? (
                <>
                  {hpProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {hpProducts[2] && <DynamicBrandProductCard product={hpProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No HP products available</div>
              )}
            </div>
          </div>

          {/* Dell Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dellProducts.length > 0 ? (
                <>
                  {dellProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {dellProducts[2] && <DynamicBrandProductCard product={dellProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No Dell products available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section Position 3 */}
      {/* {renderDynamicSection(3)} */}

      {/* Accessories Banner - Desktop/Mobile Responsive */}
      <div className="mx-3 my-4 h-[160px] lg:h-[300px]">
        <Link to="/product-category/accessories">
          <img
            src="12.png"
            alt="Accessories Promotion Banner Mobile"
            className="w-full h-full cover rounded-lg lg:hidden"
          />
          <img
            src="acessories (1).png"
            alt="Accessories Promotion Banner Desktop"
            className="w-full h-full cover rounded-lg hidden lg:block"
          />
        </Link>
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {accessoriesProducts.slice(0, 2).map((product) => (
              <AccessoriesProductCard key={product._id} product={product} />
            ))}
            {accessoriesProducts.slice(2, 6).map((product) => (
              <div key={product._id} className="hidden md:block">
                <AccessoriesProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No accessories products available</p>
          </div>
        )}
      </section>
  {/* <CategoryBanners /> */}
      {/* Dynamic Section Position 4 */}
      {/* {renderDynamicSection(4)} */}

      {/* Mobile Banner Asus */}
      <div className="md:hidden rounded-lg shadow-lg mx-3 h-[160px]">
  <Link to={brandUrls.ASUS} aria-label="Browse ASUS products">
          <img
            //src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753939737/asus_f95cjw.png"
            src="laptop (2).png"
            alt="ASUS Products Banner Mobile"
            className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Desktop Banner - Two separate images side by side */}
      <div className="hidden md:flex gap-2 mx-3 h-[270px]">
        <div className="w-1/2">
          <Link to={brandUrls.Acer}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753854475/acer_half_side_jkun9a.png"
             src="acer01.png"
             alt="HP Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
        <div className="w-1/2">
          <Link to={brandUrls.ASUS}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753854475/asus_half_side_aikrmo.png"
             src="asus01.png"
             alt="Dell Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
      </div>

      {/* Acer and ASUS Section - Mobile shows only ASUS */}
      <section className="py-8 mx-3">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Acer Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {acerProducts.length > 0 ? (
                <>
                  {acerProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {acerProducts[2] && <DynamicBrandProductCard product={acerProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No Acer products available</div>
              )}
            </div>
          </div>

          {/* ASUS Products */}
          <div className="w-full md:w-1/2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {asusProducts.length > 0 ? (
                <>
                  {asusProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {asusProducts[2] && <DynamicBrandProductCard product={asusProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">
                  No ASUS products available
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section Position 5 */}
      {/* {renderDynamicSection(5)} */}

      {/* Networking Banner - Desktop/Mobile Responsive */}
      <div className="mx-3 my-4 h-[160px] lg:h-[300px]">
        <Link to="/product-category/computers/networking">
          <img
            src="13.png"
            alt="Networking Banner Mobile"
            className="w-full h-full cover rounded-lg lg:hidden"
          />
          <img
            src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753939592/networking_kr6uvk.png"
            alt="Networking Banner Desktop"
            className="w-full h-full cover rounded-lg hidden lg:block"
          />
        </Link>
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {networkingProducts.slice(0, 2).map((product) => (
              <AccessoriesProductCard key={product._id} product={product} />
            ))}
            {networkingProducts.slice(2, 6).map((product) => (
              <div key={product._id} className="hidden md:block">
                <AccessoriesProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No networking products available</p>
          </div>
        )}
      </section>

      {/* Dynamic Section Position 6 */}
      {/* {renderDynamicSection(6)} */}

      {/* Mobile Banner MSI */}
      <div className="md:hidden rounded-lg shadow-lg mx-3 h-[160px]">
  <Link to={brandUrls.MSI} aria-label="Browse MSI products">
          <img
            //src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753939739/msi_mmaozn.png"
            src="14.png"
            alt="MSI Products Banner Mobile"
            className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Desktop Banner - Two separate images side by side */}
      <div className="hidden md:flex gap-2 mx-3 h-[270px]">
        <div className="w-1/2">
          <Link to={brandUrls.MSI}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753854476/msi_half_side_1_k4dmhz.png"
             src="msi01.png"
             alt="HP Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
        <div className="w-1/2">
          <Link to={brandUrls.Lenovo}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753854475/lenovo_half_side_daug2k.png"
             src="lenovo01.png"
             alt="Dell Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
      </div>

      {/* MSI and Lenovo Products Section - Mobile shows only MSI */}
      <section className="py-8 mx-3">
        <div className="flex flex-col md:flex-row gap-6">
          {/* MSI Products */}
          <div className="w-full md:w-1/2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {msiProducts.length > 0 ? (
                <>
                  {msiProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {msiProducts[2] && <DynamicBrandProductCard product={msiProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No MSI products available</div>
              )}
            </div>
          </div>

          {/* Lenovo Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {lenovoProducts.length > 0 ? (
                <>
                  {lenovoProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {lenovoProducts[2] && <DynamicBrandProductCard product={lenovoProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No Lenovo products available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section Position 7 */}
      {/* {renderDynamicSection(7)} */}

      {/* Mobile Banner Apple */}
      <div className="md:hidden rounded-lg shadow-lg mx-3 h-[160px]">
  <Link to={brandUrls.Apple} aria-label="Browse Apple products">
          <img
          //  src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757769951/apple_half_side_n1cxhc.png"
          src="15.png"
          alt="Apple Products Banner Mobile"
            className="w-full h-full cover rounded-lg hover:opacity-95 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Desktop Banner - Two separate images side by side */}
      <div className="hidden md:flex gap-2 mx-3 h-[270px]">
        <div className="w-1/2">
          <Link to={brandUrls.Apple}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757769951/apple_half_side_n1cxhc.png"
             src="apple (1).png"
             alt="HP Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
        <div className="w-1/2">
          <Link to={brandUrls.Samsung}>
            <img
             // src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1753939592/samsung_half_side_gtslyc.png"
             src="samsung01.png" 
             alt="Dell Products Banner"
              className="w-full h-full cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            />
          </Link>
        </div>
      </div>



      {/* Apple and Samsung Products Section - Mobile shows only Apple */}
      <section className="py-8 mx-3">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Apple Products */}
          <div className="w-full md:w-1/2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {appleProducts.length > 0 ? (
                <>
                  {appleProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {appleProducts[2] && <DynamicBrandProductCard product={appleProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">
                  No Apple products available
                </div>
              )}
            </div>
          </div>

          {/* Samsung Products - Hidden on Mobile */}
          <div className="w-full md:w-1/2 hidden md:block">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {samsungProducts.length > 0 ? (
                <>
                  {samsungProducts.slice(0, 2).map((product) => (
                    <DynamicBrandProductCard key={product._id} product={product} />
                  ))}
                  <div className="hidden md:block">
                    {samsungProducts[2] && <DynamicBrandProductCard product={samsungProducts[2]} />}
                  </div>
                </>
              ) : (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">No Samsung products available</div>
              )}
            </div>
          </div>
        </div>
      </section>

           {/* Dynamic Section Position 8 */}
      {/* {renderDynamicSection(8)}
  */}
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

      {/* Dynamic Section Position 9 */}
      {/* {renderDynamicSection(9)} */}

      {/* Featured Brands Section - Use BrandSlider component */}
      {brands.length > 0 && <BrandSlider brands={brands} onBrandClick={handleBrandClick} />}

      {/* Dynamic Section Position 10 */}
      {/* {renderDynamicSection(10)} */}

      {/* Core Service Section - Responsive: Desktop(4 in row), Mobile(2x2 grid) */}
      <section className="py-8 md:py-10 bg-white mt-2">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-center text-gray-900 mb-6 lg:mb-8 xl:mb-12">
            Core Service Aspects
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6 xl:gap-8 2xl:gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg flex items-center justify-center mb-2 lg:mb-3 xl:mb-4">
                <CreditCard className="w-6 h-6 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-lime-500" />
              </div>
              <h3 className="text-xs lg:text-sm xl:text-base 2xl:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">Secure Payment Method</h3>
              <p className="text-[10px] lg:text-xs xl:text-sm text-gray-600 leading-relaxed">
                Available Different secure Payment Methods
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg flex items-center justify-center mb-2 lg:mb-3 xl:mb-4">
                <Truck className="w-6 h-6 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-lime-500" />
              </div>
              <h3 className="text-xs lg:text-sm xl:text-base 2xl:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">Extreme Fast Delivery</h3>
              <p className="text-[10px] lg:text-xs xl:text-sm text-gray-600 leading-relaxed">
                Fast and convenient From door to door delivery
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg flex items-center justify-center mb-2 lg:mb-3 xl:mb-4">
                <Heart className="w-6 h-6 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-lime-500" />
              </div>
              <h3 className="text-xs lg:text-sm xl:text-base 2xl:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">Quality & Savings</h3>
              <p className="text-[10px] lg:text-xs xl:text-sm text-gray-600 leading-relaxed">
                Comprehensive quality control and affordable price
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg flex items-center justify-center mb-2 lg:mb-3 xl:mb-4">
                <Headphones className="w-6 h-6 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-lime-500" />
              </div>
              <h3 className="text-xs lg:text-sm xl:text-base 2xl:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">Professional Support</h3>
              <p className="text-[10px] lg:text-xs xl:text-sm text-gray-600 leading-relaxed">
                Efficient customer support from passionate team
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
      `}</style>
    </div>
  )
}

const MobileProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
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

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border p-2 h-[410px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex h-[170px] justify-center items-center">
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`}>
          <img
            src={getFullImageUrl(product.image) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            className="w-full h-full object-contain rounded mx-auto"
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
      
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-xs inline-block`}>
          {stockStatus.replace('Available Product', 'Available')}
        </div>
        {discount && (
          <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-xs inline-block">{discount}</div>
        )}
      </div>
      
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`}>
        <h3 className="text-xs font-sm text-gray-900 line-clamp-3 hover:text-blue-600 h-[50px] mb-1">{product.name}</h3>
      </Link>
      
      {product.category && <div className="text-xs text-yellow-600 mb-1">Category: {categoryName}</div>}
      <div className="text-xs text-green-600 mb-1">Inclusive VAT</div>
      
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0 mb-1">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed with 20px stars */}
      <div className="flex items-center mb-2 min-h-[24px]">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={17}
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
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => {
            if (e.target) e.target.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className="mt-auto w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        Add to Cart
      </button>
    </div>
  )
}

const DynamicBrandProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
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

  // Fallback: compute discount % if not provided from admin and we have a valid offer
  let computedDiscount = null
  if (!discount && hasValidOffer && basePrice > 0 && offerPrice > 0) {
    const pct = Math.round(((basePrice - offerPrice) / basePrice) * 100)
    if (pct > 0) computedDiscount = `${pct}% Off`
  }
  const finalDiscountLabel = discount || computedDiscount

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border p-2 h-[410px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex justify-center items-center" style={{height:190}}>
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`} className="w-full h-full flex items-center justify-center">
          <img
            src={getFullImageUrl(product.image) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            className="w-full h-full object-contain bg-white rounded mx-auto mb-4"
            style={{maxHeight:165}}
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
        {/* Status & Discount badges overlayed at bottom of image, always inside image area */}
        <div className="absolute inset-x-0 -bottom-2 px-2 flex flex-wrap items-center gap-2 z-10">
          <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm`}>{stockStatus.replace('Available Product', 'Available')}</div>
          {finalDiscountLabel && (
            <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm">
              {finalDiscountLabel}
            </div>
          )}
        </div>
      </div>
      
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`}>
        <h3 className="text-xs font-sm text-gray-900 line-clamp-3 hover:text-blue-600 h-[50px]">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-yellow-600">Category: {categoryName}</div>}
      <div className="text-xs text-green-600">Inclusive VAT</div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed with 20px stars */}
      <div className="flex items-center min-h-[24px]">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
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
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => {
            if (e.target) e.target.style.transform = "scale(1)"
          }, 100)
          addToCart(product)
        }}
        className=" w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        Add to Cart
      </button>
    </div>
  )
}

const AccessoriesProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  // Use dynamic discount
  const discount = product.discount && Number(product.discount) > 0 ? `${product.discount}% Off` : null
  // Use dynamic stock status
  const stockStatus = product.stockStatus || (product.countInStock > 0 ? "Available" : "Out of Stock")
  // Use dynamic price
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

  // Fallback: compute discount % if not provided from admin
  let computedDiscount = null
  if (!discount && hasValidOffer && basePrice > 0 && offerPrice > 0) {
    const pct = Math.round(((basePrice - offerPrice) / basePrice) * 100)
    if (pct > 0) computedDiscount = `${pct}% Off`
  }
  const finalDiscountLabel = discount || computedDiscount

  // Fix rating and reviews display
  const rating = Number(product.rating) || 0
  const numReviews = Number(product.numReviews) || 0

  // Get category and brand names safely
  const categoryName = product.category?.name || "Unknown"

  return (
    <div className="border p-2 h-[410px] flex flex-col justify-between bg-white">
      <div className="relative mb-2 flex justify-center items-center" style={{height:190}}>
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`} className="w-full h-full flex items-center justify-center">
          <img
            src={getFullImageUrl(product.image) || "/placeholder.svg?height=120&width=120"}
            alt={product.name}
            className="w-full h-full object-contain bg-white rounded mx-auto mb-4"
            style={{maxHeight:165}}
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
        {/* Status & Discount badges overlayed at bottom of image, always inside image area */}
        <div className="absolute inset-x-0 -bottom-2 px-2 flex flex-wrap items-center gap-2 z-10">
          <div className={`${getStatusColor(stockStatus)} text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm`}>{stockStatus.replace('Available Product', 'Available')}</div>
          {finalDiscountLabel && (
            <div className="bg-yellow-400 text-white px-1 py-0.5 rounded text-[10px] font-medium shadow-sm">
              {finalDiscountLabel}
            </div>
          )}
        </div>
      </div>
  <Link to={`/product/${encodeURIComponent(product.slug || product._id)}`}>
        <h3 className="text-xs font-sm text-gray-900 line-clamp-3 hover:text-blue-600 h-[50px]">{product.name}</h3>
      </Link>
      {product.category && <div className="text-xs text-yellow-600">Category: {categoryName}</div>}
      <div className="text-xs text-green-600">Inclusive VAT</div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
        <div className="text-red-600 font-bold text-sm">
          {Number(priceToShow).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
        </div>
        {showOldPrice && (
          <div className="text-gray-400 line-through text-xs font-medium">
            {Number(basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}AED
          </div>
        )}
      </div>

      {/* Rating and Reviews Section - Fixed with 20px stars */}
      <div className="flex items-center min-h-[24px]">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
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
          e.target.style.transform = "scale(0.95)"
          setTimeout(() => { if (e.target) e.target.style.transform = "scale(1)" }, 100)
          addToCart(product)
        }}
        className=" w-full bg-lime-500 hover:bg-lime-400 border border-lime-300 hover:border-transparent text-black text-xs font-medium py-2 px-1 rounded flex items-center justify-center gap-1 transition-all duration-100"
        disabled={stockStatus === "Out of Stock"}
      >
        <ShoppingBag size={12} />
        Add to Cart
      </button>
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