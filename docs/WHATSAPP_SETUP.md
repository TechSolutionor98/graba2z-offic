# WhatsApp — setup

Order notifications and a support inbox, over **Meta's official WhatsApp Business
Platform** (the Cloud API).

Everything the shop owner touches lives in **Admin → WhatsApp**. This file covers
the one-time work that happens outside the app, in Meta's dashboard.

---

## Why the official platform

Tools that log in by scanning a QR code, the way WhatsApp Web does, make the
server pretend to be a linked phone. That breaks WhatsApp's terms, and it — not
sending volume — is what gets business numbers banned. A ban is permanent in
practice, appeals almost never succeed, and the number lost is the one printed on
the invoices and the website.

The Cloud API costs a little per conversation and needs a one-time approval. It
cannot get the number banned for being automated. Nothing in this codebase talks
to WhatsApp any other way.

---

## One-time setup in Meta

1. **Create the app.** developers.facebook.com → My Apps → Create App → Business.
2. **Add WhatsApp** to the app, and attach the business phone number. The number
   must not be registered to the normal WhatsApp or WhatsApp Business phone app.
3. **Phone number ID** — WhatsApp → API Setup. Copy it.
4. **Access token** — Business Settings → System Users → create one with the
   `whatsapp_business_messaging` permission and generate a *permanent* token. The
   24-hour test token on the API Setup page is for trying things out only.
5. **App secret** — App dashboard → Settings → Basic.
6. Paste all four into **Admin → WhatsApp → Connection**, invent a **verify
   token** (any phrase), and save.
7. **Register the webhook.** WhatsApp → Configuration → Edit:
   - Callback URL: the address shown on the Connection tab
     (`https://<your api host>/api/whatsapp/webhook`)
   - Verify token: the phrase from step 6
   - Subscribe to the **`messages`** field.

   Without this step, customer replies and button taps never arrive.
8. **Get the templates approved.** WhatsApp Manager → Message Templates. One per
   event you want to use. The Connection tab lists the exact variables each one is
   filled with, in order.
9. Turn on the master switch and the individual events you want.

### The order-confirmation template

The "Order placed" template needs **two quick-reply buttons**: the first confirms
the order, the second cancels it. Their text is yours to choose; the app supplies
the payload behind each one at send time, so a tap names the order it came from.

Body variables, in order: `{{1}}` customer name, `{{2}}` order number,
`{{3}}` order total.

---

## What the system enforces on its own

These are not staff guidelines. They are in the code, and the admin screens cannot
switch them off.

| Rule | Where it lives |
|---|---|
| Only customers who ordered, or who wrote in first | `findOrCreateContact()` refuses any other source; no endpoint accepts a list of numbers |
| Free text only inside the 24-hour window | `sendFreeText()` checks it on every send; the inbox's reply box disables itself and says why |
| Opt-out is permanent, checked before every send | `isOptOutKeyword()` matches the whole message only; a sentence containing "stop" is a complaint, not an opt-out |
| Notifications start off | Every toggle in `whatsappSettingsModel.js` defaults to `false` |
| An order never fails because of WhatsApp | `notifyOrderEventInBackground()` is never awaited and never rejects |

An opted-out customer who writes in again has consented to a reply, and the
conversation reopens by itself.

---

## Where the code is

```
server/
  models/whatsappSettingsModel.js   The connection, the toggles, the template names
  models/whatsappContactModel.js    One row per number we may message; consent + opt-out
  models/whatsappMessageModel.js    Every message in and out; the audit trail
  services/whatsappService.js       The five rules, and the only code that calls Meta
  routes/whatsappRoutes.js          Webhook (public) + the admin screens' API
client/
  src/pages/admin/AdminWhatsApp.jsx Connection and Inbox tabs
```

Order events are raised from three places, all fire-and-forget:

- `routes/orderRoutes.js` — an order is placed, and the customer-facing status route
- `routes/adminRoutes.js` — the admin status route, and when a tracking number is added

Only **Shipped**, **Delivered** and **Cancelled** reach the customer. The other
statuses are internal bookkeeping and stay silent. Each event sends at most one
message per order.

---

## Permission

The screens are behind the `whatsapp` admin permission, granted per admin in
Super Admin → Admin Management. Super admins and full-access admins already have it.
