import React, { forwardRef } from "react"
import { getInvoiceBreakdown } from "../../utils/invoiceBreakdown"
import { resolveOrderItemBasePrice, computeBaseSubtotal, deriveBaseDiscount } from "../../utils/orderPricing"
import { getPaymentMethodDisplay, getPaymentMethodBadgeColor } from "../../utils/paymentUtils"

const InvoiceComponent = forwardRef(({ order, showStatus }, ref) => {
  const formatPrice = (price) => {
    return `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const resolvedItems = Array.isArray(order?.orderItems) ? order.orderItems : []
  
  // Separate protection items from regular items
  const protectionItems = resolvedItems.filter(item => item.isProtection || (item.name && item.name.includes('for ')))
  const regularItems = resolvedItems.filter(item => !item.isProtection && !(item.name && item.name.includes('for ')))
  
  const baseSubtotal = computeBaseSubtotal(regularItems)

  const { subtotal, shipping, tax, total, couponCode, couponDiscount, displaySubtotal, displayTotal, codFee,
    codShippingFee,
    isCOD,
    paymentCharges,
  } = getInvoiceBreakdown(order)
  const derivedDiscount = deriveBaseDiscount(baseSubtotal, subtotal)

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
            {showStatus && <div className="text-sm font-semibold mt-1 text-lime-700">🏷️ Status: {order.status}</div>}
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

        {/* Seller Comments */}
        {order.sellerComments && (
          <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-bold text-blue-700 uppercase mb-2">💬 Seller Comments</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{order.sellerComments}</p>
          </div>
        )}

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
                {regularItems.map((item, index) => {
                  const basePrice = resolveOrderItemBasePrice(item)
                  const itemPrice = Number(item.price) || basePrice
                  const showDiscount = basePrice > itemPrice
                  const lineTotal = itemPrice * (item.quantity || 0)
                  const baseTotal = basePrice * (item.quantity || 0)

                  return (
                    <tr key={index} className="hover:bg-lime-50">
                      <td className="border border-lime-300 px-3 py-2 text-sm">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.selectedColorData && (
                          <div className="text-xs text-purple-600 font-medium mt-1 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300" style={{backgroundColor: item.selectedColorData.color?.toLowerCase() || '#9333ea'}}></span>
                            Color: {item.selectedColorData.color}
                          </div>
                        )}
                        {item.selectedDosData && (
                          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center">
                            💻 OS: {item.selectedDosData.dosType}
                          </div>
                        )}
                        {showDiscount && (
                          <div className="text-xs text-gray-500">Base: {formatPrice(basePrice)}</div>
                        )}
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm">
                        {showDiscount && (
                          <span className="block text-xs text-gray-400 line-through">{formatPrice(basePrice)}</span>
                        )}
                        <span className="font-semibold text-gray-900">{formatPrice(itemPrice)}</span>
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm font-semibold">
                        {showDiscount && (
                          <span className="block text-xs text-gray-400 font-normal line-through">
                            {formatPrice(baseTotal)}
                          </span>
                        )}
                        <span>{formatPrice(lineTotal)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Protection Plans Section */}
        {protectionItems.length > 0 && (
          <div className="mb-4">
            <h4 className="text-lg font-bold text-blue-800 mb-2 uppercase">🛡️ Protection Plans</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-blue-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-300 px-3 py-2 text-left text-sm font-bold">Protection</th>
                    <th className="border border-blue-300 px-3 py-2 text-center text-sm font-bold">Qty</th>
                    <th className="border border-blue-300 px-3 py-2 text-right text-sm font-bold">Price</th>
                    <th className="border border-blue-300 px-3 py-2 text-right text-sm font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {protectionItems.map((item, index) => {
                    const itemPrice = Number(item.price) || 0
                    const lineTotal = itemPrice * (item.quantity || 0)

                    return (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="border border-blue-300 px-3 py-2 text-sm">
                          <div className="font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="border border-blue-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                          {formatPrice(itemPrice)}
                        </td>
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold">
                          {formatPrice(lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Amount */}
        <div className="bg-lime-50 border-2 border-lime-200 rounded-lg p-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">💰 Total Amount</h4>
          <div className="space-y-2">
            {baseSubtotal > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Base Price:</span>
                <span className="line-through">{formatPrice(baseSubtotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatPrice(subtotal + (couponDiscount || 0))}</span>
            </div>

            {derivedDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Offer Discount:</span>
                <span className="text-green-600">-{formatPrice(derivedDiscount)}</span>
              </div>
            )}

            {(couponDiscount > 0 || (order.couponCode && order.discountAmount > 0)) && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {(couponCode || order.couponCode) ? `Coupon (${couponCode || order.couponCode})` : "Coupon Discount"}:
                </span>
                <span className="text-green-600">-{formatPrice(couponDiscount || order.discountAmount || 0)}</span>
              </div>
            )}

            {!(shipping === 0 && (
              (paymentCharges?.length > 0 && paymentCharges.some(c => c.name?.toLowerCase().includes('shipping'))) ||
              (!(paymentCharges?.length > 0) && isCOD && codShippingFee > 0)
            )) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
            )}
            {paymentCharges?.length > 0 ? (
              paymentCharges.map((charge, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-700 text-sm">💰 {charge.name}:</span>
                  <span className="text-gray-700 text-sm">{formatPrice(charge.amount)}</span>
                </div>
              ))
            ) : (
              <>
                {isCOD && codFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700 text-sm">💰 COD Handling Fee (Non-Refundable):</span>
                    <span className="text-yellow-700 text-sm">{formatPrice(codFee)}</span>
                  </div>
                )}
                {isCOD && codShippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700 text-sm">🚚 COD Shipping Fee:</span>
                    <span className="text-yellow-700 text-sm">{formatPrice(codShippingFee)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">VAT (Included):</span>
              <span className="text-gray-900">{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-lime-600">{formatPrice(displayTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 bg-yellow-50 p-2 rounded-lg border-2 border-yellow-200 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">💳 Payment Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                order.isPaid ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}
            >
              {order.isPaid ? "✅ Paid" : "❌ Unpaid"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">💰 Payment Method:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPaymentMethodBadgeColor(order)}`}>
              {getPaymentMethodDisplay(order)}
            </span>
          </div>
          {order.trackingId && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">📦 Tracking ID:</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{order.trackingId}</code>
            </div>
          )}
          {order.paidAt && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">✅ Paid At:</span>
              <span className="text-gray-700 text-xs">{new Date(order.paidAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {(order.customerNotes || order.notes) && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📝 Special Notes:</h4>
            <p className="text-blue-700 italic">{order.customerNotes || order.notes}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-end mt-2 opacity-80">🖨️ Printed: {currentDate}</div>
    </div>
  )
})

export default InvoiceComponent
