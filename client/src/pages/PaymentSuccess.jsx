import React from "react"
import { useNavigate } from "react-router-dom"

const PaymentSuccess = () => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-lime-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-lime-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-lime-700 mb-2">Payment Successful!</h1>
      <p className="text-lg text-gray-700 mb-6">Thank you for your purchase. Your order has been placed and payment was successful.</p>
      <div className="flex gap-4">
        <button onClick={() => navigate("/")} className="bg-lime-500 hover:bg-lime-600 text-white rounded-lg px-6 py-3">Go to Home</button>
        <button onClick={() => navigate("/orders")} className="bg-gray-200 hover:bg-gray-300 text-lime-700 rounded-lg px-6 py-3">View My Orders</button>
      </div>
    </div>
  )
}

export default PaymentSuccess 