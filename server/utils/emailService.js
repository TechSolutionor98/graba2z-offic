// import nodemailer from "nodemailer"

// // Create transporter - FIXED: should be createTransport, not createTransporter
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   })
// }

// // Email templates
// const getEmailTemplate = (type, data) => {
//   const baseStyle = `
//     <style>
//       body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
//       .container { max-width: 600px; margin: 0 auto; background-color: white; }
//       .header { background-color: #7CB342; color: white; padding: 20px; text-align: center; }
//       .content { padding: 30px; }
//       .footer { background-color: #f8f8f8; padding: 20px; text-align: center; color: #666; }
//       .button { background-color: #7CB342; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
//       .code { background-color: #f0f0f0; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 3px; border-radius: 5px; margin: 20px 0; }
//       .order-item { border-bottom: 1px solid #eee; padding: 10px 0; }
//       .total { font-weight: bold; font-size: 18px; color: #7CB342; }
//     </style>
//   `

//   switch (type) {
//     case "emailVerification":
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Email Verification</title>
//           ${baseStyle}
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Verify Your Email</h1>
//             </div>
//             <div class="content">
//               <h2>Hello ${data.name || "User"}!</h2>
//               <p>Thank you for registering with Graba2z. Please verify your email address by entering the verification code below:</p>
//               <div class="code">${data.code || "000000"}</div>
//               <p>This code will expire in 10 minutes.</p>
//               <p>If you didn't create an account with us, please ignore this email.</p>
//             </div>
//             <div class="footer">
//               <p>&copy; 2024 Graba2z. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `

//     case "orderConfirmation":
//       const orderItems = Array.isArray(data.orderItems) ? data.orderItems : []
//       const orderItemsHtml = orderItems
//         .map(
//           (item) => `
//         <div class="order-item">
//           <strong>${item.name || "Product"}</strong><br>
//           Quantity: ${item.quantity || 1} × $${item.price || 0}<br>
//           Subtotal: $${(item.quantity || 1) * (item.price || 0)}
//         </div>
//       `,
//         )
//         .join("")

//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Order Confirmation</title>
//           ${baseStyle}
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Order Confirmed!</h1>
//             </div>
//             <div class="content">
//               <h2>Hello ${data.customerName || "Customer"}!</h2>
//               <p>Thank you for your order. Here are the details:</p>
//               <p><strong>Order ID:</strong> ${data.orderNumber || "N/A"}</p>
//               <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
              
//               <h3>Order Items:</h3>
//               ${orderItemsHtml}
              
//               <div class="total">
//                 <p>Total: $${data.totalPrice || 0}</p>
//               </div>
              
//               <p>We'll send you another email when your order ships.</p>
//             </div>
//             <div class="footer">
//               <p>&copy; 2024 Graba2z. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `

//     case "orderStatusUpdate":
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Order Status Update</title>
//           ${baseStyle}
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Order Status Update</h1>
//             </div>
//             <div class="content">
//               <h2>Hello ${data.customerName || "Customer"}!</h2>
//               <p>Your order status has been updated:</p>
//               <p><strong>Order ID:</strong> ${data.orderNumber || "N/A"}</p>
//               <p><strong>New Status:</strong> ${data.status || "Processing"}</p>
//               ${data.trackingId ? `<p><strong>Tracking Number:</strong> ${data.trackingId}</p>` : ""}
//             </div>
//             <div class="footer">
//               <p>&copy; 2024 Graba2z. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `

//     default:
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Graba2z</title>
//           ${baseStyle}
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Graba2z</h1>
//             </div>
//             <div class="content">
//               <p>Thank you for choosing Graba2z!</p>
//             </div>
//             <div class="footer">
//               <p>&copy; 2024 Graba2z. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//   }
// }

// // Generic send email function
// const sendEmail = async (to, subject, html) => {
//   try {
//     const transporter = createTransporter()

//     const mailOptions = {
//       from: `"Graba2z" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     }

//     const result = await transporter.sendMail(mailOptions)
//     console.log("Email sent successfully:", result.messageId)
//     return { success: true, messageId: result.messageId }
//   } catch (error) {
//     console.error("Failed to send email:", error)
//     throw new Error(`Email sending failed: ${error.message}`)
//   }
// }

