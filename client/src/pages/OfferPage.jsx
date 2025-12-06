import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import config from "../config/config"
import ProductCard from "../components/ProductCard"
import { Helmet } from "react-helmet-async"
import { ChevronLeft, ChevronRight } from "lucide-react"

const OfferPage = () => {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [offerPage, setOfferPage] = useState(null)
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const brandsScrollRef = useRef(null)
  const categoriesScrollRef = useRef(null)

  useEffect(() => {
    fetchOfferPageData()
  }, [slug])

  const fetchOfferPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch offer page details by slug
      const pageResponse = await axios.get(`${config.API_URL}/api/offer-pages/slug/${slug}`)
      const pageData = pageResponse.data

      if (!pageData.isActive) {
        setError("This offer is currently not available.")
        setLoading(false)
        return
      }

      setOfferPage(pageData)

      // Fetch associated products, brands, and categories in parallel
      // Also fetch ALL categories and brands to ensure complete data
      const [productsRes, brandsRes, categoriesRes, allCategoriesRes, allBrandsRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/offer-products/page/${slug}`),
        axios.get(`${config.API_URL}/api/offer-brands/page/${slug}`),
        axios.get(`${config.API_URL}/api/offer-categories/page/${slug}`),
        axios.get(`${config.API_URL}/api/categories`),
        axios.get(`${config.API_URL}/api/brands`)
      ])

      console.log('Offer Page Data:', pageData)
      console.log('Card Images:', pageData.cardImages)
      console.log('Offer Products Response:', productsRes.data)
      console.log('Offer Brands Response:', brandsRes.data)
      console.log('Offer Categories Response:', categoriesRes.data)
      console.log('All Categories:', allCategoriesRes.data)
      console.log('All Brands:', allBrandsRes.data)

      // Filter only active items and ensure product data exists
      const activeProducts = productsRes.data.filter(item => {
        console.log('Product Item:', item)
        return item.isActive && item.product && item.product._id
      })
      
      console.log('Filtered Active Products:', activeProducts)
      
      // Create lookup maps for brands and categories from ALL data
      const brandMap = {}
      const categoryMap = {}
      
      // First add from offer-specific brands
      brandsRes.data.forEach(item => {
        if (item.brand && item.brand._id) {
          brandMap[item.brand._id] = item.brand
        }
      })
      
      // Then add from all brands (won't override existing)
      allBrandsRes.data.forEach(brand => {
        if (brand && brand._id && !brandMap[brand._id]) {
          brandMap[brand._id] = brand
        }
      })
      
      // First add from offer-specific categories
      categoriesRes.data.forEach(item => {
        if (item.category && item.category._id) {
          categoryMap[item.category._id] = item.category
        }
      })
      
      // Then add from all categories (this ensures we have complete data)
      allCategoriesRes.data.forEach(category => {
        if (category && category._id && !categoryMap[category._id]) {
          categoryMap[category._id] = category
        }
      })
      
      console.log('Brand Map:', brandMap)
      console.log('Category Map:', categoryMap)
      
      // Enrich products with full brand and category objects
      const enrichedProducts = activeProducts.map(item => {
        const product = { ...item.product }
        
        console.log('Before enrichment - Product:', product.name)
        console.log('Category before:', product.category)
        console.log('Brand before:', product.brand)
        
        // Replace brand ID with full brand object if needed
        if (product.brand && typeof product.brand === 'string') {
          if (brandMap[product.brand]) {
            product.brand = brandMap[product.brand]
            console.log('Brand enriched to:', product.brand)
          } else {
            console.warn('Brand ID not found in map:', product.brand)
          }
        }
        
        // Replace category ID with full category object if needed
        if (product.category && typeof product.category === 'string') {
          if (categoryMap[product.category]) {
            product.category = categoryMap[product.category]
            console.log('Category enriched to:', product.category)
          } else {
            console.warn('Category ID not found in map:', product.category)
          }
        }
        
        // Also check subcategory, parentCategory, etc.
        if (product.subcategory && typeof product.subcategory === 'string' && categoryMap[product.subcategory]) {
          product.subcategory = categoryMap[product.subcategory]
        }
        
        if (product.parentCategory && typeof product.parentCategory === 'string' && categoryMap[product.parentCategory]) {
          product.parentCategory = categoryMap[product.parentCategory]
        }
        
        console.log('After enrichment - Category:', product.category)
        console.log('After enrichment - Brand:', product.brand)
        
        return { ...item, product }
      })
      
      console.log('Enriched Products:', enrichedProducts)
      
      setProducts(enrichedProducts)
      setFilteredProducts(enrichedProducts)
      setBrands(brandsRes.data.filter(item => item.isActive && item.brand))
      setCategories(categoriesRes.data.filter(item => item.isActive && item.category))

      setLoading(false)
    } catch (error) {
      console.error("Error fetching offer page:", error)
      console.error("Error details:", error.response?.data)
      setError("Offer page not found.")
      setLoading(false)
    }
  }

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleBrandClick = (brandId) => {
    if (selectedBrand === brandId) {
      // Deselect if already selected
      setSelectedBrand(null)
      setSelectedCategory(null)
      applyFilters(null, null)
    } else {
      // Clear category filter when selecting brand
      setSelectedBrand(brandId)
      setSelectedCategory(null)
      applyFilters(brandId, null)
    }
  }

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      // Deselect if already selected
      setSelectedCategory(null)
      setSelectedBrand(null)
      applyFilters(null, null)
    } else {
      // Clear brand filter when selecting category
      setSelectedCategory(categoryId)
      setSelectedBrand(null)
      applyFilters(null, categoryId)
    }
  }

  const applyFilters = (brandId, categoryId) => {
    let filtered = [...products]

    if (brandId) {
      filtered = filtered.filter(item => 
        item.product?.brand?._id === brandId || item.product?.brand === brandId
      )
    }

    if (categoryId) {
      filtered = filtered.filter(item => {
        // Check if product matches the category (parent category)
        if (item.product?.category?._id === categoryId || item.product?.category === categoryId) {
          return true
        }
        // Check if product matches any subcategory level
        if (item.product?.subcategory?._id === categoryId || item.product?.subcategory === categoryId) {
          return true
        }
        if (item.product?.subcategory2?._id === categoryId || item.product?.subcategory2 === categoryId) {
          return true
        }
        if (item.product?.subcategory3?._id === categoryId || item.product?.subcategory3 === categoryId) {
          return true
        }
        if (item.product?.subcategory4?._id === categoryId || item.product?.subcategory4 === categoryId) {
          return true
        }
        return false
      })
    }

    setFilteredProducts(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offer...</p>
        </div>
      </div>
    )
  }

  if (error || !offerPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Offer Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The offer you're looking for doesn't exist."}</p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{offerPage.metaTitle || offerPage.name}</title>
        <meta name="description" content={offerPage.metaDescription || offerPage.description} />
        <link rel="canonical" href={`${window.location.origin}/offers/${slug}`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        {offerPage.heroImage && (
          <div className="relative h-64 md:h-96 bg-gradient-to-r from-lime-600 to-green-600">
            <img
              src={offerPage.heroImage}
              alt={offerPage.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {/* <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{offerPage.name}</h1>
                {offerPage.description && (
                  <p className="text-lg md:text-xl max-w-3xl mx-auto">{offerPage.description}</p>
                )}
              </div> */}
            </div>
          </div>
        )}

        {/* Title Section (if no hero image) */}
        {!offerPage.heroImage && (
          <div className="bg-gradient-to-r from-lime-600 to-green-600 py-12">
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{offerPage.name}</h1>
              {offerPage.description && (
                <p className="text-lg md:text-xl max-w-3xl mx-auto">{offerPage.description}</p>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          {/* Main Layout: Sidebar + Products */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Optional Card Images */}
            {offerPage.cardImages && offerPage.cardImages.length > 0 && (
              <aside className="w-full lg:w-1/4 space-y-4">
                {offerPage.cardImages.map((cardImage, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow-md">
                    <img
                      src={cardImage.image}
                      alt={`${offerPage.name} card ${index + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </aside>
            )}

            {/* Main Content Area - Categories, Brands, and Products */}
            <div className={`flex-1 ${offerPage.cardImages && offerPage.cardImages.length > 0 ? 'lg:w-3/4' : 'w-full'}`}>
              {/* Categories Slider - First Line */}
              {categories.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories...</h2>
                  <div className="relative">
                    <button
                      onClick={() => scrollSlider(categoriesScrollRef, 'left')}
                      className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={categoriesScrollRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {categories.map((item) => {
                        const catData = item.category
                        const displayName = catData?.displayName || catData?.name || 'N/A'
                        const displayImage = catData?.image
                        return (
                          <button
                            key={item._id}
                            onClick={() => handleCategoryClick(catData._id)}
                            className={`flex-shrink-0 w-32 h-32 rounded-lg transition-all flex items-center justify-center p-4 ${
                              selectedCategory === catData._id
                                ? 'bg-lime-100 border-2 border-lime-600'
                                : ''
                            }`}
                          >
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={displayName}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-700 text-center">
                                {displayName}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => scrollSlider(categoriesScrollRef, 'right')}
                      className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )}

              {/* Brands Slider - Second Line */}
              {brands.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Brands...</h2>
                  <div className="relative">
                    <button
                      onClick={() => scrollSlider(brandsScrollRef, 'left')}
                      className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div
                      ref={brandsScrollRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {brands.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => handleBrandClick(item.brand._id)}
                          className={`flex-shrink-0 w-32 h-32 rounded-lg transition-all flex items-center justify-center p-4 ${
                            selectedBrand === item.brand._id
                              ? 'bg-lime-100 border-2 border-lime-600'
                              : ''
                          }`}
                        >
                          {item.brand.logo ? (
                            <img
                              src={item.brand.logo}
                              alt={item.brand.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-700 text-center">
                              {item.brand.name}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => scrollSlider(brandsScrollRef, 'right')}
                      className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-lime-500 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </section>
              )}

              {/* Active Filter Display */}
              {(selectedBrand || selectedCategory) && (
                <div className="mb-4 p-4 bg-lime-50 border border-lime-200 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700"></span>
                    {selectedBrand && (
                      <span className="px-3 py-1 bg-lime-600 text-white rounded-full text-sm font-medium">
                        Brand: {brands.find(b => b.brand._id === selectedBrand)?.brand?.name || 'Selected Brand'}
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="px-3 py-1 bg-lime-600 text-white rounded-full text-sm font-medium">
                        Category: {categories.find(c => c.category._id === selectedCategory)?.category?.displayName || categories.find(c => c.category._id === selectedCategory)?.category?.name || 'Selected Category'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBrand(null)
                      setSelectedCategory(null)
                      setFilteredProducts(products)
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Products...</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((item, index) => (
                      <ProductCard key={item._id} product={item.product} offerPageName={offerPage?.name} cardIndex={index} />
                    ))}
                  </div>
                </section>
              )}

              {/* No Results State */}
              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">No products match your selected filters.</p>
                  <button
                    onClick={() => {
                      setSelectedBrand(null)
                      setSelectedCategory(null)
                      setFilteredProducts(products)
                    }}
                    className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OfferPage
