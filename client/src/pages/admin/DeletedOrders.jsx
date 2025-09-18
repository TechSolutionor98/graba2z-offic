// "use client"

// import { useState, useEffect } from "react"
// import { FaEye, FaEnvelope, FaPrint, FaSearch, FaDownload } from "react-icons/fa"
// import { toast } from "react-toastify"
// import axios from "axios"
// import config from "../../config/config.js"

// const DeletedOrders = () => {
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedOrder, setSelectedOrder] = useState(null)
//   const [showModal, setShowModal] = useState(false)
//   const [orderStatus, setOrderStatus] = useState("")
//   const [paymentStatus, setPaymentStatus] = useState("")
//   const [trackingId, setTrackingId] = useState("")
//   const [estimatedDelivery, setEstimatedDelivery] = useState("")
//   const [customerNotes, setCustomerNotes] = useState("")

//   const orderStatusOptions = [
//     "New",
//     "Processing",
//     "Confirmed",
//     "Ready For Shipment",
//     "Shipped",
//     "On the Way",
//     "Out for Delivery",
//     "Delivered",
//     "On Hold",
//     "Cancelled",
//     "Deleted",
//   ]

//   useEffect(() => {
//     fetchOrders()
//   }, [])

//   const fetchOrders = async () => {
//     try {
//       setLoading(true)
//       const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

//       if (!token) {
//         toast.error("Authentication required. Please login again.")
//         return
//       }

//       console.log("[v0] Fetching deleted orders from API...")
//       const response = await axios.get(`${config.API_URL}/api/admin/orders?status=Deleted`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       console.log("[v0] Deleted orders received:", response.data.length)
//       console.log(
//         "[v0] Sample order statuses:",
//         response.data.slice(0, 5).map((order) => ({ id: order._id, status: order.status })),
//       )

