import express from "express"
import axios from "axios"
import crypto from "crypto"
import Order from "../models/orderModel.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// Generate UUID without external dependency
function generateUUID() {
  return crypto.randomUUID()
}

// Test route to check if payment routes are working
router.get("/test", (req, res) => {
  res.json({
    message: "Payment routes are working!",
    timestamp: new Date().toISOString(),
    environment: {
      hasNgeniusApiUrl: !!process.env.NGENIUS_API_URL,
      hasNgeniusApiKey: !!process.env.NGENIUS_API_KEY,
      hasOutletId: !!process.env.NG_OUTLET_ID,
      hasClientUrl: !!process.env.CLIENT_URL,
    },
  })
})

// Debug endpoint to list all available outlets
router.get("/ngenius/outlets", protect, async (req, res) => {
  try {
    console.log("Fetching all available outlets...")

    const apiKey = process.env.NGENIUS_API_KEY
    let base64Auth

    if (apiKey.match(/^[A-Za-z0-9+/]+=*$/)) {
      base64Auth = apiKey
    } else {
      const authString = `${apiKey}:`
      base64Auth = Buffer.from(authString).toString("base64")
    }

    // Get access token
    const tokenRes = await axios.post(`${process.env.NGENIUS_API_URL}/identity/auth/access-token`, null, {
      headers: {
        Authorization: `Basic ${base64Auth}`,
        "Content-Type": "application/vnd.ni-identity.v1+json",
      },
    })

    const accessToken = tokenRes.data.access_token

    // List all outlets
    const outletsRes = await axios.get(`${process.env.NGENIUS_API_URL}/transactions/outlets`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.ni-payment.v2+json",
      },
    })

    console.log("Available outlets:", outletsRes.data)

    res.json({
      success: true,
      message: "Available outlets retrieved successfully",
      currentOutletId: process.env.NG_OUTLET_ID,
      outlets: outletsRes.data._embedded?.outlets || outletsRes.data,
      totalOutlets: outletsRes.data._embedded?.outlets?.length || 0,
    })
  } catch (err) {
    console.error("Failed to fetch outlets:", err.response?.data || err.message)
    res.status(500).json({
      error: "Failed to fetch outlets",
      details: err.response?.data || err.message,
      status: err.response?.status,
    })
  }
})

