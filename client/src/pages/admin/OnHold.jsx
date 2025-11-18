"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Eye, RefreshCw, Pause, Play, ChevronDown, X, Package, CreditCard, MapPin, Clock } from "lucide-react"
import { useToast } from "../../context/ToastContext"

import config from "../../config/config"
import { resolveOrderItemBasePrice, computeBaseSubtotal } from "../../utils/orderPricing"
const OnHold = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState({})
  const [showPaymentDropdown, setShowPaymentDropdown] = useState({})
  const { showToast } = useToast()

  const orderStatusOptions = [
    "New",
    "Processing",
    "Confirmed",
    "Ready For Shipment",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Returned",
    "On Hold"
  ]

  const paymentStatusOptions = ["Unpaid", "Paid"]

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setProcessingAction(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      await axios.put(
        `${config.API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      
      fetchOrders()
      showToast("Order status updated successfully", "success")
    } catch (error) {
      console.error("Error updating order status:", error)
      showToast("Failed to update order status", "error")
    } finally {
      setProcessingAction(false)
      setShowStatusDropdown({})
    }
  }

  const handleUpdatePayment = async (orderId, isPaid) => {
    try {
      setProcessingAction(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      await axios.put(
        `${config.API_URL}/api/admin/orders/${orderId}`,
        { isPaid, ...(isPaid && { paidAt: new Date().toISOString() }), ...(!isPaid && { paidAt: null }) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      
      fetchOrders()
      showToast("Payment status updated successfully", "success")
    } catch (error) {
      console.error("Error updating payment status:", error)
      showToast("Failed to update payment status", "error")
    } finally {
      setProcessingAction(false)
      setShowPaymentDropdown({})
    }
  }

  const formatPrice = (price) => {
    return `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  const selectedOrderItems = Array.isArray(selectedOrder?.orderItems) ? selectedOrder.orderItems : []
  const selectedBaseSubtotal = computeBaseSubtotal(selectedOrderItems)

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

      const { data } = await axios.get(`${config.API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const onHoldOrders = data.filter((order) => order.status === "On Hold" || order.status === "Paused")
      setOrders(onHoldOrders)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again later.")
      setLoading(false)
    }
  }

  const handleResumeOrder = async (orderId) => {
    try {
      setProcessingAction(true)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

      await axios.put(
        `${config.API_URL}/api/admin/orders/${orderId}/status`,
        { status: "Processing" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setOrders(orders.filter((order) => order._id !== orderId))
      showToast("Order processed successfully!", "success")
      setProcessingAction(false)
    } catch (error) {
      console.error("Error resuming order:", error)
      showToast("Failed to resume order", "error")
      setProcessingAction(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
  }

  const filteredOrders = orders.filter(
    (order) =>
      order._id.includes(searchTerm) ||
      order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">On Hold Orders</h1>
            <p className="text-gray-600 mt-1">Orders temporarily paused or on hold</p>
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
            On Hold: <span className="font-semibold text-yellow-600">{filteredOrders.length}</span>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hold Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    {/* Removed Items column */}
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
                        <div className="relative">
                          <button
                            onClick={() => setShowStatusDropdown({ ...showStatusDropdown, [order._id]: !showStatusDropdown[order._id] })}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <span className={`
                              inline-block w-2 h-2 rounded-full mr-2
                              ${order.status === 'Delivered' ? 'bg-green-500' : 
                                order.status === 'Cancelled' ? 'bg-red-500' : 
                                order.status === 'On Hold' ? 'bg-yellow-500' : 'bg-blue-500'}
                            `}></span>
                            {order.status}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </button>
                          
                          {showStatusDropdown[order._id] && (
                            <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                              <div className="py-1">
                                {orderStatusOptions.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(order._id, status)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdatePayment(order._id, !order.isPaid)}
                          className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded
                            ${order.isPaid ? 
                              'border-green-300 text-green-700 bg-green-50' : 
                              'border-red-300 text-red-700 bg-red-50'}`}
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(order.updatedAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.holdReason || "Payment Issue"}</div>
                      </td>
                      {/* Removed Items column */}
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
                          onClick={() => handleResumeOrder(order._id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={processingAction}
                          title="Process Order"
                        >
                          <Play size={18} />
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
            <Pause className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-gray-500 text-lg mt-4">No orders on hold</div>
            <p className="text-gray-400 mt-2">Orders on hold will appear here</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header with navigation breadcrumb */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span>On Hold Orders</span>
                  <span>/</span>
                  <span className="text-blue-600">View</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order ID: {selectedOrder._id.slice(-6)}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-900">{selectedOrder.status}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Type</p>
                      <p className="font-semibold text-blue-900">
                        {selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Order Type</p>
                      <p className="font-semibold text-purple-900">Delivery</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Order Status Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={processingAction}
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                    Current: {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Update Payment Status Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpdatePayment(selectedOrder._id, !selectedOrder.isPaid)}
                    className={`px-4 py-2 border rounded-md font-medium ${
                      selectedOrder.isPaid 
                        ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' 
                        : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                    }`}
                    disabled={processingAction}
                  >
                    {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                  </button>
                </div>
              </div>

              {/* Order Items Section */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrderItems.length > 0 ? (
                    selectedOrderItems.map((item, index) => {
                      const basePrice = resolveOrderItemBasePrice(item)
                      const salePrice = Number(item.price) || basePrice
                      const showDiscount = basePrice > salePrice
                      const lineTotal = salePrice * (item.quantity || 0)
                      const baseTotal = basePrice * (item.quantity || 0)

                      return (
                        <div
                          key={item._id || index}
                          className="flex items-center justify-between py-3 border-b last:border-b-0"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-14 h-14 object-contain" />
                              ) : (
                                <Package size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {showDiscount && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(basePrice)}</p>
                            )}
                            <p className="font-semibold text-gray-900">{formatPrice(salePrice)}</p>
                            {showDiscount && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(baseTotal)}</p>
                            )}
                            <p className="text-sm text-gray-500">Total: {formatPrice(lineTotal)}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items found</p>
                  )}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t space-y-1">
                  {selectedBaseSubtotal > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Base Price:</span>
                      <span className="line-through">{formatPrice(selectedBaseSubtotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatPrice(selectedOrder?.totalPrice || 0)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleResumeOrder(selectedOrder._id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                    disabled={processingAction}
                  >
                    <Play size={20} />
                    Process Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnHold