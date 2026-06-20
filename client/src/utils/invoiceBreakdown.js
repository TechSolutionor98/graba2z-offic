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

  // Detect if this is a COD order
  const isCOD =
    order.actualPaymentMethod === "cod" ||
    order.paymentMethod === "cod" ||
    order.paymentMethod === "Cash on Delivery"

  // COD fees: read explicitly stored values if present
  const codFee = Number(order.codFee || 0);
  const codShippingFee = Number(order.codShippingFee || 0);

  const vatRate = 0.05
  const derivedVat = subtotal > 0 ? Number((subtotal * vatRate).toFixed(2)) : 0
  const vat = tax > 0 ? tax : derivedVat

  const paymentCharges = Array.isArray(order.paymentCharges) ? order.paymentCharges : []
  const hasPaymentCharges = paymentCharges.length > 0
  const paymentChargesTotal = paymentCharges.reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0)

  const calculatedTotal = hasPaymentCharges 
    ? subtotal + shipping + paymentChargesTotal - couponDiscount
    : subtotal + shipping + codFee + codShippingFee - couponDiscount
    
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
    codFee,
    codShippingFee,
    isCOD,
    paymentCharges,
    hasPaymentCharges,
    paymentChargesTotal
  }
}

