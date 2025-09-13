"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import axios from "axios"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { Truck, Shield, MapPin, ChevronDown, ChevronUp, Banknote, Clock, X } from "lucide-react"
import { Dialog } from "@headlessui/react"
import { Fragment } from "react"

import config from "../config/config"
const UAE_STATES = ["Abu Dhabi", "Ajman", "Al Ain", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm al-Qaywain"]

const STORES = [
  {
    storeId: "1",
    name: "CROWN EXCEL (Experience Center)",
    address:
      "Admiral Plaza Hotel Building - 37C Street - Shop 5 - Khalid Bin Al Waleed Rd - Bur Dubai - Dubai - United Arab Emirates",
    phone: "+97143540566",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7234567890123!2d55.28877!3d25.2603139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43ba6913e913%3A0x904de2fef7d413ec!2sCROWN%20EXCEL%20(Experience%20Center)!5e0!3m2!1sen!2sae!4v1640995200000!5m2!1sen!2sae",
    coordinates: { lat: 25.2603093, lng: 55.2912192 },
  },
  {
    storeId: "2",
    name: "Crown Excel Head Office",
    address:
      "Al Jahra Building, 2nd floor, office 204, 18th st- Al Raffa - Khalid Bin Al Waleed Rd - Bur Dubai - Dubai - United Arab Emirates",
    phone: "+97143540566",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7234567890123!2d55.28877!3d25.2603139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43ba6913e913%3A0x904de2fef7d413ec!2sCrown%20Excel%20Head%20Office!5e0!3m2!1sen!2sae!4v1640995200001!5m2!1sen!2sae",
    coordinates: { lat: 25.2603093, lng: 55.2912192 },
  },
  {
    storeId: "3",
    name: "CROWN EXCEL (branch 2)",
    address:
      "Shop No. 2 - Building 716 Khalid Bin Al Waleed Rd - opposite Main Entrance of Admiral Plaza Hotel - Bur Dubai - Al Souq Al Kabeer - Dubai - United Arab Emirates",
    phone: "+97143281653",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7456789012345!2d55.2889495!3d25.2601883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43326d8e4cc9%3A0x4d452917e7a19b6!2sCROWN%20EXCEL%20(branch%202)!5e0!3m2!1sen!2sae!4v1640995200002!5m2!1sen!2sae",
    coordinates: { lat: 25.2601835, lng: 55.2915244 },
  },
  {
    storeId: "4",
    name: "GrabAtoZ",
    address:
      "Al Jahra Building, 2nd floor, 18th st - Khalid Bin Al Waleed Rd - Al Raffa - Dubai - United Arab Emirates",
    phone: "+97143395794",
    img: "/placeholder.svg?height=200&width=300",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.8901234567890!2d55.2880084!3d25.2589614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43591325fc3b%3A0x62b01661f2a6cdb7!2sGrabAtoZ!5e0!3m2!1sen!2sae!4v1640995200003!5m2!1sen!2sae",
    coordinates: { lat: 25.2589566, lng: 55.2905833 },
  },
]

const PAYMENT_METHODS = [
  {
    id: "tamara",
    name: "",
    description: "",
    iconUrls: [
      { src: "https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757764221/tamara_card_lh6vev.webp", size: "big" },
    ],
    color: "", // Remove background color
  },
  {
    id: "tabby",
    name: "",
    description: "",
    iconUrls: [
      { src: "https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757764220/tabby_card_lpsmhh.webp", size: "big" },
    ],
    color: "", // Remove background color
  },
  {
    id: "card",
    name: "",
    description: "",
    iconUrls: [
      {
        src: "https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757764222/master_visa_card_q9zo4b.webp",
        size: "big",
      },
    ],
    color: "", // Remove background color
  },
  {
    id: "cod",
    name: "",
    description: "",
    iconUrls: [{ src: "https://res.cloudinary.com/dyfhsu5v6/image/upload/v1757764221/cash_qk1cws.webp", size: "big" }],
    color: "", // Remove background color
  },
]


const bounceKeyframes = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`
if (typeof document !== "undefined" && !document.getElementById("bounce-keyframes")) {
  const style = document.createElement("style")
  style.id = "bounce-keyframes"
  style.innerHTML = bounceKeyframes
  document.head.appendChild(style)
}

const Checkout = () => {
  const navigate = useNavigate()
  const {
    cartItems,
    cartTotal,
    clearCart,
    calculateFinalTotal,
    deliveryOptions,
    setDeliveryOptions,
    selectedDelivery,
    setSelectedDelivery,
    coupon,
    setCoupon,
    couponDiscount,
    setCouponDiscount,
  } = useCart()
  const { user } = useAuth()
  const location = useLocation()

  const [tax, setTax] = useState(null)

  // Fetch delivery options on mount (if not already fetched)
  useEffect(() => {
    if (!deliveryOptions || deliveryOptions.length === 0) {
      const fetchDeliveryOptions = async () => {
        try {
          const { data } = await axios.get(`${config.API_URL}/api/delivery-charges`)
          setDeliveryOptions(data)
          if (!selectedDelivery && data.length > 0) {
            setSelectedDelivery(data[0])
          }
        } catch (err) {
          // handle error
        }
      }
      fetchDeliveryOptions()
    }
    // Fetch tax
    const fetchTax = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/tax`)
        if (data && data.length > 0) setTax(data[0])
      } catch (err) {
        // handle error
      }
    }
    fetchTax()
  }, [])

  useEffect(() => {
    if (!user) {
      const guestInfo = localStorage.getItem("guestInfo")
      if (!guestInfo) {
        navigate("/login")
      }
    }
  }, [user, navigate])

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deliveryType, setDeliveryType] = useState("home")
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressType, setAddressType] = useState("home")
  const [addressDetails, setAddressDetails] = useState({
    address: "",
    zip: "",
    country: "UAE",
    state: "",
    city: "",
    isDefault: false,
  })
  const [pickupDetails, setPickupDetails] = useState({
    phone: "",
    location: "",
    storeId: "",
  })
  const [selectedStore, setSelectedStore] = useState(null)
  const [step, setStep] = useState(1)
  const [showAllItems, setShowAllItems] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })
  const [customerNotes, setCustomerNotes] = useState("")
  const [couponInput, setCouponInput] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  // Delivery charge logic (dynamic)
  let deliveryCharge = 0
  if (selectedDelivery && cartTotal < 500) {
    deliveryCharge = selectedDelivery.charge
  }

  // Tax is included in prices, no separate calculation needed
  const taxAmount = "included"

  const finalTotal = cartTotal + deliveryCharge - couponDiscount

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  // Helper function to get pricing details for an item
  const getItemPricingDetails = (item) => {
    const basePrice = Number(item.originalPrice || item.basePrice) || 0
    const currentPrice = Number(item.price) || 0
    const offerPrice = Number(item.offerPrice) || 0

    // Determine the actual prices to display
    let actualBasePrice = basePrice
    let actualCurrentPrice = currentPrice

    // If we have both base price and offer price, and offer price is valid
    if (basePrice > 0 && offerPrice > 0 && offerPrice < basePrice) {
      // We have a valid discount
      actualBasePrice = basePrice
      actualCurrentPrice = offerPrice
    } else if (basePrice > 0) {
      // No valid offer, use base price
      actualBasePrice = basePrice
      actualCurrentPrice = basePrice
    } else {
      // Fallback to current price
      actualBasePrice = currentPrice
      actualCurrentPrice = currentPrice
    }

    const savings = actualBasePrice > actualCurrentPrice ? actualBasePrice - actualCurrentPrice : 0
    const discountPercentage = savings > 0 ? Math.round((savings / actualBasePrice) * 100) : 0

    return {
      basePrice: actualBasePrice,
      currentPrice: actualCurrentPrice,
      savings,
      discountPercentage,
      hasDiscount: savings > 0,
    }
  }

  // Calculate detailed cart totals
  const calculateCartTotals = () => {
    let totalBasePrice = 0
    let totalOfferPrice = 0
    let totalSavings = 0

    cartItems.forEach((item) => {
      const pricingDetails = getItemPricingDetails(item)
      totalBasePrice += pricingDetails.basePrice * item.quantity
      totalOfferPrice += pricingDetails.currentPrice * item.quantity
      totalSavings += pricingDetails.savings * item.quantity
    })

    return {
      totalBasePrice,
      totalOfferPrice,
      totalSavings,
    }
  }

  const cartTotals = calculateCartTotals()

  // Coupon logic
  const handleApplyCoupon = async () => {
    setCouponLoading(true)
    setCouponError("")
    try {
      const cartApiItems = cartItems.map((item) => ({ product: item._id, qty: item.quantity }))
      const { data } = await axios.post(`${config.API_URL}/api/coupons/validate`, {
        code: couponInput,
        cartItems: cartApiItems,
      })
      setCoupon(data.coupon)
      setCouponDiscount(data.discountAmount)
      setCouponError("")
    } catch (err) {
      setCoupon(null)
      setCouponDiscount(0)
      setCouponError(err.response?.data?.message || "Invalid coupon")
    } finally {
      setCouponLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target
    setCardDetails({
      ...cardDetails,
      [name]: value,
    })
  }

  const validateHomeDelivery = () => {
    if (
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      setError("Please fill in all required fields")
      return false
    }
    return true
  }

  const validatePickup = () => {
    if (!pickupDetails.phone || !pickupDetails.storeId) {
      setError("Please fill in phone number and select a store")
      return false
    }
    return true
  }

  const validatePayment = () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method")
      return false
    }
    // Card details validation removed for N-Genius redirect flow
    return true
  }

  const processPayment = async (orderData) => {
    try {
      switch (selectedPaymentMethod) {
        case "tamara":
          return await processTamaraPayment(orderData)
        case "tabby":
          return await processTabbyPayment(orderData)
        case "card":
          return await processCardPayment(orderData)
        case "cod":
          return await processCODPayment(orderData)
        default:
          throw new Error("Invalid payment method")
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      throw error
    }
  }

  const processTamaraPayment = async (orderData) => {
    const tamaraPayload = {
      total_amount: {
        amount: finalTotal,
        currency: "AED",
      },
      shipping_amount: {
        amount: 0,
        currency: "AED",
      },
      tax_amount: {
        amount: taxAmount,
      },
      order_reference_id: `ORDER_${Date.now()}`,
      order_number: `ORD_${Date.now()}`,
      consumer: {
        first_name: formData.name.split(" ")[0] || "Customer",
        last_name: formData.name.split(" ")[1] || "",
        phone_number: `+971${formData.phone}`,
        email: formData.email,
      },
      shipping_address: {
        first_name: formData.name.split(" ")[0] || "Customer",
        last_name: formData.name.split(" ")[1] || "",
        line1: formData.address,
        city: formData.city,
        country_code: "AE",
      },
      items: cartItems.map((item) => ({
        name: item.name,
        type: "Physical",
        reference_id: item._id,
        sku: item._id,
        quantity: item.quantity,
        unit_price: {
          amount: item.price,
          currency: "AED",
        },
        total_amount: {
          amount: item.price * item.quantity,
          currency: "AED",
        },
      })),
      merchant_url: {
        success: `${window.location.origin}/orders?success=true`,
        failure: `${window.location.origin}/checkout?error=payment_failed`,
        cancel: `${window.location.origin}/checkout`,
        notification: `${window.location.origin}/api/webhooks/tamara`,
      },
    }

    const response = await axios.post(`${config.API_URL}/api/payment/tamara/checkout`, tamaraPayload)
    return response.data
  }

  const processTabbyPayment = async (orderData) => {
    const tabbyPayload = {
      payment: {
        amount: finalTotal.toString(),
        currency: "AED",
        description: `Order payment for ${cartItems.length} items`,
        buyer: {
          phone: `+971${formData.phone}`,
          email: formData.email,
          name: formData.name,
        },
        shipping_address: {
          city: formData.city,
          address: formData.address,
          zip: formData.zipCode,
        },
        order: {
          tax_amount: taxAmount.toString(),
          shipping_amount: deliveryCharge.toString(),
          discount_amount: "0.00",
          updated_at: new Date().toISOString(),
          reference_id: `ORDER_${Date.now()}`,
          items: cartItems.map((item) => ({
            title: item.name,
            description: item.description || item.name,
            quantity: item.quantity,
            unit_price: item.price.toString(),
            discount_amount: "0.00",
            reference_id: item._id,
            image_url: item.image,
            product_url: `${window.location.origin}/product/${item.slug || item._id}`,
            category: item.category || "Electronics",
          })),
        },
        order_history: [],
        meta: {
          order_id: `ORDER_${Date.now()}`,
          customer: formData.email,
        },
      },
      lang: "en",
      merchant_code: process.env.REACT_APP_TABBY_MERCHANT_CODE,
      merchant_urls: {
        success: `${window.location.origin}/orders?success=true`,
        cancel: `${window.location.origin}/checkout`,
        failure: `${window.location.origin}/checkout?error=payment_failed`,
      },
    }

    const response = await axios.post(`${config.API_URL}/api/payment/tabby/checkout`, tabbyPayload)
    return response.data
  }

  const processCardPayment = async (orderData) => {
    // Call backend to create N-Genius order using the correct API URL
    const response = await axios.post(`${config.API_URL}/api/payment/ngenius/card`, {
      amount: finalTotal,
      currencyCode: "AED",
    })

    // Redirect user to N-Genius payment page
    const paymentUrl = response.data?.paymentUrl
    if (paymentUrl) {
      window.location.href = paymentUrl
    } else {
      throw new Error("Payment URL not received from N-Genius")
    }
  }

  const processCODPayment = async (orderData) => {
    const token = localStorage.getItem("token")
    try {
      const axiosConfig = {}
      if (token) {
        axiosConfig.headers = { Authorization: `Bearer ${token}` }
      }
      const response = await axios.post(
        `${config.API_URL}/api/orders`,
        {
          ...orderData,
          paymentMethod: "cod",
          paymentStatus: "pending",
          isPaid: false,
        },
        axiosConfig,
      )
      return { success: true, order: response.data }
    } catch (error) {
      console.error("[Checkout] Order error:", error, error.response?.data)
      throw error
    }
  }

  // New function to create order first, then initiate payment
  const createOrderThenPay = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const guestInfo = localStorage.getItem("guestInfo")
      if (!token && !guestInfo) {
        setError("Please log in or continue as guest to place an order")
        setLoading(false)
        return
      }

      // Map tabby to card for payment processing
      const actualPaymentMethod = selectedPaymentMethod === "tabby" ? "card" : selectedPaymentMethod

      // Prepare order data
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        itemsPrice: cartTotal,
        shippingPrice: deliveryCharge,
        totalPrice: finalTotal,
        deliveryType: deliveryType,
        paymentMethod: actualPaymentMethod, // Use actual payment method (card for tabby)
        paymentStatus: "pending",
        isPaid: false,
        customerNotes: customerNotes.trim() || undefined,
      }

      if (deliveryType === "home") {
        orderData.shippingAddress = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
        if (actualPaymentMethod === "cod") {
          orderData.billingAddress = { ...orderData.shippingAddress }
        }
      } else if (deliveryType === "pickup") {
        const store = STORES.find((s) => s.storeId === pickupDetails.storeId)
        orderData.pickupDetails = {
          phone: pickupDetails.phone,
          location: store?.name || pickupDetails.location,
          storeId: pickupDetails.storeId,
          storeAddress: store?.address,
          storePhone: store?.phone,
        }
      }

      // Create order first
      const axiosConfig = {}
      if (token) {
        axiosConfig.headers = { Authorization: `Bearer ${token}` }
      }
      const orderRes = await axios.post(`${config.API_URL}/api/orders`, orderData, axiosConfig)
      const createdOrder = orderRes.data
      const orderId = createdOrder._id

      if (selectedPaymentMethod === "cod") {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: orderId,
            affiliation: "Graba2z Online Store",
            currency: "AED",
            value: finalTotal,
            tax: 0, // VAT included in prices
            shipping: deliveryCharge,
            coupon: coupon?.code || undefined,
            payment_type: "cash_on_delivery",
            items: cartItems.map((item) => ({
              item_id: item._id,
              item_name: item.name,
              item_category: item.parentCategory?.name || item.category?.name || "Uncategorized",
              item_brand: item.brand?.name || "Unknown",
              price: item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price,
              quantity: item.quantity,
            })),
          },
        })

        console.log("Purchase tracked (COD):", orderId) // For debugging
      }

      // Now initiate payment based on selected method
      if (selectedPaymentMethod === "card" || selectedPaymentMethod === "tabby") {
        // Both card and tabby use N-Genius card payment
        const response = await axios.post(`${config.API_URL}/api/payment/ngenius/card`, {
          amount: finalTotal,
          currencyCode: "AED",
          orderId: orderId,
          redirectUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        })
        const paymentUrl = response.data?.paymentUrl
        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          throw new Error("Payment URL not received from N-Genius")
        }
      } else if (selectedPaymentMethod === "tamara") {
        // Tamara payment logic
        const tamaraPayload = {
          total_amount: {
            amount: finalTotal,
            currency: "AED",
          },
          shipping_amount: {
            amount: 0,
            currency: "AED",
          },
          tax_amount: {
            amount: taxAmount,
          },
          order_reference_id: orderId,
          order_number: `ORD_${orderId}`,
          consumer: {
            first_name: formData.name.split(" ")[0] || "Customer",
            last_name: formData.name.split(" ")[1] || "",
            phone_number: `+971${formData.phone}`,
            email: formData.email,
          },
          shipping_address: {
            first_name: formData.name.split(" ")[0] || "Customer",
            last_name: formData.name.split(" ")[1] || "",
            line1: formData.address,
            city: formData.city,
            country_code: "AE",
          },
          items: cartItems.map((item) => ({
            name: item.name,
            type: "Physical",
            reference_id: item._id,
            sku: item._id,
            quantity: item.quantity,
            unit_price: {
              amount: item.price,
              currency: "AED",
            },
            total_amount: {
              amount: item.price * item.quantity,
              currency: "AED",
            },
          })),
          merchant_url: {
            success: `${window.location.origin}/payment/success`,
            failure: `${window.location.origin}/payment/cancel`,
            cancel: `${window.location.origin}/payment/cancel`,
            notification: `${window.location.origin}/api/webhooks/tamara`,
          },
        }
        const response = await axios.post(`${config.API_URL}/api/payment/tamara/checkout`, tamaraPayload)
        const paymentUrl = response.data?.checkout_url || response.data?.payment_url
        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          throw new Error("Payment URL not received from Tamara")
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to process order/payment. Please try again.")
      setLoading(false)
    }
  }

  const handlePaymentMethodSelect = (paymentMethod) => {
    // Keep the visual selection as-is, but map tabby to card internally for processing
    setSelectedPaymentMethod(paymentMethod)

    // For tracking purposes, use actual payment method (map tabby to card)
    const actualPaymentMethod = paymentMethod === "tabby" ? "card" : paymentMethod

    // Track add payment info event
    if (cartItems.length > 0) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "add_payment_info",
        ecommerce: {
          currency: "AED",
          value: finalTotal,
          payment_type: actualPaymentMethod, // Use the actual payment method for tracking
          items: cartItems.map((item) => ({
            item_id: item._id,
            item_name: item.name,
            item_category: item.parentCategory?.name || item.category?.name || "Uncategorized",
            item_brand: item.brand?.name || "Unknown",
            price: item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price,
            quantity: item.quantity,
          })),
        },
      })

      console.log("Add payment info tracked:", actualPaymentMethod) // For debugging
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      setError("Your cart is empty")
      return
    }

    // Validate based on delivery type
    if (deliveryType === "home" && !validateHomeDelivery()) {
      return
    }

    if (deliveryType === "pickup" && !validatePickup()) {
      return
    }

    // Validate payment method
    if (!validatePayment()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const guestInfo = localStorage.getItem("guestInfo")
      if (!token && !guestInfo) {
        // Neither logged in nor guest
        setError("Please log in or continue as guest to place an order")
        return
      }

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        itemsPrice: cartTotal,
        shippingPrice: deliveryCharge, // Include delivery charge
        totalPrice: finalTotal, // Include delivery charge
        deliveryType: deliveryType,
        paymentMethod: selectedPaymentMethod,
        customerNotes: customerNotes.trim() || undefined, // Only include if not empty
      }

      if (deliveryType === "home") {
        orderData.shippingAddress = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
        // For COD, billing address is same as shipping
        if (selectedPaymentMethod === "cod") {
          orderData.billingAddress = { ...orderData.shippingAddress }
        }
      } else if (deliveryType === "pickup") {
        const store = STORES.find((s) => s.storeId === pickupDetails.storeId)
        orderData.pickupDetails = {
          phone: pickupDetails.phone,
          location: store?.name || pickupDetails.location,
          storeId: pickupDetails.storeId,
          storeAddress: store?.address,
          storePhone: store?.phone,
        }
      }

      // Process payment
      let paymentResult
      if (!token && guestInfo) {
        // Guest order: do not send Authorization header
        paymentResult = await processPayment(orderData)
      } else {
        // Logged-in user: send Authorization header
        paymentResult = await processPayment(orderData)
      }

      if (selectedPaymentMethod === "cod") {
        // For COD, order is created directly
        clearCart()
        if (!token && guestInfo) {
          // Guest: redirect to GuestOrder page
          if (paymentResult && paymentResult.order && paymentResult.order._id) {
            navigate(
              `/guest-order?success=true&orderId=${paymentResult.order._id}&email=${encodeURIComponent(formData.email)}`,
            )
          } else {
            navigate(`/guest-order?success=true&email=${encodeURIComponent(formData.email)}`)
          }
        } else {
          // Logged-in user
          if (paymentResult && paymentResult.order && paymentResult.order._id) {
            navigate(`/orders?success=true&orderId=${paymentResult.order._id}`)
          } else {
            navigate(`/orders?success=true`)
          }
        }
      } else {
        // For other payment methods, redirect to payment gateway
        if (
          paymentResult &&
          (paymentResult.checkout_url ||
            paymentResult.payment_url ||
            paymentResult._links?.payment?.href ||
            paymentResult.paymentUrl)
        ) {
          const paymentUrl =
            paymentResult.checkout_url ||
            paymentResult.payment_url ||
            paymentResult._links?.payment?.href ||
            paymentResult.paymentUrl
          window.location.href = paymentUrl
        } else {
          throw new Error("Payment URL not received")
        }
      }
    } catch (error) {
      console.error("Error processing order:", error)
      setError(error.response?.data?.message || error.message || "Failed to process order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Update handleAddressModalSubmit to only save to localStorage for guests, and always update formData
  const handleAddressModalSubmit = (e) => {
    e.preventDefault()
    const newAddress = {
      address: addressDetails.address,
      city: addressDetails.city,
      state: addressDetails.state,
      zipCode: addressDetails.zip,
    }
    setFormData({
      ...formData,
      ...newAddress,
    })
    // Only save to localStorage if not logged in
    if (!user) {
      localStorage.setItem(
        "savedShippingAddress",
        JSON.stringify({
          ...formData,
          ...newAddress,
        }),
      )
    }
    setShowAddressModal(false)
    // Do NOT advance step here; let main form handle it
  }

  // In handleContinueToSummary, always save address/phone to backend for logged-in users when deliveryType is 'home'
  const handleContinueToSummary = async (e) => {
    e.preventDefault()
    if (deliveryType === "home") {
      if (!formData.email || !formData.phone) {
        setError("Please fill in email and phone number")
        return
      }
      if (!formData.address) {
        setShowAddressModal(true)
        return
      }
      // Save to backend if logged in
      if (user) {
        try {
          const token = localStorage.getItem("token")
          const payload = {
            phone: formData.phone,
            address: {
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: "UAE",
            },
          }
          await axios.put(`${config.API_URL}/api/users/profile`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        } catch (err) {
          // Optionally show error
        }
      }
    } else if (deliveryType === "pickup") {
      if (!pickupDetails.phone || !pickupDetails.storeId) {
        setError("Please fill in phone number and select a store")
        return
      }
      // Optionally, save phone to backend if logged in
      if (user && pickupDetails.phone) {
        try {
          const token = localStorage.getItem("token")
          const payload = { phone: pickupDetails.phone }
          await axios.put(`${config.API_URL}/api/users/profile`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        } catch (err) {
          // Optionally show error
        }
      }
    }
    setError(null)
    setStep(2)
  }

  const handleContinueToPayment = () => {
    setStep(3)
  }

  const handleStoreSelection = (store) => {
    setPickupDetails({
      ...pickupDetails,
      storeId: store.storeId,
      location: store.name,
    })
    setSelectedStore(store)
  }

  const toggleShowAllItems = () => {
    setShowAllItems(!showAllItems)
  }

  useEffect(() => {
    // Load address from localStorage if available
    const savedAddress = localStorage.getItem("savedShippingAddress")
    if (savedAddress) {
      const parsed = JSON.parse(savedAddress)
      setFormData((prev) => ({ ...prev, ...parsed }))
    }
  }, [])

  useEffect(() => {
    if (!user) {
      const guestInfo = localStorage.getItem("guestInfo")
      if (guestInfo) {
        try {
          const parsed = JSON.parse(guestInfo)
          setFormData((prev) => ({
            ...prev,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
          }))
          setPickupDetails((prev) => ({
            ...prev,
            phone: prev.phone || parsed.phone || "",
          }))
        } catch {}
      }
    }
  }, [user])

  // On mount, check for step query param
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const stepParam = Number.parseInt(params.get("step"), 10)
    if ([1, 2, 3].includes(stepParam)) {
      setStep(stepParam)
    }
  }, [location.search])

  // Fetch user profile and pre-fill address/phone if logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const token = localStorage.getItem("token")
          const { data } = await axios.get(`${config.API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          // Fill formData and pickupDetails.phone
          setFormData((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone || "",
            address: data.address?.street || prev.address || "",
            city: data.address?.city || prev.city || "",
            state: data.address?.state || prev.state || "",
            zipCode: data.address?.zipCode || prev.zipCode || "",
          }))
          setPickupDetails((prev) => ({
            ...prev,
            phone: data.phone || prev.phone || "",
          }))
        } catch (err) {
          // ignore error
        }
      }
    }
    fetchUserProfile()
  }, [user])

  // Sync phone number between forms when switching delivery type
  useEffect(() => {
    if (deliveryType === "pickup" && !pickupDetails.phone && formData.phone) {
      setPickupDetails((prev) => ({ ...prev, phone: formData.phone }))
    } else if (deliveryType === "home" && !formData.phone && pickupDetails.phone) {
      setFormData((prev) => ({ ...prev, phone: pickupDetails.phone }))
    }
  }, [deliveryType])

  const bounceStyle = {
    animation: "bounce 1s infinite",
  }

  // Track begin_checkout event
  useEffect(() => {
    if (cartItems.length > 0) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "AED",
          value: finalTotal,
          coupon: coupon?.code || undefined,
          items: cartItems.map((item) => ({
            item_id: item._id,
            item_name: item.name,
            item_category: item.parentCategory?.name || item.category?.name || "Uncategorized",
            item_brand: item.brand?.name || "Unknown",
            price: item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price,
            quantity: item.quantity,
          })),
        },
      })

      console.log("Begin checkout tracked, total:", finalTotal) // For debugging
    }
  }, []) // Run only once when component mounts

  if (cartItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
        <button onClick={() => navigate("/")} className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-8 py-3">
          Continue Shopping
        </button>
      </div>
    )
  }

  // Determine which items to show
  const itemsToShow = showAllItems ? cartItems : cartItems.slice(0, 2)
  const remainingItemsCount = cartItems.length - 2

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 px-6">
        <nav className="text-sm text-gray-500 mb-4">
          Home <span className="mx-2">›</span> <span className="font-semibold text-black">Checkout</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3 p-2 ">
            {/* Always horizontal stepper, even on mobile */}
            <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-8 w-full overflow-x-auto mb-8">
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= 1 ? "bg-lime-500" : "bg-gray-300"}`}
                >
                  01
                </span>
                <span className="font-semibold text-xs sm:text-sm md:text-base">Shipping Details</span>
              </div>
              <div className="h-0.5 w-4 sm:w-8 bg-gray-300" />
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= 2 ? "bg-lime-500" : "bg-gray-300"}`}
                >
                  02
                </span>
                <span
                  className={
                    step >= 2
                      ? "font-semibold text-xs sm:text-sm md:text-base"
                      : "text-gray-400 text-xs sm:text-sm md:text-base"
                  }
                >
                  Summary
                </span>
              </div>
              <div className="h-0.5 w-4 sm:w-8 bg-gray-300" />
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= 3 ? "bg-lime-500" : "bg-gray-300"}`}
                >
                  03
                </span>
                <span
                  className={
                    step >= 3
                      ? "font-semibold text-xs sm:text-sm md:text-base"
                      : "text-gray-400 text-xs sm:text-sm md:text-base"
                  }
                >
                  Payment Method
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            {/* Delivery type selection: Only show on step 1 */}
            {step === 1 && (
              <div className="flex gap-8 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="home"
                    checked={deliveryType === "home"}
                    onChange={() => setDeliveryType("home")}
                    className="accent-lime-500 mr-2"
                  />
                  <span className="font-semibold text-lg">Home Delivery</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={deliveryType === "pickup"}
                    onChange={() => setDeliveryType("pickup")}
                    className="accent-lime-500 mr-2"
                  />
                  <span className="font-semibold text-lg">Pickup From Store</span>
                </label>
              </div>
            )}
            <div className="rounded-2xl">
              {step === 1 && (
                <>
                  {deliveryType === "home" && (
                    <form onSubmit={handleContinueToSummary}>
                      <h3 className="font-bold text-lg mb-4">Contact Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">E-mail *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone number *</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-600">
                              +971
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full border rounded-r-lg px-4 py-3"
                              required
                              maxLength={9}
                              minLength={9}
                              pattern="[0-9]{9}"
                            />
                          </div>
                        </div>
                      </div>

                      {formData.address && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-1">Shipping Address</h4>
                          <div className="text-gray-700">{formData.address}</div>
                          <div className="text-gray-700">
                            {formData.city}, {formData.state} {formData.zipCode}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(true)}
                            className="text-lime-500 text-sm mt-2 mr-4"
                          >
                            Edit Address
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                address: "",
                                city: "",
                                state: "",
                                zipCode: "",
                              }))
                              localStorage.removeItem("savedShippingAddress")
                            }}
                            className="text-red-500 text-sm mt-2"
                          >
                            Remove Address
                          </button>
                        </div>
                      )}

                      <div className="mt-8 flex gap-4 ">
                        <button
                          type="button"
                          onClick={() => navigate("/cart")}
                          className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 bg-red-500 font-semibold lg:py-3 lg:px-6 py-2 px-3 rounded-lg transition duration-300"
                        >
                          Back to Cart
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-lime-500 hover:bg-lime-600 text-white font-semibold lg:py-3 lg:px-6 py-2 px-3 rounded-lg transition duration-300"
                        >
                          <span className="block lg:hidden">Continue Summary</span> {/* Mobile */}
                          <span className="hidden lg:block">Continue to Summary</span> {/* Desktop */}
                        </button>
                      </div>
                    </form>
                  )}

                  {deliveryType === "pickup" && (
                    <form onSubmit={handleContinueToSummary}>
                      <h3 className="font-bold text-lg mb-4">Where do you want to pick up?</h3>

                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Phone number *</label>
                        <div className="flex max-w-md">
                          <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-600">
                            +971
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={pickupDetails.phone}
                            onChange={(e) => setPickupDetails({ ...pickupDetails, phone: e.target.value })}
                            className="w-full border rounded-r-lg px-4 py-3"
                            placeholder="1234567890"
                            required
                            maxLength={9}
                            minLength={9}
                            pattern="[0-9]{9}"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-lime-500" />
                          Select Store *
                        </h4>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Store Selection */}
                          <div className="space-y-4">
                            {STORES.map((store) => (
                              <div
                                key={store.storeId}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                  pickupDetails.storeId === store.storeId
                                    ? "border-lime-500 bg-lime-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="store"
                                    checked={pickupDetails.storeId === store.storeId}
                                    onChange={() => handleStoreSelection(store)}
                                    className="mt-1 accent-lime-500"
                                  />
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{store.name}</div>
                                    <div className="text-sm text-gray-600 mt-1 leading-relaxed">{store.address}</div>
                                    <div className="text-sm text-lime-600 mt-2 font-medium">{store.phone}</div>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>

                          {/* Map Display */}
                          <div className="lg:sticky lg:top-4">
                            {selectedStore ? (
                              <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-3 border-b">
                                  <h5 className="font-semibold text-gray-900">{selectedStore.name}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{selectedStore.phone}</p>
                                </div>
                                <div className="h-64">
                                  <iframe
                                    className="w-full h-full border-0"
                                    src={selectedStore.mapEmbedUrl}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Map of ${selectedStore.name}`}
                                  ></iframe>
                                </div>
                              </div>
                            ) : (
                              <div className="border rounded-lg h-80 flex items-center justify-center bg-gray-50">
                                <div className="text-center text-gray-500">
                                  <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                  <p className="font-medium">Select a store to view location</p>
                                  <p className="text-sm">Choose from the stores on the left</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-8 py-3 disabled:opacity-50"
                        disabled={!pickupDetails.phone || !pickupDetails.storeId}
                      >
                        Continue
                      </button>
                    </form>
                  )}
                </>
              )}

              {step === 2 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Delivery Details</h4>
                    {deliveryType === "home" ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium">Home Delivery</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formData.name && <div>{formData.name}</div>}
                          <div>{formData.email}</div>
                          <div>+971{formData.phone}</div>
                          <div>{formData.address}</div>
                          <div>
                            {formData.city}, {formData.state} {formData.zipCode}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium">Store Pickup</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>Phone: +971{pickupDetails.phone}</div>
                          {selectedStore && (
                            <>
                              <div className="font-medium mt-2">{selectedStore.name}</div>
                              <div>{selectedStore.address}</div>
                              <div>{selectedStore.phone}</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Order Notes (Optional)</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium mb-2">Add a note to your order:</label>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        rows="3"
                        placeholder="Special delivery instructions, gift message, or any other notes..."
                        maxLength="500"
                      />
                      <div className="text-xs text-gray-500 mt-1">{customerNotes.length}/500 characters</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="border border-gray-300 text-gray-700 rounded-lg px-8 py-3"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleContinueToPayment}
                      className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-8 py-3"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="font-bold text-lg mb-6">Payment Method</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method.id}
                        className={` rounded-lg p-4 cursor-pointer transition-all relative ${
                          selectedPaymentMethod === method.id
                            ? "border-lime-500 bg-lime-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                      >
                        {/* Radio button positioned at top-left corner */}
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                          className="absolute top-20 left-16 accent-lime-500 w-4 h-4"
                        />
                        
                        {/* Image container centered */}
                        <div className="flex items-center justify-center pt-2">
                          <div className="flex gap-2 flex-wrap justify-center">
                            {method.iconUrls.map((icon, idx) => (
                              <img
                                key={idx}
                                src={icon.src || "/placeholder.svg"}
                                alt={method.name}
                                className={`w-60 h-48 md:w-60 md:h-36 object-contain rounded-lg transition-all ${
                                  selectedPaymentMethod === method.id
                                    ? " border-lime-500"
                                    : " border-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedPaymentMethod === "cod" && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Banknote className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        You will pay in cash when your order is delivered to your address. Please have the exact amount
                        ready.
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "tamara" && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Buy Now, Pay Later</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Split your purchase into 3 interest-free installments with Tamara.
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "tabby" && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-800">Split into 4 Payments</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Split your purchase into 4 interest-free installments with Tabby.
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "card" && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Card Payment</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Pay securely with your credit or debit card.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="border border-gray-300 text-gray-700 rounded-lg px-8 py-3"
                    >
                      Back
                    </button>
                    <button
                      onClick={
                        selectedPaymentMethod === "card" || selectedPaymentMethod === "tamara" || selectedPaymentMethod === "tabby"
                          ? createOrderThenPay
                          : handleSubmit
                      }
                      disabled={loading || !selectedPaymentMethod}
                      className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-6 py-3 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <img
                            src="/g.png"
                            alt="Loading..."
                            style={{ width: 24, height: 24, animation: "bounce 1s infinite" }}
                          />
                          Processing...
                        </>
                      ) : (
                        `Place Order - ${formatPrice(finalTotal)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2 mt-4">
            <div className="rounded-lg shadow-md shadow-lime-500 p-4 lg:mx-9 sticky top-4">
              <div className="flex items-center mb-6">
                <div className="bg-lime-100 p-2 rounded-full">
                  <Truck className="h-8 w-8 text-lime-600" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-bold text-black">Order Summary</h2>
                  <p className="text-sm text-black">Review your order</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {itemsToShow.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg?height=48&width=48"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-black truncate max-w-32">{item.name}</h3>
                        <p className="text-xs text-black">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                {/* Show/Hide More Items Button */}
                {cartItems.length > 2 && (
                  <button
                    onClick={toggleShowAllItems}
                    className="w-full text-center text-sm text-black  py-2 flex items-center justify-center gap-1 transition-colors"
                  >
                    {showAllItems ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />+{remainingItemsCount} more items
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Detailed Price Breakdown */}
                {cartTotals.totalBasePrice > cartTotals.totalOfferPrice && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sale Price Total</span>
                      <span className="text-gray-500 line-through">{formatPrice(cartTotals.totalBasePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Our Offer Price</span>
                      <span className="text-red-600 font-medium">{formatPrice(cartTotals.totalOfferPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-medium">You Save</span>
                      <span className="font-medium">- {formatPrice(cartTotals.totalSavings)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-black font-medium">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Simple subtotal when no discounts */}
                {cartTotals.totalBasePrice <= cartTotals.totalOfferPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-black">{formatPrice(cartTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-black">{deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT Included</span>
                  <span className="text-gray-600">✓</span>
                </div>

                {/* Coupon Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      placeholder="Enter coupon code"
                      value={coupon ? coupon.code : couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={!!coupon}
                    />
                    {!coupon ? (
                      <button
                        className="bg-lime-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput}
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </button>
                    ) : (
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                        onClick={() => {
                          setCoupon(null)
                          setCouponDiscount(0)
                          setCouponInput("")
                          setCouponError("")
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {couponError && <div className="text-red-500 text-xs">{couponError}</div>}
                  {coupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon: {coupon.code}</span>
                      <span>- {formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span className="text-black">Total Amount</span>
                  <span className="text-black">{formatPrice(finalTotal)}</span>
                </div>

                {/* Free shipping message */}
                {cartTotal < 500 && cartTotal > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Purchase for {formatPrice(500 - cartTotal)} or more to enable free shipping
                    </p>
                  </div>
                )}

                {cartTotal >= 500 && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <p className="text-sm text-green-700 font-medium">You qualify for free shipping!</p>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Shield className="h-7 w-7 text-lime-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-700">
                      Your order is secure and encrypted. We never store your payment information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Modal for Home Delivery */}
        <Dialog as={Fragment} open={showAddressModal} onClose={() => setShowAddressModal(false)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-4 relative">
              {/* Close (X) icon */}
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowAddressModal(false)}
                aria-label="Close"
              >
                <X />
              </button>
              <h3 className="font-bold text-2xl mb-6">Address Details</h3>
              <form onSubmit={handleAddressModalSubmit}>
                <div className="flex gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      value="home"
                      checked={addressType === "home"}
                      onChange={() => setAddressType("home")}
                      className="accent-lime-500"
                    />
                    Home
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      value="office"
                      checked={addressType === "office"}
                      onChange={() => setAddressType("office")}
                      className="accent-lime-500"
                    />
                    Office
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Address *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-3"
                    value={addressDetails.address}
                    onChange={(e) => setAddressDetails({ ...addressDetails, address: e.target.value })}
                    placeholder="Enter address"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Zip Code *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-3"
                    value={addressDetails.zip}
                    onChange={(e) => setAddressDetails({ ...addressDetails, zip: e.target.value })}
                    placeholder="Enter zip code"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Country</label>
                  <select
                    className="w-full border rounded-lg px-4 py-3"
                    value={addressDetails.country}
                    onChange={(e) => setAddressDetails({ ...addressDetails, country: e.target.value })}
                  >
                    <option value="UAE">UAE</option>
                  </select>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium mb-1">State/Region *</label>
                    <select
                      className="w-full border rounded-lg px-4 py-3"
                      value={addressDetails.state}
                      onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                      required
                    >
                      <option value="">Select State</option>
                      {UAE_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium mb-1">City *</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-4 py-3"
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="checkbox"
                    checked={addressDetails.isDefault}
                    onChange={(e) => setAddressDetails({ ...addressDetails, isDefault: e.target.checked })}
                    className="accent-lime-500"
                  />
                  <span>Default Address</span>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="border border-gray-300 text-gray-700 rounded-lg px-8 py-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-8 py-3">
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

export default Checkout
