import config from "../config/config"

// Image utility functions
export const checkImageUrl = async (url) => {
  if (!url) return false
  
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Check if a URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  if (!url) return false
  return url.includes("cloudinary.com") || url.includes("res.cloudinary")
}

/**
 * Get the full image URL with proper base URL
 * - If it's a Cloudinary URL, return as-is
 * - If it's a local path starting with /uploads, prepend API_URL
 * - If it's already a full URL with localhost, replace with current API_URL
 * - If it's already a full URL (http/https), check if it needs API_URL replacement
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return ""
  
  // Handle Cloudinary URLs - return as-is
  if (isCloudinaryUrl(imageUrl)) {
    return imageUrl
  }
  
  // Handle full URLs (http:// or https://)
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    // Check if it's a localhost URL that needs to be replaced
    if (imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1")) {
      // Extract just the /uploads/... part
      const uploadsMatch = imageUrl.match(/(\/uploads\/.+)/)
      if (uploadsMatch) {
        return `${config.API_URL}${uploadsMatch[1]}`
      }
    }
    
    // Check if it contains /uploads/ and the hostname doesn't match current API
    if (imageUrl.includes("/uploads/")) {
      try {
        const urlObj = new URL(imageUrl)
        const currentApiHost = new URL(config.API_URL).hostname
        
        // If the hostname doesn't match, replace with current API_URL
        if (urlObj.hostname !== currentApiHost) {
          const uploadsPath = urlObj.pathname
          return `${config.API_URL}${uploadsPath}`
        }
      } catch (e) {
        // If URL parsing fails, continue to return as-is
      }
    }
    
    // Return other full URLs as-is
    return imageUrl
  }
  
  // Local file path - prepend API URL
  if (imageUrl.startsWith("/uploads")) {
    return `${config.API_URL}${imageUrl}`
  }
  
  // Handle case where it might be just "uploads/..." without leading slash
  if (imageUrl.startsWith("uploads/")) {
    return `${config.API_URL}/${imageUrl}`
  }
  
  // Default: return as-is (might be a placeholder or relative path)
  return imageUrl
}

/**
 * Get multiple image URLs
 */
export const getFullImageUrls = (imageUrls) => {
  if (!Array.isArray(imageUrls)) return []
  return imageUrls.map(url => getFullImageUrl(url))
}

/**
 * Extract filename from Cloudinary or local URL for deletion
 */
export const getImageIdentifier = (imageUrl) => {
  if (!imageUrl) return ""
  
  // For Cloudinary URLs
  if (isCloudinaryUrl(imageUrl)) {
    // Extract public ID from Cloudinary URL
    const parts = imageUrl.split("/")
    const filename = parts[parts.length - 1]
    return filename.split(".")[0] // Remove extension
  }
  
  // For local URLs, return the path
  if (imageUrl.startsWith("http")) {
    // Extract path from full URL
    try {
      const urlObj = new URL(imageUrl)
      return urlObj.pathname // Returns /uploads/...
    } catch {
      return imageUrl
    }
  }
  
  // Already a path
  return imageUrl
}

// Original function for backward compatibility
export const getImageUrl = (product) => {
  // Try different image fields in order of preference
  if (product.image) return getFullImageUrl(product.image)
  if (product.galleryImages && product.galleryImages.length > 0) return getFullImageUrl(product.galleryImages[0])
  if (product.images && product.images.length > 0) return getFullImageUrl(product.images[0])
  
  // Fallback to placeholder
  return "/placeholder.svg?height=150&width=150"
}
