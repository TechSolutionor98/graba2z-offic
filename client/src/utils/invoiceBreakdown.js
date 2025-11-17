export function getInvoiceBreakdown(order = {}) {
  const subtotal = Number(order.itemsPrice || 0)
  const shipping = Number(order.shippingPrice || 0)
  const tax = Number(order.taxPrice || 0)
  const total = Number(order.totalPrice || 0)
  const rawDiscount = Number(order.discountAmount || 0)
  const fallbackDiscount = Math.max(0, subtotal + shipping + tax - total)
  const resolvedDiscount = rawDiscount > 0 ? rawDiscount : fallbackDiscount
  const couponCode = (order.couponCode || "").trim()
  const couponDiscount = couponCode ? resolvedDiscount : 0
  const manualDiscount = couponCode ? 0 : resolvedDiscount

  const vatRate = 0.05
  const derivedVat = total > 0 ? Number((total * vatRate).toFixed(2)) : 0
  const vat = tax > 0 ? tax : derivedVat

  return {
    subtotal,
    shipping,
    tax: vat,
    total,
    manualDiscount,
    couponDiscount,
    couponCode,
  }
}
