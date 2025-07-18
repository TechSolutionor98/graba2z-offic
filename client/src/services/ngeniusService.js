import axios from "axios"
import config from "../config/config"

class NgeniusService {
  constructor() {
    this.baseURL = config.API_URL
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Initiate N-Genius payment
  async initiatePayment(orderData) {
    try {
      const response = await axios.post(`${this.baseURL}/api/payments/ngenius/orders`, orderData, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error("N-Genius initiate payment error:", error)
      throw new Error(error.response?.data?.message || "Failed to initiate payment")
    }
  }

  // Verify payment status
  async verifyPayment(paymentRef) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/ngenius/verify`,
        { paymentRef },
        {
          headers: this.getAuthHeaders(),
        },
      )
      return response.data
    } catch (error) {
      console.error("N-Genius verify payment error:", error)
      throw new Error(error.response?.data?.message || "Failed to verify payment")
    }
  }

  // Handle payment callback (for success/failure pages)
  async handlePaymentCallback(urlParams) {
    const paymentRef = urlParams.get("ref")
    const orderId = urlParams.get("orderId")

    if (!paymentRef) {
      throw new Error("Payment reference not found")
    }

    try {
      const verificationResult = await this.verifyPayment(paymentRef)

      return {
        success: verificationResult.success,
        status: verificationResult.status,
        orderId: orderId,
        paymentData: verificationResult.paymentData,
      }
    } catch (error) {
      console.error("Payment callback handling error:", error)
      throw error
    }
  }
}

export default new NgeniusService()
