import { computeSaleSubtotal } from "./orderPricing"

export function getInvoiceBreakdown(order = {}) {
  let subtotal = Number(order.itemsPrice || 0)

  if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
    const calculatedSubtotal = computeSaleSubtotal(order.orderItems)

    if (calculatedSubtotal > subtotal) {
      subtotal = calculatedSubtotal
    }
  }

  const shipping = Number(order.shippingPrice || 0)
  const tax = Number(order.taxPrice || 0)
  const storedTotal = Number(order.totalPrice || 0)

  const couponCode = (order.couponCode || "").trim()
  const rawDiscount = Number(order.discountAmount || 0)

  const hasActualCoupon = couponCode.length > 0 || rawDiscount > 0
  const couponDiscount = hasActualCoupon ? rawDiscount : 0
  const manualDiscount = 0

  const vatRate = 0.05
  const derivedVat = subtotal > 0 ? Number((subtotal * vatRate).toFixed(2)) : 0
  const vat = tax > 0 ? tax : derivedVat

  const calculatedTotal = subtotal + shipping - couponDiscount
  const displayTotal = calculatedTotal > storedTotal ? calculatedTotal : storedTotal

  return {
    subtotal,
    shipping,
    tax: vat,
    total: displayTotal,
    manualDiscount,
    couponDiscount,
    couponCode,
    hasCoupon: hasActualCoupon && couponDiscount > 0,
    displaySubtotal: subtotal,
    displayTotal,
  }
}
