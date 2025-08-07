// import config from "../config/config.js"

// // Product Caching Service with compression and size management
// class ProductCacheService {
//   constructor() {
//     this.CACHE_KEY = 'graba2z_products_cache'
//     this.CACHE_CHUNK_PREFIX = 'graba2z_products_chunk_'
//     this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
//     this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
//     this.MAX_CHUNKS = 20 // More chunks, smaller size
//   }

//   // Compress data using JSON.stringify and btoa
//   compressData(data) {
//     try {
//       const jsonString = JSON.stringify(data)
//       return btoa(encodeURIComponent(jsonString))
//     } catch (error) {
//       return null
//     }
//   }

//   // Decompress data
//   decompressData(compressedData) {
//     try {
//       const jsonString = decodeURIComponent(atob(compressedData))
//       return JSON.parse(jsonString)
//     } catch (error) {
//       return null
//     }
//   }

//   // Check if cache is valid
//   isCacheValid() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) return false

//     try {
//       const data = this.decompressData(cached)
//       if (!data) return false
      
//       const now = Date.now()
//       return data.timestamp && (now - data.timestamp) < this.CACHE_EXPIRY
//     } catch (error) {
//       return false
//     }
//   }

//   // Get cached products
//   getCachedProducts() {
//     if (!this.isCacheValid()) return null

//     try {
//       const cached = localStorage.getItem(this.CACHE_KEY)
//       const data = this.decompressData(cached)
      
//       if (!data) return null

//       // Check if data is chunked
//       if (data.isChunked) {
//         return this.getCachedProductsChunked(data)
//       }

//       return data?.products || []
//     } catch (error) {
//       return null
//     }
//   }

//   // Get cached products from chunked storage
//   getCachedProductsChunked(metadata) {
//     try {
//       const allProducts = []
      
//       for (let i = 0; i < metadata.chunkCount; i++) {
//         const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`
        
//         // Try localStorage first, then sessionStorage
//         let chunkData = localStorage.getItem(chunkKey)
//         let storageType = 'localStorage'
        
//         if (!chunkData) {
//           chunkData = sessionStorage.getItem(chunkKey)
//           storageType = 'sessionStorage'
//         }
        
//         if (!chunkData) {
//           return null
//         }

//         const chunk = this.decompressData(chunkData)
//         if (!chunk || !chunk.products) {
//           return null
//         }

//         allProducts.push(...chunk.products)
//       }

//       return allProducts

//     } catch (error) {
//       return null
//     }
//   }

//     // Set products in cache with chunked storage
//   async setCachedProducts(products) {
//     try {

      
//       // Create ultra-minimal product data (only core fields)
//       const minimalProducts = products.map(product => ({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         basePrice: product.basePrice,
//         offerPrice: product.offerPrice,
//         brand: product.brand,
//         category: product.category,
//         parentCategory: product.parentCategory,
//         countInStock: product.countInStock,
//         stockStatus: product.stockStatus,
//         discount: product.discount,
//         featured: product.featured,
//         slug: product.slug,
//         image: product.image,
//         galleryImages: product.galleryImages
//       }))

//       // Try single cache first
//       const cacheData = {
//         products: minimalProducts,
//         timestamp: Date.now(),
//         isMinimal: true
//       }

//       const compressedData = this.compressData(cacheData)
//       if (!compressedData) {
//         throw new Error('Failed to compress data')
//       }

//       const dataSize = new Blob([compressedData]).size
      
//       if (dataSize <= this.MAX_CACHE_SIZE) {
//         localStorage.setItem(this.CACHE_KEY, compressedData)
//         return
//       }

//       // If too large, try chunked storage
//       return await this.setCachedProductsChunked(minimalProducts)

//     } catch (error) {
//       throw error
//     }
//   }

//   // Set products in cache using chunked storage
//   async setCachedProductsChunked(products) {
//     try {
//       const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
//       const chunks = []
      
//       // Split products into chunks
//       for (let i = 0; i < products.length; i += chunkSize) {
//         chunks.push(products.slice(i, i + chunkSize))
//       }



//       // Store chunk metadata
//       const metadata = {
//         totalProducts: products.length,
//         chunkCount: chunks.length,
//         timestamp: Date.now(),
//         isChunked: true
//       }

//       localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

//       // Store each chunk
//       for (let i = 0; i < chunks.length; i++) {
//         const chunkData = {
//           products: chunks[i],
//           chunkIndex: i,
//           timestamp: Date.now()
//         }

//         const compressedChunk = this.compressData(chunkData)
//         const chunkSize = new Blob([compressedChunk]).size

//         if (chunkSize > this.MAX_CACHE_SIZE) {
//           // Try sessionStorage as fallback
//           try {
//             sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//           } catch (sessionError) {
//             throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
//           }
//         } else {
//           localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//         }
//       }

//       return true

//     } catch (error) {
//       // Clean up any partial chunks
//       this.clearCache()
//       throw error
//     }
//   }

//   // Clear cache
//   clearCache() {
//     // Clear main cache
//     localStorage.removeItem(this.CACHE_KEY)
//     sessionStorage.removeItem(this.CACHE_KEY)
    
//     // Clear chunked cache from both storages
//     for (let i = 0; i < this.MAX_CHUNKS; i++) {
//       localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//       sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//     }
    

//   }

//   // Force refresh cache (clear and fetch new data)
//   async forceRefreshCache() {
//     this.clearCache()
//     const products = await this.fetchAndCacheProducts()
//     return products
//   }

//   // Test cache functionality
//   async testCache() {
//     // Check current cache
//     const stats = this.getCacheStats()
    
//     // Try to get products
//     const products = await this.getProducts()
    
//     // Check if cache was used
//     const newStats = this.getCacheStats()
    
//     // Test storage availability
//     const storageTest = {
//       localStorage: this.testStorage('localStorage'),
//       sessionStorage: this.testStorage('sessionStorage')
//     }
    
//     return { products, cacheUsed: newStats.hasCache, storageTest }
//   }

//   // Test storage availability
//   testStorage(storageType) {
//     try {
//       const testKey = 'test_storage'
//       const testValue = 'test'
      
//       if (storageType === 'localStorage') {
//         localStorage.setItem(testKey, testValue)
//         const result = localStorage.getItem(testKey) === testValue
//         localStorage.removeItem(testKey)
//         return result
//       } else if (storageType === 'sessionStorage') {
//         sessionStorage.setItem(testKey, testValue)
//         const result = sessionStorage.getItem(testKey) === testValue
//         sessionStorage.removeItem(testKey)
//         return result
//       }
//       return false
//     } catch (error) {
//       return false
//     }
//   }

//     // Fetch products from API and cache them
//   async fetchAndCacheProducts() {
//     try {
//       const response = await fetch(`${config.API_URL}/api/products`)
//       if (!response.ok) {
//         throw new Error('Failed to fetch products')
//       }
//       const products = await response.json()
      
//       // Always try to cache products
//       try {
//         await this.setCachedProducts(products)
//       } catch (cacheError) {
//         // Continue without cache - the app will still work
//       }
      
//       return products
//     } catch (error) {
//       throw error
//     }
//   }

//       // Get products (from cache or API)
//   async getProducts() {
//     // Check if we have valid cached data
//     if (this.isCacheValid()) {
//       const cachedProducts = this.getCachedProducts()
//       if (cachedProducts && cachedProducts.length > 0) {
//         return cachedProducts
//       }
//     }

//     // Fetch from API if no valid cache
//     return await this.fetchAndCacheProducts()
//   }

//   // Filter products by category and parent_category
//   filterProducts(products, filters = {}) {
//     if (!products || !Array.isArray(products)) {
//       return []
//     }

//     let filteredProducts = [...products]

//     // Filter by category
//     if (filters.category && filters.category !== 'all') {
//       filteredProducts = filteredProducts.filter(product => {
//         if (!product.category) return false
        
//         const categoryId = typeof product.category === 'string' 
//           ? product.category 
//           : product.category._id
        
//         return categoryId === filters.category
//       })
//     }

//     // Filter by parent_category
//     if (filters.parent_category && filters.parent_category !== 'all') {
//       filteredProducts = filteredProducts.filter(product => {
//         if (!product.parentCategory) return false
        
//         const parentCategoryId = typeof product.parentCategory === 'string' 
//           ? product.parentCategory 
//           : product.parentCategory._id
        
//         return parentCategoryId === filters.parent_category
//       })
//     }

//     // Filter by brand
//     if (filters.brand && filters.brand.length > 0) {
//       filteredProducts = filteredProducts.filter(product => {
//         if (!product.brand) return false
        
//         const brandId = typeof product.brand === 'string' 
//           ? product.brand 
//           : product.brand._id
        
//         return filters.brand.includes(brandId)
//       })
//     }

//     // Filter by search query
//     if (filters.search && filters.search.trim()) {
//       const searchTerm = filters.search.toLowerCase().trim()
//       filteredProducts = filteredProducts.filter(product => {
//         const name = (product.name || '').toLowerCase()
//         const description = (product.description || '').toLowerCase()
//         const brandName = product.brand?.name?.toLowerCase() || ''
        
//         return name.includes(searchTerm) || 
//                description.includes(searchTerm) || 
//                brandName.includes(searchTerm)
//       })
//     }

//     // Filter by price range
//     if (filters.priceRange && Array.isArray(filters.priceRange)) {
//       const [minPrice, maxPrice] = filters.priceRange
//       filteredProducts = filteredProducts.filter(product => {
//         const price = product.price || 0
//         return price >= minPrice && price <= maxPrice
//       })
//     }

//     // Filter by stock status (supports multiple filters)
//     if (filters.stockStatus) {
//       const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]
      
//       if (stockFilters.length > 0) {
//         filteredProducts = filteredProducts.filter(product => {
//           // If any stock filter matches, include the product
//           const matches = stockFilters.some(filter => {
//             switch (filter) {
//               case 'inStock':
//                 // Product is in stock if stockStatus is "Available Product" OR countInStock > 0
//                 return product.stockStatus === "Available Product" || (product.countInStock || 0) > 0
//               case 'outOfStock':
//                 // Product is out of stock if stockStatus is "Out of Stock" AND countInStock === 0
//                 return product.stockStatus === "Out of Stock" && (product.countInStock || 0) === 0
//               case 'onSale':
//                 // Product is on sale if has discount > 0 OR offerPrice < price
//                 return (product.discount && product.discount > 0) || 
//                        (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
//               default:
//                 return false
//             }
//           })
//           return matches
//         })
//       }
//     }