// Test N-Genius credentials and outlet access
router.get("/ngenius/test", protect, async (req, res) => {
  try {
    console.log("Testing N-Genius credentials and outlet access...")

    // Check environment variables
    const requiredVars = ["NGENIUS_API_URL", "NGENIUS_API_KEY", "NG_OUTLET_ID"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return res.status(400).json({
        error: "Missing environment variables",
        missing: missingVars,
        current: {
          NGENIUS_API_URL: process.env.NGENIUS_API_URL || "NOT SET",
          NGENIUS_API_KEY: process.env.NGENIUS_API_KEY ? "SET" : "NOT SET",
          NG_OUTLET_ID: process.env.NG_OUTLET_ID || "NOT SET",
        },
      })
    }

    // Determine if API key is already base64 encoded or raw
    const apiKey = process.env.NGENIUS_API_KEY
    let base64Auth

    if (apiKey.match(/^[A-Za-z0-9+/]+=*$/)) {
      console.log("API key appears to be base64 encoded already")
      base64Auth = apiKey
    } else {
      console.log("API key appears to be raw, encoding it...")
      const authString = `${apiKey}:`
      base64Auth = Buffer.from(authString).toString("base64")
    }

    // Test access token request
    const tokenRes = await axios.post(`${process.env.NGENIUS_API_URL}/identity/auth/access-token`, null, {
      headers: {
        Authorization: `Basic ${base64Auth}`,
        "Content-Type": "application/vnd.ni-identity.v1+json",
      },
    })

    const accessToken = tokenRes.data.access_token

    // Test outlet access by trying to get outlet information
    try {
      const outletRes = await axios.get(
        `${process.env.NGENIUS_API_URL}/transactions/outlets/${process.env.NG_OUTLET_ID}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.ni-payment.v2+json",
          },
        },
      )

      res.json({
        success: true,
        message: "N-Genius credentials and outlet access are valid",
        hasAccessToken: true,
        outletAccessible: true,
        apiUrl: process.env.NGENIUS_API_URL,
        outletId: process.env.NG_OUTLET_ID,
        apiKeyLength: process.env.NGENIUS_API_KEY.length,
        keyFormat: apiKey.match(/^[A-Za-z0-9+/]+=*$/) ? "base64" : "raw",
        outletInfo: {
          name: outletRes.data.name || "N/A",
          currency: outletRes.data.currency || "N/A",
          status: outletRes.data.status || "N/A",
          capabilities: outletRes.data.capabilities || [],
        },
      })
    } catch (outletErr) {
      res.json({
        success: false,
        message: "N-Genius credentials are valid but outlet access failed",
        hasAccessToken: true,
        outletAccessible: false,
        error: "Outlet access denied - check your outlet ID and permissions",
        outletError: outletErr.response?.data || outletErr.message,
        apiUrl: process.env.NGENIUS_API_URL,
        outletId: process.env.NG_OUTLET_ID,
        suggestion: "Try visiting /api/payment/ngenius/outlets to see all available outlets",
      })
    }
  } catch (err) {
    console.error("N-Genius credentials test failed:", err.response?.data || err.message)
    res.status(500).json({
      error: "N-Genius credentials test failed",
      details: err.response?.data || err.message,
      status: err.response?.status,
    })
  }
})

// Tamara Payment Routes
router.post("/tamara/checkout", protect, async (req, res) => {
  try {
    const tamaraConfig = {
      headers: {
        Authorization: `Bearer ${process.env.TAMARA_API_KEY}`,
        "Content-Type": "application/json",
      },
    }

    const tamaraResponse = await axios.post(`${process.env.TAMARA_API_URL}/checkout`, req.body, tamaraConfig)

    res.json(tamaraResponse.data)
  } catch (error) {
    console.error("Tamara payment error:", error.response?.data || error.message)
    res.status(500).json({
      message: "Tamara payment failed",
      error: error.response?.data || error.message,
    })
  }
})

router.post("/tamara/webhook", async (req, res) => {
  try {
    const { order_id, order_status, payment_status } = req.body

    // Find and update order
    const order = await Order.findOne({ "paymentResult.tamara_order_id": order_id })
    if (order) {
      order.paymentResult = {
        ...order.paymentResult,
        status: payment_status,
        update_time: new Date().toISOString(),
      }
      order.isPaid = payment_status === "approved"
      order.paidAt = payment_status === "approved" ? new Date() : null
      await order.save()
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error("Tamara webhook error:", error)
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

// Tabby Payment Routes
router.post("/tabby/sessions", protect, async (req, res) => {
  try {
    const tabbyConfig = {
      headers: {
        Authorization: `Bearer ${process.env.TABBY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }

    const tabbyResponse = await axios.post(`${process.env.TABBY_API_URL}/api/v2/checkout`, req.body, tabbyConfig)

    res.json(tabbyResponse.data)
  } catch (error) {
    console.error("Tabby payment error:", error.response?.data || error.message)
    res.status(500).json({
      message: "Tabby payment failed",
      error: error.response?.data || error.message,
    })
  }
})

router.post("/tabby/webhook", async (req, res) => {
  try {
    const { id, status, order } = req.body

    // Find and update order
    const dbOrder = await Order.findOne({ "paymentResult.tabby_payment_id": id })
    if (dbOrder) {
      dbOrder.paymentResult = {
        ...dbOrder.paymentResult,
        status: status,
        update_time: new Date().toISOString(),
      }
      dbOrder.isPaid = status === "AUTHORIZED"
      dbOrder.paidAt = status === "AUTHORIZED" ? new Date() : null
      await dbOrder.save()
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error("Tabby webhook error:", error)
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

// N-Genius Payment Routes - SIMPLIFIED VERSION TO WORK AROUND OUTLET ISSUE
router.post("/ngenius", protect, async (req, res) => {
  console.log("=== N-Genius Payment Request Started ===")
  console.log("Request body:", req.body)

  const { order_id, amount } = req.body

  if (!amount) {
    console.log("❌ Missing amount in request")
    return res.status(400).json({ error: "Missing amount" })
  }

  const generatedOrderId = order_id || generateUUID()
  console.log("✅ Generated Order ID:", generatedOrderId)

  try {
    // Check environment variables
    const requiredVars = {
      NGENIUS_API_URL: process.env.NGENIUS_API_URL,
      NGENIUS_API_KEY: process.env.NGENIUS_API_KEY,
      NG_OUTLET_ID: process.env.NG_OUTLET_ID,
    }

    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      console.error("❌ Missing environment variables:", missingVars)
      return res.status(500).json({
        error: "Missing N-Genius configuration",
        missing: missingVars,
      })
    }

    console.log("✅ All environment variables present")
    console.log("API URL:", process.env.NGENIUS_API_URL)
    console.log("Outlet ID:", process.env.NG_OUTLET_ID)

    // Step 1: Get access token
    console.log("🔑 Step 1: Getting access token...")

    const apiKey = process.env.NGENIUS_API_KEY
    let base64Auth

    if (apiKey.match(/^[A-Za-z0-9+/]+=*$/)) {
      console.log("API key appears to be base64 encoded already, using directly")
      base64Auth = apiKey
    } else {
      console.log("API key appears to be raw, encoding as 'apikey:'")
      const authString = `${apiKey}:`
      base64Auth = Buffer.from(authString).toString("base64")
    }

    const tokenRes = await axios.post(`${process.env.NGENIUS_API_URL}/identity/auth/access-token`, null, {
      headers: {
        Authorization: `Basic ${base64Auth}`,
        "Content-Type": "application/vnd.ni-identity.v1+json",
      },
      timeout: 30000,
    })

    console.log("✅ Access token received successfully")
    const accessToken = tokenRes.data.access_token

    // Step 2: Try to get all outlets first to find the correct one
    console.log("🔍 Step 2: Checking available outlets...")

    try {
      const outletsRes = await axios.get(`${process.env.NGENIUS_API_URL}/transactions/outlets`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.ni-payment.v2+json",
        },
        timeout: 30000,
      })

      console.log("Available outlets:", JSON.stringify(outletsRes.data, null, 2))

      const outlets = outletsRes.data._embedded?.outlets || outletsRes.data
      const currentOutlet = outlets.find((outlet) => outlet.id === process.env.NG_OUTLET_ID)

      if (!currentOutlet) {
        console.error("❌ Current outlet ID not found in available outlets")
        console.log(
          "Available outlet IDs:",
          outlets.map((o) => o.id),
        )

        return res.status(400).json({
          error: "Outlet ID not found",
          message: "Your configured outlet ID is not available in your account",
          configuredOutletId: process.env.NG_OUTLET_ID,
          availableOutlets: outlets.map((o) => ({
            id: o.id,
            name: o.name,
            currency: o.currency,
            status: o.status,
          })),
          suggestion: "Update your NG_OUTLET_ID in .env file with one of the available outlet IDs",
        })
      }

      console.log("✅ Found outlet:", currentOutlet.name, "Status:", currentOutlet.status)

      if (currentOutlet.status !== "ACTIVE") {
        return res.status(400).json({
          error: "Outlet not active",
          message: `Your outlet status is ${currentOutlet.status}. It needs to be ACTIVE to process payments.`,
          outletInfo: currentOutlet,
        })
      }
    } catch (outletsErr) {
      console.error("❌ Failed to fetch outlets:", outletsErr.response?.data || outletsErr.message)
    }

    // Step 3: Create payment order with minimal required fields
    console.log("💳 Step 3: Creating payment order...")
    const reference = `ORDER-${generatedOrderId}-${Date.now()}`

    // Use minimal payload to avoid validation issues
    const paymentOrderData = {
      action: "SALE",
      amount: {
        currencyCode: "AED",
        value: Math.round(amount * 100),
      },
      merchantOrderReference: reference,
      merchantAttributes: {
        redirectUrl: `${process.env.CLIENT_URL || "https://www.graba2z.ae"}/orders?success=true&orderId=${generatedOrderId}`,
        cancelUrl: `${process.env.CLIENT_URL || "https://www.graba2z.ae"}/checkout?error=payment_cancelled`,
      },
    }

    console.log("Payment order data:", JSON.stringify(paymentOrderData, null, 2))

    const paymentRes = await axios.post(
      `${process.env.NGENIUS_API_URL}/transactions/outlets/${process.env.NG_OUTLET_ID}/orders`,
      paymentOrderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/vnd.ni-payment.v2+json",
          Accept: "application/vnd.ni-payment.v2+json",
        },
        timeout: 30000,
      },
    )

    console.log("✅ Payment order created successfully")
    console.log("Payment response:", JSON.stringify(paymentRes.data, null, 2))

    const paymentUrl = paymentRes.data._links?.payment?.href

    if (!paymentUrl) {
      console.error("❌ No payment URL in response")
      return res.status(500).json({
        error: "No payment URL received from N-Genius",
        responseData: paymentRes.data,
      })
    }

    console.log("✅ Payment URL:", paymentUrl)
    console.log("=== N-Genius Payment Request Completed Successfully ===")

    res.json({
      success: true,
      paymentUrl,
      orderReference: reference,
      ngeniusOrderId: paymentRes.data.reference,
    })
  } catch (err) {
    console.error("❌ N-Genius Payment Error:")
    console.error("Error message:", err.message)
    console.error("Response status:", err.response?.status)
    console.error("Response data:", JSON.stringify(err.response?.data, null, 2))

    let errorMessage = "Failed to initiate N-Genius payment"
    let statusCode = 500

    if (err.response?.status === 403) {
      errorMessage = "Access denied to outlet. Please check:"
      const suggestions = [
        "1. Verify your outlet ID is correct",
        "2. Ensure your outlet is ACTIVE status",
        "3. Check if your outlet has payment processing permissions",
        "4. Verify you're using the correct API environment (sandbox vs live)",
      ]

      return res.status(403).json({
        error: errorMessage,
        suggestions,
        details: err.response?.data,
        configuredOutletId: process.env.NG_OUTLET_ID,
        apiUrl: process.env.NGENIUS_API_URL,
        helpEndpoint: "Visit /api/payment/ngenius/outlets to see available outlets",
      })
    } else if (err.response?.status === 400) {
      errorMessage = "Invalid request to N-Genius API"
      statusCode = 400
    } else if (err.response?.status === 401) {
      errorMessage = "Unauthorized - your N-Genius API key is invalid"
      statusCode = 401
    }

    console.log("=== N-Genius Payment Request Failed ===")

    res.status(statusCode).json({
      error: errorMessage,
      details: err.response?.data || err.message,
      status: err.response?.status,
    })
  }
})

// Payment Verification
router.post("/verify", protect, async (req, res) => {
  const { paymentRef } = req.body

  if (!paymentRef) {
    return res.status(400).json({ error: "Missing paymentRef" })
  }

  try {
    const apiKey = process.env.NGENIUS_API_KEY
    let base64Auth

    if (apiKey.match(/^[A-Za-z0-9+/]+=*$/)) {
      base64Auth = apiKey
    } else {
      const authString = `${apiKey}:`
      base64Auth = Buffer.from(authString).toString("base64")
    }

    const tokenRes = await axios.post(`${process.env.NGENIUS_API_URL}/identity/auth/access-token`, null, {
      headers: {
        Authorization: `Basic ${base64Auth}`,
        "Content-Type": "application/vnd.ni-identity.v1+json",
      },
    })

    const accessToken = tokenRes.data.access_token

    const verifyRes = await axios.get(`${process.env.NGENIUS_API_URL}/transactions/${paymentRef}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.ni-payment.v2+json",
      },
    })

    const status = verifyRes.data.state

    res.json({
      success: status === "CAPTURED",
      status,
      paymentData: verifyRes.data,
    })
  } catch (err) {
    console.error("N-Genius Verify Error:", err.response?.data || err.message)
    res.status(500).json({ error: "Failed to verify payment" })
  }
})

// N-Genius webhook
router.post("/ngenius/webhook", async (req, res) => {
  try {
    const { orderReference, state, amount, paymentRef } = req.body

    console.log("N-Genius webhook received:", req.body)

    // Find and update order based on the order reference
    const order = await Order.findOne({
      $or: [
        { "paymentResult.ngenius_order_ref": orderReference },
        { "paymentResult.merchantOrderReference": orderReference },
      ],
    })

    if (order) {
      order.paymentResult = {
        ...order.paymentResult,
        status: state,
        paymentRef: paymentRef,
        update_time: new Date().toISOString(),
        ngenius_order_ref: orderReference,
      }

      order.isPaid = state === "CAPTURED"
      order.paidAt = state === "CAPTURED" ? new Date() : null

      // Update order status based on payment status
      if (state === "CAPTURED") {
        order.status = "Confirmed"
      } else if (state === "FAILED" || state === "CANCELLED") {
        order.status = "Cancelled"
        order.cancelReason = `Payment ${state.toLowerCase()}`
      }

      await order.save()
      console.log("Order updated successfully:", order._id)
    } else {
      console.log("Order not found for reference:", orderReference)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error("N-Genius webhook error:", error)
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

export default router
