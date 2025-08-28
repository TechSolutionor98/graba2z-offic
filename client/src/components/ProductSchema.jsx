import { useEffect } from 'react';

const ProductSchema = ({ product }) => {
  useEffect(() => {
    if (!product) return;

    // Remove any existing dynamic schema
    const existingSchema = document.querySelector('script[data-dynamic-schema="true"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Create properly structured schema
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name || product.title,
      "image": product.image || product.thumbnail,
      "description": product.description || product.shortDescription || product.name,
      "url": window.location.href,
      "sku": product.sku || product._id,
      "brand": {
        "@type": "Brand",
        "name": product.brand,
      },
      "category": product.category?.name ,
      "offers": {
        "@type": "Offer",
        "price": product.price?.toString() ,
        "priceCurrency": "AED",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": window.location.href,
        "seller": {
          "@type": "Organization",
          "name": "Grab AtoZ"
        }
      }
    };

    // Add manufacturer if brand exists
    if (product.brand) {
      schema.manufacturer = {
        "@type": "Organization",
        "name": product.brand
      };
    }

    // Add rating only if it exists and is valid
    if (product.rating && product.rating > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toString(),
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": (product.reviewCount || 1).toString()
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