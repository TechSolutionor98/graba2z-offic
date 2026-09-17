// Nothing reaches a customer's inbox unless an admin says so. The server treats
// every notification as opt-in, and this is the single question the admin is
// asked before one goes out -- one wording, one behaviour, on every screen that
// can trigger a mail.

const refOf = (order = {}) => {
  const ref = order?.trackingId || order?._id || ""
  return ref ? `#${String(ref).slice(-6)}` : "This order"
}

const recipientOf = (order = {}) =>
  order?.shippingAddress?.email || order?.user?.email || order?.pickupDetails?.email || ""

/**
 * Ask whether to email the customer about a change that is about to be saved.
 *
 * The change itself always goes ahead -- only the email is in question. Answering
 * Cancel updates the record quietly.
 *
 * @param {string} change  What is changing, in the admin's words -- "Delivered",
 *                         "Tracking number added", "Moved to Orders"
 * @param {Object} order   The order or quotation being changed
 * @returns {boolean}      true when the admin wants the email sent
 */
export const askToEmailCustomer = (change, order) => {
  const recipient = recipientOf(order)

  // No address on file means there is nothing to send and nothing to decide, so
  // don't interrupt the admin with a dialog that cannot do anything.
  if (!recipient) return false

  return window.confirm(
    `${refOf(order)} → ${change}\n\n` +
      `Email ${recipient} about this?\n\n` +
      `OK — save and send the email\n` +
      `Cancel — save quietly, no email`,
  )
}

/**
 * The same question for a bulk status change, asked once for the batch.
 *
 * Asking per order would mean fifty dialogs for a fifty-order update, so the
 * admin answers once and the answer applies to all of them. Orders in the
 * batch with no email on file are simply skipped by the server.
 *
 * @param {string} change  The status every selected order is moving to
 * @param {number} count   How many orders are in the batch
 * @returns {boolean}      true when the admin wants the emails sent
 */
export const askToEmailCustomerBulk = (change, count) => {
  const orders = Number(count) || 0
  if (orders < 1) return false

  return window.confirm(
    `${orders} ${orders === 1 ? "order" : "orders"} → ${change}\n\n` +
      `Email ${orders === 1 ? "the customer" : "all these customers"} about it?\n\n` +
      `OK — save and send ${orders === 1 ? "the email" : `${orders} emails`}\n` +
      `Cancel — save quietly, no emails`,
  )
}