// // Send verification email
// export const sendVerificationEmail = async (email, name, code) => {
//   try {
//     const html = getEmailTemplate("emailVerification", { name, code })
//     await sendEmail(email, "Verify Your Email - Graba2z", html)
//     return { success: true }
//   } catch (error) {
//     console.error("Failed to send verification email:", error)
//     throw error
//   }
// }

// // Send order placed email (for orderRoutes.js compatibility)
// export const sendOrderPlacedEmail = async (order) => {
//   try {
//     const orderNumber = order._id.toString().slice(-6)
//     const customerName = order.shippingAddress?.name || order.pickupDetails?.name || "Customer"
//     const customerEmail = order.shippingAddress?.email || order.user?.email

//     const html = getEmailTemplate("orderConfirmation", {
//       orderNumber,
//       customerName,
//       orderItems: order.orderItems || [],
//       totalPrice: order.totalPrice,
//     })

//     await sendEmail(customerEmail, `Order Confirmation #${orderNumber} - Graba2z`, html)
//     return { success: true }
//   } catch (error) {
//     console.error("Failed to send order placed email:", error)
//     throw error
//   }
// }

// // Send order status update email
// export const sendOrderStatusUpdateEmail = async (order) => {
//   try {
//     const orderNumber = order._id.toString().slice(-6)
//     const customerName = order.shippingAddress?.name || order.pickupDetails?.name || "Customer"
//     const customerEmail = order.shippingAddress?.email || order.user?.email

//     const html = getEmailTemplate("orderStatusUpdate", {
//       orderNumber,
//       customerName,
//       status: order.status,
//       trackingId: order.trackingId,
//     })

//     const statusMessages = {
//       processing: "Order is Being Processed",
//       confirmed: "Order Confirmed",
//       shipped: "Order Shipped",
//       delivered: "Order Delivered",
//       cancelled: "Order Cancelled",
//     }

//     const subject = `${statusMessages[order.status] || "Order Update"} #${orderNumber} - Graba2z`
//     await sendEmail(customerEmail, subject, html)
//     return { success: true }
//   } catch (error) {
//     console.error("Failed to send order status update email:", error)
//     throw error
//   }
// }

// // Backward compatibility exports
// export const sendOrderNotification = sendOrderStatusUpdateEmail
// export const sendTrackingUpdateEmail = sendOrderStatusUpdateEmail

// export default {
//   sendVerificationEmail,
//   sendOrderPlacedEmail,
//   sendOrderStatusUpdateEmail,
//   sendOrderNotification,
//   sendTrackingUpdateEmail,
// }



//============================Final Code ==========================





