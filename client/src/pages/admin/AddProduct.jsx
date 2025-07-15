"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import ImageUpload from "../../components/ImageUpload"
import TipTapEditor from "../../components/TipTapEditor"
import { ArrowLeft, Plus, X } from "lucide-react"
import axios from "axios"

import config from "../../config/config"
const AddProduct = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [taxes, setTaxes] = useState([])
  const [units, setUnits] = useState([])
  const [warranties, setWarranties] = useState([])
  const [volumes, setVolumes] = useState([])
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    slug: "",
    category: "",
    subCategory: "",
    barcode: "",
    buyingPrice: "",
    price: "",
    offerPrice: "",
    discount: "",
    image: "",
    galleryImages: [],
    tax: "",
    brand: "",
    isActive: true,
    canPurchase: true,
    showStockOut: true,
    refundable: true,
    maxPurchaseQty: "",
    lowStockWarning: "",
    unit: "",
    warranty: "",
    volume: "",
    selectedColors: [],
    selectedSizes: [],
    weight: "",
    tags: "",
    shortDescription: "",
    description: "",
    stockStatus: "",
    specifications: [],
  })
  const [basePrice, setBasePrice] = useState("")
  const [taxAmount, setTaxAmount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category)
    } else {
      setSubCategories([])
      setFormData((prev) => ({ ...prev, subCategory: "" }))
    }
  }, [formData.category])

  useEffect(() => {
    if (formData.tax && taxes.length > 0) {
      const selectedTax = taxes.find(t => t._id === formData.tax)
      setTaxRate(selectedTax ? Number(selectedTax.rate) : 0)
    } else {
      setTaxRate(0)
    }
  }, [formData.tax, taxes])

  useEffect(() => {
    const base = Number(basePrice) || 0
    let offer = Number(formData.offerPrice) || 0
    let discount = Number(formData.discount) || 0
    // If both base and offer price are provided, calculate discount
    if (base > 0 && offer > 0) {
      discount = Math.max(0, Math.round(((base - offer) / base) * 100))
    }
    // If discount is set and offer price is not manually entered, calculate offer price
    if (discount > 0 && (!formData.offerPrice || formData.offerPrice === "0")) {
      offer = base - (base * discount / 100)
    }
    // Tax calculation base is offer if present, else base
    const priceBase = offer > 0 ? offer : base
    const tax = taxRate
    const taxAmt = priceBase * (tax / 100)
    setTaxAmount(taxAmt)
    setFormData(prev => ({ ...prev, offerPrice: offer.toFixed(2), discount: discount, price: (priceBase + taxAmt).toFixed(2) }))
  }, [basePrice, taxRate, formData.offerPrice])

  const fetchAllData = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        showToast("Please login as admin first", "error")
        navigate("/grabiansadmin/login")
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      // Fetch all required data with correct endpoints
      const fetchPromises = []

      // Categories
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/categories`, { headers }).catch((err) => {
          console.log("Categories API error:", err)
          return { data: [] }
        }),
      )

      // Brands
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/brands`, { headers }).catch((err) => {
          console.log("Brands API error:", err)
          return { data: [] }
        }),
      )

      // Taxes
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/taxes`, { headers }).catch((err) => {
          console.log("Tax API error:", err)
          return { data: [] }
        }),
      )

      // Units
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/units`, { headers }).catch((err) => {
          console.log("Units API error:", err)
          return { data: [] }
        }),
      )

      // Warranties
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/warranty`, { headers }).catch((err) => {
          console.log("Warranty API error:", err)
          return { data: [] }
        }),
      )

      // Volumes
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/volumes`, { headers }).catch((err) => {
          console.log("Volumes API error:", err)
          return { data: [] }
        }),
      )

      // Colors
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/colors`, { headers }).catch((err) => {
          console.log("Colors API error:", err)
          return { data: [] }
        }),
      )

      // Sizes
      fetchPromises.push(
        axios.get(`${config.API_URL}/api/sizes`, { headers }).catch((err) => {
          console.log("Sizes API error:", err)
          return { data: [] }
        }),
      )

      const [categoriesRes, brandsRes, taxesRes, unitsRes, warrantiesRes, volumesRes, colorsRes, sizesRes] =
        await Promise.all(fetchPromises)

      console.log("API Responses:", {
        categories: categoriesRes.data,
        brands: brandsRes.data,
        taxes: taxesRes.data,
        units: unitsRes.data,
        warranties: warrantiesRes.data,
        colors: colorsRes.data,
        sizes: sizesRes.data,
      })

      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data.filter((cat) => cat.isActive !== false) : [])
      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data.filter((brand) => brand.isActive !== false) : [])
      setTaxes(Array.isArray(taxesRes.data) ? taxesRes.data.filter((tax) => tax.isActive !== false) : [])
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data.filter((unit) => unit.isActive !== false) : [])
      setWarranties(
        Array.isArray(warrantiesRes.data) ? warrantiesRes.data.filter((warranty) => warranty.isActive !== false) : [],
      )
      setVolumes(Array.isArray(volumesRes.data) ? volumesRes.data.filter((volume) => volume.isActive !== false) : [])
      setColors(Array.isArray(colorsRes.data) ? colorsRes.data.filter((color) => color.isActive !== false) : [])
      setSizes(Array.isArray(sizesRes.data) ? sizesRes.data.filter((size) => size.isActive !== false) : [])
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Failed to load some form data. Please check if all services are running.", "error")
    }
  }

  const fetchSubCategories = async (categoryId) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const { data } = await axios.get(`${config.API_URL}/api/subcategories/category/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSubCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      setSubCategories([])
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Auto-generate slug from name
    if (name === "name" && value) {
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

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }))
  }

  const handleGalleryImageUpload = (imageUrl, index) => {
    setFormData((prev) => {
      const newGalleryImages = [...prev.galleryImages]
      newGalleryImages[index] = imageUrl
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

  // Handle multi-select for colors
  const handleColorChange = (colorId) => {
    setFormData((prev) => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(colorId)
        ? prev.selectedColors.filter((id) => id !== colorId)
        : [...prev.selectedColors, colorId],
    }))
  }

  // Handle multi-select for sizes
  const handleSizeChange = (sizeId) => {
    setFormData((prev) => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(sizeId)
        ? prev.selectedSizes.filter((id) => id !== sizeId)
        : [...prev.selectedSizes, sizeId],
    }))
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
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        showToast("Please login as admin first", "error")
        navigate("/grabiansadmin/login")
        return
      }

      const productData = {
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug,
        parentCategory: formData.category, // main category
        category: formData.subCategory,    // subcategory
        subCategory: formData.subCategory || null, // for backward compatibility
        barcode: formData.barcode,
        buyingPrice: Number.parseFloat(formData.buyingPrice) || 0,
        price: Number.parseFloat(formData.price) || 0,
        offerPrice: Number.parseFloat(formData.offerPrice) || 0,
        discount: Number.parseFloat(formData.discount) || 0,
        image: formData.image,
        galleryImages: formData.galleryImages.filter((img) => img !== ""),
        tax: formData.tax,
        brand: formData.brand,
        isActive: formData.isActive,
        canPurchase: formData.canPurchase,
        showStockOut: formData.showStockOut,
        refundable: formData.refundable,
        maxPurchaseQty: Number.parseInt(formData.maxPurchaseQty) || 1,
        lowStockWarning: Number.parseInt(formData.lowStockWarning) || 5,
        unit: formData.unit,
        warranty: formData.warranty,
        volume: formData.volume,
        colors: formData.selectedColors,
        sizes: formData.selectedSizes,
        weight: Number.parseFloat(formData.weight) || 0,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        shortDescription: formData.shortDescription,
        description: formData.description,
        stockStatus: formData.stockStatus,
        specifications: formData.specifications.filter((spec) => spec.key && spec.value),
      }

      await axios.post(`${config.API_URL}/api/products`, productData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      showToast("Product added successfully!", "success")
      navigate("/admin/products")
    } catch (error) {
      console.error("Error adding product:", error)
      showToast(error.response?.data?.message || "Failed to add product", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button
                onClick={() => navigate("/admin/products")}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Products
              </button>
              <span>/</span>
              <span className="text-gray-900">Add Product</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          </div>

          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Data Status:</h3>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>Categories: {categories.length}</div>
              <div>Sub Categories: {subCategories.length}</div>
              <div>Brands: {brands.length}</div>
              <div>Colors: {colors.length}</div>
              <div>Sizes: {sizes.length}</div>
              <div>Taxes: {taxes.length}</div>
              <div>Units: {units.length}</div>
              <div>Warranties: {warranties.length}</div>
              <div>Volumes: {volumes.length}</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (Custom Link) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="product-custom-url"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be used in the product URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.category}
                  >
                    <option value="">Select a Sub Category</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                  {!formData.category && <p className="text-xs text-gray-500 mt-1">Please select a category first</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Status <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="stockStatus"
                    value={formData.stockStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Any One</option>
                    <option value="Available Product">Available Product</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="PreOrder">PreOrder</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buying Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="buyingPrice"
                    value={formData.buyingPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Price
                  </label>
                  <input
                    type="number"
                    name="offerPrice"
                    value={formData.offerPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    readOnly={basePrice && formData.offerPrice}
                  />
                </div>
              </div>
              {/* Tax-inclusive price summary */}
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-4">
                <div className="flex flex-wrap gap-4 items-center text-sm">
                  <div>Base Price: <b>{basePrice || 0} AED</b></div>
                  <div>Offer Price: <b>{formData.offerPrice || 0} AED</b></div>
                  <div>Discount: <b>{formData.discount || 0}%</b></div>
                  <div>Tax: <b>{taxRate}%</b></div>
                  <div>Tax Amount: <b>{taxAmount.toFixed(2)} AED</b></div>
                  <div className="text-green-700 font-bold">Final Price (Saved): {formData.price} AED <span className="text-xs text-red-500 ml-2">Inclusive tax</span></div>
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h2>

              {/* Main Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImage={formData.image}
                  label="Upload Main Image"
                />
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

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax
                    {formData.tax && <span className="ml-2 text-xs text-red-500">Inclusive tax</span>}
                  </label>
                  <select
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Tax</option>
                    {taxes.map((tax) => (
                      <option key={tax._id} value={tax._id}>
                        {tax.name} ({tax.rate}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Unit</option>
                    {units.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
                  <select
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Warranty</option>
                    {warranties.map((warranty) => (
                      <option key={warranty._id} value={warranty._id}>
                        {warranty.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                  <select
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Volume</option>
                    {volumes.map((volume) => (
                      <option key={volume._id} value={volume._id}>
                        {volume.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Colors (Multi-select) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Colors (Select Multiple)</h2>
              {colors.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {colors.map((color) => (
                    <div key={color._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`color-${color._id}`}
                        checked={formData.selectedColors.includes(color._id)}
                        onChange={() => handleColorChange(color._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`color-${color._id}`} className="text-sm text-gray-700 flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                          style={{ backgroundColor: color.hexCode || color.code || "#ccc" }}
                        ></div>
                        {color.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">No colors available. Please add colors first.</div>
              )}
              {formData.selectedColors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Selected: {formData.selectedColors.length} color(s)</p>
                </div>
              )}
            </div>

            {/* Sizes (Multi-select) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Sizes (Select Multiple)</h2>
              {sizes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {sizes.map((size) => (
                    <div key={size._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`size-${size._id}`}
                        checked={formData.selectedSizes.includes(size._id)}
                        onChange={() => handleSizeChange(size._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`size-${size._id}`} className="text-sm text-gray-700">
                        {size.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">No sizes available. Please add sizes first.</div>
              )}
              {formData.selectedSizes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Selected: {formData.selectedSizes.length} size(s)</p>
                </div>
              )}
            </div>

            {/* Product Specifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Product Specifications</h2>
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
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Specification #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="text-red-600 hover:text-red-800 p-1"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">No specifications added yet</p>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="flex items-center mx-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Specification
                  </button>
                </div>
              )}

              {formData.specifications.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    {formData.specifications.length} specification{formData.specifications.length !== 1 ? "s" : ""}{" "}
                    added
                  </p>
                </div>
              )}
            </div>

            {/* Status Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Status Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Status:</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="true"
                        checked={formData.isActive === true}
                        onChange={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Active</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="false"
                        checked={formData.isActive === false}
                        onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Inactive</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Can Purchasable:</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="canPurchase"
                        value="true"
                        checked={formData.canPurchase === true}
                        onChange={() => setFormData((prev) => ({ ...prev, canPurchase: true }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Yes</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="canPurchase"
                        value="false"
                        checked={formData.canPurchase === false}
                        onChange={() => setFormData((prev) => ({ ...prev, canPurchase: false }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">No</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Show Stock Out:</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="showStockOut"
                        value="true"
                        checked={formData.showStockOut === true}
                        onChange={() => setFormData((prev) => ({ ...prev, showStockOut: true }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Enable</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="showStockOut"
                        value="false"
                        checked={formData.showStockOut === false}
                        onChange={() => setFormData((prev) => ({ ...prev, showStockOut: false }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Disable</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Refundable:</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="refundable"
                        value="true"
                        checked={formData.refundable === true}
                        onChange={() => setFormData((prev) => ({ ...prev, refundable: true }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">Yes</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="refundable"
                        value="false"
                        checked={formData.refundable === false}
                        onChange={() => setFormData((prev) => ({ ...prev, refundable: false }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700">No</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock & Purchase Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Stock & Purchase Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Purchase Quantity</label>
                  <input
                    type="number"
                    name="maxPurchaseQty"
                    value={formData.maxPurchaseQty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Quantity Warning</label>
                  <input
                    type="number"
                    name="lowStockWarning"
                    value={formData.lowStockWarning}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Tags</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>

            {/* Descriptions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Descriptions</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                <TipTapEditor
                  content={formData.shortDescription}
                  onChange={handleShortDescriptionChange}
                  placeholder="Enter brief product description with formatting..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <TipTapEditor
                  content={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Enter detailed product description with images and formatting..."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pb-8">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
