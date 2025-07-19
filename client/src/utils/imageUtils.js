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

export const getImageUrl = (product) => {
  // Try different image fields in order of preference
  if (product.image) return product.image
  if (product.galleryImages && product.galleryImages.length > 0) return product.galleryImages[0]
  if (product.images && product.images.length > 0) return product.images[0]
  
  // Fallback to placeholder
  return "/placeholder.svg?height=150&width=150"
}

 