//     // Sort products - Always prioritize in-stock products first
//     filteredProducts.sort((a, b) => {
//       // Check if products are in stock
//       const aInStock = a.stockStatus === "Available" || a.stockStatus === "Available Product" || (!a.stockStatus && a.countInStock > 0)
//       const bInStock = b.stockStatus === "Available" || b.stockStatus === "Available Product" || (!b.stockStatus && b.countInStock > 0)
      
//       // In-stock products come first
//       if (aInStock && !bInStock) return -1
//       if (!aInStock && bInStock) return 1
      
//       // If both have same stock status, apply secondary sorting
//       if (filters.sortBy) {
//         switch (filters.sortBy) {
//           case 'price-low':
//             return (a.price || 0) - (b.price || 0)
//           case 'price-high':
//             return (b.price || 0) - (a.price || 0)
//           case 'name':
//             return (a.name || '').localeCompare(b.name || '')
//           case 'newest':
//           default:
//             return new Date(b.createdAt) - new Date(a.createdAt)
//         }
//       }
      
//       // Default sorting by newest if no sortBy specified
//       return new Date(b.createdAt) - new Date(a.createdAt)
//     })

//     return filteredProducts
//   }

//   // Get cache statistics
//   getCacheStats() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: 'none' }
//     }

//     try {
//       const data = this.decompressData(cached)
//       if (!data) {
//         return { hasCache: false, itemCount: 0, age: null, cacheType: 'none' }
//       }
      
//       const age = Date.now() - data.timestamp
//       let cacheType = 'full'
//       if (data.isEssential) cacheType = 'essential'
//       if (data.isMinimal) cacheType = 'minimal'
//       if (data.isUltraMinimal) cacheType = 'ultra-minimal'
//       if (data.isChunked) cacheType = 'chunked'
      
//       const itemCount = data.isChunked ? data.totalProducts : (data.products?.length || 0)
      
//       return {
//         hasCache: true,
//         itemCount: itemCount,
//         age: age,
//         isValid: age < this.CACHE_EXPIRY,
//         cacheType: cacheType,
//         chunks: data.isChunked ? data.chunkCount : null
//       }
//     } catch (error) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: 'none' }
//     }
//   }
// }

// // Create singleton instance
// const productCache = new ProductCacheService()

// export default productCache 




// -------------------------
// ==============================

// import config from "../config/config.js"

// // Product Caching Service with compression and size management
// class ProductCacheService {
//   constructor() {
//     this.CACHE_KEY = "graba2z_products_cache"
//     this.CACHE_CHUNK_PREFIX = "graba2z_products_chunk_"
//     this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
//     this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
//     this.MAX_CHUNKS = 20 // More chunks, smaller size
//   }

//   // Compress data using JSON.stringify and btoa
//   compressData(data) {
//     try {
//       const jsonString = JSON.stringify(data)
//       return btoa(encodeURIComponent(jsonString))
//     } catch (error) {
//       return null
//     }
//   }

//   // Decompress data
//   decompressData(compressedData) {
//     try {
//       const jsonString = decodeURIComponent(atob(compressedData))
//       return JSON.parse(jsonString)
//     } catch (error) {
//       return null
//     }
//   }

//   // Check if cache is valid
//   isCacheValid() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) return false

//     try {
//       const data = this.decompressData(cached)
//       if (!data) return false

//       const now = Date.now()
//       return data.timestamp && now - data.timestamp < this.CACHE_EXPIRY
//     } catch (error) {
//       return false
//     }
//   }

//   // Get cached products
//   getCachedProducts() {
//     if (!this.isCacheValid()) return null

//     try {
//       const cached = localStorage.getItem(this.CACHE_KEY)
//       const data = this.decompressData(cached)

//       if (!data) return null

//       // Check if data is chunked
//       if (data.isChunked) {
//         return this.getCachedProductsChunked(data)
//       }

//       return data?.products || []
//     } catch (error) {
//       return null
//     }
//   }

//   // Get cached products from chunked storage
//   getCachedProductsChunked(metadata) {
//     try {
//       const allProducts = []

//       for (let i = 0; i < metadata.chunkCount; i++) {
//         const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`

//         // Try localStorage first, then sessionStorage
//         let chunkData = localStorage.getItem(chunkKey)
//         let storageType = "localStorage"

//         if (!chunkData) {
//           chunkData = sessionStorage.getItem(chunkKey)
//           storageType = "sessionStorage"
//         }

//         if (!chunkData) {
//           return null
//         }

//         const chunk = this.decompressData(chunkData)
//         if (!chunk || !chunk.products) {
//           return null
//         }

//         allProducts.push(...chunk.products)
//       }

//       return allProducts
//     } catch (error) {
//       return null
//     }
//   }

//   // Set products in cache with chunked storage
//   async setCachedProducts(products) {
//     try {
//       // Create ultra-minimal product data (only core fields)
//       const minimalProducts = products.map((product) => ({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         basePrice: product.basePrice,
//         offerPrice: product.offerPrice,
//         brand: product.brand,
//         category: product.category,
//         parentCategory: product.parentCategory,
//         countInStock: product.countInStock,
//         stockStatus: product.stockStatus,
//         discount: product.discount,
//         featured: product.featured,
//         slug: product.slug,
//         image: product.image,
//         galleryImages: product.galleryImages,
//         rating: product.rating,
//         numReviews: product.numReviews,
//       }))

//       // Try single cache first
//       const cacheData = {
//         products: minimalProducts,
//         timestamp: Date.now(),
//         isMinimal: true,
//       }

//       const compressedData = this.compressData(cacheData)
//       if (!compressedData) {
//         throw new Error("Failed to compress data")
//       }

//       const dataSize = new Blob([compressedData]).size

//       if (dataSize <= this.MAX_CACHE_SIZE) {
//         localStorage.setItem(this.CACHE_KEY, compressedData)
//         return
//       }

//       // If too large, try chunked storage
//       return await this.setCachedProductsChunked(minimalProducts)
//     } catch (error) {
//       throw error
//     }
//   }

//   // Set products in cache using chunked storage
//   async setCachedProductsChunked(products) {
//     try {
//       const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
//       const chunks = []

//       // Split products into chunks
//       for (let i = 0; i < products.length; i += chunkSize) {
//         chunks.push(products.slice(i, i + chunkSize))
//       }

//       // Store chunk metadata
//       const metadata = {
//         totalProducts: products.length,
//         chunkCount: chunks.length,
//         timestamp: Date.now(),
//         isChunked: true,
//       }

//       localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

//       // Store each chunk
//       for (let i = 0; i < chunks.length; i++) {
//         const chunkData = {
//           products: chunks[i],
//           chunkIndex: i,
//           timestamp: Date.now(),
//         }

//         const compressedChunk = this.compressData(chunkData)
//         const chunkSize = new Blob([compressedChunk]).size

//         if (chunkSize > this.MAX_CACHE_SIZE) {
//           // Try sessionStorage as fallback
//           try {
//             sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//           } catch (sessionError) {
//             throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
//           }
//         } else {
//           localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//         }
//       }

//       return true
//     } catch (error) {
//       // Clean up any partial chunks
//       this.clearCache()
//       throw error
//     }
//   }

//   // Clear cache
//   clearCache() {
//     // Clear main cache
//     localStorage.removeItem(this.CACHE_KEY)
//     sessionStorage.removeItem(this.CACHE_KEY)

//     // Clear chunked cache from both storages
//     for (let i = 0; i < this.MAX_CHUNKS; i++) {
//       localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//       sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//     }
//   }

//   // Force refresh cache (clear and fetch new data)
//   async forceRefreshCache() {
//     this.clearCache()
//     const products = await this.fetchAndCacheProducts()
//     return products
//   }

//   // Test cache functionality
//   async testCache() {
//     // Check current cache
//     const stats = this.getCacheStats()

//     // Try to get products
//     const products = await this.getProducts()

//     // Check if cache was used
//     const newStats = this.getCacheStats()

//     // Test storage availability
//     const storageTest = {
//       localStorage: this.testStorage("localStorage"),
//       sessionStorage: this.testStorage("sessionStorage"),
//     }

//     return { products, cacheUsed: newStats.hasCache, storageTest }
//   }

//   // Test storage availability
//   testStorage(storageType) {
//     try {
//       const testKey = "test_storage"
//       const testValue = "test"

//       if (storageType === "localStorage") {
//         localStorage.setItem(testKey, testValue)
//         const result = localStorage.getItem(testKey) === testValue
//         localStorage.removeItem(testKey)
//         return result
//       } else if (storageType === "sessionStorage") {
//         sessionStorage.setItem(testKey, testValue)
//         const result = sessionStorage.getItem(testKey) === testValue
//         sessionStorage.removeItem(testKey)
//         return result
//       }
//       return false
//     } catch (error) {
//       return false
//     }
//   }

//   // Fetch products from API and cache them
//   async fetchAndCacheProducts() {
//     try {
//       const response = await fetch(`${config.API_URL}/api/products`)
//       if (!response.ok) {
//         throw new Error("Failed to fetch products")
//       }
//       const products = await response.json()

//       // Always try to cache products
//       try {
//         await this.setCachedProducts(products)
//       } catch (cacheError) {
//         // Continue without cache - the app will still work
//       }

//       return products
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get products (from cache or API)
//   async getProducts() {
//     // Check if we have valid cached data
//     if (this.isCacheValid()) {
//       const cachedProducts = this.getCachedProducts()
//       if (cachedProducts && cachedProducts.length > 0) {
//         return cachedProducts
//       }
//     }

//     // Fetch from API if no valid cache
//     return await this.fetchAndCacheProducts()
//   }

//   // Filter products by category and parent_category
//   filterProducts(products, filters = {}) {
//     if (!products || !Array.isArray(products)) {
//       return []
//     }

//     let filteredProducts = [...products]

//     // Filter by category
//     if (filters.category && filters.category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.category) return false

//         const categoryId = typeof product.category === "string" ? product.category : product.category._id

//         return categoryId === filters.category
//       })
//     }

//     // Filter by parent_category
//     if (filters.parent_category && filters.parent_category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.parentCategory) return false

//         const parentCategoryId =
//           typeof product.parentCategory === "string" ? product.parentCategory : product.parentCategory._id

//         return parentCategoryId === filters.parent_category
//       })
//     }

//     // Filter by brand
//     if (filters.brand && filters.brand.length > 0) {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.brand) return false

//         const brandId = typeof product.brand === "string" ? product.brand : product.brand._id

//         return filters.brand.includes(brandId)
//       })
//     }

//     // Filter by search query
//     if (filters.search && filters.search.trim()) {
//       const searchTerm = filters.search.toLowerCase().trim()
//       filteredProducts = filteredProducts.filter((product) => {
//         const name = (product.name || "").toLowerCase()
//         const description = (product.description || "").toLowerCase()
//         const brandName = product.brand?.name?.toLowerCase() || ""

//         return name.includes(searchTerm) || description.includes(searchTerm) || brandName.includes(searchTerm)
//       })
//     }

//     // Filter by price range
//     if (filters.priceRange && Array.isArray(filters.priceRange)) {
//       const [minPrice, maxPrice] = filters.priceRange
//       filteredProducts = filteredProducts.filter((product) => {
//         const price = product.price || 0
//         return price >= minPrice && price <= maxPrice
//       })
//     }

//     // Filter by stock status (supports multiple filters)
//     if (filters.stockStatus) {
//       const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]

//       if (stockFilters.length > 0) {
//         filteredProducts = filteredProducts.filter((product) => {
//           // If any stock filter matches, include the product
//           const matches = stockFilters.some((filter) => {
//             switch (filter) {
//               case "inStock":
//                 // Product is in stock if stockStatus is "Available Product" OR countInStock > 0
//                 return product.stockStatus === "Available Product" || (product.countInStock || 0) > 0
//               case "outOfStock":
//                 // Product is out of stock if stockStatus is "Out of Stock" AND countInStock === 0
//                 return product.stockStatus === "Out of Stock" && (product.countInStock || 0) === 0
//               case "onSale":
//                 // Product is on sale if has discount > 0 OR offerPrice < price
//                 return (
//                   (product.discount && product.discount > 0) ||
//                   (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
//                 )
//               default:
//                 return false
//             }
//           })
//           return matches
//         })
//       }
//     }

//     // Sort products - Always prioritize in-stock products first
//     filteredProducts.sort((a, b) => {
//       // Check if products are in stock
//       const aInStock =
//         a.stockStatus === "Available" || a.stockStatus === "Available Product" || (!a.stockStatus && a.countInStock > 0)
//       const bInStock =
//         b.stockStatus === "Available" || b.stockStatus === "Available Product" || (!b.stockStatus && b.countInStock > 0)

//       // In-stock products come first
//       if (aInStock && !bInStock) return -1
//       if (!aInStock && bInStock) return 1

//       // If both have same stock status, apply secondary sorting
//       if (filters.sortBy) {
//         switch (filters.sortBy) {
//           case "price-low":
//             return (a.price || 0) - (b.price || 0)
//           case "price-high":
//             return (b.price || 0) - (a.price || 0)
//           case "name":
//             return (a.name || "").localeCompare(b.name || "")
//           case "newest":
//           default:
//             return new Date(b.createdAt) - new Date(a.createdAt)
//         }
//       }

//       // Default sorting by newest if no sortBy specified
//       return new Date(b.createdAt) - new Date(a.createdAt)
//     })

//     return filteredProducts
//   }

//   // Get cache statistics
//   getCacheStats() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }

//     try {
//       const data = this.decompressData(cached)
//       if (!data) {
//         return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//       }

//       const age = Date.now() - data.timestamp
//       let cacheType = "full"
//       if (data.isEssential) cacheType = "essential"
//       if (data.isMinimal) cacheType = "minimal"
//       if (data.isUltraMinimal) cacheType = "ultra-minimal"
//       if (data.isChunked) cacheType = "chunked"

//       const itemCount = data.isChunked ? data.totalProducts : data.products?.length || 0

//       return {
//         hasCache: true,
//         itemCount: itemCount,
//         age: age,
//         isValid: age < this.CACHE_EXPIRY,
//         cacheType: cacheType,
//         chunks: data.isChunked ? data.chunkCount : null,
//       }
//     } catch (error) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }
//   }
// }

// // Create singleton instance
// const productCache = new ProductCacheService()

// export default productCache


// --------------------
// ===========================

// import config from "../config/config.js"

// // Product Caching Service with compression and size management
// class ProductCacheService {
//   constructor() {
//     this.CACHE_KEY = "graba2z_products_cache"
//     this.CACHE_CHUNK_PREFIX = "graba2z_products_chunk_"
//     this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
//     this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
//     this.MAX_CHUNKS = 20 // More chunks, smaller size
//   }

//   // Compress data using JSON.stringify and btoa
//   compressData(data) {
//     try {
//       const jsonString = JSON.stringify(data)
//       return btoa(encodeURIComponent(jsonString))
//     } catch (error) {
//       return null
//     }
//   }

//   // Decompress data
//   decompressData(compressedData) {
//     try {
//       const jsonString = decodeURIComponent(atob(compressedData))
//       return JSON.parse(jsonString)
//     } catch (error) {
//       return null
//     }
//   }

//   // Check if cache is valid
//   isCacheValid() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) return false

//     try {
//       const data = this.decompressData(cached)
//       if (!data) return false

//       const now = Date.now()
//       return data.timestamp && now - data.timestamp < this.CACHE_EXPIRY
//     } catch (error) {
//       return false
//     }
//   }

//   // Get cached products
//   getCachedProducts() {
//     if (!this.isCacheValid()) return null

//     try {
//       const cached = localStorage.getItem(this.CACHE_KEY)
//       const data = this.decompressData(cached)

//       if (!data) return null

//       // Check if data is chunked
//       if (data.isChunked) {
//         return this.getCachedProductsChunked(data)
//       }

//       return data?.products || []
//     } catch (error) {
//       return null
//     }
//   }

//   // Get cached products from chunked storage
//   getCachedProductsChunked(metadata) {
//     try {
//       const allProducts = []

//       for (let i = 0; i < metadata.chunkCount; i++) {
//         const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`

//         // Try localStorage first, then sessionStorage
//         let chunkData = localStorage.getItem(chunkKey)
//         let storageType = "localStorage"

//         if (!chunkData) {
//           chunkData = sessionStorage.getItem(chunkKey)
//           storageType = "sessionStorage"
//         }

//         if (!chunkData) {
//           return null
//         }

//         const chunk = this.decompressData(chunkData)
//         if (!chunk || !chunk.products) {
//           return null
//         }

//         allProducts.push(...chunk.products)
//       }

//       return allProducts
//     } catch (error) {
//       return null
//     }
//   }

//   // Set products in cache with chunked storage
//   async setCachedProducts(products) {
//     try {
//       // Create ultra-minimal product data (only core fields)
//       const minimalProducts = products.map((product) => ({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         basePrice: product.basePrice,
//         offerPrice: product.offerPrice,
//         brand: product.brand,
//         category: product.category,
//         parentCategory: product.parentCategory,
//         countInStock: product.countInStock,
//         stockStatus: product.stockStatus,
//         discount: product.discount,
//         featured: product.featured,
//         slug: product.slug,
//         image: product.image,
//         galleryImages: product.galleryImages,
//         rating: product.rating,
//         numReviews: product.numReviews,
//         description: product.description,
//         tags: product.tags,
//       }))

//       // Try single cache first
//       const cacheData = {
//         products: minimalProducts,
//         timestamp: Date.now(),
//         isMinimal: true,
//       }

//       const compressedData = this.compressData(cacheData)
//       if (!compressedData) {
//         throw new Error("Failed to compress data")
//       }

//       const dataSize = new Blob([compressedData]).size

//       if (dataSize <= this.MAX_CACHE_SIZE) {
//         localStorage.setItem(this.CACHE_KEY, compressedData)
//         return
//       }

//       // If too large, try chunked storage
//       return await this.setCachedProductsChunked(minimalProducts)
//     } catch (error) {
//       throw error
//     }
//   }

//   // Set products in cache using chunked storage
//   async setCachedProductsChunked(products) {
//     try {
//       const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
//       const chunks = []

//       // Split products into chunks
//       for (let i = 0; i < products.length; i += chunkSize) {
//         chunks.push(products.slice(i, i + chunkSize))
//       }

//       // Store chunk metadata
//       const metadata = {
//         totalProducts: products.length,
//         chunkCount: chunks.length,
//         timestamp: Date.now(),
//         isChunked: true,
//       }

//       localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

//       // Store each chunk
//       for (let i = 0; i < chunks.length; i++) {
//         const chunkData = {
//           products: chunks[i],
//           chunkIndex: i,
//           timestamp: Date.now(),
//         }

//         const compressedChunk = this.compressData(chunkData)
//         const chunkSize = new Blob([compressedChunk]).size

//         if (chunkSize > this.MAX_CACHE_SIZE) {
//           // Try sessionStorage as fallback
//           try {
//             sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//           } catch (sessionError) {
//             throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
//           }
//         } else {
//           localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//         }
//       }

//       return true
//     } catch (error) {
//       // Clean up any partial chunks
//       this.clearCache()
//       throw error
//     }
//   }

//   // Clear cache
//   clearCache() {
//     // Clear main cache
//     localStorage.removeItem(this.CACHE_KEY)
//     sessionStorage.removeItem(this.CACHE_KEY)

//     // Clear chunked cache from both storages
//     for (let i = 0; i < this.MAX_CHUNKS; i++) {
//       localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//       sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//     }
//   }

//   // Force refresh cache (clear and fetch new data)
//   async forceRefreshCache() {
//     this.clearCache()
//     const products = await this.fetchAndCacheProducts()
//     return products
//   }

//   // Test cache functionality
//   async testCache() {
//     // Check current cache
//     const stats = this.getCacheStats()

//     // Try to get products
//     const products = await this.getProducts()

//     // Check if cache was used
//     const newStats = this.getCacheStats()

//     // Test storage availability
//     const storageTest = {
//       localStorage: this.testStorage("localStorage"),
//       sessionStorage: this.testStorage("sessionStorage"),
//     }

//     return { products, cacheUsed: newStats.hasCache, storageTest }
//   }

//   // Test storage availability
//   testStorage(storageType) {
//     try {
//       const testKey = "test_storage"
//       const testValue = "test"

//       if (storageType === "localStorage") {
//         localStorage.setItem(testKey, testValue)
//         const result = localStorage.getItem(testKey) === testValue
//         localStorage.removeItem(testKey)
//         return result
//       } else if (storageType === "sessionStorage") {
//         sessionStorage.setItem(testKey, testValue)
//         const result = sessionStorage.getItem(testKey) === testValue
//         sessionStorage.removeItem(testKey)
//         return result
//       }
//       return false
//     } catch (error) {
//       return false
//     }
//   }

//   // Fetch products from API and cache them
//   async fetchAndCacheProducts() {
//     try {
//       const response = await fetch(`${config.API_URL}/api/products`)
//       if (!response.ok) {
//         throw new Error("Failed to fetch products")
//       }
//       const products = await response.json()

//       // Always try to cache products
//       try {
//         await this.setCachedProducts(products)
//       } catch (cacheError) {
//         // Continue without cache - the app will still work
//       }

//       return products
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get products (from cache or API)
//   async getProducts() {
//     // Check if we have valid cached data
//     if (this.isCacheValid()) {
//       const cachedProducts = this.getCachedProducts()
//       if (cachedProducts && cachedProducts.length > 0) {
//         return cachedProducts
//       }
//     }