import nodemailer from "nodemailer"

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Email templates
const getEmailTemplate = (type, data) => {
  const baseStyle = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        background-color: #f5f5f5; 
        margin: 0; 
        padding: 20px;
      }
      .email-container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: #ffffff; 
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header { 
        background-color: #ffffff; 
        padding: 30px 20px 20px; 
        text-align: center; 
        border-bottom: 1px solid #eee;
      }
      .logo { 
        max-width: 200px; 
        height: auto; 
        margin-bottom: 20px;
      }
      .order-icon {
        width: 80px;
        height: 80px;
        background-color: #2c3e50;
        border-radius: 50%;
        margin: 20px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 30px;
      }
      .content { 
        padding: 30px 20px; 
        background-color: #ffffff;
      }
      .order-number {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        text-align: center;
        margin-bottom: 20px;
      }
      .greeting {
        font-size: 18px;
        text-align: center;
        margin-bottom: 10px;
        color: #333;
      }
      .processing-text {
        font-size: 16px;
        text-align: center;
        color: #666;
        margin-bottom: 30px;
      }
      .action-buttons {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        background-color: #8BC34A;
        color: white;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 25px;
        font-weight: bold;
        font-size: 14px;
        margin: 5px 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .button:hover {
        background-color: #7CB342;
      }
      .product-section {
        margin: 30px 0;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
      }
      .product-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }
      .product-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      .product-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 15px;
        background-color: #f0f0f0;
      }
      .product-details {
        flex: 1;
      }
      .product-name {
        font-weight: bold;
        font-size: 16px;
        color: #333;
        margin-bottom: 5px;
        line-height: 1.4;
      }
      .product-quantity {
        color: #666;
        font-size: 14px;
        margin-bottom: 5px;
      }
      .product-price {
        font-weight: bold;
        color: #8BC34A;
        font-size: 16px;
      }
      .order-summary {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 16px;
      }
      .summary-row.total {
        font-weight: bold;
        font-size: 18px;
        color: #333;
        border-top: 1px solid #ddd;
        padding-top: 10px;
        margin-top: 15px;
      }
      .vat-note {
        font-size: 14px;
        color: #666;
        text-align: right;
        margin-top: 5px;
      }
      .info-section {
        margin: 20px 0;
      }
      .info-title {
        font-weight: bold;
        font-size: 18px;
        color: #333;
        margin-bottom: 15px;
      }
      .info-content {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.6;
      }
      .address-section {
        display: flex;
        gap: 20px;
        margin: 20px 0;
      }
      .address-block {
        flex: 1;
      }
      .footer {
        background-color: #8BC34A;
        color: white;
        padding: 30px 20px;
        text-align: center;
      }
      .footer h3 {
        margin-bottom: 20px;
        font-size: 20px;
      }
      .social-icons {
        margin: 20px 0;
      }
      .social-icon {
        display: inline-block;
        width: 40px;
        height: 40px;
        background-color: white;
        border-radius: 50%;
        margin: 0 10px;
        line-height: 40px;
        text-decoration: none;
        color: #8BC34A;
        font-weight: bold;
      }
      .contact-info {
        margin-top: 20px;
        font-size: 14px;
      }
      .contact-info a {
        color: white;
        text-decoration: underline;
      }
      @media (max-width: 600px) {
        .email-container { margin: 0; border-radius: 0; }
        .content { padding: 20px 15px; }
        .address-section { flex-direction: column; }
        .product-item { flex-direction: column; text-align: center; }
        .product-image { margin: 0 auto 15px; }
        .button { display: block; margin: 10px 0; }
      }
    </style>
  `

  switch (type) {
    case "emailVerification":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          ${baseStyle}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://graba2z.ae/logo.png" alt="Graba2z" class="logo" />
            </div>
            <div class="content">
              <h2>Hello ${data.name || "User"}!</h2>
              <p>Thank you for registering with Graba2z. Please verify your email address by entering the verification code below:</p>
              <div style="background-color: #f0f0f0; padding: 20px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 3px; border-radius: 5px; margin: 20px 0;">
                ${data.code || "000000"}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <h3>Get in Touch</h3>
              <div class="social-icons">
                <a href="#" class="social-icon">f</a>
                <a href="#" class="social-icon">t</a>
                <a href="#" class="social-icon">@</a>
                <a href="#" class="social-icon">in</a>
              </div>
              <div class="contact-info">
                <p><strong>This email was sent by:</strong><br>
                <a href="mailto:order@grabatoz.ae">order@grabatoz.ae</a></p>
                <p><strong>For any questions please send an email to:</strong><br>
                <a href="mailto:support@grabatoz.ae">support@grabatoz.ae</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

    case "orderConfirmation":
      const orderItems = Array.isArray(data.orderItems) ? data.orderItems : []
      const orderItemsHtml = orderItems
        .map(
          (item) => `
        <div class="product-item">
          <img src="${item.product?.image || item.image || "/placeholder.svg?height=80&width=80"}" alt="${item.product?.name || item.name || "Product"}" class="product-image" />
          <div class="product-details">
            <div class="product-name">${item.product?.name || item.name || "Product"}</div>
            <div class="product-quantity">Quantity: ${item.quantity || 1}</div>
            <div class="product-price">${(item.price || 0).toFixed(2)}AED</div>
          </div>
        </div>
      `,
        )
        .join("")

      const subtotal = data.itemsPrice || 0
      const shipping = data.shippingPrice || 0
      const total = data.totalPrice || 0
      const vatAmount = (total * 0.05).toFixed(2) // Assuming 5% VAT

      // Get customer info based on delivery type
      const customerName = data.shippingAddress?.name || data.pickupDetails?.name || data.customerName || "Customer"
      const customerEmail = data.shippingAddress?.email || data.pickupDetails?.email || data.customerEmail || ""
      const customerPhone = data.shippingAddress?.phone || data.pickupDetails?.phone || ""

      const billingAddress = data.shippingAddress || data.pickupDetails || {}
      const shippingAddress = data.deliveryType === "pickup" ? data.pickupDetails : data.shippingAddress

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          ${baseStyle}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://graba2z.ae/logo.png" alt="Graba2z" class="logo" />
              <div class="order-icon">🛒</div>
            </div>
            
            <div class="content">
              <div class="order-number">Order #${data.orderNumber || data._id?.toString().slice(-6) || "N/A"}</div>
              <div class="greeting">Hi ${customerName}, Thank you for your purchase.</div>
              <div class="processing-text">We are processing your order.</div>
              
              <div class="action-buttons">
                <a href="${process.env.FRONTEND_URL || "https://graba2z.ae"}" class="button">Visit Website</a>
                <a href="${process.env.FRONTEND_URL || "https://graba2z.ae"}/track-order" class="button">Track Your Order</a>
              </div>

              ${
                orderItems.length > 0
                  ? `
              <div class="product-section">
                ${orderItemsHtml}
              </div>
              `
                  : ""
              }

              <div class="info-section">
                <div class="info-title">Payment Method</div>
                <div class="info-content">${data.paymentMethod || "Cash on delivery"}</div>
              </div>

              <div class="info-section">
                <div class="info-title">Shipment Method</div>
                <div class="info-content">${data.deliveryType === "pickup" ? "Store Pickup" : "Home Delivery"}</div>
              </div>

              ${
                data.customerNotes
                  ? `
              <div class="info-section">
                <div class="info-title">Note</div>
                <div class="info-content">${data.customerNotes}</div>
              </div>
              `
                  : ""
              }

              <div class="order-summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}AED</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}AED</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}AED</span>
                </div>
                <div class="vat-note">(includes ${vatAmount}AED VAT)</div>
              </div>

              <div class="address-section">
                <div class="address-block">
                  <div class="info-title">Billing Address</div>
                  <div class="info-content">
                    ${billingAddress.name || customerName}<br>
                    ${billingAddress.address || "N/A"}<br>
                    ${billingAddress.city || "N/A"}<br>
                    ${billingAddress.phone || customerPhone}<br>
                    ${billingAddress.email || customerEmail}
                  </div>
                </div>
                
                <div class="address-block">
                  <div class="info-title">${data.deliveryType === "pickup" ? "Pickup Location" : "Shipping Address"}</div>
                  <div class="info-content">
                    ${shippingAddress?.name || customerName}<br>
                    ${shippingAddress?.address || shippingAddress?.location || "N/A"}<br>
                    ${shippingAddress?.city || "N/A"}<br>
                    ${shippingAddress?.phone || customerPhone}
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <h3>Get in Touch</h3>
              <div class="social-icons">
                <a href="https://facebook.com/graba2z" class="social-icon">f</a>
                <a href="https://twitter.com/graba2z" class="social-icon">t</a>
                <a href="https://instagram.com/graba2z" class="social-icon">@</a>
                <a href="https://linkedin.com/company/graba2z" class="social-icon">in</a>
              </div>
              <div class="contact-info">
                <p><strong>This email was sent by:</strong><br>
                <a href="mailto:order@grabatoz.ae">order@grabatoz.ae</a></p>
                <p><strong>For any questions please send an email to:</strong><br>
                <a href="mailto:support@grabatoz.ae">support@grabatoz.ae</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

    case "orderStatusUpdate":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
          ${baseStyle}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://graba2z.ae/logo.png" alt="Graba2z" class="logo" />
              <div class="order-icon">📦</div>
            </div>
            <div class="content">
              <div class="order-number">Order #${data.orderNumber || data._id?.toString().slice(-6) || "N/A"}</div>
              <div class="greeting">Hello ${data.customerName || "Customer"}!</div>
              <div class="processing-text">Your order status has been updated.</div>
              
              <div class="info-section">
                <div class="info-title">New Status</div>
                <div class="info-content" style="font-weight: bold; color: #8BC34A;">${data.status || "Processing"}</div>
              </div>

              ${
                data.trackingId
                  ? `
              <div class="info-section">
                <div class="info-title">Tracking Number</div>
                <div class="info-content">${data.trackingId}</div>
              </div>
              `
                  : ""
              }

              <div class="action-buttons">
                <a href="${process.env.FRONTEND_URL || "https://graba2z.ae"}/track-order" class="button">Track Your Order</a>
              </div>
            </div>
            <div class="footer">
              <h3>Get in Touch</h3>
              <div class="social-icons">
                <a href="https://facebook.com/graba2z" class="social-icon">f</a>
                <a href="https://twitter.com/graba2z" class="social-icon">t</a>
                <a href="https://instagram.com/graba2z" class="social-icon">@</a>
                <a href="https://linkedin.com/company/graba2z" class="social-icon">in</a>
              </div>
              <div class="contact-info">
                <p><strong>This email was sent by:</strong><br>
                <a href="mailto:order@grabatoz.ae">order@grabatoz.ae</a></p>
                <p><strong>For any questions please send an email to:</strong><br>
                <a href="mailto:support@grabatoz.ae">support@grabatoz.ae</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Graba2z</title>
          ${baseStyle}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://graba2z.ae/logo.png" alt="Graba2z" class="logo" />
            </div>
            <div class="content">
              <p>Thank you for choosing Graba2z!</p>
            </div>
            <div class="footer">
              <h3>Get in Touch</h3>
              <div class="social-icons">
                <a href="https://facebook.com/graba2z" class="social-icon">f</a>
                <a href="https://twitter.com/graba2z" class="social-icon">t</a>
                <a href="https://instagram.com/graba2z" class="social-icon">@</a>
                <a href="https://linkedin.com/company/graba2z" class="social-icon">in</a>
              </div>
              <div class="contact-info">
                <p><strong>This email was sent by:</strong><br>
                <a href="mailto:order@grabatoz.ae">order@grabatoz.ae</a></p>
                <p><strong>For any questions please send an email to:</strong><br>
                <a href="mailto:support@grabatoz.ae">support@grabatoz.ae</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
  }
}

// Generic send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Graba2z" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error(`Email sending failed: ${error.message}`)
  }
}

// Send verification email
export const sendVerificationEmail = async (email, name, code) => {
  try {
    const html = getEmailTemplate("emailVerification", { name, code })
    await sendEmail(email, "Verify Your Email - Graba2z", html)
    return { success: true }
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw error
  }
}

// Send order placed email
export const sendOrderPlacedEmail = async (order) => {
  try {
    const orderNumber = order._id.toString().slice(-6)
    const customerName = order.shippingAddress?.name || order.pickupDetails?.name || "Customer"
    const customerEmail = order.shippingAddress?.email || order.pickupDetails?.email || order.user?.email

    if (!customerEmail) {
      console.error("No customer email found for order:", order._id)
      return { success: false, error: "No customer email" }
    }

    const html = getEmailTemplate("orderConfirmation", {
      ...order.toObject(),
      orderNumber,
      customerName,
      customerEmail,
    })

    await sendEmail(customerEmail, `Order Confirmation #${orderNumber} - Graba2z`, html)
    return { success: true }
  } catch (error) {
    console.error("Failed to send order placed email:", error)
    throw error
  }
}

