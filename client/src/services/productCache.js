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
      
      if (response.data && Array.isArray(response.data.products)) {
        const products = response.data.products.map(product => ({
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
        }));

        // Cache the fetched page
        this.pageCache.set(cacheKey, {
          products: products,
          timestamp: now,
          totalCount: response.data.totalCount,
          pages: response.data.pages,
          page: response.data.page,
        });
        this.lastFetchTimestamp = now; // Update global fetch timestamp

        return {
          products: products,
          totalCount: response.data.totalCount,
          pages: response.data.pages,
          page: response.data.page,
        };
      } else {
        console.error('Invalid products data received:', response.data);
        return { products: [], totalCount: 0, pages: 0, page: 1 };
      }
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
