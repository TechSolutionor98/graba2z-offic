

"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ImageUpload from "../ImageUpload"
import TipTapEditor from "../TipTapEditor"
import { Plus, X } from "lucide-react"

import config from "../../config/config"
const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [taxes, setTaxes] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    slug: "",
    barcode: "",
    brand: "",
    parentCategory: "",
    category: "",
    subCategory: "",
    description: "",
    shortDescription: "",
    buyingPrice: "",
    price: "", // This will be the final calculated price (base + tax)
    offerPrice: "",
    discount: "",
    image: "",
    galleryImages: [],
    countInStock: "",
    lowStockWarning: "5",
    maxPurchaseQty: "10",
    weight: "",
    unit: "piece",
    tax: "0",
    tags: "",
    specifications: [],
    isActive: true,
    canPurchase: true,
    showStockOut: true,
    refundable: true,
    featured: false,
    stockStatus: "Available Product",
  })

  // New states for price calculation
  const [basePrice, setBasePrice] = useState("") // This will be the input for the base price
  const [taxAmount, setTaxAmount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [originalOfferPrice, setOriginalOfferPrice] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [editingField, setEditingField] = useState(null) // 'offer' | 'discount' | null

  const units = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram" },
    { value: "gram", label: "Gram" },
    { value: "liter", label: "Liter" },
    { value: "meter", label: "Meter" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
  ]

  // Fetch taxes from backend
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        const { data } = await axios.get(`${config.API_URL}/api/tax`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTaxes(data)
      } catch (error) {
        setTaxes([])
        console.error("Failed to load taxes:", error)
      }
    }
    fetchTaxes()
  }, [])

  // Set tax rate when formData.tax or taxes change
  useEffect(() => {
    if (formData.tax && taxes.length > 0) {
      const selectedTax = taxes.find((t) => t._id === formData.tax)
      setTaxRate(selectedTax ? Number(selectedTax.rate) : 0)
    } else {
      setTaxRate(0)
    }
  }, [formData.tax, taxes])

  useEffect(() => {
    // Only recompute VAT breakdown and keep formData values in sync with inputs.
    const base = Number(basePrice) || 0
    const offer = Number(originalOfferPrice) || 0

    const tax = taxRate
    const includedTax = (amount, rate) => {
      if (!amount || amount <= 0 || !rate || rate <= 0) return 0
      return amount - amount / (1 + rate / 100)
    }

    const displayBase = offer > 0 ? offer : base
    const taxAmt = includedTax(displayBase, tax)
    setTaxAmount(taxAmt)

    // Do not round while typing; just mirror to formData
    setFormData((prev) => ({
      ...prev,
      offerPrice: originalOfferPrice,
      price: basePrice === "" ? prev.price : base.toFixed(2),
    }))
  }, [basePrice, taxRate, originalOfferPrice])

  useEffect(() => {
    fetchParentCategories()
    fetchBrands()
    if (product) {
      const parentId =
        (typeof product.parentCategory === "object" && product.parentCategory
          ? product.parentCategory._id
          : product.parentCategory) || ""
      const resolvedCategoryId =
        (typeof product.category === "object" && product.category ? product.category._id : product.category) ||
        (typeof product.subCategory === "object" && product.subCategory ? product.subCategory._id : product.subCategory) ||
        ""

      setBasePrice(product.price ? String(product.price) : "")
      setOriginalOfferPrice(product.offerPrice ? String(product.offerPrice) : "")

      const preload = async () => {
        if (parentId) {
          await fetchSubCategories(String(parentId))
        }
        setFormData({
          name: product.name || "",
          sku: product.sku || "",
          slug: product.slug || "",
          barcode: product.barcode || "",
          brand:
            (typeof product.brand === "object" && product.brand ? product.brand._id : product.brand)
              ? String(typeof product.brand === "object" && product.brand ? product.brand._id : product.brand)
              : "",
          parentCategory: parentId ? String(parentId) : "",
          category: resolvedCategoryId ? String(resolvedCategoryId) : "",
          subCategory:
            (typeof product.subCategory === "object" && product.subCategory ? product.subCategory._id : product.subCategory)
              ? String(
                  typeof product.subCategory === "object" && product.subCategory
                    ? product.subCategory._id
                    : product.subCategory,
                )
              : "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          buyingPrice: product.buyingPrice || "",
          price: product.price || "",
          offerPrice: product.offerPrice || "",
          discount: product.discount || "",
          image: product.image || "",
          galleryImages: product.galleryImages || [],
          countInStock: product.countInStock || "",
          lowStockWarning: product.lowStockWarning || "5",
          maxPurchaseQty: product.maxPurchaseQty || "10",
          weight: product.weight || "",
          unit: product.unit || "piece",
          tax:
            (typeof product.tax === "object" && product.tax ? product.tax._id : product.tax)
              ? String(typeof product.tax === "object" && product.tax ? product.tax._id : product.tax)
              : "0",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
          specifications: product.specifications || [],
          isActive: product.isActive !== undefined ? product.isActive : true,
          canPurchase: product.canPurchase !== undefined ? product.canPurchase : true,
          showStockOut: product.showStockOut !== undefined ? product.showStockOut : true,
          refundable: product.refundable !== undefined ? product.refundable : true,
          featured: product.featured || false,
          stockStatus: product.stockStatus || "Available Product",
        })
      }

      preload()
    }
  }, [product]) // Removed taxes from dependencies to prevent recalculation loops

  // Fetch parent categories (main categories)
  const fetchParentCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setParentCategories(data)
    } catch (error) {
      console.error("Failed to load parent categories:", error)
    }
  }

  // Fetch subcategories when parentCategory changes
  useEffect(() => {
    if (formData.parentCategory) {
      fetchSubCategories(formData.parentCategory)
    } else {
      setSubCategories([])
      setFormData((prev) => ({ ...prev, category: "", subCategory: "" }))
    }
  }, [formData.parentCategory])

  const fetchSubCategories = async (parentCategoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/subcategories/category/${parentCategoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSubCategories(data)
    } catch (error) {
      setSubCategories([])
      console.error("Failed to load subcategories:", error)
    }
  }

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const { data } = await axios.get(`${config.API_URL}/api/brands`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setBrands(data)
    } catch (error) {
      console.error("Failed to load brands:", error)
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === "basePrice") {
      // Handle the new basePrice input
      setBasePrice(value)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }

    // Auto-generate slug from name
    if (name === "name" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }))
    }
  }

  const handleOfferPriceChange = (e) => {
    const value = e.target.value
    setEditingField("offer")
    setOriginalOfferPrice(value)

    const base = Number(basePrice)
    const offer = Number(value)
    if (!isNaN(base) && base > 0 && value !== "") {
      const calcDiscount = Math.max(0, ((base - offer) / base) * 100).toFixed(2)
      setFormData((prev) => ({ ...prev, discount: String(calcDiscount) }))
    } else {
      // When offer is cleared, clear discount (but don't touch if user is editing discount)
      if (editingField !== "discount") {
        setFormData((prev) => ({ ...prev, discount: "" }))
      }
    }
  }

  const handleOfferPriceBlur = () => {
    setEditingField(null)
    if (originalOfferPrice === "") return
    const n = Number(originalOfferPrice)
    if (!isNaN(n)) {
      const fixed = n.toFixed(2)
      setOriginalOfferPrice(fixed)
      setFormData((prev) => ({ ...prev, offerPrice: fixed }))
    }
  }

  const handleDiscountChange = (e) => {
    const value = e.target.value
    setEditingField("discount")
    // Update discount immediately
    setFormData((prev) => ({ ...prev, discount: value }))

    const base = Number(basePrice)
    const disc = Number(value)
    if (!isNaN(base) && base > 0 && value !== "") {
      const offer = base - (base * Math.min(Math.max(disc, 0), 100)) / 100
      const offerStr = offer.toFixed(2)
      setOriginalOfferPrice(offerStr)
      setFormData((prev) => ({ ...prev, offerPrice: offerStr }))
    } else if (value === "") {
      // If discount cleared, keep offer as is (user may type it)
    }
  }

  const handleDiscountBlur = () => {
    setEditingField(null)
    const d = Number(formData.discount)
    if (!isNaN(d)) {
      const clamped = Math.min(Math.max(d, 0), 100).toFixed(2)
      setFormData((prev) => ({ ...prev, discount: String(clamped) }))
    }
  }

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }))
  }

  const handleShortDescriptionChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      shortDescription: content,
    }))
  }

  const handleImageUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
    }))
  }

  const handleGalleryImageUpload = (url, index) => {
    setFormData((prev) => {
      const newGalleryImages = [...prev.galleryImages]
      newGalleryImages[index] = url
      return {
        ...prev,
        galleryImages: newGalleryImages,
      }
    })
  }

  const removeGalleryImage = (index) => {
    setFormData((prev) => {
      const newGalleryImages = [...prev.galleryImages]
      newGalleryImages.splice(index, 1)
      return {
        ...prev,
        galleryImages: newGalleryImages,
      }
    })
  }

  // Specification handlers
  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }))
  }

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const updateSpecification = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (Number(formData.buyingPrice) < 0 || Number(basePrice) < 0 || Number(originalOfferPrice) < 0) {
      alert("Buying price, base price, and offer price cannot be less than 0.")
      setLoading(false)
      return
    }
    try {
      let taxValue = formData.tax
      if (!taxValue || taxValue === "0" || taxValue === 0) {
        taxValue = undefined
      }
      // IMPORTANT: Do not add tax again on submit.
      // We treat basePrice and formData.offerPrice as already tax-inclusive (informational VAT only).
  const finalBasePrice = Number.parseFloat(basePrice) || 0
  // Use the visible Offer Price input; if blank, treat as 0
  const finalOfferPrice = originalOfferPrice !== "" ? Number.parseFloat(originalOfferPrice) || 0 : 0

      const productData = {
        ...formData,
        parentCategory: formData.parentCategory,
        category: formData.category,
        subCategory: formData.category || null,
        buyingPrice: Number.parseFloat(formData.buyingPrice) || 0,
        price: finalBasePrice, // Save as-is (tax-inclusive; no re-add)
        offerPrice: finalOfferPrice, // Save as-is (tax-inclusive; no re-add)
        discount: Number.parseFloat(formData.discount) || 0,
        countInStock: Number.parseInt(formData.countInStock) || 0,
        lowStockWarning: Number.parseInt(formData.lowStockWarning) || 5,
        maxPurchaseQty: Number.parseInt(formData.maxPurchaseQty) || 10,
        weight: Number.parseFloat(formData.weight) || 0,
        tax: taxValue,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        galleryImages: formData.galleryImages.filter((img) => img !== ""),
        specifications: formData.specifications.filter((spec) => spec.key && spec.value),
        stockStatus: formData.stockStatus,
      }
      await onSubmit(productData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  // Debug logs for subcategory selection
  console.log("Selected subcategory value:", formData.category)
  console.log(
    "Fetched subcategories:",
    subCategories.map((s) => ({ id: s._id, name: s.name })),
  )
  // Debug log for taxes
  console.log("Fetched taxes:", taxes)


  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">{product ? "Edit Product" : "Add New Product"}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter SKU"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="product-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter barcode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Status <span className="text-red-500">*</span>
            </label>
            <select
              name="stockStatus"
              value={formData.stockStatus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Available Product">Available Product</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="PreOrder">PreOrder</option>
            </select>
          </div>

          {/* Parent Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Category <span className="text-red-500">*</span>
            </label>
            <select
              name="parentCategory"
              value={formData.parentCategory}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a Main Category</option>
              {parentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.parentCategory || subCategories.length === 0}
              required
            >
              <option value="">
                {formData.parentCategory ? "Select a Subcategory" : "Select a main category first"}
              </option>
              {subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a Brand</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buying Price{!product && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              name="buyingPrice"
              value={formData.buyingPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              {...(!product ? { required: true } : {})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price (AED) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="basePrice"
              value={basePrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter base price"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (AED)</label>
            <input
              type="number"
              name="offerPrice"
              value={originalOfferPrice}
              onChange={handleOfferPriceChange}
              onBlur={handleOfferPriceBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter offer price (before tax)"
              min="0"
              step="0.01"
            />
            {/* {Number(originalOfferPrice) > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {taxRate > 0 ? (
                  <span className="text-blue-600 font-medium">
                    Includes approx VAT {taxRate}%: AED {(
                      Number(originalOfferPrice) - Number(originalOfferPrice) / (1 + taxRate / 100)
                    ).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-gray-500">No VAT selected</span>
                )}
              </p>
            )} */}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleDiscountChange}
              onBlur={handleDiscountBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Tax-inclusive price summary */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-4">
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div>
              Base Price: <b>{Number(basePrice).toFixed(2) || "0.00"} AED</b>
            </div>
            <div>
              Offer Price: <b>{Number(formData.offerPrice).toFixed(2) || "0.00"} AED</b>
            </div>
            <div>
              Discount: <b>{Number(formData.discount).toFixed(2) || "0.00"}%</b>
            </div>
            <div>
              Tax: <b>{taxRate}%</b>
            </div>
            <div>
              Tax Amount: <b className="text-blue-600">{taxAmount.toFixed(2)} AED</b>
            </div>
            <div className="text-green-700 font-bold">
              Final Price (Saved): {Number(formData.price).toFixed(2)} AED{" "}
              <span className="text-xs text-red-500 ml-2">Inclusive tax</span>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div>
            <ImageUpload onImageUpload={handleImageUpload} currentImage={formData.image} label="Main Image *" />
          </div>

          {/* Gallery Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formData.galleryImages.map((img, index) => (
                <div key={index} className="relative">
                  <ImageUpload
                    onImageUpload={(url) => handleGalleryImageUpload(url, index)}
                    currentImage={img}
                    label={`Upload Gallery Image ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove Image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, ""] }))}
                  className="w-full h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-colors"
                >
                  <Plus size={24} />
                  <span className="ml-2">Add Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stock & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity{!product && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              {...(!product ? { required: true } : {})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Warning</label>
            <input
              type="number"
              name="lowStockWarning"
              value={formData.lowStockWarning}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Purchase Quantity</label>
            <input
              type="number"
              name="maxPurchaseQty"
              value={formData.maxPurchaseQty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {units.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax
              {formData.tax && taxRate > 0 && (
                <span className="ml-2 text-xs text-blue-600 font-medium">{taxRate}% - Inclusive tax</span>
              )}
            </label>
            <select
              name="tax"
              value={formData.tax}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Tax</option>
              {taxes.map((tax) => (
                <option key={tax._id} value={tax._id}>
                  {tax.name}
                  {tax.rate ? ` (${tax.rate}${tax.type ? (tax.type === "percentage" ? "%" : "") : ""})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        {/* Product Specifications Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Specifications</h3>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              Add Specification
            </button>
          </div>

          {formData.specifications.length > 0 ? (
            <div className="space-y-4">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Specification #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                      title="Remove Specification"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specification Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Processor, RAM, Storage"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, "key", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specification Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Intel i5-1235U, 8GB DDR4, 512GB SSD"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, "value", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No specifications added yet</h3>
              <p className="text-gray-500 mb-6">Add product specifications like processor, RAM, storage, etc.</p>
              <button
                type="button"
                onClick={addSpecification}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                <Plus size={18} className="mr-2" />
                Add First Specification
              </button>
            </div>
          )}

          {formData.specifications.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>{formData.specifications.length}</strong> specification
                {formData.specifications.length !== 1 ? "s" : ""} added
              </p>
            </div>
          )}
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <TipTapEditor
              content={formData.shortDescription}
              onChange={handleShortDescriptionChange}
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description{!product && <span className="text-red-500">*</span>}
            </label>
            <TipTapEditor
              content={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Enter detailed product description with images..."
              {...(!product ? { required: true } : {})}
            />
          </div>
        </div>

        {/* Status Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="canPurchase"
              checked={formData.canPurchase}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Can Purchase</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="showStockOut"
              checked={formData.showStockOut}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Show Stock Out</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="refundable"
              checked={formData.refundable}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Refundable</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Featured</label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
