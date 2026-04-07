import { useEffect } from 'react';

const ProductSchema = ({ product }) => {
  useEffect(() => {
    if (!product) return;

    // Remove any existing dynamic schema
    const existingSchema = document.querySelector('script[data-dynamic-schema="true"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    const toAbsoluteUrl = (url) => {
      if (!url) return null
      if (/^https?:\/\//i.test(url)) return url
      return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`
    }

    const basePrice = Number(product.price) || 0
    const offerPrice = Number(product.offerPrice) || 0
    const hasValidOffer = offerPrice > 0 && basePrice > 0 && offerPrice < basePrice
    const effectivePrice = hasValidOffer ? offerPrice : (basePrice > 0 ? basePrice : offerPrice)
    const stockCount = Number.parseInt(product.countInStock ?? product.stock ?? 0, 10) || 0
    const stockStatus = product.stockStatus || ""
    const availability = stockStatus === "PreOrder"
      ? "https://schema.org/PreOrder"
      : (stockStatus === "Out of Stock" || stockCount <= 0)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock"
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    // Create clean schema with proper structure
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name || product.title || "Product",
      "image": [toAbsoluteUrl(product.image || product.thumbnail)].filter(Boolean),
      "description": product.description ? product.description.replace(/<[^>]*>/g, '') : '', // Remove HTML tags
      "url": window.location.href,
      "sku": product.sku || product._id,
      "category": typeof product.category === 'string' ? product.category : product.category?.name,
      "brand": {
        "@type": "Brand",
        "name": typeof product.brand === 'string' ? product.brand : product.brand?.name || "Generic"
      },
      "manufacturer": {
        "@type": "Organization", 
        "name": typeof product.brand === 'string' ? product.brand : product.brand?.name || "Generic"
      },
      "offers": {
        "@type": "Offer",
        "price": effectivePrice.toFixed(2),
        "priceCurrency": "AED",
        "priceValidUntil": oneYearFromNow.toISOString().slice(0, 10),
        "itemCondition": "https://schema.org/NewCondition",
        "availability": availability,
        "url": window.location.href,
        "seller": {
          "@type": "Organization",
          "name": "Grab AtoZ"
        }
      }
    };

    // Add rating if exists
    if (product.rating && product.rating > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toString(),
        "bestRating": "5",
        "worstRating": "1", 
        "ratingCount": (product.numReviews || product.reviewCount || 1).toString()
      };
    }

    // Inject schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic-schema', 'true');
    script.innerHTML = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const schemaToRemove = document.querySelector('script[data-dynamic-schema="true"]');
      if (schemaToRemove) {
        schemaToRemove.remove();
      }
    };
  }, [product]);

  return null;
};

export default ProductSchema;
