import express from "express"
import axios from "axios"
import Order from "../models/orderModel.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

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

// N-Genius Payment Routes
router.post("/ngenius/orders", protect, async (req, res) => {
  try {
    // First, get access token
    const authResponse = await axios.post(
      `${process.env.NGENIUS_API_URL}/identity/auth/access-token`,
      {
        realmName: process.env.NGENIUS_REALM,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.NGENIUS_API_KEY}:${process.env.NGENIUS_API_SECRET}`).toString("base64")}`,
          "Content-Type": "application/vnd.ni-identity.v1+json",
        },
      },
    )

    const accessToken = authResponse.data.access_token

    // Create payment order
    const orderResponse = await axios.post(
      `${process.env.NGENIUS_API_URL}/transactions/outlets/${process.env.NGENIUS_OUTLET_ID}/orders`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/vnd.ni-payment.v2+json",
          Accept: "application/vnd.ni-payment.v2+json",
        },
      },
    )

    res.json(orderResponse.data)
  } catch (error) {
    console.error("N-Genius payment error:", error.response?.data || error.message)
    res.status(500).json({
      message: "N-Genius payment failed",
      error: error.response?.data || error.message,
    })
  }
})

router.post("/ngenius/webhook", async (req, res) => {
  try {
    const { orderReference, state, amount } = req.body

    // Find and update order
    const order = await Order.findOne({ "paymentResult.ngenius_order_ref": orderReference })
    if (order) {
      order.paymentResult = {
        ...order.paymentResult,
        status: state,
        update_time: new Date().toISOString(),
      }
      order.isPaid = state === "PURCHASED"
      order.paidAt = state === "PURCHASED" ? new Date() : null
      await order.save()
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error("N-Genius webhook error:", error)
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

export default router
