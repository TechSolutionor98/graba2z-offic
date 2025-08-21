"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const orderId = urlParams.get("orderId") || urlParams.get("order_id")
    const total = urlParams.get("total") || urlParams.get("amount")
    const paymentMethod = urlParams.get("payment_method") || "online_payment"

    if (orderId) {
      // Get cart items from localStorage for detailed tracking
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]")

      // Enhanced purchase event with detailed ecommerce data
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: orderId,
          affiliation: "Graba2z Online Store",
          currency: "AED",
          value: Number.parseFloat(total) || 0,
          tax: 0, // VAT is included in prices
          shipping: 0, // Will be calculated based on order
          payment_type: paymentMethod,
          items: cartItems.map((item) => ({
            item_id: item._id,
            item_name: item.name,
            item_category: item.parentCategory?.name || item.category?.name || "Uncategorized",
            item_brand: item.brand?.name || "Unknown",
            price: item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price,
            quantity: item.quantity,
          })),
        },
      })

      console.log("Enhanced purchase tracked:", orderId, "Items:", cartItems.length) // For debugging

      // Clear cart after successful purchase tracking
      localStorage.removeItem("cart")
    }
  }, [location])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-lime-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-lime-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-lime-700 mb-2">Payment Successful!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Thank you for your purchase. Your order has been placed and payment was successful.
      </p>
      <div className="flex gap-4">
        <button onClick={() => navigate("/")} className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-6 py-3">
          Go to Home
        </button>
        <button
          onClick={() => navigate("/orders")}
          className="bg-gray-200 hover:bg-gray-300 text-lime-700 rounded-lg px-6 py-3"
        >
          View My Orders
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess
