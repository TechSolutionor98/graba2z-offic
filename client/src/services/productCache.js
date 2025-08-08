import config from "../config/config.js"
import axios from 'axios'; // Import axios for API calls

// Product Caching Service (simplified for paginated API)
class ProductCacheService {
  constructor() {
    this.CACHE_KEY = "graba2z_products_cache"
    this.CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes for page cache
    this.pageCache = new Map(); // Cache for individual pages
    this.lastFetchTimestamp = 0;
  }

  // Helper to generate a unique key for page cache
  _getPageCacheKey(filters) {
    return JSON.stringify(filters);
  }

  // Get products (from cache or API)
  async getProducts(filters = {}) {
    const cacheKey = this._getPageCacheKey(filters);
    const cachedData = this.pageCache.get(cacheKey);
    const now = Date.now();

    // Check if cached data exists and is still valid
    if (cachedData && (now - cachedData.timestamp < this.CACHE_EXPIRY)) {
      return cachedData.products;
    }

    try {
      // Construct query parameters for the API
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        search: filters.search || undefined,
        category: filters.category || undefined,
        subcategory: filters.subcategory || undefined,
        parentCategory: filters.parent_category || undefined,
        brand: filters.brand || undefined,
        sortBy: filters.sortBy || undefined,
        minPrice: filters.priceRange ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange ? filters.priceRange[1] : undefined,
        // Add stock status filters if needed by the API
        inStock: filters.stockStatus?.includes('inStock') || undefined,
        outOfStock: filters.stockStatus?.includes('outOfStock') || undefined,
        onSale: filters.stockStatus?.includes('onSale') || undefined,
      };

      // Remove undefined values to avoid sending empty query params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axios.get(`${config.API_URL}/api/products`, { params });
      
      // Ensure we always have a valid response structure
      const responseData = response.data || {};
      const products = Array.isArray(responseData.products) 
        ? responseData.products.map(product => ({
            _id: product._id,
            name: product.name,
            price: product.price || 0,
            basePrice: product.basePrice || product.price || 0,
            offerPrice: product.offerPrice || product.price || 0,
            brand: product.brand || {},
            category: product.category || {},
            parentCategory: product.parentCategory || {},
            countInStock: product.countInStock || 0,
            stockStatus: product.stockStatus || 'Out of Stock',
            discount: product.discount || 0,
            featured: Boolean(product.featured),
            slug: product.slug || '',
            image: product.image || '',
            galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages : [],
            rating: typeof product.rating === 'number' ? product.rating : 0,
            numReviews: product.numReviews || 0,
            description: product.description || '',
            tags: Array.isArray(product.tags) ? product.tags : [],
            createdAt: product.createdAt || new Date().toISOString(),
          }))
        : [];

      // Cache the fetched page with default values
      const cacheData = {
        products: products,
        timestamp: now,
        totalCount: typeof responseData.totalCount === 'number' ? responseData.totalCount : 0,
        pages: typeof responseData.pages === 'number' ? responseData.pages : 1,
        page: typeof responseData.page === 'number' ? responseData.page : 1,
      };
      
      this.pageCache.set(cacheKey, cacheData);
      this.lastFetchTimestamp = now;

      return cacheData;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Clear all cached pages
  clearCache() {
    this.pageCache.clear();
    this.lastFetchTimestamp = 0;
  }

  // Force refresh cache (clear and fetch new data for a specific page/filters)
  async forceRefreshCache(filters = {}) {
    this.clearCache(); // Clear all cache
    return await this.getProducts(filters); // Fetch the requested page
  }

  // Get cache statistics (for debugging)
  getCacheStats() {
    const now = Date.now();
    let totalCachedProducts = 0;
    this.pageCache.forEach(entry => {
      totalCachedProducts += entry.products.length;
    });

    return {
      hasCache: this.pageCache.size > 0,
      cachedPages: this.pageCache.size,
      totalCachedProducts: totalCachedProducts,
      lastFetch: this.lastFetchTimestamp,
      cacheAge: this.lastFetchTimestamp ? now - this.lastFetchTimestamp : null,
    };
  }
}

// Create singleton instance
const productCache = new ProductCacheService()

export default productCache