//     // Fetch from API if no valid cache
//     return await this.fetchAndCacheProducts()
//   }

//   // Filter products by category and parent_category
//   filterProducts(products, filters = {}) {
//     if (!products || !Array.isArray(products)) {
//       return []
//     }

//     let filteredProducts = [...products]

//     // Filter by search with word-by-word matching
//     if (filters.search && filters.search.trim()) {
//       const searchQuery = filters.search.trim()
      
//       // Split search query into individual words
//       const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0)
      
//       if (searchWords.length > 0) {
//         filteredProducts = filteredProducts.filter((product) => {
//           // Create searchable text from product fields
//           const searchableFields = [
//             product.name || '',
//             product.description || '',
//             product.brand?.name || '',
//             product.category?.name || '',
//             product.parentCategory?.name || '',
//             ...(product.tags || [])
//           ]
          
//           const searchableText = searchableFields.join(' ').toLowerCase()
          
//           // Check if any word from the search query matches
//           return searchWords.some(word => 
//             searchableText.includes(word.toLowerCase())
//           )
//         })
//       }
//     }

//     // Filter by category
//     if (filters.category && filters.category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.category) return false

//         const categoryId = typeof product.category === "string" ? product.category : product.category._id

//         return categoryId === filters.category
//       })
//     }

//     // Filter by parent_category
//     if (filters.parent_category && filters.parent_category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.parentCategory) return false

//         const parentCategoryId =
//           typeof product.parentCategory === "string" ? product.parentCategory : product.parentCategory._id

//         return parentCategoryId === filters.parent_category
//       })
//     }

//     // Filter by brand
//     if (filters.brand && filters.brand.length > 0) {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.brand) return false

//         const brandId = typeof product.brand === "string" ? product.brand : product.brand._id

//         return filters.brand.includes(brandId)
//       })
//     }

//     // Filter by price range
//     if (filters.priceRange && Array.isArray(filters.priceRange)) {
//       const [minPrice, maxPrice] = filters.priceRange
//       filteredProducts = filteredProducts.filter((product) => {
//         const price = product.price || 0
//         return price >= minPrice && price <= maxPrice
//       })
//     }

//     // Filter by stock status (supports multiple filters)
//     if (filters.stockStatus) {
//       const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]

//       if (stockFilters.length > 0) {
//         filteredProducts = filteredProducts.filter((product) => {
//           // If any stock filter matches, include the product
//           const matches = stockFilters.some((filter) => {
//             switch (filter) {
//               case "inStock":
//                 // Product is in stock if stockStatus is "Available Product" OR countInStock > 0
//                 return product.stockStatus === "Available Product" || (product.countInStock || 0) > 0
//               case "outOfStock":
//                 // Product is out of stock if stockStatus is "Out of Stock" AND countInStock === 0
//                 return product.stockStatus === "Out of Stock" && (product.countInStock || 0) === 0
//               case "onSale":
//                 // Product is on sale if has discount > 0 OR offerPrice < price
//                 return (
//                   (product.discount && product.discount > 0) ||
//                   (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
//                 )
//               default:
//                 return false
//             }
//           })
//           return matches
//         })
//       }
//     }

//     // Sort products - Always prioritize in-stock products first
//     filteredProducts.sort((a, b) => {
//       // Check if products are in stock
//       const aInStock =
//         a.stockStatus === "Available" || a.stockStatus === "Available Product" || (!a.stockStatus && a.countInStock > 0)
//       const bInStock =
//         b.stockStatus === "Available" || b.stockStatus === "Available Product" || (!b.stockStatus && b.countInStock > 0)

//       // In-stock products come first
//       if (aInStock && !bInStock) return -1
//       if (!aInStock && bInStock) return 1

//       // If both have same stock status, apply secondary sorting
//       if (filters.sortBy) {
//         switch (filters.sortBy) {
//           case "price-low":
//             return (a.price || 0) - (b.price || 0)
//           case "price-high":
//             return (b.price || 0) - (a.price || 0)
//           case "name":
//             return (a.name || "").localeCompare(b.name || "")
//           case "newest":
//           default:
//             return new Date(b.createdAt) - new Date(a.createdAt)
//         }
//       }

//       // Default sorting by newest if no sortBy specified
//       return new Date(b.createdAt) - new Date(a.createdAt)
//     })

//     return filteredProducts
//   }

//   // Get cache statistics
//   getCacheStats() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }

//     try {
//       const data = this.decompressData(cached)
//       if (!data) {
//         return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//       }

//       const age = Date.now() - data.timestamp
//       let cacheType = "full"
//       if (data.isEssential) cacheType = "essential"
//       if (data.isMinimal) cacheType = "minimal"
//       if (data.isUltraMinimal) cacheType = "ultra-minimal"
//       if (data.isChunked) cacheType = "chunked"

//       const itemCount = data.isChunked ? data.totalProducts : data.products?.length || 0

//       return {
//         hasCache: true,
//         itemCount: itemCount,
//         age: age,
//         isValid: age < this.CACHE_EXPIRY,
//         cacheType: cacheType,
//         chunks: data.isChunked ? data.chunkCount : null,
//       }
//     } catch (error) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }
//   }
// }

// // Create singleton instance
// const productCache = new ProductCacheService()

// export default productCache


// ---------------------
// ========================

// import config from "../config/config.js"

// // Product Caching Service with compression and size management
// class ProductCacheService {
//   constructor() {
//     this.CACHE_KEY = "graba2z_products_cache"
//     this.CACHE_CHUNK_PREFIX = "graba2z_products_chunk_"
//     this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
//     this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
//     this.MAX_CHUNKS = 20 // More chunks, smaller size
//   }

//   // Compress data using JSON.stringify and btoa
//   compressData(data) {
//     try {
//       const jsonString = JSON.stringify(data)
//       return btoa(encodeURIComponent(jsonString))
//     } catch (error) {
//       return null
//     }
//   }

//   // Decompress data
//   decompressData(compressedData) {
//     try {
//       const jsonString = decodeURIComponent(atob(compressedData))
//       return JSON.parse(jsonString)
//     } catch (error) {
//       return null
//     }
//   }

//   // Check if cache is valid
//   isCacheValid() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) return false

//     try {
//       const data = this.decompressData(cached)
//       if (!data) return false

//       const now = Date.now()
//       return data.timestamp && now - data.timestamp < this.CACHE_EXPIRY
//     } catch (error) {
//       return false
//     }
//   }

//   // Get cached products
//   getCachedProducts() {
//     if (!this.isCacheValid()) return null

//     try {
//       const cached = localStorage.getItem(this.CACHE_KEY)
//       const data = this.decompressData(cached)

//       if (!data) return null

//       // Check if data is chunked
//       if (data.isChunked) {
//         return this.getCachedProductsChunked(data)
//       }

//       return data?.products || []
//     } catch (error) {
//       return null
//     }
//   }

//   // Get cached products from chunked storage
//   getCachedProductsChunked(metadata) {
//     try {
//       const allProducts = []

//       for (let i = 0; i < metadata.chunkCount; i++) {
//         const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`

//         // Try localStorage first, then sessionStorage
//         let chunkData = localStorage.getItem(chunkKey)
//         let storageType = "localStorage"

//         if (!chunkData) {
//           chunkData = sessionStorage.getItem(chunkKey)
//           storageType = "sessionStorage"
//         }

//         if (!chunkData) {
//           return null
//         }

//         const chunk = this.decompressData(chunkData)
//         if (!chunk || !chunk.products) {
//           return null
//         }

//         allProducts.push(...chunk.products)
//       }

//       return allProducts
//     } catch (error) {
//       return null
//     }
//   }

//   // Set products in cache with chunked storage
//   async setCachedProducts(products) {
//     try {
//       // Create ultra-minimal product data (only core fields)
//       const minimalProducts = products.map((product) => ({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         basePrice: product.basePrice,
//         offerPrice: product.offerPrice,
//         brand: product.brand,
//         category: product.category,
//         parentCategory: product.parentCategory,
//         countInStock: product.countInStock,
//         stockStatus: product.stockStatus,
//         discount: product.discount,
//         featured: product.featured,
//         slug: product.slug,
//         image: product.image,
//         galleryImages: product.galleryImages,
//         rating: product.rating,
//         numReviews: product.numReviews,
//         description: product.description,
//         tags: product.tags,
//         createdAt: product.createdAt,
//       }))

//       // Try single cache first
//       const cacheData = {
//         products: minimalProducts,
//         timestamp: Date.now(),
//         isMinimal: true,
//       }

//       const compressedData = this.compressData(cacheData)
//       if (!compressedData) {
//         throw new Error("Failed to compress data")
//       }

//       const dataSize = new Blob([compressedData]).size

//       if (dataSize <= this.MAX_CACHE_SIZE) {
//         localStorage.setItem(this.CACHE_KEY, compressedData)
//         return
//       }

//       // If too large, try chunked storage
//       return await this.setCachedProductsChunked(minimalProducts)
//     } catch (error) {
//       throw error
//     }
//   }

//   // Set products in cache using chunked storage
//   async setCachedProductsChunked(products) {
//     try {
//       const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
//       const chunks = []

//       // Split products into chunks
//       for (let i = 0; i < products.length; i += chunkSize) {
//         chunks.push(products.slice(i, i + chunkSize))
//       }

//       // Store chunk metadata
//       const metadata = {
//         totalProducts: products.length,
//         chunkCount: chunks.length,
//         timestamp: Date.now(),
//         isChunked: true,
//       }

//       localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

//       // Store each chunk
//       for (let i = 0; i < chunks.length; i++) {
//         const chunkData = {
//           products: chunks[i],
//           chunkIndex: i,
//           timestamp: Date.now(),
//         }

//         const compressedChunk = this.compressData(chunkData)
//         const chunkSize = new Blob([compressedChunk]).size

//         if (chunkSize > this.MAX_CACHE_SIZE) {
//           // Try sessionStorage as fallback
//           try {
//             sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//           } catch (sessionError) {
//             throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
//           }
//         } else {
//           localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//         }
//       }

//       return true
//     } catch (error) {
//       // Clean up any partial chunks
//       this.clearCache()
//       throw error
//     }
//   }

//   // Clear cache
//   clearCache() {
//     // Clear main cache
//     localStorage.removeItem(this.CACHE_KEY)
//     sessionStorage.removeItem(this.CACHE_KEY)

//     // Clear chunked cache from both storages
//     for (let i = 0; i < this.MAX_CHUNKS; i++) {
//       localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//       sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//     }
//   }

//   // Force refresh cache (clear and fetch new data)
//   async forceRefreshCache() {
//     this.clearCache()
//     const products = await this.fetchAndCacheProducts()
//     return products
//   }

//   // Test cache functionality
//   async testCache() {
//     // Check current cache
//     const stats = this.getCacheStats()

//     // Try to get products
//     const products = await this.getProducts()

//     // Check if cache was used
//     const newStats = this.getCacheStats()

//     // Test storage availability
//     const storageTest = {
//       localStorage: this.testStorage("localStorage"),
//       sessionStorage: this.testStorage("sessionStorage"),
//     }

//     return { products, cacheUsed: newStats.hasCache, storageTest }
//   }

//   // Test storage availability
//   testStorage(storageType) {
//     try {
//       const testKey = "test_storage"
//       const testValue = "test"

//       if (storageType === "localStorage") {
//         localStorage.setItem(testKey, testValue)
//         const result = localStorage.getItem(testKey) === testValue
//         localStorage.removeItem(testKey)
//         return result
//       } else if (storageType === "sessionStorage") {
//         sessionStorage.setItem(testKey, testValue)
//         const result = sessionStorage.getItem(testKey) === testValue
//         sessionStorage.removeItem(testKey)
//         return result
//       }
//       return false
//     } catch (error) {
//       return false
//     }
//   }

//   // Fetch products from API and cache them
//   async fetchAndCacheProducts() {
//     try {
//       const response = await fetch(`${config.API_URL}/api/products`)
//       if (!response.ok) {
//         throw new Error("Failed to fetch products")
//       }
//       const products = await response.json()

//       // Always try to cache products
//       try {
//         await this.setCachedProducts(products)
//       } catch (cacheError) {
//         // Continue without cache - the app will still work
//       }

//       return products
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get products (from cache or API)
//   async getProducts() {
//     // Check if we have valid cached data
//     if (this.isCacheValid()) {
//       const cachedProducts = this.getCachedProducts()
//       if (cachedProducts && cachedProducts.length > 0) {
//         return cachedProducts
//       }
//     }

//     // Fetch from API if no valid cache
//     return await this.fetchAndCacheProducts()
//   }

//   // Filter products by category and parent_category
//   filterProducts(products, filters = {}) {
//     if (!products || !Array.isArray(products)) {
//       return []
//     }

//     let filteredProducts = [...products]

//     // Filter by search with enhanced word-by-word matching
//     if (filters.search && filters.search.trim()) {
//       const searchQuery = filters.search.trim()
      
//       // Split search query into individual words
//       const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0)
      
//       if (searchWords.length > 0) {
//         // Create array to store products with their match scores
//         const productsWithScores = []
        
//         filteredProducts.forEach((product) => {
//           // Create searchable text from product fields
//           const searchableFields = [
//             product.name || '',
//             product.description || '',
//             product.brand?.name || '',
//             product.category?.name || '',
//             product.parentCategory?.name || '',
//             ...(product.tags || [])
//           ]
          
//           const searchableText = searchableFields.join(' ').toLowerCase()
          
//           // Count how many search words match this product
//           let matchCount = 0
//           const matchedWords = []
          
//           searchWords.forEach(word => {
//             const lowerWord = word.toLowerCase()
//             if (searchableText.includes(lowerWord)) {
//               matchCount++
//               matchedWords.push(word)
//             }
//           })
          
//           // Only include products that match at least one word
//           if (matchCount > 0) {
//             productsWithScores.push({
//               product,
//               matchCount,
//               matchedWords,
//               // Calculate match score (higher is better)
//               matchScore: matchCount / searchWords.length
//             })
//           }
//         })
        
//         // Sort by match score (products with more matching words first)
//         productsWithScores.sort((a, b) => {
//           // First sort by match count (more matches = higher priority)
//           if (b.matchCount !== a.matchCount) {
//             return b.matchCount - a.matchCount
//           }
//           // If same match count, sort by match score
//           return b.matchScore - a.matchScore
//         })
        
//         // Extract the sorted products
//         filteredProducts = productsWithScores.map(item => item.product)
        
//         // Debug log to show search results
//         console.log(`Search for "${searchQuery}":`, {
//           searchWords,
//           totalResults: productsWithScores.length,
//           topResults: productsWithScores.slice(0, 5).map(item => ({
//             name: item.product.name,
//             matchCount: item.matchCount,
//             matchedWords: item.matchedWords,
//             matchScore: item.matchScore
//           }))
//         })
//       }
//     }

//     // Filter by category
//     if (filters.category && filters.category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.category) return false

//         const categoryId = typeof product.category === "string" ? product.category : product.category._id

//         return categoryId === filters.category
//       })
//     }

//     // Filter by parent_category
//     if (filters.parent_category && filters.parent_category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.parentCategory) return false

//         const parentCategoryId =
//           typeof product.parentCategory === "string" ? product.parentCategory : product.parentCategory._id

//         return parentCategoryId === filters.parent_category
//       })
//     }

//     // Filter by brand
//     if (filters.brand && filters.brand.length > 0) {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.brand) return false

//         const brandId = typeof product.brand === "string" ? product.brand : product.brand._id

//         return filters.brand.includes(brandId)
//       })
//     }

//     // Filter by price range
//     if (filters.priceRange && Array.isArray(filters.priceRange)) {
//       const [minPrice, maxPrice] = filters.priceRange
//       filteredProducts = filteredProducts.filter((product) => {
//         const price = product.price || 0
//         return price >= minPrice && price <= maxPrice
//       })
//     }

//     // Filter by stock status (supports multiple filters)
//     if (filters.stockStatus) {
//       const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]

//       if (stockFilters.length > 0) {
//         filteredProducts = filteredProducts.filter((product) => {
//           // If any stock filter matches, include the product
//           const matches = stockFilters.some((filter) => {
//             switch (filter) {
//               case "inStock":
//                 // Product is in stock if stockStatus is "Available Product" OR countInStock > 0
//                 return product.stockStatus === "Available Product" || (product.countInStock || 0) > 0
//               case "outOfStock":
//                 // Product is out of stock if stockStatus is "Out of Stock" AND countInStock === 0
//                 return product.stockStatus === "Out of Stock" && (product.countInStock || 0) === 0
//               case "onSale":
//                 // Product is on sale if has discount > 0 OR offerPrice < price
//                 return (
//                   (product.discount && product.discount > 0) ||
//                   (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
//                 )
//               default:
//                 return false
//             }
//           })
//           return matches
//         })
//       }
//     }

//     // Apply secondary sorting only if no search was performed (search already sorts by relevance)
//     if (!filters.search || !filters.search.trim()) {
//       // Sort products - Always prioritize in-stock products first
//       filteredProducts.sort((a, b) => {
//         // Check if products are in stock
//         const aInStock =
//           a.stockStatus === "Available" || a.stockStatus === "Available Product" || (!a.stockStatus && a.countInStock > 0)
//         const bInStock =
//           b.stockStatus === "Available" || b.stockStatus === "Available Product" || (!b.stockStatus && b.countInStock > 0)

//         // In-stock products come first
//         if (aInStock && !bInStock) return -1
//         if (!aInStock && bInStock) return 1

//         // If both have same stock status, apply secondary sorting
//         if (filters.sortBy) {
//           switch (filters.sortBy) {
//             case "price-low":
//               return (a.price || 0) - (b.price || 0)
//             case "price-high":
//               return (b.price || 0) - (a.price || 0)
//             case "name":
//               return (a.name || "").localeCompare(b.name || "")
//             case "newest":
//             default:
//               return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
//           }
//         }

//         // Default sorting by newest if no sortBy specified
//         return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
//       })
//     } else {
//       // For search results, apply stock status as secondary sort while maintaining relevance order
//       filteredProducts.sort((a, b) => {
//         // Check if products are in stock
//         const aInStock =
//           a.stockStatus === "Available" || a.stockStatus === "Available Product" || (!a.stockStatus && a.countInStock > 0)
//         const bInStock =
//           b.stockStatus === "Available" || b.stockStatus === "Available Product" || (!b.stockStatus && b.countInStock > 0)

//         // In-stock products come first, but maintain search relevance within each group
//         if (aInStock && !bInStock) return -1
//         if (!aInStock && bInStock) return 1

//         // If both have same stock status, maintain the search relevance order (already sorted above)
//         return 0
//       })
//     }

//     return filteredProducts
//   }

//   // Get cache statistics
//   getCacheStats() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }

//     try {
//       const data = this.decompressData(cached)
//       if (!data) {
//         return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//       }

//       const age = Date.now() - data.timestamp
//       let cacheType = "full"
//       if (data.isEssential) cacheType = "essential"
//       if (data.isMinimal) cacheType = "minimal"
//       if (data.isUltraMinimal) cacheType = "ultra-minimal"
//       if (data.isChunked) cacheType = "chunked"

//       const itemCount = data.isChunked ? data.totalProducts : data.products?.length || 0

//       return {
//         hasCache: true,
//         itemCount: itemCount,
//         age: age,
//         isValid: age < this.CACHE_EXPIRY,
//         cacheType: cacheType,
//         chunks: data.isChunked ? data.chunkCount : null,
//       }
//     } catch (error) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }
//   }
// }

// // Create singleton instance
// const productCache = new ProductCacheService()

// export default productCache



// ------------------



// import config from "../config/config.js"

// // Product Caching Service with compression and size management
// class ProductCacheService {
//   constructor() {
//     this.CACHE_KEY = "graba2z_products_cache"
//     this.CACHE_CHUNK_PREFIX = "graba2z_products_chunk_"
//     this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
//     this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
//     this.MAX_CHUNKS = 20 // More chunks, smaller size
    
//     // Search optimization cache
//     this.searchableTextCache = new Map()
//     this.lastCacheUpdate = 0
//   }

//   // Compress data using JSON.stringify and btoa
//   compressData(data) {
//     try {
//       const jsonString = JSON.stringify(data)
//       return btoa(encodeURIComponent(jsonString))
//     } catch (error) {
//       return null
//     }
//   }

//   // Decompress data
//   decompressData(compressedData) {
//     try {
//       const jsonString = decodeURIComponent(atob(compressedData))
//       return JSON.parse(jsonString)
//     } catch (error) {
//       return null
//     }
//   }

//   // Check if cache is valid
//   isCacheValid() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) return false

//     try {
//       const data = this.decompressData(cached)
//       if (!data) return false

//       const now = Date.now()
//       return data.timestamp && now - data.timestamp < this.CACHE_EXPIRY
//     } catch (error) {
//       return false
//     }
//   }

//   // Get cached products
//   getCachedProducts() {
//     if (!this.isCacheValid()) return null

//     try {
//       const cached = localStorage.getItem(this.CACHE_KEY)
//       const data = this.decompressData(cached)

//       if (!data) return null

//       // Check if data is chunked
//       if (data.isChunked) {
//         return this.getCachedProductsChunked(data)
//       }

//       return data?.products || []
//     } catch (error) {
//       return null
//     }
//   }

//   // Get cached products from chunked storage
//   getCachedProductsChunked(metadata) {
//     try {
//       const allProducts = []

//       for (let i = 0; i < metadata.chunkCount; i++) {
//         const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`

//         // Try localStorage first, then sessionStorage
//         let chunkData = localStorage.getItem(chunkKey)
//         let storageType = "localStorage"

//         if (!chunkData) {
//           chunkData = sessionStorage.getItem(chunkKey)
//           storageType = "sessionStorage"
//         }

//         if (!chunkData) {
//           return null
//         }

//         const chunk = this.decompressData(chunkData)
//         if (!chunk || !chunk.products) {
//           return null
//         }

//         allProducts.push(...chunk.products)
//       }

//       return allProducts
//     } catch (error) {
//       return null
//     }
//   }

//   // Set products in cache with chunked storage
//   async setCachedProducts(products) {
//     try {
//       // Create ultra-minimal product data (only core fields)
//       const minimalProducts = products.map((product) => ({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         basePrice: product.basePrice,
//         offerPrice: product.offerPrice,
//         brand: product.brand,
//         category: product.category,
//         parentCategory: product.parentCategory,
//         countInStock: product.countInStock,
//         stockStatus: product.stockStatus,
//         discount: product.discount,
//         featured: product.featured,
//         slug: product.slug,
//         image: product.image,
//         galleryImages: product.galleryImages,
//         rating: product.rating,
//         numReviews: product.numReviews,
//         description: product.description,
//         tags: product.tags,
//         createdAt: product.createdAt,
//       }))

//       // Try single cache first
//       const cacheData = {
//         products: minimalProducts,
//         timestamp: Date.now(),
//         isMinimal: true,
//       }

//       const compressedData = this.compressData(cacheData)
//       if (!compressedData) {
//         throw new Error("Failed to compress data")
//       }

//       const dataSize = new Blob([compressedData]).size

//       if (dataSize <= this.MAX_CACHE_SIZE) {
//         localStorage.setItem(this.CACHE_KEY, compressedData)
//         return
//       }

//       // If too large, try chunked storage
//       return await this.setCachedProductsChunked(minimalProducts)
//     } catch (error) {
//       throw error
//     }
//   }

//   // Set products in cache using chunked storage
//   async setCachedProductsChunked(products) {
//     try {
//       const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
//       const chunks = []

//       // Split products into chunks
//       for (let i = 0; i < products.length; i += chunkSize) {
//         chunks.push(products.slice(i, i + chunkSize))
//       }

//       // Store chunk metadata
//       const metadata = {
//         totalProducts: products.length,
//         chunkCount: chunks.length,
//         timestamp: Date.now(),
//         isChunked: true,
//       }

//       localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

//       // Store each chunk
//       for (let i = 0; i < chunks.length; i++) {
//         const chunkData = {
//           products: chunks[i],
//           chunkIndex: i,
//           timestamp: Date.now(),
//         }

//         const compressedChunk = this.compressData(chunkData)
//         const chunkSize = new Blob([compressedChunk]).size

//         if (chunkSize > this.MAX_CACHE_SIZE) {
//           // Try sessionStorage as fallback
//           try {
//             sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//           } catch (sessionError) {
//             throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
//           }
//         } else {
//           localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
//         }
//       }

//       return true
//     } catch (error) {
//       // Clean up any partial chunks
//       this.clearCache()
//       throw error
//     }
//   }

//   // Clear cache
//   clearCache() {
//     // Clear main cache
//     localStorage.removeItem(this.CACHE_KEY)
//     sessionStorage.removeItem(this.CACHE_KEY)

//     // Clear chunked cache from both storages
//     for (let i = 0; i < this.MAX_CHUNKS; i++) {
//       localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//       sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
//     }
    
//     // Clear search cache
//     this.searchableTextCache.clear()
//     this.lastCacheUpdate = 0
//   }

//   // Force refresh cache (clear and fetch new data)
//   async forceRefreshCache() {
//     this.clearCache()
//     const products = await this.fetchAndCacheProducts()
//     return products
//   }

//   // Test cache functionality
//   async testCache() {
//     // Check current cache
//     const stats = this.getCacheStats()

//     // Try to get products
//     const products = await this.getProducts()

//     // Check if cache was used
//     const newStats = this.getCacheStats()

//     // Test storage availability
//     const storageTest = {
//       localStorage: this.testStorage("localStorage"),
//       sessionStorage: this.testStorage("sessionStorage"),
//     }

//     return { products, cacheUsed: newStats.hasCache, storageTest }
//   }

//   // Test storage availability
//   testStorage(storageType) {
//     try {
//       const testKey = "test_storage"
//       const testValue = "test"

//       if (storageType === "localStorage") {
//         localStorage.setItem(testKey, testValue)
//         const result = localStorage.getItem(testKey) === testValue
//         localStorage.removeItem(testKey)
//         return result
//       } else if (storageType === "sessionStorage") {
//         sessionStorage.setItem(testKey, testValue)
//         const result = sessionStorage.getItem(testKey) === testValue
//         sessionStorage.removeItem(testKey)
//         return result
//       }
//       return false
//     } catch (error) {
//       return false
//     }
//   }

//   // Fetch products from API and cache them
//   async fetchAndCacheProducts() {
//     try {
//       const response = await fetch(`${config.API_URL}/api/products`)
//       if (!response.ok) {
//         throw new Error("Failed to fetch products")
//       }
//       const products = await response.json()

//       // Always try to cache products
//       try {
//         await this.setCachedProducts(products)
//         // Update search cache timestamp
//         this.lastCacheUpdate = Date.now()
//       } catch (cacheError) {
//         // Continue without cache - the app will still work
//       }

//       return products
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get products (from cache or API)
//   async getProducts() {
//     // Check if we have valid cached data
//     if (this.isCacheValid()) {
//       const cachedProducts = this.getCachedProducts()
//       if (cachedProducts && cachedProducts.length > 0) {
//         return cachedProducts
//       }
//     }

//     // Fetch from API if no valid cache
//     return await this.fetchAndCacheProducts()
//   }

//   // Pre-compute searchable text for a product (with caching)
//   getSearchableText(product) {
//     const productId = product._id
    
//     // Check if we have cached searchable text and it's still valid
//     if (this.searchableTextCache.has(productId)) {
//       const cached = this.searchableTextCache.get(productId)
//       // Cache is valid for 5 minutes or until products are refreshed
//       if (Date.now() - cached.timestamp < 300000 && cached.timestamp >= this.lastCacheUpdate) {
//         return cached.text
//       }
//     }

//     // Create searchable text from product fields
//     const searchableFields = [
//       product.name || '',
//       product.description || '',
//       product.brand?.name || '',
//       product.category?.name || '',
//       product.parentCategory?.name || '',
//       ...(product.tags || [])
//     ]
    
//     const searchableText = searchableFields.join(' ').toLowerCase()
    
//     // Cache the result
//     this.searchableTextCache.set(productId, {
//       text: searchableText,
//       timestamp: Date.now()
//     })
    
//     // Limit cache size to prevent memory issues
//     if (this.searchableTextCache.size > 5000) {
//       // Remove oldest entries
//       const entries = Array.from(this.searchableTextCache.entries())
//       entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
//       const toRemove = entries.slice(0, 1000)
//       toRemove.forEach(([key]) => this.searchableTextCache.delete(key))
//     }
    
//     return searchableText
//   }

//   // Optimized search function
//   performOptimizedSearch(products, searchWords, maxResults = 100) {
//     const results = []
//     const searchWordsLower = searchWords.map(word => word.toLowerCase())
    
//     // Early termination - stop when we have enough high-quality results
//     let highQualityResults = 0
//     const maxHighQuality = Math.min(50, maxResults)
    
//     for (let i = 0; i < products.length && results.length < maxResults; i++) {
//       const product = products[i]
//       const searchableText = this.getSearchableText(product)
      
//       // Quick check - if no words match, skip this product
//       let matchCount = 0
//       const matchedWords = []
      
//       // Use more efficient string matching
//       for (let j = 0; j < searchWordsLower.length; j++) {
//         const word = searchWordsLower[j]
//         if (searchableText.includes(word)) {
//           matchCount++
//           matchedWords.push(searchWords[j])
//         }
//       }
      
//       // Only include products that match at least one word
//       if (matchCount > 0) {
//         const matchScore = matchCount / searchWords.length
        
//         results.push({
//           product,
//           matchCount,
//           matchScore,
//           matchedWords
//         })
        
//         // Count high-quality results (50%+ word match)
//         if (matchScore >= 0.5) {
//           highQualityResults++
//         }
        
//         // Early termination if we have enough high-quality results
//         if (highQualityResults >= maxHighQuality && results.length >= 20) {
//           break
//         }
//       }
//     }
    
//     // Fast sort using a more efficient comparison
//     results.sort((a, b) => {
//       // Primary: match count (more matches first)
//       if (b.matchCount !== a.matchCount) {
//         return b.matchCount - a.matchCount
//       }
//       // Secondary: match score
//       return b.matchScore - a.matchScore
//     })
    
//     return results
//   }

//   // Filter products by category and parent_category
//   filterProducts(products, filters = {}) {
//     if (!products || !Array.isArray(products)) {
//       return []
//     }

//     let filteredProducts = [...products]

//     // Optimized search with word-by-word matching
//     if (filters.search && filters.search.trim()) {
//       const searchQuery = filters.search.trim()
      
//       // Split search query into individual words
//       const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0)
      
//       if (searchWords.length > 0) {
//         // Use optimized search function
//         const searchResults = this.performOptimizedSearch(filteredProducts, searchWords)
        
//         // Extract products from search results
//         filteredProducts = searchResults.map(result => result.product)
        
//         // Debug log (only for development)
//         if (process.env.NODE_ENV === 'development') {
//           console.log(`Search for "${searchQuery}":`, {
//             searchWords,
//             totalResults: searchResults.length,
//             topResults: searchResults.slice(0, 3).map(item => ({
//               name: item.product.name,
//               matchCount: item.matchCount,
//               matchedWords: item.matchedWords,
//               matchScore: item.matchScore
//             }))
//           })
//         }
//       }
//     }

//     // Apply other filters efficiently
//     if (filters.category && filters.category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.category) return false
//         const categoryId = typeof product.category === "string" ? product.category : product.category._id
//         return categoryId === filters.category
//       })
//     }

//     if (filters.parent_category && filters.parent_category !== "all") {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.parentCategory) return false
//         const parentCategoryId = typeof product.parentCategory === "string" ? product.parentCategory : product.parentCategory._id
//         return parentCategoryId === filters.parent_category
//       })
//     }

//     if (filters.brand && filters.brand.length > 0) {
//       filteredProducts = filteredProducts.filter((product) => {
//         if (!product.brand) return false
//         const brandId = typeof product.brand === "string" ? product.brand : product.brand._id
//         return filters.brand.includes(brandId)
//       })
//     }

//     if (filters.priceRange && Array.isArray(filters.priceRange)) {
//       const [minPrice, maxPrice] = filters.priceRange
//       filteredProducts = filteredProducts.filter((product) => {
//         const price = product.price || 0
//         return price >= minPrice && price <= maxPrice
//       })
//     }

//     if (filters.stockStatus) {
//       const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]
//       if (stockFilters.length > 0) {
//         filteredProducts = filteredProducts.filter((product) => {
//           return stockFilters.some((filter) => {
//             switch (filter) {
//               case "inStock":
//                 return product.stockStatus === "Available Product" || (product.countInStock || 0) > 0
//               case "outOfStock":
//                 return product.stockStatus === "Out of Stock" && (product.countInStock || 0) === 0
//               case "onSale":
//                 return (
//                   (product.discount && product.discount > 0) ||
//                   (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
//                 )
//               default:
//                 return false
//             }
//           })
//         })
//       }
//     }

//     // Apply sorting only if no search was performed (search already sorts by relevance)
//     if (!filters.search || !filters.search.trim()) {
//       // Efficient sorting with stock status priority
//       filteredProducts.sort((a, b) => {
//         // Check stock status efficiently
//         const aInStock = a.stockStatus === "Available Product" || (!a.stockStatus && (a.countInStock || 0) > 0)
//         const bInStock = b.stockStatus === "Available Product" || (!b.stockStatus && (b.countInStock || 0) > 0)

//         // In-stock products first
//         if (aInStock !== bInStock) {
//           return bInStock ? 1 : -1
//         }

//         // Secondary sorting
//         if (filters.sortBy) {
//           switch (filters.sortBy) {
//             case "price-low":
//               return (a.price || 0) - (b.price || 0)
//             case "price-high":
//               return (b.price || 0) - (a.price || 0)
//             case "name":
//               return (a.name || "").localeCompare(b.name || "")
//             case "newest":
//             default:
//               return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
//           }
//         }

//         return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
//       })
//     } else {
//       // For search results, maintain relevance but prioritize in-stock items within each relevance group
//       const inStockProducts = []
//       const outOfStockProducts = []
      
//       filteredProducts.forEach(product => {
//         const inStock = product.stockStatus === "Available Product" || (!product.stockStatus && (product.countInStock || 0) > 0)
//         if (inStock) {
//           inStockProducts.push(product)
//         } else {
//           outOfStockProducts.push(product)
//         }
//       })
      
//       filteredProducts = [...inStockProducts, ...outOfStockProducts]
//     }

//     return filteredProducts
//   }

//   // Get cache statistics
//   getCacheStats() {
//     const cached = localStorage.getItem(this.CACHE_KEY)
//     if (!cached) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }

//     try {
//       const data = this.decompressData(cached)
//       if (!data) {
//         return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//       }

//       const age = Date.now() - data.timestamp
//       let cacheType = "full"
//       if (data.isEssential) cacheType = "essential"
//       if (data.isMinimal) cacheType = "minimal"
//       if (data.isUltraMinimal) cacheType = "ultra-minimal"
//       if (data.isChunked) cacheType = "chunked"

//       const itemCount = data.isChunked ? data.totalProducts : data.products?.length || 0

//       return {
//         hasCache: true,
//         itemCount: itemCount,
//         age: age,
//         isValid: age < this.CACHE_EXPIRY,
//         cacheType: cacheType,
//         chunks: data.isChunked ? data.chunkCount : null,
//         searchCacheSize: this.searchableTextCache.size
//       }
//     } catch (error) {
//       return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
//     }
//   }
// }

// // Create singleton instance
// const productCache = new ProductCacheService()

// export default productCache


// -------------------
// ====================

import axios from 'axios';
import config from "../config/config.js"

// Product Caching Service with compression and size management
class ProductCacheService {
  constructor() {
    this.CACHE_KEY = "graba2z_products_cache"
    this.CACHE_CHUNK_PREFIX = "graba2z_products_chunk_"
    this.CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes
    this.MAX_CACHE_SIZE = 1 * 1024 * 1024 // 1MB per chunk (reduced)
    this.MAX_CHUNKS = 20 // More chunks, smaller size
    
    // Search optimization cache
    this.searchableTextCache = new Map()
    this.lastCacheUpdate = 0
    this.products = [];
    this.lastFetch = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.isLoading = false;
  }

  // Compress data using JSON.stringify and btoa
  compressData(data) {
    try {
      const jsonString = JSON.stringify(data)
      return btoa(encodeURIComponent(jsonString))
    } catch (error) {
      return null
    }
  }

  // Decompress data
  decompressData(compressedData) {
    try {
      const jsonString = decodeURIComponent(atob(compressedData))
      return JSON.parse(jsonString)
    } catch (error) {
      return null
    }
  }

  // Check if cache is valid
  isCacheValid() {
    const cached = localStorage.getItem(this.CACHE_KEY)
    if (!cached) return false

    try {
      const data = this.decompressData(cached)
      if (!data) return false

      const now = Date.now()
      return data.timestamp && now - data.timestamp < this.CACHE_EXPIRY
    } catch (error) {
      return false
    }
  }

  // Get cached products
  getCachedProducts() {
    if (!this.isCacheValid()) return null

    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      const data = this.decompressData(cached)

      if (!data) return null

      // Check if data is chunked
      if (data.isChunked) {
        return this.getCachedProductsChunked(data)
      }

      return data?.products || []
    } catch (error) {
      return null
    }
  }

  // Get cached products from chunked storage
  getCachedProductsChunked(metadata) {
    try {
      const allProducts = []

      for (let i = 0; i < metadata.chunkCount; i++) {
        const chunkKey = `${this.CACHE_CHUNK_PREFIX}${i}`

        // Try localStorage first, then sessionStorage
        let chunkData = localStorage.getItem(chunkKey)
        let storageType = "localStorage"

        if (!chunkData) {
          chunkData = sessionStorage.getItem(chunkKey)
          storageType = "sessionStorage"
        }

        if (!chunkData) {
          return null
        }

        const chunk = this.decompressData(chunkData)
        if (!chunk || !chunk.products) {
          return null
        }

        allProducts.push(...chunk.products)
      }

      return allProducts
    } catch (error) {
      return null
    }
  }

  // Set products in cache with chunked storage
  async setCachedProducts(products) {
    try {
      // Create ultra-minimal product data (only core fields)
      const minimalProducts = products.map((product) => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        basePrice: product.basePrice,
        offerPrice: product.offerPrice,
        brand: product.brand,
        category: product.category,
        parentCategory: product.parentCategory,
        countInStock: product.countInStock,
        stockStatus: product.stockStatus,
        discount: product.discount,
        featured: product.featured,
        slug: product.slug,
        image: product.image,
        galleryImages: product.galleryImages,
        rating: product.rating,
        numReviews: product.numReviews,
        description: product.description,
        tags: product.tags,
        createdAt: product.createdAt,
      }))

      // Try single cache first
      const cacheData = {
        products: minimalProducts,
        timestamp: Date.now(),
        isMinimal: true,
      }

      const compressedData = this.compressData(cacheData)
      if (!compressedData) {
        throw new Error("Failed to compress data")
      }

      const dataSize = new Blob([compressedData]).size

      if (dataSize <= this.MAX_CACHE_SIZE) {
        localStorage.setItem(this.CACHE_KEY, compressedData)
        return
      }

      // If too large, try chunked storage
      return await this.setCachedProductsChunked(minimalProducts)
    } catch (error) {
      throw error
    }
  }

  // Set products in cache using chunked storage
  async setCachedProductsChunked(products) {
    try {
      const chunkSize = Math.ceil(products.length / this.MAX_CHUNKS)
      const chunks = []

      // Split products into chunks
      for (let i = 0; i < products.length; i += chunkSize) {
        chunks.push(products.slice(i, i + chunkSize))
      }

      // Store chunk metadata
      const metadata = {
        totalProducts: products.length,
        chunkCount: chunks.length,
        timestamp: Date.now(),
        isChunked: true,
      }

      localStorage.setItem(this.CACHE_KEY, this.compressData(metadata))

      // Store each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkData = {
          products: chunks[i],
          chunkIndex: i,
          timestamp: Date.now(),
        }

        const compressedChunk = this.compressData(chunkData)
        const chunkSize = new Blob([compressedChunk]).size

        if (chunkSize > this.MAX_CACHE_SIZE) {
          // Try sessionStorage as fallback
          try {
            sessionStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
          } catch (sessionError) {
            throw new Error(`Chunk ${i} is too large for both localStorage and sessionStorage: ${chunkSize} bytes`)
          }
        } else {
          localStorage.setItem(`${this.CACHE_CHUNK_PREFIX}${i}`, compressedChunk)
        }
      }

      return true
    } catch (error) {
      // Clean up any partial chunks
      this.clearCache()
      throw error
    }
  }

  // Clear cache
  clearCache() {
    // Clear main cache
    localStorage.removeItem(this.CACHE_KEY)
    sessionStorage.removeItem(this.CACHE_KEY)

    // Clear chunked cache from both storages
    for (let i = 0; i < this.MAX_CHUNKS; i++) {
      localStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
      sessionStorage.removeItem(`${this.CACHE_CHUNK_PREFIX}${i}`)
    }
    
    // Clear search cache
    this.searchableTextCache.clear()
    this.lastCacheUpdate = 0
    this.products = [];
    this.lastFetch = null;
  }

  // Force refresh cache (clear and fetch new data)
  async forceRefreshCache() {
    this.clearCache()
    const products = await this.fetchAndCacheProducts()
    return products
  }

  // Test cache functionality
  async testCache() {
    // Check current cache
    const stats = this.getCacheStats()

    // Try to get products
    const products = await this.getProducts()

    // Check if cache was used
    const newStats = this.getCacheStats()

    // Test storage availability
    const storageTest = {
      localStorage: this.testStorage("localStorage"),
      sessionStorage: this.testStorage("sessionStorage"),
    }

    return { products, cacheUsed: newStats.hasCache, storageTest }
  }

  // Test storage availability
  testStorage(storageType) {
    try {
      const testKey = "test_storage"
      const testValue = "test"

      if (storageType === "localStorage") {
        localStorage.setItem(testKey, testValue)
        const result = localStorage.getItem(testKey) === testValue
        localStorage.removeItem(testKey)
        return result
      } else if (storageType === "sessionStorage") {
        sessionStorage.setItem(testKey, testValue)
        const result = sessionStorage.getItem(testKey) === testValue
        sessionStorage.removeItem(testKey)
        return result
      }
      return false
    } catch (error) {
      return false
    }
  }

  // Fetch products from API and cache them
  async fetchAndCacheProducts() {
    try {
      const response = await axios.get(`${config.API_URL}/api/products`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const products = await response.json()

      // Always try to cache products
      try {
        await this.setCachedProducts(products)
        // Update search cache timestamp
        this.lastCacheUpdate = Date.now()
      } catch (cacheError) {
        // Continue without cache - the app will still work
      }

      return products
    } catch (error) {
      throw error
    }
  }

  // Get products (from cache or API)
  async getProducts() {
    const now = Date.now();
    
    // Return cached products if still valid
    if (this.products.length > 0 && this.lastFetch && (now - this.lastFetch) < this.cacheExpiry) {
      return this.products;
    }

    // Prevent multiple simultaneous requests
    if (this.isLoading) {
      // Wait for the current request to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.products;
    }

    try {
      this.isLoading = true;
      console.log('Fetching products from API...');
      
      const response = await axios.get(`${config.API_URL}/api/products`);
      
      if (response.data && Array.isArray(response.data)) {
        this.products = response.data.map(product => ({
          ...product,
          // Ensure required fields exist
          name: product.name || '',
          description: product.description || '',
          tags: product.tags || '',
          price: product.price || 0,
          // Add searchable fields for better filtering
          brand: product.brand || null,
          category: product.category || null,
          parentCategory: product.parentCategory || null
        }));
        
        this.lastFetch = now;
        this.clearSearchableCache(); // Clear cache when products are refreshed
        console.log(`Cached ${this.products.length} products`);
      } else {
        console.error('Invalid products data received:', response.data);
        this.products = [];
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Don't clear existing cache on error, return what we have
      if (this.products.length === 0) {
        throw error;
      }
    } finally {
      this.isLoading = false;
    }

    return this.products;
  }

  // Pre-compute searchable text for a product (with caching)
  getSearchableText(product) {
    const productId = product._id
    
    // Check if we have cached searchable text and it's still valid
    if (this.searchableTextCache.has(productId)) {
      const cached = this.searchableTextCache.get(productId)
      // Cache is valid for 5 minutes or until products are refreshed
      if (Date.now() - cached.timestamp < 300000 && cached.timestamp >= this.lastCacheUpdate) {
        return cached.text
      }
    }

    // Create searchable text from product fields
    const searchableFields = [
      product.name || '',
      product.description || '',
      product.tags || '',
      product.brand?.name || '',
      product.category?.name || '',
      product.parentCategory?.name || ''
    ]
    
    const searchableText = searchableFields
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Cache the result
    this.searchableTextCache.set(productId, {
      text: searchableText,
      timestamp: Date.now()
    })
    
    // Limit cache size to prevent memory issues
    if (this.searchableTextCache.size > 5000) {
      // Remove oldest entries (simple FIFO)
      const firstKey = this.searchableTextCache.keys().next().value;
      this.searchableTextCache.delete(firstKey);
    }

    return searchableText;
  }

  // Optimized search function
  performOptimizedSearch(products, searchWords, maxResults = 100) {
    const results = []
    const searchWordsLower = searchWords.map(word => word.toLowerCase())
    
    // Early termination - stop when we have enough high-quality results
    let highQualityResults = 0
    const maxHighQuality = Math.min(50, maxResults)
    
    for (let i = 0; i < products.length && results.length < maxResults; i++) {
      const product = products[i]
      const searchableText = this.getSearchableText(product)
      
      // Quick check - if no words match, skip this product
      let matchCount = 0
      const matchedWords = []
      
      // Use more efficient string matching
      for (let j = 0; j < searchWordsLower.length; j++) {
        const word = searchWordsLower[j]
        if (searchableText.includes(word)) {
          matchCount++
          matchedWords.push(searchWords[j])
        }
      }
      
      // Only include products that match at least one word
      if (matchCount > 0) {
        const matchScore = matchCount / searchWords.length
        
        results.push({
          product,
          matchCount,
          matchScore,
          matchedWords
        })
        
        // Count high-quality results (50%+ word match)
        if (matchScore >= 0.5) {
          highQualityResults++
        }
        
        // Early termination if we have enough high-quality results
        if (highQualityResults >= maxHighQuality && results.length >= 20) {
          break
        }
      }
    }
    
    // Fast sort using a more efficient comparison
    results.sort((a, b) => {
      // Primary: match count (more matches first)
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount
      }
      // Secondary: match score
      return b.matchScore - a.matchScore
    })
    
    return results
  }

  // Filter products by category and parent_category
  filterProducts(products, filters = {}) {
    if (!products || !Array.isArray(products)) {
      return []
    }

    let filteredProducts = [...products]

    // Optimized search with word-by-word matching
    if (filters.search && filters.search.trim()) {
      const searchQuery = filters.search.trim()
      
      // Split search query into individual words
      const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0)
      
      if (searchWords.length > 0) {
        // Use optimized search function
        const searchResults = this.performOptimizedSearch(filteredProducts, searchWords)
        
        // Extract products from search results
        filteredProducts = searchResults.map(result => result.product)
        
        // Debug log (only for development)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Search for "${searchQuery}":`, {
            searchWords,
            totalResults: searchResults.length,
            topResults: searchResults.slice(0, 3).map(item => ({
              name: item.product.name,
              matchCount: item.matchCount,
              matchedWords: item.matchedWords,
              matchScore: item.matchScore
            }))
          })
        }
      }
    }

    // Apply other filters efficiently
    if (filters.category && filters.category !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        if (!product.category) return false
        const categoryId = typeof product.category === "string" ? product.category : product.category._id
        return categoryId === filters.category
      })
    }

    if (filters.parent_category && filters.parent_category !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        if (!product.parentCategory) return false
        const parentCategoryId = typeof product.parentCategory === "string" ? product.parentCategory : product.parentCategory._id
        return parentCategoryId === filters.parent_category
      })
    }

    if (filters.brand && filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        if (!product.brand) return false
        const brandId = typeof product.brand === "string" ? product.brand : product.brand._id
        return filters.brand.includes(brandId)
      })
    }

    if (filters.priceRange && Array.isArray(filters.priceRange)) {
      const [minPrice, maxPrice] = filters.priceRange
      filteredProducts = filteredProducts.filter((product) => {
        const price = product.price || 0
        return price >= minPrice && price <= maxPrice
      })
    }

    if (filters.stockStatus) {
      const stockFilters = Array.isArray(filters.stockStatus) ? filters.stockStatus : [filters.stockStatus]
      if (stockFilters.length > 0) {
        filteredProducts = filteredProducts.filter((product) => {
          return stockFilters.some((filter) => {
            switch (filter) {
              case "inStock":
                return product.stockStatus === "Available Product" || (product.countInStock || 0) > 0
              case "outOfStock":
                return product.stockStatus === "Out of Stock" && (product.countInStock || 0) === 0
              case "onSale":
                return (
                  (product.discount && product.discount > 0) ||
                  (product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price)
                )
              default:
                return false
            }
          })
        })
      }
    }

    // Apply sorting only if no search was performed (search already sorts by relevance)
    if (!filters.search || !filters.search.trim()) {
      // Efficient sorting with stock status priority
      filteredProducts.sort((a, b) => {
        // Check stock status efficiently
        const aInStock = a.stockStatus === "Available Product" || (!a.stockStatus && (a.countInStock || 0) > 0)
        const bInStock = b.stockStatus === "Available Product" || (!b.stockStatus && (b.countInStock || 0) > 0)

        // In-stock products first
        if (aInStock !== bInStock) {
          return bInStock ? 1 : -1
        }

        // Secondary sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case "price-low":
              return (a.price || 0) - (b.price || 0)
            case "price-high":
              return (b.price || 0) - (a.price || 0)
            case "name":
              return (a.name || "").localeCompare(b.name || "")
            case "newest":
            default:
              return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          }
        }

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })
    } else {
      // For search results, maintain relevance but prioritize in-stock items within each relevance group
      const inStockProducts = []
      const outOfStockProducts = []
      
      filteredProducts.forEach(product => {
        const inStock = product.stockStatus === "Available Product" || (!product.stockStatus && (product.countInStock || 0) > 0)
        if (inStock) {
          inStockProducts.push(product)
        } else {
          outOfStockProducts.push(product)
        }
      })
      
      filteredProducts = [...inStockProducts, ...outOfStockProducts]
    }

    return filteredProducts
  }

  // Get cache statistics
  getCacheStats() {
    const cached = localStorage.getItem(this.CACHE_KEY)
    if (!cached) {
      return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
    }

    try {
      const data = this.decompressData(cached)
      if (!data) {
        return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
      }

      const age = Date.now() - data.timestamp
      let cacheType = "full"
      if (data.isEssential) cacheType = "essential"
      if (data.isMinimal) cacheType = "minimal"
      if (data.isUltraMinimal) cacheType = "ultra-minimal"
      if (data.isChunked) cacheType = "chunked"

      const itemCount = data.isChunked ? data.totalProducts : data.products?.length || 0

      return {
        hasCache: true,
        itemCount: itemCount,
        age: age,
        isValid: age < this.CACHE_EXPIRY,
        cacheType: cacheType,
        chunks: data.isChunked ? data.chunkCount : null,
        searchCacheSize: this.searchableTextCache.size
      }
    } catch (error) {
      return { hasCache: false, itemCount: 0, age: null, cacheType: "none" }
    }
  }

  // Clear searchable text cache when products are refreshed
  clearSearchableCache() {
    this.searchableTextCache.clear();
    this.searchableCacheTimestamp = Date.now();
  }

  // Method to manually refresh cache
  async refreshCache() {
    this.lastFetch = null;
    this.clearSearchableCache();
    return await this.getProducts();
  }

  // Get cache status for debugging
  getCacheStatus() {
    const now = Date.now();
    return {
      productsCount: this.products.length,
      lastFetch: this.lastFetch,
      cacheAge: this.lastFetch ? now - this.lastFetch : null,
      isExpired: this.lastFetch ? (now - this.lastFetch) > this.cacheExpiry : true,
      isLoading: this.isLoading,
      searchableCacheSize: this.searchableTextCache.size,
      searchableCacheAge: this.searchableCacheTimestamp ? now - this.searchableCacheTimestamp : null
    };
  }
}

// Create singleton instance
const productCache = new ProductCacheService()

export default productCache
