import React from 'react';
import { generateProductSchema, generateProductListSchema } from '../utils/productSchema';

const ProductSchema = ({ product, products, type = 'single' }) => {
  const schema = type === 'list' && products 
    ? generateProductListSchema(products)
    : product 
    ? generateProductSchema(product)
    : null;

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
};

export default ProductSchema;