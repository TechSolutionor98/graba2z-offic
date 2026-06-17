"use client"

import { useEffect, useMemo, useRef, useState, forwardRef } from "react"
import { adminAPI } from "../../services/api"
import { Search, Eye, RefreshCw, Printer, Repeat, Mail } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import { getInvoiceBreakdown } from "../../utils/invoiceBreakdown"
import {
  resolveOrderItemSalePrice,
  resolveOrderItemBasePrice,
  computeBaseSubtotal,
  deriveBaseDiscount,
  isProtectionItem,
} from "../../utils/orderPricing"
import { getPaymentMethodDisplay, getPaymentMethodBadgeColor } from "../../utils/paymentUtils"

const formatPrice = (price) => `AED ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

const QuotationPrint = forwardRef(({ quotation }, ref) => {
  const resolvedItems = Array.isArray(quotation?.orderItems) ? quotation.orderItems : []

  const protectionItems = resolvedItems.filter((item) => isProtectionItem(item))
  const regularItems = resolvedItems.filter((item) => !isProtectionItem(item))

  const baseSubtotal = computeBaseSubtotal(regularItems)
  const { subtotal, shipping, tax, couponCode, couponDiscount, displayTotal } = getInvoiceBreakdown(quotation || {})
  const derivedDiscount = deriveBaseDiscount(baseSubtotal, subtotal)

  const currentDate = new Date().toLocaleDateString()
  const quotationDate = quotation?.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : "-"

  return (
    <div ref={ref} className="bg-white pl-8 pr-8 pb-8 max-w-4xl mx-auto font-sans">
      <div className=" text-black rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0" />
        <div className="relative z-10 flex justify-between items-start w-full">
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

          <div className="w-1/2 text-end p-5 rounded-xl backdrop-blur-sm max-w-xs ml-auto">
            <h2 className="text-2xl font-bold mb-1">QUOTATION</h2>
            <div className="text-lg font-semibold mb-1">Quotation: #{quotation?._id?.slice?.(-6)}</div>
            <div className="text-sm">📅 Date: {quotationDate}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border-l-4 pl-2 border-lime-500">
        <h3 className="text-2xl font-bold text-lime-800 mb-2 uppercase tracking-wide">📋 Quotation Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-2">
          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">📦 Shipping Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {quotation?.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {quotation?.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {quotation?.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {quotation?.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {quotation?.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {quotation?.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {quotation?.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-lime-200 rounded-lg px-3 py-1 relative">
            <div className="absolute -top-3 left-3 bg-white px-2">
              <h4 className="text-sm font-bold text-lime-700 uppercase">💳 Billing Address</h4>
            </div>
            <div className="pt-2 space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {quotation?.billingAddress?.name || quotation?.shippingAddress?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {quotation?.billingAddress?.email || quotation?.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {quotation?.billingAddress?.phone || quotation?.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {quotation?.billingAddress?.address || quotation?.shippingAddress?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {quotation?.billingAddress?.city || quotation?.shippingAddress?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {quotation?.billingAddress?.state || quotation?.shippingAddress?.state || "N/A"}
              </p>
              <p>
                <strong>Zip Code:</strong> {quotation?.billingAddress?.zipCode || quotation?.shippingAddress?.zipCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-bold text-lime-800 mb-2 uppercase">🛍️ Quotation Items</h4>
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
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300"
                              style={{ backgroundColor: item.selectedColorData.color?.toLowerCase() || "#9333ea" }}
                            ></span>
                            Color: {item.selectedColorData.color}
                          </div>
                        )}
                        {item.selectedDosData && (
                          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center">💻 OS: {item.selectedDosData.dosType}</div>
                        )}
                        {showDiscount && <div className="text-xs text-gray-500">Base: {formatPrice(basePrice)}</div>}
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm">
                        {showDiscount && <span className="block text-xs text-gray-400 line-through">{formatPrice(basePrice)}</span>}
                        <span className="font-semibold text-gray-900">{formatPrice(itemPrice)}</span>
                      </td>
                      <td className="border border-lime-300 px-3 py-2 text-right text-sm font-semibold">
                        {showDiscount && <span className="block text-xs text-gray-400 font-normal line-through">{formatPrice(baseTotal)}</span>}
                        <span>{formatPrice(lineTotal)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

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
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">{formatPrice(itemPrice)}</td>
                        <td className="border border-blue-300 px-3 py-2 text-right text-sm font-semibold">{formatPrice(lineTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

            {(couponDiscount > 0 || (quotation?.couponCode && quotation?.discountAmount > 0)) && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {couponCode || quotation?.couponCode ? `Coupon (${couponCode || quotation?.couponCode})` : "Coupon Discount"}:
                </span>
                <span className="text-green-600">-{formatPrice(couponDiscount || quotation?.discountAmount || 0)}</span>
              </div>
            )}

            {!isCOD && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">{formatPrice(shipping)}</span>
            </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">VAT:</span>
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
                quotation?.isPaid ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}
            >
              {quotation?.isPaid ? "✅ Paid" : "❌ Unpaid"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">💰 Payment Method:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPaymentMethodBadgeColor(quotation || {})}`}>
              {getPaymentMethodDisplay(quotation || {})}
            </span>
          </div>
          {quotation?.trackingId && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">📦 Tracking ID:</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{quotation.trackingId}</code>
            </div>
          )}
          {quotation?.paidAt && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">✅ Paid At:</span>
              <span className="text-gray-700 text-xs">{new Date(quotation.paidAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {(quotation?.customerNotes || quotation?.notes) && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📝 Special Notes:</h4>
            <p className="text-blue-700 italic">{quotation.customerNotes || quotation.notes}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-end mt-2 opacity-80">🖨️ Printed: {currentDate}</div>
    </div>
  )
})

QuotationPrint.displayName = "QuotationPrint"

export default function RecentQuotation() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [sendingConvert, setSendingConvert] = useState(false)
  const [sendEmailOnConvert, setSendEmailOnConvert] = useState(false)

  const printRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Quotation-${selectedQuotation?._id?.slice?.(-6) || "Document"}`,
  })

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getQuotations()
      setQuotations(Array.isArray(data) ? data : [])
      setError("")
    } catch (e) {
      setError(e?.message || "Failed to load quotations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return quotations
    return quotations.filter((it) => {
      const id = it._id?.slice?.(-6)?.toLowerCase?.() || ""
      const name = it.shippingAddress?.name?.toLowerCase?.() || ""
      const email = it.shippingAddress?.email?.toLowerCase?.() || ""
      return id.includes(q) || name.includes(q) || email.includes(q)
    })
  }, [quotations, search])

  const convertQuotation = async () => {
    if (!selectedQuotation?._id) return
    try {
      setSendingConvert(true)
      const response = await adminAPI.convertQuotation(selectedQuotation._id, {
        sendCustomerEmail: sendEmailOnConvert,
      })
      alert(`Quotation converted to Order #${response?.order?._id?.slice?.(-6) || ""}`)
      setSelectedQuotation(null)
      setSendEmailOnConvert(false)
      fetchQuotations()
    } catch (e) {
      alert(e?.message || "Failed to convert quotation")
    } finally {
      setSendingConvert(false)
    }
  }

  return (
    <div className="ml-64 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recent Quotation</h1>
        <button
          onClick={fetchQuotations}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

      <div className="mb-4 relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by quotation #, customer, email"
          className="pl-9 pr-3 py-2 border rounded w-full"
        />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading quotations...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Quotation ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q._id} className="border-t">
                  <td className="px-4 py-3 font-medium text-blue-700">#{q._id.slice(-6)}</td>
                  <td className="px-4 py-3">
                    <div>{q.shippingAddress?.name || "N/A"}</div>
                    <div className="text-gray-500">{q.shippingAddress?.email || "N/A"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        q.quotationStatus === "Converted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {q.quotationStatus || "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(q.totalPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedQuotation(q)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mr-3"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">No quotations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Quotation #{selectedQuotation._id.slice(-6)}</h2>
              <button onClick={() => setSelectedQuotation(null)} className="text-2xl text-gray-400 hover:text-gray-700">×</button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <h3 className="font-semibold mb-2">Customer Info</h3>
                  <p>Name: {selectedQuotation.shippingAddress?.name || "N/A"}</p>
                  <p>Email: {selectedQuotation.shippingAddress?.email || "N/A"}</p>
                  <p>Phone: {selectedQuotation.shippingAddress?.phone || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p>{selectedQuotation.shippingAddress?.address || "N/A"}</p>
                  <p>{selectedQuotation.shippingAddress?.city || ""} {selectedQuotation.shippingAddress?.state || ""}</p>
                  <p>{selectedQuotation.shippingAddress?.zipCode || ""}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded border overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedQuotation.orderItems || []).map((item, idx) => {
                      const unit = resolveOrderItemSalePrice(item)
                      const qty = Number(item.quantity) || 1
                      return (
                        <tr key={item._id || idx} className="border-t">
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-right">{formatPrice(unit)}</td>
                          <td className="px-3 py-2 text-right">{qty}</td>
                          <td className="px-3 py-2 text-right">{formatPrice(unit * qty)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
                >
                  <Printer size={16} /> Print Quotation
                </button>

                {selectedQuotation.quotationStatus !== "Converted" ? (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={sendEmailOnConvert}
                        onChange={(e) => setSendEmailOnConvert(e.target.checked)}
                      />
                      <span className="inline-flex items-center gap-1"><Mail size={14} /> Send order email</span>
                    </label>
                    <button
                      onClick={convertQuotation}
                      disabled={sendingConvert}
                      className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded disabled:opacity-60"
                    >
                      <Repeat size={16} /> {sendingConvert ? "Converting..." : "Convert to Order"}
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                    Converted to Order #{selectedQuotation.convertedOrderId?._id?.slice?.(-6) || "-"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        {selectedQuotation && <QuotationPrint quotation={selectedQuotation} ref={printRef} />}
      </div>
    </div>
  )
}
