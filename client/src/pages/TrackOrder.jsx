"use client"

import { useState } from "react"
import { useToast } from "../context/ToastContext"
import { Package, Truck, CheckCircle, Clock, AlertCircle, Search } from "lucide-react"
import axios from "axios"
import { getFullImageUrl } from "../utils/imageUtils"

import config from "../config/config"

const TrackOrder = () => {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    orderId: "",
  })
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setOrderData(null)

    try {
      const { data } = await axios.post(`${config.API_URL}/api/orders/track`, {
        email: formData.email,
        orderId: formData.orderId,
      })

      setOrderData(data)
      showToast("Order found successfully!", "success")
    } catch (error) {
      console.error("Error tracking order:", error)
      const errorMessage = error.response?.data?.message || "Order not found. Please check your details."
      setError(errorMessage)
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "received":
        return <Clock className="text-yellow-500" size={24} />
      case "processing":
      case "in progress":
        return <Package className="text-blue-500" size={24} />
      case "shipped":
      case "ready for shipment":
      case "on the way":
        return <Truck className="text-purple-500" size={24} />
      case "delivered":
        return <CheckCircle className="text-green-500" size={24} />
      case "cancelled":
      case "rejected":
        return <AlertCircle className="text-red-500" size={24} />
      default:
        return <Package className="text-gray-500" size={24} />
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "received":
        return "text-yellow-600 bg-yellow-100"
      case "processing":
      case "in progress":
        return "text-blue-600 bg-blue-100"
      case "shipped":
      case "ready for shipment":
      case "on the way":
        return "text-purple-600 bg-purple-100"
      case "delivered":
        return "text-green-600 bg-green-100"
      case "cancelled":
      case "rejected":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatPrice = (price) => {
    return `${Number(price).toLocaleString()}.00 AED`
  }

  const getTrackingSteps = (status) => {
    const steps = [
      { name: "Order Placed", status: "completed" },
      { name: "Order Confirmed", status: "completed" },
      { name: "Processing", status: "pending" },
      { name: "Shipped", status: "pending" },
      { name: "Delivered", status: "pending" },
    ]

    const currentStatus = status.toLowerCase()

    if (currentStatus.includes("processing") || currentStatus.includes("progress")) {
      steps[2].status = "current"
    } else if (
      currentStatus.includes("shipped") ||
      currentStatus.includes("way") ||
      currentStatus.includes("shipment")
    ) {
      steps[2].status = "completed"
      steps[3].status = "current"
    } else if (currentStatus.includes("delivered")) {
      steps[2].status = "completed"
      steps[3].status = "completed"
      steps[4].status = "completed"
    }

    return steps
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-4xl w-full mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your email and order ID to track your order status</p>
        </div>

        {/* Track Order Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your order ID"
                  required
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-lime-500 text-white px-8 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Search size={20} />
                <span>{loading ? "Tracking..." : "Track Order"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6 overflow-x-auto">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 min-w-0 w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
                  {orderData.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0 w-full">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Order ID:</span> {orderData._id}
                    </p>
                    <p>
                      <span className="font-medium">Order Date:</span>{" "}
                      {new Date(orderData.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Total Amount:</span> {formatPrice(orderData.totalPrice)}
                    </p>
                    {orderData.trackingId && (
                      <p>
                        <span className="font-medium">Tracking ID:</span> {orderData.trackingId}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    {orderData.shippingAddress ? (
                      <>
                        <p>{orderData.shippingAddress.name}</p>
                        <p>{orderData.shippingAddress.address}</p>
                        <p>
                          {orderData.shippingAddress.city}, {orderData.shippingAddress.postalCode}
                        </p>
                        <p>{orderData.shippingAddress.country}</p>
                        <p>Phone: {orderData.shippingAddress.phone}</p>
                      </>
                    ) : (
                      <p>No shipping address available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Progress */}
            <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto relative">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h2>

              <div className="flex items-center justify-between mb-8 min-w-0 w-full">
                {getTrackingSteps(orderData.status).map((step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        step.status === "completed"
                          ? "bg-green-500 text-white"
                          : step.status === "current"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle size={20} />
                      ) : step.status === "current" ? (
                        <Clock size={20} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current"></div>
                      )}
                    </div>
                    <span
                      className={`text-xs text-center ${
                        step.status === "completed" || step.status === "current"
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                    {index < getTrackingSteps(orderData.status).length - 1 && (
                      <div
                        className={`hidden md:block absolute h-0.5 w-full top-5 left-1/2 transform -translate-y-1/2 ${
                          step.status === "completed" ? "bg-green-500" : "bg-gray-200"
                        }`}
                        style={{ zIndex: -1 }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(orderData.status)}
                  <span className="ml-2 text-lg font-semibold text-gray-900">Current Status: {orderData.status}</span>
                </div>
                <p className="text-gray-600 text-sm">
                  {orderData.status.toLowerCase().includes("delivered")
                    ? "Your order has been delivered successfully!"
                    : orderData.status.toLowerCase().includes("shipped") ||
                        orderData.status.toLowerCase().includes("way")
                      ? "Your order is on the way to your address."
                      : orderData.status.toLowerCase().includes("processing")
                        ? "Your order is being processed and will be shipped soon."
                        : "Your order has been received and is being prepared."}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6 min-w-0 w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {orderData.orderItems.filter(item => !item.isProtection).map((item, index) => {
                  console.log('Order item:', item);
                  const price = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 0;
                  const total = price * qty;
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg min-w-0 w-full">
                      <div className="relative">
                        <img
                          src={getFullImageUrl(item.image) || "/placeholder.svg?height=80&width=80"}
                          alt={item.name}
                          className="w-20 h-20 object-contain rounded"
                        />
                        <span className="absolute bottom-1 right-1 bg-lime-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{total > 0 ? formatPrice(total) : "N/A"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {orderData.orderItems.some(item => item.isProtection) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Buyer Protection Plans
                  </h3>
                  <div className="space-y-3">
                    {orderData.orderItems.filter(item => item.isProtection).map((item, index) => {
                      const price = Number(item.price) || 0;
                      return (
                        <div key={index} className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <svg className="w-8 h-8 mr-3 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatPrice(price)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">{formatPrice(orderData.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackOrder
