const MONGODB_OBJECT_ID_REGEX = /^[a-f\d]{24}$/i

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "")

const isDisplayableName = (value) => {
  const text = normalizeText(value)
  if (!text) return false
  return !MONGODB_OBJECT_ID_REGEX.test(text)
}

const extractFromNode = (node) => {
  if (!node) return null

  if (typeof node === "string") {
    return isDisplayableName(node)
      ? {
          name: node.trim(),
          sourceDoc: null,
          fieldName: null,
        }
      : null
  }

  if (typeof node === "object") {
    const preferredFields = ["displayName", "name", "title", "label"]

    for (const fieldName of preferredFields) {
      const fieldValue = node[fieldName]
      if (isDisplayableName(fieldValue)) {
        return {
          name: fieldValue.trim(),
          sourceDoc: node,
          fieldName,
        }
      }
    }
  }

  return null
}

const CATEGORY_CANDIDATES = [
  { key: "category", useProductFieldFallback: false },
  { key: "subCategory", useProductFieldFallback: false },
  { key: "subcategory", useProductFieldFallback: false },
  { key: "subCategory2", useProductFieldFallback: false },
  { key: "subCategory3", useProductFieldFallback: false },
  { key: "subCategory4", useProductFieldFallback: false },
  { key: "parentCategory", useProductFieldFallback: false },
  { key: "categoryName", useProductFieldFallback: true },
  { key: "subCategoryName", useProductFieldFallback: true },
  { key: "parentCategoryName", useProductFieldFallback: true },
]

export const resolveProductCategoryInfo = (product) => {
  if (!product || typeof product !== "object") {
    return {
      name: "",
      sourceDoc: null,
      fieldName: null,
    }
  }

  for (const candidate of CATEGORY_CANDIDATES) {
    const value = product[candidate.key]
    const extracted = extractFromNode(value)
    if (!extracted) continue

    if (extracted.sourceDoc) {
      return extracted
    }

    if (candidate.useProductFieldFallback) {
      return {
        name: extracted.name,
        sourceDoc: product,
        fieldName: candidate.key,
      }
    }

    return {
      name: extracted.name,
      sourceDoc: null,
      fieldName: null,
    }
  }

  return {
    name: "",
    sourceDoc: null,
    fieldName: null,
  }
}

/**
 * Checks if a product is visible for a given country code (e.g. "AE", "SA")
 */
export const isProductVisibleInCountry = (product, countryCode) => {
  if (!product) return false
  const targetCountries = product.targetCountries
  if (!targetCountries || !Array.isArray(targetCountries) || targetCountries.length === 0) {
    return true
  }
  if (targetCountries.includes("ALL")) {
    return true
  }
  if (!countryCode) return true
  return targetCountries.includes(String(countryCode).toUpperCase())
}

/**
 * Returns effective countInStock and stockStatus for a product in a given country
 */
export const getProductEffectiveStock = (product, countryCode) => {
  if (!product) return { countInStock: 0, stockStatus: "Out of Stock", isOutOfStock: true }

  const code = String(countryCode || "AE").toUpperCase()

  let count = product.countInStock

  if (Array.isArray(product.countryStock) && product.countryStock.length > 0) {
    const entry = product.countryStock.find((cs) => cs && String(cs.country).toUpperCase() === code)
    if (entry && typeof entry.countInStock === "number") {
      count = entry.countInStock
    }
  }

  const numCount = Number(count) || 0

  // The status the admin set decides, which is the same rule the server applies in
  // buildPublicStockFilterCondition: a product marked In Stock is in stock whatever
  // the count says, and one marked Out of Stock stays out whatever the count says.
  // The count only speaks when no status was set at all.
  //
  // This used to read `numCount <= 0 || stockStatus === "Out of Stock"`. That made the
  // offer page the only screen on the site calling a product out of stock while the
  // category listing, the product page, the offer page's own stock filter and the
  // order route all called the same product in stock -- 71 live products at the time,
  // every one of them marked In Stock with a count of 0.
  const declared = String(product.stockStatus || "").trim()
  const stockStatus = declared || (numCount > 0 ? "In Stock" : "Out of Stock")
  const isOutOfStock = stockStatus === "Out of Stock"

  return {
    countInStock: numCount,
    stockStatus,
    isOutOfStock,
  }
}
