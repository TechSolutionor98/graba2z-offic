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
 * - If it's already a full URL (http/https), return as-is
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return ""
  
  // Already a full URL (Cloudinary or other external source)
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
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
