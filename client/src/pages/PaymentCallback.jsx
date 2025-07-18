"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import ngeniusService from "../services/ngeniusService"

const PaymentCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState("processing") // processing, success, failed
  const [message, setMessage] = useState("Processing your payment...")
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const result = await ngeniusService.handlePaymentCallback(searchParams)

        if (result.success) {
          setStatus("success")
          setMessage("Payment successful! Your order has been confirmed.")
          setOrderDetails(result)

          // Redirect to orders page after 3 seconds
          setTimeout(() => {
            navigate(`/orders?success=true&orderId=${result.orderId}`)
          }, 3000)
        } else {
          setStatus("failed")
          setMessage("Payment failed. Please try again or contact support.")

          // Redirect to checkout after 5 seconds
          setTimeout(() => {
            navigate("/checkout?error=payment_failed")
          }, 5000)
        }
      } catch (error) {
        console.error("Payment callback error:", error)
        setStatus("failed")
        setMessage("An error occurred while processing your payment. Please contact support.")

        // Redirect to checkout after 5 seconds
        setTimeout(() => {
          navigate("/checkout?error=payment_error")
        }, 5000)
      }
    }

    handlePaymentCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "processing" && (
          <>
            <div className="mb-6">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            {orderDetails?.orderId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Order ID:</strong> {orderDetails.orderId}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">Redirecting to your orders...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mb-6">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Contact Support
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
