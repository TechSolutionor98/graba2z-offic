// Lightweight Excel export using SheetJS (xlsx)
import * as XLSX from 'xlsx';

// Map product object to a flat row for Excel
function mapProductToRow(p) {
  const brandName = p.brand?.name || p.brand?.toString?.() || '';
  const categoryName = p.category?.name || p.category?.toString?.() || '';
  const parentCategoryName = p.parentCategory?.name || p.parentCategory?.toString?.() || '';
  const subCategoryName = p.subCategory?.name || p.subCategory?.toString?.() || '';
  return {
    Name: p.name || '',
    Slug: p.slug || '',
    SKU: p.sku || '',
    Barcode: p.barcode || '',
    Brand: brandName,
    Category: categoryName,
    ParentCategory: parentCategoryName,
    SubCategory: subCategoryName,
    Price: p.price ?? '',
    OfferPrice: p.offerPrice ?? '',
    Discount: p.discount ?? '',
    CountInStock: p.countInStock ?? '',
    StockStatus: p.stockStatus || '',
    Featured: p.featured ? 'Yes' : 'No',
    Active: p.isActive ? 'Yes' : 'No',
    Rating: p.rating ?? '',
    NumReviews: p.numReviews ?? '',
    Tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
    CreatedAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
  };
}

export function exportProductsToExcel(products, filename = 'products.xlsx') {
  if (!Array.isArray(products) || products.length === 0) return;
  const rows = products.map(mapProductToRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, filename);
}

export function downloadSelectedProducts(products, selectedIds, filename) {
  const set = new Set(selectedIds || []);
  const filtered = Array.isArray(selectedIds) && selectedIds.length > 0
    ? (products || []).filter(p => set.has(p._id))
    : (products || []);
  exportProductsToExcel(filtered, filename);
}
