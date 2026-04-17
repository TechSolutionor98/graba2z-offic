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
