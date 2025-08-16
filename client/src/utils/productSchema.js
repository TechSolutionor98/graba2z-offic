export const generateProductSchema = (product) => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name || product.title,
    "image": product.images?.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    ) || [],
    "description": product.description || product.shortDescription || "",
    "sku": product.sku || product._id,
    "mpn": product.mpn || product.model || "",
    "brand": {
      "@type": "Brand",
      "name": product.brand || "GrabAtoZ"
    },
    "category": product.category || "",
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${product.slug || product._id}`,
      "priceCurrency": "AED",
      "price": product.price || product.discountPrice || 0,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "GrabA2Z"
      }
    },
    "aggregateRating": product.ratings && product.numOfReviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.ratings,
      "reviewCount": product.numOfReviews,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "review": product.reviews?.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": review.name || "Anonymous"
      },
      "reviewBody": review.comment
    })) || []
  };
};

export const generateProductListSchema = (products) => {
  return {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": generateProductSchema(product)
    }))
  };
};