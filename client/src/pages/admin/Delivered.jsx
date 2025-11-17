"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Eye, RefreshCw, CheckCircle2, Star, ChevronDown, X, Printer, Save, Mail, Package } from "lucide-react"
import { useToast } from "../../context/ToastContext"

import config from "../../config/config"
import { getInvoiceBreakdown } from "../../utils/invoiceBreakdown"

// Invoice Component for Printing - Using forwardRef
const InvoiceComponent = forwardRef(({ order }, ref) => {
  const formatPrice = (price) => {
    return `AED ${price?.toLocaleString() || 0}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const { subtotal, shipping, tax, total, manualDiscount, couponDiscount, couponCode } =
    getInvoiceBreakdown(order)

  const currentDate = new Date().toLocaleDateString()
  const orderDate = new Date(order.createdAt).toLocaleDateString()

  return (
    <div ref={ref} className="bg-white pl-8 pr-8 pb-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className=" text-black rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0" />
        {/* Top row: two columns with logos */}
        <div className="relative z-10 flex justify-between items-start w-full">
          {/* Left Logo */}
          <div className="flex-shrink-0">
            <img
              src="/BLACK.png"
              alt="Right Logo"
              className="w-50 h-20 object-contain"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.nextSibling && (e.target.nextSibling.style.display = "flex")
              }}
            />
            <p className="ml-7"> TRN: 100349772200003</p>
          </div>

          {/* Right Logo */}
          <div className="flex-shrink-0">
            <img
              src="/admin-logo.svg"
              alt="Left Logo"
              className="w-40 h-20 object-contain"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.nextSibling && (e.target.nextSibling.style.display = "flex")
              }}
            />
            A Brand By Crown Excel
          </div>
        </div>

        <div className="flex justify-between items-start gap-6 ml-2">
          <div className="w-1/2 p-5 ">
            <h2 className="text-2xl font-bold mb-1">CONTACT DETAILS</h2>
            <p className="text-black text-sm italic mb-2">
              <strong>We Are Here For You</strong>
            </p>
            <div className="text-sm text-black space-y-1">
              <p>✉️ Email: orders@grabatoz.com</p>
              <p>🌐 Website: www.grabatoz.com</p>
              <p>📞 Phone: +971 50 860 4360</p>
            </div>
          </div>

          <div className="w-1/2 text-end p-5   rounded-xl backdrop-blur-sm max-w-xs ml-auto">
            <h2 className="text-2xl font-bold mb-1">VAT INVOICE</h2>
            <div className="text-lg font-semibold mb-1">Order: #{order._id.slice(-6)}</div>
            <div className="text-sm">📅 Date: {orderDate}</div>
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="bg-white  border-l-4 pl-2 border-lime-500">
        <h3 className="text-2xl font-bold text-lime-800 mb-2 uppercase tracking-wide">📋 Order Summary</h3>

        {/* Addresses */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-2">
          {/* Shipping Address */}
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">📦 Shipping Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {order.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {order.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {order.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {order.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {order.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {order.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {order.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">💳 Billing Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {order.billingAddress?.name || order.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {order.billingAddress?.email || order.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {order.billingAddress?.phone || order.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {order.billingAddress?.address || order.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {order.billingAddress?.city || order.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {order.billingAddress?.state || order.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {order.billingAddress?.zipCode || order.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">🛍️ Order Items</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-lime-300">
              <thead>
                <tr className="bg-lime-100">
                  <th className="border border-lime-300 px-3 py-2 text-left text-sm font-bold">Product</th>
                  <th className="border border-lime-300 px-3 py-2 text-center text-sm font-bold">Qty</th>
                  <th className="border border-lime-300 px-3 py-2 text-right text-sm font-bold">Price</th>
                  <th className="border border-lime-300 px-3 py-2 text-right text-sm font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item, index) => (
                  <tr key={index} className="hover:bg-lime-50">
                    <td className="border border-lime-300 px-3 py-2 text-sm">{item.name}</td>
                    <td className="border border-lime-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                    <td className="border border-lime-300 px-3 py-2 text-right text-sm">{formatPrice(item.price)}</td>
                    <td className="border border-lime-300 px-3 py-2 text-right text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-lime-50 border-2 border-lime-200 rounded-lg p-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">💰 Total Amount</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT:</span>
              <span className="text-gray-900">{formatPrice(tax)}</span>
            </div>
            {manualDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="text-green-600">-{formatPrice(manualDiscount)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Coupon{couponCode ? ` (${couponCode})` : ""}:</span>
                <span className="text-green-600">-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="border-t-2 border-lime-300 pt-2 flex justify-between">
              <span className="text-lg font-bold text-lime-800">Total:</span>
              <span className="text-lg font-bold text-lime-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
const Delivered = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState({})
  const [showPaymentDropdown, setShowPaymentDropdown] = useState({})
  
  // Notes and tracking states
  const [orderNotes, setOrderNotes] = useState("")
  const [trackingId, setTrackingId] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  
  // Print ref
  const printComponentRef = useRef(null)
  
  const { showToast } = useToast()

  const orderStatusOptions = [
    "New",
    "Processing",
    "Confirmed",
    "Ready for Shipment",
    "Shipped",
    "On the Way",
    "Out for Delivery",
    "Delivered",
    "On Hold",
    "Cancelled",
    "Returned",
    "Deleted",
  ]
  
  const paymentStatusOptions = ["Paid", "Unpaid"]

  const formatPrice = (price) => {
    return `AED ${price?.toLocaleString() || 0}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Invoice-${selectedOrder?._id.slice(-6)}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  })

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("Authentication token not found. Please login again.")
        return
      }

      console.log("[DEBUG] Fetching all orders...")
      const { data } = await axios.get(`${config.API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[DEBUG] Total orders received:", data.length)
      console.log("[DEBUG] All order statuses:", data.map((order) => ({ id: order._id.slice(-6), status: order.status })))

      // Filter for delivered orders with case-insensitive comparison
      const deliveredOrders = data.filter((order) => {
        const status = order.status?.toLowerCase().trim()
        return status === "delivered"
      })

      console.log("[DEBUG] Filtered delivered orders:", deliveredOrders.length)
      console.log("[DEBUG] Delivered orders IDs:", deliveredOrders.map((order) => order._id.slice(-6)))

      setOrders(deliveredOrders)
      setError(null) // Clear any previous errors
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again later.")
      setLoading(false)
    }
  }

  const handleSendFollowUp = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.post(
        `${config.API_URL}/api/admin/orders/${orderId}/followup`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      showToast("Follow-up email sent successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error sending follow-up:", error)
      showToast("Failed to send follow-up email", "error")
      setProcessingAction(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderNotes(order.notes || "")
    setTrackingId(order.trackingId || "")
    setEstimatedDelivery(order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : "")
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
    setOrderNotes("")
    setTrackingId("")
    setEstimatedDelivery("")
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData = { status }

      // If status is "Delivered", automatically set payment as paid
      if (status === "Delivered") {
        updateData.isPaid = true
        updateData.paidAt = new Date().toISOString()
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${orderId}/status`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrder = { ...orders.find((order) => order._id === orderId), ...updateData }
      setOrders(orders.map((order) => (order._id === orderId ? updatedOrder : order)))

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updateData })
      }

      setShowStatusDropdown({})
      setError(null)
      setProcessingAction(false)
      showToast("Order status updated successfully!", "success")
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update order status: " + (error.response?.data?.message || error.message))
      showToast("Failed to update order status", "error")
      setProcessingAction(false)
    }
  }

  const handleUpdatePaymentStatus = async (orderId, isPaid) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData = {
        isPaid: isPaid,
        ...(isPaid && { paidAt: new Date().toISOString() }),
        ...(!isPaid && { paidAt: null }),
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${orderId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrderData = {
        ...updateData,
        paidAt: isPaid ? new Date() : null,
      }

      setOrders(orders.map((order) => (order._id === orderId ? { ...order, ...updatedOrderData } : order)))

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updatedOrderData })
      }

      setShowPaymentDropdown({})
      setError(null)
      setProcessingAction(false)
      showToast("Payment status updated successfully!", "success")
    } catch (error) {
      console.error("Error updating payment status:", error)
      setError("Failed to update payment status: " + (error.response?.data?.message || error.message))
      showToast("Failed to update payment status", "error")
      setProcessingAction(false)
    }
  }

  const handleSaveOrderDetails = async () => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData = {
        notes: orderNotes,
        trackingId: trackingId,
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery).toISOString() }),
      }

      await axios.put(`${config.API_URL}/api/admin/orders/${selectedOrder._id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const updatedOrder = {
        ...selectedOrder,
        notes: orderNotes,
        trackingId: trackingId,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      }

      setSelectedOrder(updatedOrder)
      setOrders(orders.map((order) => (order._id === selectedOrder._id ? updatedOrder : order)))

      setError(null)
      setProcessingAction(false)
      showToast("Order details updated successfully!", "success")
    } catch (error) {
      console.error("Error updating order details:", error)
      setError("Failed to update order details: " + (error.response?.data?.message || error.message))
      showToast("Failed to update order details", "error")
      setProcessingAction(false)
    }
  }

  const handleSendNotification = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.post(
        `${config.API_URL}/api/admin/orders/${orderId}/notify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      showToast("Notification email sent successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error sending notification:", error)
      setError("Failed to send notification: " + (error.response?.data?.message || error.message))
      showToast("Failed to send notification", "error")
      setProcessingAction(false)
    }
  }

  const toggleStatusDropdown = (orderId) => {
    setShowStatusDropdown((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
    setShowPaymentDropdown({})
  }

  const togglePaymentDropdown = (orderId) => {
    setShowPaymentDropdown((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
    setShowStatusDropdown({})
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown({})
      setShowPaymentDropdown({})
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  // Also update the filteredOrders logic to handle potential null values:
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase()
    const orderId = order._id || ""
    const customerName = order.shippingAddress?.name || ""
    const customerEmail = order.shippingAddress?.email || ""

    return (
      orderId.includes(searchTerm) ||
      customerName.toLowerCase().includes(searchLower) ||
      customerEmail.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivered Orders</h1>
            <p className="text-gray-600 mt-1">Successfully delivered orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        <div className="mb-6 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-96 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Delivered: <span className="font-semibold text-green-600">{filteredOrders.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">#{order._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.shippingAddress?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{order.shippingAddress?.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.updatedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStatusDropdown(order._id)
                            }}
                            className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity bg-green-100 text-green-800"
                          >
                            {order.status || "Delivered"}
                            <ChevronDown size={12} className="ml-1" />
                          </button>

                          {showStatusDropdown[order._id] && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                              {orderStatusOptions.map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateStatus(order._id, status)
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  disabled={processingAction}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePaymentDropdown(order._id)
                            }}
                            className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-colors
                            ${order.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {order.isPaid ? "Paid" : "Unpaid"}
                            <ChevronDown size={12} className="ml-1" />
                          </button>

                          {showPaymentDropdown[order._id] && (
                            <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                              {paymentStatusOptions.map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdatePaymentStatus(order._id, status === "Paid")
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  disabled={processingAction}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.orderItems.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleSendFollowUp(order._id)}
                          className="text-purple-600 hover:text-purple-900"
                          disabled={processingAction}
                          title="Send Follow-up"
                        >
                          <Star size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-gray-500 text-lg mt-4">No delivered orders</div>
            <p className="text-gray-400 mt-2">Delivered orders will appear here</p>
          </div>
        )}
      </div>

      {/* Comprehensive Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span>Delivered Orders</span>
                  <span>/</span>
                  <span className="text-green-600">View</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order ID: {selectedOrder._id.slice(-6)}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-900">{selectedOrder.status || "Delivered"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Type</p>
                      <p className="font-semibold text-blue-900">
                        {selectedOrder.isPaid ? "Paid" : selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold text-purple-900">
                        {selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Delivered On</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {new Date(selectedOrder.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedOrder.status || "Delivered"}
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={processingAction}
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedOrder.status === "Processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedOrder.status === "Confirmed"
                          ? "bg-lime-100 text-lime-800"
                          : selectedOrder.status === "Shipped"
                            ? "bg-purple-100 text-purple-800"
                            : selectedOrder.status === "Out for Delivery"
                              ? "bg-indigo-100 text-indigo-800"
                              : selectedOrder.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : selectedOrder.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedOrder.status || "Delivered"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Update Payment Status</h4>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedOrder.isPaid ? "Paid" : "Unpaid"}
                      onChange={(e) => handleUpdatePaymentStatus(selectedOrder._id, e.target.value === "Paid")}
                      className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={processingAction}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedOrder.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <CheckCircle2 size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                          {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-500">Total: {formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-4">No items found</p>}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.itemsPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Charges:</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.shippingPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (VAT):</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.taxPrice || 0)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">-{formatPrice(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(selectedOrder.totalPrice || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">Name:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.name || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Email:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.email || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Phone:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.phone || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">User ID:</span>{" "}
                      <span className="text-gray-900">
                        {typeof selectedOrder.user === 'object' && selectedOrder.user?._id 
                          ? selectedOrder.user._id 
                          : typeof selectedOrder.user === 'string' 
                            ? selectedOrder.user 
                            : "Guest"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">Address:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.address || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">City:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.city || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">State:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.state || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Zip Code:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.zipCode || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Country:</span>{" "}
                      <span className="text-gray-900">{selectedOrder.shippingAddress?.country || "UAE"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Created</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.paidAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedOrder.paidAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedOrder.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information with Editable Fields */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2">
                        <span className="font-medium">Payment Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${selectedOrder.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </p>
                      {selectedOrder.paidAt && (
                        <p>
                          <span className="font-medium">Paid At:</span> {formatDate(selectedOrder.paidAt)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="Enter tracking ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
                      <input
                        type="date"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md min-h-[48px]">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedOrder.customerNotes || selectedOrder.notes || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleSaveOrderDetails}
                    disabled={processingAction}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    <Save size={16} />
                    <span>{processingAction ? "Saving..." : "Save Details"}</span>
                  </button>
                </div>
              </div>

              {/* Post-Delivery Actions */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post-Delivery Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleSendFollowUp(selectedOrder._id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                    disabled={processingAction}
                  >
                    <Star size={18} className="mr-2" />
                    Send Follow-up Email
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Send a follow-up email to request customer feedback and reviews.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                >
                  <Printer size={18} className="mr-2" />
                  Print Receipt
                </button>
                <button
                  onClick={() => handleSendNotification(selectedOrder._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors"
                  disabled={processingAction}
                >
                  <Mail size={18} className="mr-2" />
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice Component for Printing */}
      {selectedOrder && (
        <div style={{ display: "none" }}>
          <InvoiceComponent order={selectedOrder} ref={printComponentRef} />
        </div>
      )}
    </div>
  )
}

export default Delivered
