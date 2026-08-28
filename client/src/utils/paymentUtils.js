/**
 * Payment utility functions for displaying payment method information
 */

/**
 * Get the display name for a payment method
 * @param {Object} order - The order object
 * @returns {string} - Display name for the payment method
 */
export const getPaymentMethodDisplay = (order) => {
  const method = order?.actualPaymentMethod || order?.paymentMethod
  switch (method?.toLowerCase()) {
    case 'tabby':
      return 'Tabby'
    case 'tamara':
      return 'Tamara'
    case 'card':
      return 'Pay by Card'
    case 'cod':
    case 'cash on delivery':
      return 'Cash on Delivery'
    case 'credit card':
    case 'debit card':
      return 'Pay by Card'
    default:
      return method || 'Cash on Delivery'
  }
}

/**
 * Get the badge color classes for a payment method
 * @param {Object} order - The order object
 * @returns {string} - Tailwind CSS classes for the badge
 */
export const getPaymentMethodBadgeColor = (order) => {
  const method = order?.actualPaymentMethod || order?.paymentMethod
  switch (method?.toLowerCase()) {
    case 'tabby':
      return 'bg-purple-100 text-purple-800'
    case 'tamara':
      return 'bg-blue-100 text-blue-800'
    case 'card':
    case 'credit card':
    case 'debit card':
      return 'bg-indigo-100 text-indigo-800'
    case 'cod':
    case 'cash on delivery':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get the icon emoji for a payment method
 * @param {Object} order - The order object
 * @returns {string} - Emoji icon for the payment method
 */
export const getPaymentMethodIcon = (order) => {
  const method = order?.actualPaymentMethod || order?.paymentMethod
  switch (method?.toLowerCase()) {
    case 'tabby':
      return '🟣'
    case 'tamara':
      return '🔵'
    case 'card':
    case 'credit card':
    case 'debit card':
      return '💳'
    case 'cod':
    case 'cash on delivery':
      return '💵'
    default:
      return '💰'
  }
}

/**
 * Check if an order is a critical order (attempted card payment but unpaid)
 * @param {Object} order - The order object
 * @returns {boolean} - True if order is critical
 */
export const isCriticalOrder = (order) => {
  if (!order) return false
  
  const method = order.actualPaymentMethod || order.paymentMethod
  const isCardPayment = ['tabby', 'tamara', 'card', 'credit card', 'debit card'].includes(method?.toLowerCase())
  const isUnpaid = !order.isPaid
  
  return isCardPayment && isUnpaid
}

/**
 * Get payment status display with method
 * @param {Object} order - The order object
 * @returns {Object} - Object with status, method, and display info
 */
export const getPaymentInfo = (order) => {
  const method = getPaymentMethodDisplay(order)
  const isPaid = order?.isPaid
  const isCritical = isCriticalOrder(order)
  
  return {
    method,
    isPaid,
    isCritical,
    statusText: isPaid ? 'Paid' : 'Unpaid',
    statusColor: isPaid ? 'bg-green-100 text-green-800' : (isCritical ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'),
    methodColor: getPaymentMethodBadgeColor(order),
    methodIcon: getPaymentMethodIcon(order),
  }
}

/**
 * Resolve the order country name (e.g. "Kuwait", "UAE", "Saudi Arabia")
 * @param {Object} order - The order object
 * @returns {string} - Country name
 */
export const getOrderCountryName = (order) => {
  const currency = order?.currency?.toUpperCase()
  const currencyMap = {
    AED: "UAE",
    SAR: "Saudi Arabia",
    QAR: "Qatar",
    OMR: "Oman",
    BHD: "Bahrain",
    KWD: "Kuwait",
    EGP: "Egypt",
    JOD: "Jordan",
    LBP: "Lebanon",
    IQD: "Iraq",
    TRY: "Turkey",
    GBP: "United Kingdom",
    USD: "United States",
    INR: "India",
    PKR: "Pakistan",
    EUR: "Eurozone",
    CAD: "Canada",
    AUD: "Australia",
    NZD: "New Zealand",
    SGD: "Singapore",
    MYR: "Malaysia",
    THB: "Thailand",
    PHP: "Philippines",
    IDR: "Indonesia",
    CNY: "China",
    JPY: "Japan",
    KRW: "South Korea",
    RUB: "Russia",
    ZAR: "South Africa",
  }

  // Helper to detect country from address state / province
  const detectCountryFromState = (stateStr) => {
    if (!stateStr) return null
    const s = String(stateStr).toUpperCase()
    if (s.includes("HAWALLI") || s.includes("ASIMAH") || s.includes("FARWANIYA") || s.includes("MUBARAK") || s.includes("AHMADI") || s.includes("JAHRA") || s.includes("KUWAIT")) return "Kuwait"
    if (s.includes("DOHA") || s.includes("RAYYAN") || s.includes("WAKRAH") || s.includes("KHOR") || s.includes("DAAYEN") || s.includes("SALAL") || s.includes("SHAMAL") || s.includes("SHAHANIYA") || s.includes("QATAR")) return "Qatar"
    if (s.includes("RIYADH") || s.includes("MAKKAH") || s.includes("JEDDAH") || s.includes("MADINAH") || s.includes("DAMMAM") || s.includes("KHOBAR") || s.includes("QASSIM") || s.includes("ASIR") || s.includes("TABUK") || s.includes("SAUDI")) return "Saudi Arabia"
    if (s.includes("MUSCAT") || s.includes("DHOFAR") || s.includes("MUSANDAM") || s.includes("BURAIMI") || s.includes("BATINAH") || s.includes("OMAN")) return "Oman"
    if (s.includes("MANAMA") || s.includes("MUHARRAQ") || s.includes("RIFFA") || s.includes("BAHRAIN")) return "Bahrain"
    return null
  }

  // Check explicit non-UAE shipping/billing country
  const explicitCountry = order?.shippingAddress?.country || order?.billingAddress?.country
  if (explicitCountry && explicitCountry !== "UAE" && explicitCountry.trim() !== "") {
    return explicitCountry
  }

  // Detect from state / province
  const stateDetected = detectCountryFromState(order?.shippingAddress?.state || order?.billingAddress?.state)
  if (stateDetected) {
    return stateDetected
  }

  if (currency && currency !== "AED" && currencyMap[currency]) {
    return currencyMap[currency]
  }

  return explicitCountry || order?.currency || "UAE"
}

/**
 * Resolve order currency symbol dynamically (e.g. QAR, KWD, SAR, AED)
 * @param {Object} order
 * @returns {string}
 */
export const getOrderCurrencySymbol = (order) => {
  if (order?.currencySymbol && order.currencySymbol !== "AED") {
    return order.currencySymbol
  }
  if (order?.currency && order.currency !== "AED") {
    return order.currency
  }
  const countryName = getOrderCountryName(order)
  if (countryName) {
    const cUpper = String(countryName).toUpperCase()
    if (cUpper.includes("KUWAIT") || cUpper.includes("KW")) return "KWD"
    if (cUpper.includes("QATAR") || cUpper.includes("QA")) return "QAR"
    if (cUpper.includes("SAUDI") || cUpper.includes("SA")) return "SAR"
    if (cUpper.includes("OMAN") || cUpper.includes("OM")) return "OMR"
    if (cUpper.includes("BAHRAIN") || cUpper.includes("BH")) return "BHD"
    if (cUpper.includes("EGYPT") || cUpper.includes("EG")) return "EGP"
  }
  return order?.currencySymbol || order?.currency || "AED"
}

/**
 * Format order price using order's currency / currencySymbol
 * @param {number} price
 * @param {Object} order
 * @returns {string}
 */
export const formatOrderPrice = (price, order) => {
  const symbol = getOrderCurrencySymbol(order)
  return `${symbol} ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

export default {
  getPaymentMethodDisplay,
  getPaymentMethodBadgeColor,
  getPaymentMethodIcon,
  isCriticalOrder,
  getPaymentInfo,
  getOrderCountryName,
  getOrderCurrencySymbol,
  formatOrderPrice,
}