//       setOrders(response.data)
//     } catch (error) {
//       console.error("Error fetching orders:", error)
//       if (error.response?.status === 401) {
//         toast.error("Session expired. Please login again.")
//       } else {
//         toast.error("Failed to fetch orders")
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleViewOrder = (order) => {
//     setSelectedOrder(order)
//     setOrderStatus(order.status || "")
//     setPaymentStatus(order.paymentStatus || "")
//     setTrackingId(order.trackingId || "")
//     setEstimatedDelivery(order.estimatedDelivery || "")
//     setCustomerNotes(order.customerNotes || "")
//     setShowModal(true)
//   }

//   const handleUpdateOrder = async () => {
//     try {
//       const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

//       if (!token) {
//         toast.error("Authentication required. Please login again.")
//         return
//       }

//       const updateData = {
//         status: orderStatus,
//         paymentStatus,
//         trackingId,
//         estimatedDelivery,
//         customerNotes,
//       }

//       console.log("[v0] Updating order with data:", updateData)

//       await axios.put(`${config.API_URL}/api/admin/orders/${selectedOrder._id}`, updateData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       toast.success("Order updated successfully")
//       setShowModal(false)
//       fetchOrders() // Refresh the list
//     } catch (error) {
//       console.error("Error updating order:", error)
//       if (error.response?.status === 401) {
//         toast.error("Session expired. Please login again.")
//       } else {
//         toast.error("Failed to update order")
//       }
//     }
//   }

//   const handlePrintReceipt = () => {
//     if (!selectedOrder) return

//     const printWindow = window.open("", "_blank")
//     const receiptHTML = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Order Receipt - ${selectedOrder.orderId}</title>
//         <style>
//           body { font-family: Arial, sans-serif; margin: 20px; }
//           .header { text-align: center; margin-bottom: 30px; }
//           .order-info { margin-bottom: 20px; }
//           .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//           .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//           .items-table th { background-color: #f2f2f2; }
//           .total-section { margin-top: 20px; text-align: right; }
//           .addresses { display: flex; justify-content: space-between; margin-top: 20px; }
//           .address-block { width: 45%; }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h1>Graba2z</h1>
//           <h2>Order Receipt</h2>
//         </div>
//         <div class="order-info">
//           <p><strong>Order ID:</strong> ${selectedOrder.orderId}</p>
//           <p><strong>Date:</strong> ${new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
//           <p><strong>Status:</strong> ${selectedOrder.status}</p>
//           <p><strong>Payment Status:</strong> ${selectedOrder.paymentStatus}</p>
//         </div>
//         <table class="items-table">
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Quantity</th>
//               <th>Price</th>
//               <th>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${
//               selectedOrder.items
//                 ?.map(
//                   (item) => `
//               <tr>
//                 <td>${item.productName}</td>
//                 <td>${item.quantity}</td>
//                 <td>AED ${item.price}</td>
//                 <td>AED ${(item.price * item.quantity).toFixed(2)}</td>
//               </tr>
//             `,
//                 )
//                 .join("") || ""
//             }
//           </tbody>
//         </table>
//         <div class="total-section">
//           <p><strong>Subtotal: AED ${selectedOrder.subtotal || 0}</strong></p>
//           <p><strong>Shipping: AED ${selectedOrder.shippingCost || 0}</strong></p>
//           <p><strong>Tax: AED ${selectedOrder.tax || 0}</strong></p>
//           <p><strong>Total: AED ${selectedOrder.totalAmount || 0}</strong></p>
//         </div>
//         <div class="addresses">
//           <div class="address-block">
//             <h3>Shipping Address</h3>
//             <p>${selectedOrder.shippingAddress?.name || ""}</p>
//             <p>${selectedOrder.shippingAddress?.email || ""}</p>
//             <p>${selectedOrder.shippingAddress?.phone || ""}</p>
//             <p>${selectedOrder.shippingAddress?.address || ""}</p>
//             <p>${selectedOrder.shippingAddress?.city || ""}, ${selectedOrder.shippingAddress?.state || ""}</p>
//             <p>${selectedOrder.shippingAddress?.zipCode || ""}</p>
//           </div>
//           <div class="address-block">
//             <h3>Billing Address</h3>
//             <p>${selectedOrder.billingAddress?.name || ""}</p>
//             <p>${selectedOrder.billingAddress?.email || ""}</p>
//             <p>${selectedOrder.billingAddress?.phone || ""}</p>
//             <p>${selectedOrder.billingAddress?.address || ""}</p>
//             <p>${selectedOrder.billingAddress?.city || ""}, ${selectedOrder.billingAddress?.state || ""}</p>
//             <p>${selectedOrder.billingAddress?.zipCode || ""}</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `

//     printWindow.document.write(receiptHTML)
//     printWindow.document.close()
//     printWindow.print()
//   }

//   const handleSendNotification = async () => {
//     try {
//       const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

//       if (!token) {
//         toast.error("Authentication required. Please login again.")
//         return
//       }

//       await axios.post(
//         `${config.API_URL}/api/admin/orders/${selectedOrder._id}/notify`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       )

//       toast.success("Notification sent successfully")
//     } catch (error) {
//       console.error("Error sending notification:", error)
//       if (error.response?.status === 401) {
//         toast.error("Session expired. Please login again.")
//       } else {
//         toast.error("Failed to send notification")
//       }
//     }
//   }

//   // const filteredOrders = orders.filter(
//   //   (order) =>
//   //     order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //     order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //     order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()),
//   // )

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6 ml-64 ">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Deleted Orders</h1>
//           <p className="text-gray-600">Orders that have been marked as deleted</p>
//         </div>
//         <button
//           onClick={fetchOrders}
//           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//         >
//           <FaDownload /> Refresh
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow-md">
//         <div className="p-4 border-b">
//           <div className="flex justify-between items-center">
//             <div className="relative">
//               <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search orders by ID, customer name, or email..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="text-sm text-gray-600">Total Deleted Orders: {orders.length}</div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   <input type="checkbox" className="rounded" />
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Order ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Payment
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Total
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {orders.map((order) => (
//                 <tr key={order._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <input type="checkbox" className="rounded" />
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="text-green-600 font-medium">#{order.orderId}</span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
//                       <div className="text-sm text-gray-500">{order.customerEmail}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div>
//                       <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
//                       <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
//                       Deleted
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {order.paymentStatus || "Unpaid"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">AED {order.totalAmount || 0}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleViewOrder(order)}
//                         className="text-blue-600 hover:text-blue-900"
//                         title="View Order"
//                       >
//                         <FaEye />
//                       </button>
//                       <button
//                         onClick={() => {
//                           setSelectedOrder(order)
//                           handleSendNotification()
//                         }}
//                         className="text-green-600 hover:text-green-900"
//                         title="Send Notification"
//                       >
//                         <FaEnvelope />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {orders.length === 0 && (
//           <div className="text-center py-8">
//             <p className="text-gray-500">No deleted orders found</p>
//           </div>
//         )}
//       </div>

//       {/* Order Details Modal */}
//       {showModal && selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-xl font-bold">Order ID: {selectedOrder.orderId}</h2>
//                   <p className="text-gray-600">View and manage order details</p>
//                 </div>
//                 <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
//                   ✕
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {/* Order Status Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-yellow-50 p-4 rounded-lg">
//                   <div className="flex items-center">
//                     <div className="bg-yellow-100 p-2 rounded-lg mr-3">📦</div>
//                     <div>
//                       <p className="text-sm text-gray-600">Status</p>
//                       <p className="font-semibold text-red-600">Deleted</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <div className="flex items-center">
//                     <div className="bg-green-100 p-2 rounded-lg mr-3">💳</div>
//                     <div>
//                       <p className="text-sm text-gray-600">Payment Type</p>
//                       <p className="font-semibold text-green-600">
//                         {selectedOrder.paymentMethod || "Cash on Delivery"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <div className="flex items-center">
//                     <div className="bg-purple-100 p-2 rounded-lg mr-3">🚚</div>
//                     <div>
//                       <p className="text-sm text-gray-600">Order Type</p>
//                       <p className="font-semibold text-purple-600">{selectedOrder.orderType || "Delivery"}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <div className="flex items-center">
//                     <div className="bg-blue-100 p-2 rounded-lg mr-3">📅</div>
//                     <div>
//                       <p className="text-sm text-gray-600">Created At</p>
//                       <p className="font-semibold text-blue-600">
//                         {new Date(selectedOrder.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Update Order Status */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
//                     <select
//                       value={orderStatus}
//                       onChange={(e) => setOrderStatus(e.target.value)}
//                       className="w-full p-2 border border-gray-300 rounded-lg"
//                     >
//                       {orderStatusOptions.map((status) => (
//                         <option key={status} value={status}>
//                           {status}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
//                     <select
//                       value={paymentStatus}
//                       onChange={(e) => setPaymentStatus(e.target.value)}
//                       className="w-full p-2 border border-gray-300 rounded-lg"
//                     >
//                       <option value="unpaid">Unpaid</option>
//                       <option value="paid">Paid</option>
//                       <option value="refunded">Refunded</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold mb-4">Order Items</h3>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   {selectedOrder.items?.map((item, index) => (
//                     <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
//                       <div className="flex items-center">
//                         <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">📦</div>
//                         <div>
//                           <p className="font-medium">{item.productName}</p>
//                           <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold">AED ${(item.price * item.quantity).toFixed(2)}</p>
//                         <p className="text-sm text-gray-600">Total: AED ${(item.price * item.quantity).toFixed(2)}</p>
//                       </div>
//                     </div>
//                   )) || <p className="text-gray-500">No items found</p>}
//                 </div>
//               </div>

//               {/* Total Amount */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold mb-4">Total Amount</h3>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <div className="flex justify-between py-2">
//                     <span>Subtotal:</span>
//                     <span>AED {selectedOrder.subtotal || 0}</span>
//                   </div>
//                   <div className="flex justify-between py-2">
//                     <span>Shipping:</span>
//                     <span>AED {selectedOrder.shippingCost || 0}</span>
//                   </div>
//                   <div className="flex justify-between py-2">
//                     <span>Tax:</span>
//                     <span>AED {selectedOrder.tax || 0}</span>
//                   </div>
//                   <div className="flex justify-between py-2 border-t font-semibold text-lg text-green-600">
//                     <span>Total:</span>
//                     <span>AED {selectedOrder.totalAmount || 0}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Addresses */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Shipping / Pickup Address</h3>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p>
//                       <strong>Name:</strong> {selectedOrder.shippingAddress?.name || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Email:</strong> {selectedOrder.shippingAddress?.email || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Address:</strong> {selectedOrder.shippingAddress?.address || "N/A"}
//                     </p>
//                     <p>
//                       <strong>City:</strong> {selectedOrder.shippingAddress?.city || "N/A"}
//                     </p>
//                     <p>
//                       <strong>State:</strong> {selectedOrder.shippingAddress?.state || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Zip Code:</strong> {selectedOrder.shippingAddress?.zipCode || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p>
//                       <strong>Name:</strong> {selectedOrder.billingAddress?.name || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Email:</strong> {selectedOrder.billingAddress?.email || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Phone:</strong> {selectedOrder.billingAddress?.phone || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Address:</strong> {selectedOrder.billingAddress?.address || "N/A"}
//                     </p>
//                     <p>
//                       <strong>City:</strong> {selectedOrder.billingAddress?.city || "N/A"}
//                     </p>
//                     <p>
//                       <strong>State:</strong> {selectedOrder.billingAddress?.state || "N/A"}
//                     </p>
//                     <p>
//                       <strong>Zip Code:</strong> {selectedOrder.billingAddress?.zipCode || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Information */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status:</label>
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs ${
//                         selectedOrder.paymentStatus === "paid"
//                           ? "bg-green-100 text-green-800"
//                           : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {selectedOrder.paymentStatus || "Unpaid"}
//                     </span>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery</label>
//                     <input
//                       type="date"
//                       value={estimatedDelivery}
//                       onChange={(e) => setEstimatedDelivery(e.target.value)}
//                       className="w-full p-2 border border-gray-300 rounded-lg"
//                     />
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Tracking ID</label>
//                   <input
//                     type="text"
//                     placeholder="Enter tracking ID"
//                     value={trackingId}
//                     onChange={(e) => setTrackingId(e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
//                   <textarea
//                     placeholder="N/A"
//                     value={customerNotes}
//                     onChange={(e) => setCustomerNotes(e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-lg h-20 bg-yellow-50"
//                   />
//                 </div>
//                 <button
//                   onClick={handleUpdateOrder}
//                   className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
//                 >
//                   💾 Save Details
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={handlePrintReceipt}
//                 className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
//               >
//                 <FaPrint /> Print Receipt
//               </button>
//               <button
//                 onClick={handleSendNotification}
//                 className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
//               >
//                 <FaEnvelope /> Send Notification
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default DeletedOrders









































































































































































































































































































































"use client"

import { useState, useEffect } from "react"
import { FaEye, FaEnvelope, FaPrint, FaSearch, FaDownload } from "react-icons/fa"
import { toast } from "react-toastify"
import axios from "axios"
import config from "../../config/config.js"

const DeletedOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [orderStatus, setOrderStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [trackingId, setTrackingId] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  const [customerNotes, setCustomerNotes] = useState("")

  const orderStatusOptions = [
    "New",
    "Processing",
    "Confirmed",
    "Ready For Shipment",
    "Shipped",
    "On the Way",
    "Out for Delivery",
    "Delivered",
    "On Hold",
    "Cancelled",
    "Deleted",
  ]

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      if (!token) {
        toast.error("Authentication required. Please login again.")
        return
      }

      console.log("[v0] Fetching deleted orders from API...")
      const response = await axios.get(`${config.API_URL}/api/admin/orders?status=Deleted`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Deleted orders received:", response.data.length)
      console.log(
        "[v0] Sample order statuses:",
        response.data.slice(0, 5).map((order) => ({ id: order._id, status: order.status })),
      )

      setOrders(response.data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
      } else {
        toast.error("Failed to fetch orders")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderStatus(order.status || "")
    setPaymentStatus(order.isPaid ? "Paid" : "Unpaid")
    setTrackingId(order.trackingId || "")
    setEstimatedDelivery(order.estimatedDelivery || "")
    setCustomerNotes(order.customerNotes || "")
    setShowModal(true)
  }

  const handleUpdateOrder = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      if (!token) {
        toast.error("Authentication required. Please login again.")
        return
      }

      const updateData = {
        status: orderStatus,
        paymentStatus,
        trackingId,
        estimatedDelivery,
        customerNotes,
      }

      console.log("[v0] Updating order with data:", updateData)

      await axios.put(`${config.API_URL}/api/admin/orders/${selectedOrder._id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      toast.success("Order updated successfully")
      setShowModal(false)
      fetchOrders() // Refresh the list
    } catch (error) {
      console.error("Error updating order:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
      } else {
        toast.error("Failed to update order")
      }
    }
  }

  const handlePrintReceipt = () => {
    if (!selectedOrder) return

    const printWindow = window.open("", "_blank")
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${selectedOrder._id?.slice(-8) || "N/A"}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total-section { margin-top: 20px; text-align: right; }
          .addresses { display: flex; justify-content: space-between; margin-top: 20px; }
          .address-block { width: 45%; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Graba2z</h1>
          <h2>Order Receipt</h2>
        </div>
        <div class="order-info">
          <p><strong>Order ID:</strong> ${selectedOrder._id?.slice(-8) || "N/A"}</p>
          <p><strong>Date:</strong> ${new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${selectedOrder.status}</p>
          <p><strong>Payment Status:</strong> ${selectedOrder.isPaid ? "Paid" : "Unpaid"}</p>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              selectedOrder.orderItems
                ?.map(
                  (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>AED ${item.price}</td>
                <td>AED ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `,
                )
                .join("") || ""
            }
          </tbody>
        </table>
        <div class="total-section">
          <p><strong>Items Price: AED ${selectedOrder.itemsPrice || 0}</strong></p>
          <p><strong>Shipping: AED ${selectedOrder.shippingPrice || 0}</strong></p>
          <p><strong>Tax: AED ${selectedOrder.taxPrice || 0}</strong></p>
          <p><strong>Discount: AED ${selectedOrder.discountAmount || 0}</strong></p>
          <p><strong>Total: AED ${selectedOrder.totalPrice || 0}</strong></p>
        </div>
        <div class="addresses">
          <div class="address-block">
            <h3>Shipping / Pickup Address</h3>
            ${
              selectedOrder.deliveryType === "pickup" && selectedOrder.pickupDetails
                ? `
            <p><strong>Type:</strong> Pickup</p>
            <p><strong>Phone:</strong> ${selectedOrder.pickupDetails.phone || "N/A"}</p>
            <p><strong>Location:</strong> ${selectedOrder.pickupDetails.location || "N/A"}</p>
            <p><strong>Store ID:</strong> ${selectedOrder.pickupDetails.storeId || "N/A"}</p>
            `
                : `
            <p><strong>Name:</strong> ${selectedOrder.shippingAddress?.name || "N/A"}</p>
            <p><strong>Email:</strong> ${selectedOrder.shippingAddress?.email || "N/A"}</p>
            <p><strong>Phone:</strong> ${selectedOrder.shippingAddress?.phone || "N/A"}</p>
            <p><strong>Address:</strong> ${selectedOrder.shippingAddress?.address || "N/A"}</p>
            <p><strong>City:</strong> ${selectedOrder.shippingAddress?.city || "N/A"}, ${selectedOrder.shippingAddress?.state || "N/A"}</p>
            <p><strong>Zip Code:</strong> ${selectedOrder.shippingAddress?.zipCode || "N/A"}</p>
            `
            }
          </div>
          <div class="address-block">
            <h3>Payment Details</h3>
            <p><strong>Payment Method:</strong> ${selectedOrder.paymentMethod || "N/A"}</p>
            <p><strong>Payment Status:</strong> ${selectedOrder.isPaid ? "Paid" : "Unpaid"}</p>
            <p><strong>Total Amount:</strong> AED ${selectedOrder.totalPrice || 0}</p>
          </div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.print()
  }

  const handleSendNotification = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      if (!token) {
        toast.error("Authentication required. Please login again.")
        return
      }

      await axios.post(
        `${config.API_URL}/api/admin/orders/${selectedOrder._id}/notify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      toast.success("Notification sent successfully")
    } catch (error) {
      console.error("Error sending notification:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
      } else {
        toast.error("Failed to send notification")
      }
    }
  }

  // const filteredOrders = orders.filter(
  //   (order) =>
  //     order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()),
  // )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 ml-64">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deleted Orders</h1>
          <p className="text-gray-600">Orders that have been marked as deleted</p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaDownload /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">Total Deleted Orders: {orders.length}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-600 font-medium">#{order._id?.slice(-8) || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || order.user?.firstName || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">{order.user?.email || "N/A"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Deleted
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">AED {order.totalPrice || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Order"
                      >
                        <FaEye />
                      </button> */}
                      {/* <button
                        onClick={() => {
                          setSelectedOrder(order)
                          handleSendNotification()
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Send Notification"
                      >
                        <FaEnvelope />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No deleted orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Order ID: #{selectedOrder._id?.slice(-8) || "N/A"}</h2>
                  <p className="text-gray-600">View and manage order details</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Order Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">📦</div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-red-600">Deleted</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">💳</div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Type</p>
                      <p className="font-semibold text-green-600">
                        {selectedOrder.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">🚚</div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Type</p>
                      <p className="font-semibold text-purple-600">{selectedOrder.deliveryType || "Delivery"}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">📅</div>
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-semibold text-blue-600">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Order Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            "📦"
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">AED {(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Unit: AED {item.price}</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No items found</p>}
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Total Amount</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between py-2">
                    <span>Items Price:</span>
                    <span>AED {selectedOrder.itemsPrice || 0}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Shipping:</span>
                    <span>AED {selectedOrder.shippingPrice || 0}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Tax:</span>
                    <span>AED {selectedOrder.taxPrice || 0}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Discount:</span>
                    <span>AED {selectedOrder.discountAmount || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t font-semibold text-lg text-green-600">
                    <span>Total:</span>
                    <span>AED {selectedOrder.totalPrice || 0}</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Delivery/Pickup Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedOrder.deliveryType === "pickup" && selectedOrder.pickupDetails ? (
                      <>
                        <p>
                          <strong>Type:</strong> Pickup
                        </p>
                        <p>
                          <strong>Phone:</strong> {selectedOrder.pickupDetails.phone || "N/A"}
                        </p>
                        <p>
                          <strong>Location:</strong> {selectedOrder.pickupDetails.location || "N/A"}
                        </p>
                        <p>
                          <strong>Store ID:</strong> {selectedOrder.pickupDetails.storeId || "N/A"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          <strong>Type:</strong> Delivery
                        </p>
                        <p>
                          <strong>Name:</strong> {selectedOrder.shippingAddress?.name || "N/A"}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedOrder.shippingAddress?.email || "N/A"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || "N/A"}
                        </p>
                        <p>
                          <strong>Address:</strong> {selectedOrder.shippingAddress?.address || "N/A"}
                        </p>
                        <p>
                          <strong>City:</strong> {selectedOrder.shippingAddress?.city || "N/A"}
                        </p>
                        <p>
                          <strong>State:</strong> {selectedOrder.shippingAddress?.state || "N/A"}
                        </p>
                        <p>
                          <strong>Zip Code:</strong> {selectedOrder.shippingAddress?.zipCode || "N/A"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>
                      <strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}
                    </p>
                    <p>
                      <strong>Payment Status:</strong> {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                    </p>
                    <p>
                      <strong>Total Amount:</strong> AED {selectedOrder.totalPrice || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status:</label>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        selectedOrder.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery</label>
                    <input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking ID</label>
                  <input
                    type="text"
                    placeholder="Enter tracking ID"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
                  <textarea
                    placeholder="N/A"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg h-20 bg-yellow-50"
                  />
                </div>
                <button
                  onClick={handleUpdateOrder}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  💾 Save Details
                </button>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
              >
                <FaPrint /> Print Receipt
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                <FaEnvelope /> Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeletedOrders
