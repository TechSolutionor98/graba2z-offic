# GrabA2Z App First-User Discount - Full Integration Guide

## 1) Objective
Show first-user app discount in mobile app, apply it on first eligible app order, and automatically remove/hide it after user uses it or becomes ineligible.

---

## 2) What is Already Implemented (Backend)

### User tracking
`POST /api/users/register` now supports:
- `registrationSource`: `"app" | "web"`
- `registrationPlatform`: `"android" | "ios"`

When app sends `registrationSource: "app"`, backend stores user as app-registered.

### App discount management
- Admin can create/manage app discounts from `/admin/app-discounts`.
- Discounts can be:
  - all products
  - selected products
  - percentage or fixed
  - only new app users
  - single-use
  - date range + priority

### Order-time discount application
`POST /api/orders` applies app discount server-side when:
- user is authenticated
- `orderSource` is `"app"` (or `X-Order-Source: app`)
- user is app-registered
- discount rule matches

Order response contains:
- `appDiscountApplied`
- `appDiscountAmount`
- `appDiscountId`
- `appDiscountName`
- `appDiscountType`
- `appDiscountValue`
- `discountAmount`
- final `totalPrice`

---

## 3) APIs App Developer Must Use

## A) Register app user
### Endpoint
`POST /api/users/register`

### Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123",
  "registrationSource": "app",
  "registrationPlatform": "android"
}
```

> Important: If app does not send `registrationSource: "app"`, first-user app discount will not be eligible.

---

## B) Show first-user discount status (new API)
### Endpoint
`GET /api/app-discounts/me/first-user-discount`

### Auth
`Authorization: Bearer <token>`

### Success response (eligible)
```json
{
  "eligible": true,
  "reason": "eligible",
  "hasAnyOrder": false,
  "discount": {
    "_id": "...",
    "name": "First App Order 10%",
    "description": "...",
    "appliesTo": "all",
    "products": [],
    "discountType": "percentage",
    "discountValue": 10,
    "minOrderAmount": 0,
    "maxDiscountAmount": null,
    "onlyNewAppUsers": true,
    "singleUsePerUser": true,
    "startsAt": "...",
    "endsAt": "..."
  }
}
```

### Not eligible example
```json
{
  "eligible": false,
  "reason": "not_first_order_anymore",
  "hasAnyOrder": true
}
```

### Possible `reason` values
- `auth_required`
- `not_app_registered_user`
- `no_active_discount`
- `not_first_order_anymore`
- `no_matching_discount`

Use this API on app home/profile/cart badge to decide whether to show “First app order discount available”.

---

## C) Preview exact discount for current cart
### Endpoint
`POST /api/app-discounts/preview`

### Auth
`Authorization: Bearer <token>`

### Body
```json
{
  "orderItems": [
    {
      "product": "665f1b8f1b9d2449e5d8d111",
      "price": 1200,
      "quantity": 1
    }
  ]
}
```

### Response (example)
```json
{
  "applied": true,
  "discountAmount": 120,
  "eligibleSubtotal": 1200,
  "discount": {
    "_id": "...",
    "name": "First App Order 10%",
    "appliesTo": "all",
    "discountType": "percentage",
    "discountValue": 10,
    "maxDiscountAmount": null,
    "onlyNewAppUsers": true,
    "singleUsePerUser": true
  }
}
```

Use this API in cart/checkout to show exact live discount amount before placing order.

---

## D) Place app order
### Endpoint
`POST /api/orders`

### Auth
`Authorization: Bearer <token>`

### Required key for app source
- Body: `"orderSource": "app"`
- (Optional fallback header: `X-Order-Source: app`)

### Body (minimal example)
```json
{
  "orderSource": "app",
  "orderItems": [
    {
      "name": "Product Name",
      "product": "665f1b8f1b9d2449e5d8d111",
      "price": 1200,
      "quantity": 1,
      "image": "https://..."
    }
  ],
  "itemsPrice": 1200,
  "shippingPrice": 25,
  "totalPrice": 1225,
  "deliveryType": "home",
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0500000000",
    "address": "Street 1",
    "city": "Dubai",
    "state": "Dubai",
    "zipCode": "00000"
  },
  "paymentMethod": "cod",
  "actualPaymentMethod": "cod"
}
```

Backend recalculates totals and applies app discount server-side.

---

## 4) Complete App Flow (What App Dev Should Do)

1. User signs up from app using `registrationSource: "app"`.
2. User logs in and gets token.
3. App calls `GET /api/app-discounts/me/first-user-discount`.
4. If `eligible: true`, show “First app order discount available”.
5. In cart/checkout, call `POST /api/app-discounts/preview` with cart items.
6. Show exact discount amount returned by preview.
7. Place order with `orderSource: "app"`.
8. Read order response fields `appDiscountApplied` + `appDiscountAmount` for success UI.
9. After successful order, call `GET /api/app-discounts/me/first-user-discount` again.
10. If now `eligible: false`, hide first-user discount badges from app.

---

## 5) How Discount Gets Removed After First Order
No manual app-side removal needed.
Backend checks user order history and discount usage rules:
- if `onlyNewAppUsers = true` and user already has an order => no longer eligible
- if `singleUsePerUser = true` and used discount once => no longer eligible

App just re-fetches status API and updates UI.

---

## 6) Backend Rules/Contract (Must not be bypassed)
- App must not hardcode discount math.
- Always trust backend preview and order response.
- App should treat backend `reason` as source of truth for eligibility state.

---

## 7) Admin Operations
Use admin panel:
- `/admin/app-discounts`

Admin config controls:
- discount value/type
- selected products vs all products
- first-user only
- single-use
- date window

No app release needed for offer changes.

---

## 8) If You Want Existing Web Users to Also Get App First-Order Discount
Current logic requires app registration source.
If business wants web-registered users to become app-eligible later, add a separate backend feature (not enabled now), e.g.:
- endpoint to mark user as app-registered on verified first app login
- guarded by device signature / OTP / business rule

---

## 9) Quick Test Checklist
1. Create active app discount from admin.
2. Register new user from app payload (`registrationSource: app`).
3. Call `GET /api/app-discounts/me/first-user-discount` => `eligible: true`.
4. Add cart and call preview => discount amount > 0.
5. Place order with `orderSource: app`.
6. Confirm order has `appDiscountApplied: true` and reduced `totalPrice`.
7. Call status API again => usually `eligible: false` for first-user discount.