// Send order status update email
export const sendOrderStatusUpdateEmail = async (order) => {
  try {
    const orderNumber = order._id.toString().slice(-6)
    const customerName = order.shippingAddress?.name || order.pickupDetails?.name || order.user?.name || "Customer"
    const customerEmail = order.shippingAddress?.email || order.pickupDetails?.email || order.user?.email

    if (!customerEmail) {
      console.error("No customer email found for order:", order._id)
      return { success: false, error: "No customer email" }
    }

    const html = getEmailTemplate("orderStatusUpdate", {
      ...order.toObject(),
      orderNumber,
      customerName,
    })

    const statusMessages = {
      processing: "Order is Being Processed",
      confirmed: "Order Confirmed",
      shipped: "Order Shipped",
      delivered: "Order Delivered",
      cancelled: "Order Cancelled",
    }

    const subject = `${statusMessages[order.status] || "Order Update"} #${orderNumber} - Graba2z`
    await sendEmail(customerEmail, subject, html)
    return { success: true }
  } catch (error) {
    console.error("Failed to send order status update email:", error)
    throw error
  }
}

// Backward compatibility exports
export const sendOrderNotification = sendOrderStatusUpdateEmail
export const sendTrackingUpdateEmail = sendOrderStatusUpdateEmail

export default {
  sendVerificationEmail,
  sendOrderPlacedEmail,
  sendOrderStatusUpdateEmail,
  sendOrderNotification,
  sendTrackingUpdateEmail,
}
