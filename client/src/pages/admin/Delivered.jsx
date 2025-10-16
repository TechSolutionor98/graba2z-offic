"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Eye, RefreshCw, CheckCircle2, Star } from "lucide-react"
import { useToast } from "../../context/ToastContext"

import config from "../../config/config"
const Delivered = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const { showToast } = useToast()

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString()}`
  }

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
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
  }

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
                        <div className="text-sm font-medium text-blue-600">#{order._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.shippingAddress.name}</div>
                        <div className="text-sm text-gray-500">{order.shippingAddress.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.updatedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleTimeString()}</div>
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
                          className="text-blue-600 hover:text-blue-900 mr-3"
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
                    <CheckCircle2 className="text-green-600" size={20} />
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
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="font-semibold text-blue-900">
                        {selectedOrder.isPaid ? "Paid" : "Unpaid"}
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
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Delivered
