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
    price: "",
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

  const units = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram" },
    { value: "gram", label: "Gram" },
    { value: "liter", label: "Liter" },
    { value: "meter", label: "Meter" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
  ]

  const taxOptions = [
    { value: "0", label: "No Tax" },
    { value: "5", label: "5% VAT" },
    { value: "15", label: "15% VAT" },
    { value: "18", label: "18% GST" },
  ]

  useEffect(() => {
    fetchParentCategories()
    fetchBrands()
    if (product) {
      const resolvedCategory =
        (typeof product.category === "object" && product.category ? product.category._id : product.category) ||
        (typeof product.subCategory === "object" && product.subCategory ? product.subCategory._id : product.subCategory) ||
        "";
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        slug: product.slug || "",
        barcode: product.barcode || "",
        brand: typeof product.brand === "object" && product.brand ? product.brand._id : product.brand || "",
        parentCategory: typeof product.parentCategory === "object" && product.parentCategory ? product.parentCategory._id : product.parentCategory || "",
        category: resolvedCategory,
        subCategory: typeof product.subCategory === "object" && product.subCategory ? product.subCategory._id : product.subCategory || "",
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
        tax: product.tax || "0",
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
  }, [product])

  useEffect(() => {
    if (
      product &&
      subCategories.length > 0 &&
      !formData.category // Only set if not already set
    ) {
      const resolvedCategory =
        (typeof product.category === "object" && product.category ? product.category._id : product.category) ||
        (typeof product.subCategory === "object" && product.subCategory ? product.subCategory._id : product.subCategory) ||
        "";
      setFormData((prev) => ({
        ...prev,
        category: resolvedCategory,
      }));
    }
  }, [subCategories, product]);

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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Auto-generate slug from name
    if (name === "name" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }))
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
    try {
      let taxValue = formData.tax
      if (!taxValue || taxValue === '0' || taxValue === 0) {
        taxValue = undefined
      }
      const productData = {
        ...formData,
        parentCategory: formData.parentCategory,
        category: formData.category,
        subCategory: formData.category || null,
        buyingPrice: Number.parseFloat(formData.buyingPrice) || 0,
        price: Number.parseFloat(formData.price) || 0,
        offerPrice: Number.parseFloat(formData.offerPrice) || 0,
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
  console.log("Selected subcategory value:", formData.category);
  console.log("Fetched subcategories:", subCategories.map(s => ({ id: s._id, name: s.name })));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">{product ? "Edit Product" : "Add New Product"}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory <span className="text-red-500">*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.parentCategory || subCategories.length === 0}
              required
            >
              <option value="">{formData.parentCategory ? "Select a Subcategory" : "Select a main category first"}</option>
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
              {...(!product ? { required: true } : {})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price</label>
            <input
              type="number"
              name="offerPrice"
              value={formData.offerPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              max="100"
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
            <select
              name="tax"
              value={formData.tax}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {taxOptions.map((tax) => (
                <option key={tax.value} value={tax.value}>
                  {tax.label}
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
