import React, { useEffect } from 'react';

const ProductSchema = ({ product }) => {
  useEffect(() => {
    if (!product) return;

    // Remove any existing dynamic schema
    const existingSchema = document.querySelector('script[data-dynamic-schema="true"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Create new schema
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name || product.title,
      "image": product.image || product.thumbnail,
      "description": product.description || product.shortDescription,
      "url": window.location.href,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Grab AtoZ"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "AED",
        "price": product.price,
        "availability": product.stock > 0 ? "http://schema.org/InStock" : "http://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Grab AtoZ"
        }
      }
    };

    // Add rating if exists
    if (product.rating) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": product.reviewCount || 1
      };
    }

    // Inject schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic-schema', 'true');
    script.innerHTML = JSON.stringify(schema);
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