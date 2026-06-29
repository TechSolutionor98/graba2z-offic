"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { CheckCircle, Clock, Package, Truck, AlertTriangle, Printer, Download, X, Eye, FileText, ShoppingBag, MapPin, CreditCard } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"
import { Dialog, Transition } from "@headlessui/react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useReactToPrint } from "react-to-print"
import InvoiceComponent from "../components/admin/InvoiceComponent"

import config from "../config/config"

const UserOrders = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${selectedOrder?._id?.slice(-6) || "Order"}`,
  })

  // Check for success message from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const success = params.get("success")
    const orderId = params.get("orderId")

    if (success === "true" && orderId) {
      setSuccessMessage(`Order #${orderId.slice(-6)} has been placed successfully!`)

      // Initialize Google Customer Reviews opt-in module
      initializeGCROptIn(orderId)

      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [location])

  // Initialize Google Customer Reviews opt-in module
  const initializeGCROptIn = async (orderId) => {
    try {
      // Fetch order details
      const token = localStorage.getItem("token")
      const { data: order } = await axios.get(`${config.API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Load Google API platform script if not already loaded
      if (!window.gapi) {
        const script = document.createElement("script")
        script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn"
        script.async = true
        script.defer = true
        document.body.appendChild(script)
      }

      // Calculate estimated delivery date
      const estimatedDeliveryDate = order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toISOString().split('T')[0]
        : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Extract GTINs from order items if available
      const products = order.orderItems
        .filter(item => item.product?.gtin || item.product?.barcode)
        .map(item => ({ gtin: item.product?.gtin || item.product?.barcode }))

      // Define the render function for GCR opt-in
      window.renderOptIn = function () {
        if (window.gapi && window.gapi.load) {
          window.gapi.load('surveyoptin', function () {
            window.gapi.surveyoptin.render({
              "merchant_id": 5615926184,
              "order_id": order._id,
              "email": order.shippingAddress?.email || user?.email || "",
              "delivery_country": "AE",
              "estimated_delivery_date": estimatedDeliveryDate,
              "products": products.length > 0 ? products : undefined,
              "opt_in_style": "BOTTOM_RIGHT_DIALOG"
            })
          })
        }
      }

      // Call renderOptIn if gapi is already loaded
      if (window.gapi && window.gapi.load) {
        window.renderOptIn()
      }
    } catch (error) {
      console.error("Error initializing GCR opt-in:", error)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in to view your orders")
          setLoading(false)
          return
        }

        const { data } = await axios.get(`${config.API_URL}/api/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        setOrders(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError(error.response?.data?.message || "Failed to load your orders. Please try again later.")
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, navigate])

  const openModal = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedOrder(null), 300)
  }

  const triggerPrint = (order) => {
    setSelectedOrder(order)
    // Wait for state to update and InvoiceComponent to render before printing
    setTimeout(() => {
      handlePrint()
    }, 100)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing": return <Clock className="h-5 w-5 text-yellow-600" />
      case "Shipped": return <Package className="h-5 w-5 text-blue-600" />
      case "Out for Delivery": return <Truck className="h-5 w-5 text-purple-600" />
      case "Delivered": return <CheckCircle className="h-5 w-5 text-green-600" />
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Shipped": return "bg-blue-50 text-blue-700 border-blue-200"
      case "Out for Delivery": return "bg-purple-50 text-purple-700 border-purple-200"
      case "Delivered": return "bg-green-50 text-green-700 border-green-200"
      case "Cancelled":
      case "Deleted": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
            <p className="mt-2 text-gray-600">View and manage your recent purchases</p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm hover:shadow">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center shadow-sm">
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center shadow-sm">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">No orders found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't made any purchases yet. Start shopping to see your orders here.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
                <div className="p-6 border-b border-gray-50 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Order Number</p>
                      <h3 className="text-lg font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</h3>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Date Placed</p>
                      <p className="text-base font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Amount</p>
                      <p className="text-base font-bold text-green-600">AED {order.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-semibold text-sm tracking-wide">{order.status}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
                  <div className="flex items-center gap-4 flex-1 py-2">
                    <div className="flex items-center -space-x-4 overflow-hidden flex-shrink-0">
                      {order.orderItems.filter(item => !item.isProtection).slice(0, 3).map((item, idx) => (
                        <div key={item._id || idx} className="relative z-10 w-16 h-16 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex-shrink-0 group-hover:-translate-y-1 transition-transform duration-300" style={{ transitionDelay: `${idx * 50}ms` }}>
                          <img
                            src={getFullImageUrl(item.image) || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col flex-1">
                      {order.orderItems.length > 0 && (
                        <span className="font-semibold text-gray-900 pr-4">
                          {order.orderItems.filter(item => !item.isProtection)[0]?.name || "Product Item"}
                        </span>
                      )}
                      {order.orderItems.filter(item => !item.isProtection).length > 1 && (
                        <span className="text-sm text-gray-500 font-medium mt-0.5">
                          + {order.orderItems.filter(item => !item.isProtection).length - 1} more item(s)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
                    <button 
                      onClick={() => openModal(order)} 
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <button 
                      onClick={() => triggerPrint(order)}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-green-50 text-green-700 border border-green-100 rounded-xl font-medium hover:bg-green-100 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invisible component for printing */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {selectedOrder && <InvoiceComponent order={selectedOrder} showStatus={true} />}
        </div>
      </div>

      {/* Order Details Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all">
                  {selectedOrder && (
                    <div className="flex flex-col max-h-[90vh]">
                      {/* Modal Header */}
                      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 sticky top-0 z-10">
                        <div>
                          <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            Order Summary
                            <span className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide flex items-center gap-1 ${getStatusColor(selectedOrder.status)}`}>
                              {getStatusIcon(selectedOrder.status)}
                              {selectedOrder.status}
                            </span>
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 mt-1">
                            Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={closeModal}
                          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Modal Body - Scrollable */}
                      <div className="overflow-y-auto flex-1 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          
                          {/* Left Column: Items */}
                          <div className="lg:col-span-2 space-y-6">
                            <div>
                              <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-green-600" />
                                Order Items
                              </h4>
                              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
                                {selectedOrder.orderItems.filter(item => !item.isProtection).map((item) => (
                                  <div key={item._id} className="p-4 flex gap-4 hover:bg-gray-50/50 transition">
                                    <div className="w-20 h-20 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-white">
                                      <img
                                        src={getFullImageUrl(item.image) || "/placeholder.svg"}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                      <Link to={`/product/${item.product?.slug || item.product?._id || item.product}`} title={item.name} className="inline-block hover:opacity-80 transition">
                                        <h5 className="font-semibold text-gray-900 line-clamp-2 hover:text-green-600 hover:underline decoration-green-600 decoration-2 underline-offset-2">{item.name}</h5>
                                      </Link>
                                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                        <span className="text-gray-500">Qty: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                                        {item.selectedColorData?.color && (
                                          <span className="text-gray-500 flex items-center gap-1">
                                            Color: 
                                            <span className="w-3 h-3 rounded-full border border-gray-200" style={{backgroundColor: item.selectedColorData.color.toLowerCase()}}></span>
                                            <span className="font-medium text-gray-900">{item.selectedColorData.color}</span>
                                          </span>
                                        )}
                                        {item.selectedDosData?.dosType && (
                                          <span className="text-gray-500">OS: <span className="font-medium text-gray-900">{item.selectedDosData.dosType}</span></span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                      <span className="font-bold text-gray-900">AED {(item.price * item.quantity).toLocaleString()}</span>
                                      {item.quantity > 1 && (
                                        <span className="text-xs text-gray-500">AED {item.price.toLocaleString()} each</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Protection Items */}
                                {selectedOrder.orderItems.some(item => item.isProtection) && (
                                  <div className="bg-green-50/50 p-4 border-t border-green-100">
                                    <h5 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                                      <Shield className="w-4 h-4 text-green-600" />
                                      Protection Plans
                                    </h5>
                                    <div className="space-y-3">
                                      {selectedOrder.orderItems.filter(item => item.isProtection).map((item) => (
                                        <div key={item._id} className="flex justify-between items-center text-sm">
                                          <div className="flex items-center gap-2 text-green-800">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>{item.name}</span>
                                          </div>
                                          <span className="font-semibold text-green-900">AED {item.price.toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Tracking Info if available */}
                            {selectedOrder.trackingId && (
                              <div>
                                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Truck className="w-5 h-5 text-purple-600" />
                                  Delivery Information
                                </h4>
                                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-6">
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Tracking ID</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.trackingId}</p>
                                  </div>
                                  {selectedOrder.estimatedDelivery && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                                      <p className="font-semibold text-gray-900">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Order Info */}
                          <div className="space-y-6">
                            {/* Summary Box */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                              <h4 className="text-base font-bold text-gray-900 mb-4">Payment Summary</h4>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                  <span>Subtotal</span>
                                  <span className="font-medium text-gray-900">AED {selectedOrder.itemsPrice?.toLocaleString() || selectedOrder.totalPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Shipping Fee</span>
                                  <span className="font-medium text-gray-900">AED {selectedOrder.shippingPrice?.toLocaleString() || 0}</span>
                                </div>
                                {selectedOrder.taxPrice > 0 && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span className="font-medium text-gray-900">AED {selectedOrder.taxPrice?.toLocaleString()}</span>
                                  </div>
                                )}
                                {selectedOrder.discountAmount > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-medium">-AED {selectedOrder.discountAmount?.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                                  <span className="font-bold text-gray-900">Total</span>
                                  <span className="text-xl font-bold text-green-600">AED {selectedOrder.totalPrice?.toLocaleString()}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                                  <CreditCard className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">{selectedOrder.paymentMethod}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedOrder.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                              <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                Shipping Address
                              </h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-medium text-gray-900">{selectedOrder.shippingAddress?.name || user?.name}</p>
                                <p>{selectedOrder.shippingAddress?.address}</p>
                                <p>{selectedOrder.shippingAddress?.city}{selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress.state}` : ''}</p>
                                <p className="pt-2 flex items-center gap-2">
                                  <span className="w-4 flex justify-center">📞</span> 
                                  {selectedOrder.shippingAddress?.phone}
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-4 flex justify-center">✉️</span> 
                                  {selectedOrder.shippingAddress?.email || user?.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 z-10">
                        <button
                          onClick={() => triggerPrint(selectedOrder)}
                          className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white border border-transparent rounded-xl font-medium hover:bg-green-700 transition-all shadow-sm"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print / Download Invoice
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default UserOrders
