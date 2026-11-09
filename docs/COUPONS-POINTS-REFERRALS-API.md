# Coupons, Grabian Points & Referral Discounts — API guide for the app

Everything behind the three buttons on the checkout **Payment method** panel:

```
[+] Enter coupon code      [ Enter code ]  ( Apply )
🎫 Available Coupons    ⊙ Use Grabian Points    🎁 Use Referral Discount
```

Three separate systems. They do not share endpoints, storage, or rules, and a
customer may use **all three on one order**.

| | Coupon code | Grabian Points | Referral discount |
|---|---|---|---|
| Base path | `/api/coupons` | `/api/loyalty` | `/api/referrals` |
| Customer holds | nothing — a code they type | a **points balance** (a number) | a list of **reward vouchers** |
| Sent at checkout as | `couponCode` (string) | `loyaltyPointsRedeemed` (number) | `referralRewardId` (ObjectId) |
| Sign-in required | no | **yes** | **yes** |
| Earned how | published by the back office | 1 point per AED spent | inviting a friend, or being invited |

- **Base URL:** `https://api.grabatoz.ae`
- All request and response bodies are JSON. Send
  `Content-Type: application/json; charset=utf-8`.
- All money is **AED**. Other currencies are derived from AED elsewhere; nothing
  in these three systems is ever stored or returned in another currency.

> This file supersedes `POINTS-AND-REFERRALS-API.md`, which covers the same two
> programmes but not coupons and not the checkout call that actually applies them.

---

## Contents

1. [Authentication and required headers](#1-authentication-and-required-headers)
2. [Coupons](#2-coupons)
3. [Grabian Points](#3-grabian-points)
4. [Referrals](#4-referrals)
5. [Checkout — applying all three to an order](#5-checkout--applying-all-three-to-an-order)
6. [After the order — when things confirm, cancel and expire](#6-after-the-order--when-things-confirm-cancel-and-expire)
7. [Error format](#7-error-format)
8. [Known divergences — read before you build](#8-known-divergences--read-before-you-build)
9. [Current live configuration](#9-current-live-configuration)
10. [Admin endpoints (not for the app)](#10-admin-endpoints-not-for-the-app)

---

# 1. Authentication and required headers

## The customer token

Endpoints marked **Private** require the signed-in customer's JWT:

```http
Authorization: Bearer <token>
```

Without it they return `401`:

```json
{ "message": "Not authorized, no token provided" }
```

## The source header — this one changes behaviour

```http
x-order-source: app
```

The server resolves the source like this (`routes/orderRoutes.js:52`):

```js
const headerSource = headers["x-order-source"] || headers["x-client-source"]
const normalized = String(payloadSource || headerSource || "").trim().toLowerCase()
return normalized === "app" ? "app" : "web"
```

So the source is `"app"` only when the body field `orderSource` **or** one of
those two headers is exactly `app` (case-insensitive). **Anything else — including
missing — is `"web"`.**

This matters more than it looks. With source `app`:

- App-only discount codes (the `AppDiscount` collection) become usable.
- **Ordinary coupons stop being applied at checkout.** See
  [§8.1](#81-the-app-cannot-use-ordinary-coupons-at-checkout) — this is the single
  biggest trap in this document.

Points and referral rewards are unaffected by the source.

---

# 2. Coupons

Base path `/api/coupons`. A coupon is a code the back office publishes; the
customer types it. Nothing is attached to the customer's account.

Two different collections answer to a typed code:

| | `Coupon` | `AppDiscount` |
|---|---|---|
| Matched on | `code` (uppercased) | `name` |
| Valid on | web only at checkout | app only |
| Date fields | `validFrom` / `validUntil` | `startsAt` / `endsAt` |
| Per-user limits | no | yes — new users only, one-time use |

`POST /api/coupons/validate` searches `Coupon` first, then `AppDiscount` if
nothing matched.

---

## 2.1 List public coupons — Public

Backs the **Available Coupons** button.

```http
GET /api/coupons
```

No authentication. Returns an **array** (not an object).

Only coupons that satisfy **all three** conditions are returned:

```js
{ isActive: true, validUntil: { $gte: new Date() }, visibility: "public" }
```

### Response `200`

```json
[
  {
    "_id": "68a1f2c4e1b2a3d4f5061728",
    "code": "DIWALI2025",
    "description": "15% off this Diwali",
    "discountType": "percentage",
    "discountValue": 15,
    "categories": [{ "_id": "66b0...", "name": "Laptops" }],
    "minOrderAmount": 200,
    "maxDiscountAmount": 150,
    "usageLimit": null,
    "usedCount": 0,
    "validFrom": "2025-10-10T00:00:00.000Z",
    "validUntil": "2025-10-24T23:59:59.000Z",
    "isActive": true,
    "visibility": "public",
    "rules": [],
    "createdAt": "2025-10-01T08:12:44.311Z",
    "updatedAt": "2025-10-01T08:12:44.311Z"
  }
]
```

> **As of 2026-11-03 this endpoint returns `[]` on production.** Six coupons
> exist; three are `visibility: "private"` and the three public ones have all
> passed their `validUntil`. An empty list is the correct response, not a failure
> — render an empty state, never an error.

### Field notes

| Field | Meaning |
|---|---|
| `discountType` | `"percentage"` or `"fixed"` |
| `discountValue` | `15` means 15% when percentage, 15 AED when fixed |
| `minOrderAmount` | `0` = no minimum |
| `maxDiscountAmount` | ceiling in AED for a percentage coupon. **Absent or `null` = no ceiling** |
| `usageLimit` | `null` = unlimited. See [§8.3](#83-usagelimit-never-actually-stops-anyone) |
| `rules` | slab pricing — see [§2.3](#23-slab-rules) |
| `visibility` | `"private"` coupons never appear here; they still validate if typed |

---

## 2.2 Validate a coupon — Public (customer token optional)

Backs the **Apply** button. Call this when the customer presses Apply, not on
every keystroke.

```http
POST /api/coupons/validate
Content-Type: application/json
x-order-source: app          # optional; see below
Authorization: Bearer <token>  # optional, but see the warning
```

### Request body

```json
{
  "code": "diwali2025",
  "cartItems": [
    { "product": "66c1a2b3d4e5f60718293a4b", "qty": 2 },
    { "product": "66c1a2b3d4e5f60718293a4c", "qty": 1 }
  ],
  "orderSource": "app"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `code` | string | **yes** | Trimmed and uppercased server-side — send it however the customer typed it |
| `cartItems` | array | yes in practice | See the shape note below |
| `orderSource` | string | no | `"app"` or `"web"`. The headers `x-order-source` / `x-client-source` work too |

**`cartItems` shape is not symmetric between the two code types.** Read this
carefully:

- For an **`AppDiscount`**, each item is read as `item.product || item.productId`
  and the quantity as `item.qty || item.quantity`.
- For an ordinary **`Coupon`**, only `item.product` and `item.qty` are read.
  `productId` and `quantity` are **ignored**, which silently yields a zero
  subtotal and an eligibility failure.

**Always send `product` and `qty`.** Those two keys work for both paths.

Prices are **never taken from the request.** The server loads each product and
uses `offerPrice` when it is greater than zero, otherwise `price`.

### Success `200`

```json
{
  "valid": true,
  "coupon": {
    "_id": "68a1f2c4e1b2a3d4f5061728",
    "code": "DIWALI2025",
    "discountType": "percentage",
    "discountValue": 15,
    "categories": [{ "_id": "66b0...", "name": "Laptops" }]
  },
  "discountAmount": 127.5,
  "eligibleItems": [{ "product": "66c1a2b3d4e5f60718293a4b", "qty": 2 }],
  "totalEligibleAmount": 850
}
```

An `AppDiscount` response carries two extra markers:

```json
{
  "valid": true,
  "coupon": {
    "_id": "68b7...",
    "code": "NEWAPPUSER",
    "discountType": "fixed",
    "discountValue": 50,
    "categories": [],
    "isAppDiscount": true
  },
  "discountAmount": 50,
  "eligibleItems": [ ... ],
  "totalEligibleAmount": 940
}
```

| Field | Meaning |
|---|---|
| `discountAmount` | AED to take off. **Show this figure** — do not recompute it |
| `eligibleItems` | the subset of `cartItems` the coupon applies to |
| `totalEligibleAmount` | the AED subtotal those items came to |
| `coupon.isAppDiscount` | `true` only for an `AppDiscount` |

### Failures — all `400` with a `message`

| Message | Cause |
|---|---|
| `Coupon code is required` | `code` missing or empty |
| `Invalid or expired coupon code` | no match in either collection, or outside its date window, or `isActive: false` |
| `This coupon is only valid on the GrabA2Z Mobile App.` | an `AppDiscount` matched but the source was not `app` |
| `This coupon is only valid for new app users on their first order.` | customer already has a non-cancelled order |
| `You have already used this coupon code.` | one-time-use `AppDiscount` already spent |
| `Coupon usage limit exceeded` | `usedCount >= usageLimit`. Never fires in practice — see [§8.3](#83-usagelimit-never-actually-stops-anyone) |
| `No eligible items in cart for this coupon.` | `AppDiscount` matched nothing in the cart |
| `This coupon is only valid for products in: Laptops, Phones. None of your cart items belong to these categories.` | category-restricted `Coupon` matched nothing. **Show this message verbatim** — it names the categories |
| `Minimum order amount of 200 required for this coupon` | below `minOrderAmount` |
| `This coupon is not applicable for your cart total of AED 150.` | no slab rule covers that subtotal |

### The per-user checks only run when a token is sent

The new-user and one-time-use checks on an `AppDiscount` are inside
`if (user)`. The token is read from the `Authorization` header and decoded
**leniently — a bad or expired token is swallowed silently** and treated as
signed-out.

So a signed-out call validates a single-use code the customer has already spent.
**Always send the token when the customer is signed in.**

---

## 2.3 Slab rules

A coupon may carry a `rules` array instead of flat values. Each slab is a cart
band with its own discount:

```json
"rules": [
  { "minCartAmount": 0,    "maxCartAmount": 499,  "discountType": "percentage", "discountValue": 5 },
  { "minCartAmount": 500,  "maxCartAmount": 1999, "discountType": "percentage", "discountValue": 10 },
  { "minCartAmount": 2000, "maxCartAmount": 99999,"discountType": "fixed",      "discountValue": 300 }
]
```

When `rules` is non-empty:

- The slab whose band contains `totalEligibleAmount` wins.
- No matching slab → `400`, *"This coupon is not applicable for your cart total of AED X."*
- `minOrderAmount` is **not** checked — the slabs replace it.
- `maxDiscountAmount` is **forced to null**, so a percentage slab is uncapped.

The back office guarantees slabs never overlap and are validated on save. The
app only needs to render `discountAmount`.

**`rules` are honoured by `/validate` but ignored at checkout.** See
[§8.2](#82-checkout-re-prices-coupons-with-different-rules-from-validate).

---

# 3. Grabian Points

Base path `/api/loyalty`. The customer earns points on spend and redeems them
for money off. The programme is renameable from the back office — read the name
from the API, never hardcode "Grabian Points".

**Live today:** 1 point per AED spent; 1000 points = 1 AED; minimum 1000 points
per redemption; redeemed in steps of 100; capped at 50% of the order.

---

## 3.1 Programme settings — Public

Call once at launch. Cached server-side, cheap to call.

```http
GET /api/loyalty/settings
```

### Response `200` — programme on (live values as of 2026-11-03)

```json
{
  "settings": {
    "isEnabled": true,
    "pointsName": "Grabian Points",
    "pointsNameAr": "عملات غرابيان",
    "pointsNameSingular": "Grabian Coins",
    "earnPointsPerAed": 1,
    "redeemPointsPerAed": 1000,
    "minPointsToRedeem": 1000,
    "maxRedeemPercentOfOrder": 50,
    "maxPointsPerOrder": 0,
    "redeemStep": 100,
    "showOnProductPage": true,
    "showOnCart": true,
    "programmeTerms": ""
  },
  "rules": []
}
```

### Response `200` — programme off

```json
{ "settings": { "isEnabled": false }, "rules": [] }
```

**When `isEnabled` is false the object contains nothing else.** Do not read
`pointsName` without checking the flag first — hide the whole feature.

| Field | Meaning |
|---|---|
| `pointsName` | plural display name. **Read it, don't hardcode it** |
| `pointsNameSingular` | singular form. Note these currently disagree ("Points" vs "Coins") — that is the back office's choice, render both as given |
| `earnPointsPerAed` | points granted per 1 AED of eligible spend |
| `redeemPointsPerAed` | points needed to make 1 AED. **1000 → 1 point = 0.001 AED** |
| `minPointsToRedeem` | nothing below this may be redeemed |
| `maxRedeemPercentOfOrder` | share of the goods points may cover. `50` = half |
| `maxPointsPerOrder` | hard ceiling per order. **`0` = no ceiling** |
| `redeemStep` | redemption is snapped **down** to a multiple of this |
| `showOnProductPage` / `showOnCart` | back-office switches for where to advertise points |
| `programmeTerms` | free text, may be empty |

### `rules` — per-category earn rates

An array of overrides to the global earn rate. Empty today.

```json
"rules": [
  { "scope": "category", "refId": "66b0...", "mode": "multiplier", "multiplier": 2, "fixedPoints": 0 },
  { "scope": "subcategory", "refId": "66c1...", "mode": "fixed", "multiplier": 1, "fixedPoints": 500 }
]
```

| Field | Meaning |
|---|---|
| `scope` | `"category"` (top level) or `"subcategory"` (any deeper level) |
| `mode` | `"multiplier"` → `earnPointsPerAed × multiplier`. `"fixed"` → exactly `fixedPoints` per unit |
| `refId` | the category/subcategory `_id` to match against the product |

Resolution is **deepest category first**: `subCategory4` → `subCategory3` →
`subCategory2` → `category` → `subCategory` → `parentCategory`, then the global
rate. A product may also carry its own `loyaltyPointsMode` override, including
`"none"` to earn nothing.

This is sent so the app can show "earn X points" on a product tile without a
round trip per product. **It is advertising, not accounting** — the real award
is computed server-side at order time.

---

## 3.2 The customer's balance and history — Private

Backs the points screen.

```http
GET /api/loyalty/me?page=1&limit=20
Authorization: Bearer <token>
```

| Query | Default | Max |
|---|---|---|
| `page` | 1 | — |
| `limit` | 20 | 100 |

### Response `200`

```json
{
  "balance": 4300,
  "pending": 1200,
  "lifetime": 15600,
  "balanceValueAed": 4.3,
  "canRedeem": true,
  "tier": null,
  "settings": { "isEnabled": true, "pointsName": "Grabian Points", "...": "as in 3.1" },
  "transactions": [
    {
      "_id": "6a9d47789818f9e9926e7397",
      "type": "earn",
      "status": "confirmed",
      "points": 7099,
      "amountAed": 0,
      "description": "Pending on order #6e7393",
      "order": "6a9d47789818f9e9926e7393",
      "expiresAt": null,
      "createdAt": "2026-09-06T10:59:04.777Z"
    },
    {
      "_id": "6a9a7de37eb1c03bc7b13d66",
      "type": "adjust",
      "status": "confirmed",
      "points": 1000,
      "amountAed": 0,
      "description": "Manual adjustment by admin",
      "order": null,
      "expiresAt": null,
      "createdAt": "2026-09-04T08:14:27.094Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "totalCount": 37,
  "hasMore": true
}
```

| Field | Meaning |
|---|---|
| `balance` | **spendable now** |
| `pending` | earned but not yet released — the order has not reached `Delivered` |
| `lifetime` | total ever earned; never decreases |
| `balanceValueAed` | `balance ÷ redeemPointsPerAed`, floored to 2 decimals |
| `canRedeem` | `isEnabled && balance >= minPointsToRedeem` |
| `tier` | `null`, or `{ _id, name, color, earnMultiplier, badgeText }`. **No tiers exist today** |

`balance` and `pending` are **separate numbers that must not be added together.**
Showing `5500` when only `4300` can be spent generates support tickets.

`description` is generated server-side and is **not** localised. Orders are
referenced by the **last six characters of their `_id`** — `"Pending on order
#6e7393"`. There is no human-readable order number on the `Order` model; if you
want to show the customer a recognisable reference, match `transaction.order`
against the order `_id` you already hold.

### Transaction `type`

| Value | Meaning | Sign |
|---|---|---|
| `earn` | points from a purchase | positive |
| `redeem` | spent at checkout | negative |
| `refund` | spent points handed back when an order was cancelled | positive |
| `reverse` | an award taken back because the order was cancelled or returned | negative |
| `expire` | aged out | negative |
| `adjust` | manual back-office credit or debit | either |

### Transaction `status`

| Value | Meaning |
|---|---|
| `pending` | earned, not yet spendable |
| `confirmed` | counted in `balance` |
| `cancelled` | a pending award that will never pay out |

Rows with `status: "cancelled"` are **excluded from this endpoint entirely**.

---

## 3.3 Quote a redemption — Private

Backs the **Use Grabian Points** slider. Call it when the cart total changes and
when the customer moves the slider.

```http
POST /api/loyalty/quote
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{ "eligibleAmount": 1200, "requestedPoints": 3000 }
```

| Field | Notes |
|---|---|
| `eligibleAmount` | **goods only**, after any coupon and referral discount. Never include shipping or payment fees |
| `requestedPoints` | what the customer chose. Send `0` to ask only for the maximum |

### Response `200`

```json
{
  "maxPoints": 4300,
  "maxDiscountAed": 4.3,
  "appliedPoints": 3000,
  "discountAed": 3,
  "blockedReason": null,
  "balance": 4300,
  "pending": 1200,
  "pointsName": "Grabian Points",
  "redeemPointsPerAed": 1000,
  "minPointsToRedeem": 1000,
  "redeemStep": 100
}
```

| Field | Use |
|---|---|
| `maxPoints` | the slider's upper bound, already snapped to `redeemStep` |
| `maxDiscountAed` | what that maximum is worth |
| `appliedPoints` | what the request actually yields after capping and snapping |
| `discountAed` | **the figure to display.** Do not compute it yourself |
| `blockedReason` | `null` when redemption is possible |

### `blockedReason` values

Every one returns `200` with all the amount fields at `0`. **None of these is an
error** — they are the reason the control is unavailable.

| Value | Meaning | Suggested message |
|---|---|---|
| `disabled` | programme switched off | hide the control entirely |
| `no_points` | balance is zero | "You have no points yet" |
| `below_minimum` | balance below `minPointsToRedeem` | "Collect 1,000 points to start redeeming" |
| `empty_cart` | `eligibleAmount` ≤ 0 | hide the control |
| `cap_below_minimum` | the 50% cap leaves less headroom than the minimum redemption | "Your order is too small to redeem points on" |

### How the ceiling is built

In order (`utils/loyalty.js:277`):

1. `maxPoints = min(balance, aedToPoints(eligibleAmount × maxRedeemPercentOfOrder ÷ 100))`
2. then capped by `maxPointsPerOrder` when it is greater than zero
3. then **snapped down** to a multiple of `redeemStep`
4. if the result is below `minPointsToRedeem` → `cap_below_minimum`

And `appliedPoints = snapDown(min(requestedPoints, maxPoints))`, forced to `0`
if that lands below `minPointsToRedeem`.

So a customer with 4300 points on a 1200 AED basket is capped by the 50% rule at
600 AED → 600,000 points of headroom → their whole 4300 is available, snapped to
4300 (already a multiple of 100).

---

## 3.4 Points awarded since last seen — Private

For a one-off "you've earned X points" dialog after delivery.

```http
GET /api/loyalty/announcements
Authorization: Bearer <token>
```

### Nothing to announce — `200`

```json
{ "hasNews": false }
```

**That is the entire response.** No other field is present, including when the
programme is disabled. Check `hasNews` before reading anything else.

### Points to announce — `200`

```json
{
  "hasNews": true,
  "points": 1200,
  "orderCount": 1,
  "transactionIds": ["67f2a1b2c3d4e5f607182930"],
  "balance": 5500,
  "balanceValueAed": 5.5,
  "redeemPointsPerAed": 1000,
  "minPointsToRedeem": 1000,
  "maxRedeemPercentOfOrder": 50,
  "pointsName": "Grabian Points",
  "pointsNameAr": "عملات غرابيان",
  "pointsNameSingular": "Grabian Coins",
  "canRedeem": true
}
```

| Field | Meaning |
|---|---|
| `points` | total newly confirmed — the headline number for the dialog |
| `orderCount` | how many orders contributed |
| `transactionIds` | **send these straight back to `/ack`** |
| `balance` | the new balance, already including `points` |
| `canRedeem` | whether to offer a "spend them now" button |

At most 20 rows are considered, newest first.

### Mark them seen

Or the dialog returns on every launch.

```http
POST /api/loyalty/announcements/ack
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{ "transactionIds": ["67f2a1b2c3d4e5f607182930"] }
```

```json
{ "acknowledged": 1 }
```

**Send back exactly the `transactionIds` you were given.** Omitting them (or
sending `null`) acknowledges **everything outstanding** — including an award that
confirmed between your fetch and the dismiss, which the customer would then never
be told about.

---

# 4. Referrals

Base path `/api/referrals`. Two sides, rewarded at different times:

- The **referee** — the invited friend — gets a reward **the moment they sign up**.
- The **referrer** — the inviter — gets one only once that friend's order reaches
  `qualifyOnOrderStatus` (`Delivered` today).

A reward is a **voucher document with its own `_id`**, not a balance. A customer
may hold several and picks one per order.

---

## 4.1 Programme settings — Public

```http
GET /api/referrals/settings
```

### Response `200` — live as of 2026-11-03

```json
{
  "settings": {
    "isEnabled": true,
    "programmeName": "Refer a Friend",
    "programmeNameAr": "أدعُ صديقاً",
    "refereeDiscountType": "percentage",
    "refereeDiscountValue": 20,
    "refereeMaxDiscountAed": 0,
    "refereeMinOrderAed": 0,
    "refereeFirstOrderOnly": true,
    "referrerDiscountType": "percentage",
    "referrerDiscountValue": 10,
    "referrerMaxDiscountAed": 0,
    "referrerMinOrderAed": 0,
    "qualifyOnOrderStatus": "Delivered",
    "qualifyMinOrderAed": 0,
    "showInProfile": true,
    "shareMessage": "Shop at Grab A2Z and get a discount on your first order with my link: {{link}}",
    "programmeTerms": "",
    "offer": {
      "referee":  { "discountType": "fixed", "discountValue": 25, "maxDiscountAed": 0, "minOrderAed": 500, "expiryDays": 0, "firstOrderOnly": true },
      "referrer": { "discountType": "fixed", "discountValue": 30, "maxDiscountAed": 0, "minOrderAed": 500, "expiryDays": 0, "firstOrderOnly": false }
    }
  }
}
```

### ⚠️ Read `offer`, not the flat fields

Look closely at the response above. The flat fields promise **20% and 10%**. The
`offer` block promises **25 AED and 30 AED with a 500 AED minimum**. They
disagree, and `offer` is the truthful one.

The flat `referee*` / `referrer*` fields are the programme's **base settings**.
Three referral tiers exist in production — `Regular` (the default), `Special` and
`Wolsale` — and a tier **replaces** the base settings for anyone it applies to.
The server resolves the default tier and puts the real terms in `offer`.

**Render `offer.referee` and `offer.referrer`. Treat the flat fields as legacy.**

When `isEnabled` is false the response is `{ "settings": { "isEnabled": false } }`
and nothing else.

| Field | Meaning |
|---|---|
| `shareMessage` | share sheet text. **Replace `{{link}}` with the customer's link** from §4.3 |
| `qualifyOnOrderStatus` | the friend's order must reach this before the inviter is paid |
| `qualifyMinOrderAed` | the friend's order must be worth at least this. `0` = no minimum |
| `*MaxDiscountAed` | `0` = no ceiling |
| `firstOrderOnly` | the reward may only be spent on the holder's very first order |
| `expiryDays` | `0` = never expires |

---

## 4.2 Validate a referral code — Public

For the signup screen, when someone arrives on an invite link.

```http
GET /api/referrals/validate/:code
```

Codes are normalised server-side to `[A-Z0-9]` — case, spaces and punctuation
are all stripped, so `ab-12 cd` and `AB12CD` are the same code.

### Valid `200`

```json
{
  "valid": true,
  "code": "AB12CD",
  "referrerName": "Fahad",
  "reward": {
    "discountType": "fixed",
    "discountValue": 25,
    "maxDiscountAed": 0,
    "minOrderAed": 500,
    "firstOrderOnly": true
  },
  "tier": { "name": "Regular", "color": "#3b82f6" }
}
```

### Invalid — **also `200`**

```json
{ "valid": false, "reason": "unknown_code" }
```

| `reason` | Meaning |
|---|---|
| `programme_disabled` | the whole programme is off |
| `empty` | the code normalised to nothing |
| `unknown_code` | no customer owns it |

**This endpoint never returns 404 or 400 for a bad code.** Branch on `valid`, not
on the status code. Only the inviter's **first name** is returned — by design, so
a code cannot be used to harvest email addresses.

### Signing up with a code

The code goes to the existing registration endpoint:

```http
POST /api/users
```

```json
{
  "name": "New Customer",
  "email": "new@example.com",
  "password": "...",
  "referralCode": "AB12CD",
  "registrationSource": "app"
}
```

The header `x-referral-code` is accepted as a fallback if `referralCode` is
absent from the body. The welcome reward is minted during signup.

> `requireEmailVerified` is **true** in production. The referral is created at
> signup but will not qualify the inviter until the friend's email is verified.

---

## 4.3 The customer's referral panel — Private

Backs the "invite a friend" screen.

```http
GET /api/referrals/me?country=ae&lang=en
Authorization: Bearer <token>
```

| Query | Default | Notes |
|---|---|---|
| `country` | `ae` | must be exactly two letters or it falls back to `ae` |
| `lang` | `en` | only `ar` differs; anything else becomes `en` |

### Response `200`

```json
{
  "code": "AB12CD",
  "link": "https://www.grabatoz.ae/ae-en/register?ref=AB12CD",
  "invites": [
    {
      "id": "67a1...",
      "name": "Ahmed K.",
      "email": "ah•••@gmail.com",
      "status": "qualified",
      "joinedAt": "2026-09-02T11:20:00.000Z",
      "qualifiedAt": "2026-09-14T08:03:11.000Z",
      "rewarded": true,
      "notRewardedReason": ""
    },
    {
      "id": "67a2...",
      "name": "Sara M.",
      "email": "sa•••@outlook.com",
      "status": "pending",
      "joinedAt": "2026-10-28T19:45:00.000Z",
      "qualifiedAt": null,
      "rewarded": false,
      "notRewardedReason": ""
    }
  ],
  "rewards": [
    {
      "id": "6ab0db0c6886756b1a268a20",
      "role": "referee",
      "code": "D8DAP3PK",
      "referralTypeName": "Regular",
      "discountType": "fixed",
      "discountValue": 25,
      "maxDiscountAed": 0,
      "minOrderAed": 500,
      "firstOrderOnly": true,
      "status": "active",
      "expiresAt": null,
      "usedAt": null,
      "discountAppliedAed": 0,
      "description": "Welcome discount from Rena Khurram (Regular tier)",
      "createdAt": "2026-09-21T07:21:48.694Z"
    }
  ],
  "tier": { "_id": "...", "name": "Regular", "color": "#3b82f6", "refereeDiscountValue": 25, "referrerDiscountValue": 30 },
  "offer": {
    "referee":  { "discountType": "fixed", "discountValue": 25, "minOrderAed": 500, "firstOrderOnly": true,  "maxDiscountAed": 0, "expiryDays": 0 },
    "referrer": { "discountType": "fixed", "discountValue": 30, "minOrderAed": 500, "firstOrderOnly": false, "maxDiscountAed": 0, "expiryDays": 0 }
  },
  "stats": {
    "total": 2,
    "pending": 1,
    "qualified": 1,
    "cancelled": 0,
    "activeRewards": 1,
    "totalEarnedAed": 30
  },
  "settings": { "isEnabled": true, "...": "as in 4.1" }
}
```

When the programme is off:

```json
{ "settings": { "isEnabled": false }, "code": null, "link": "", "invites": [], "rewards": [], "stats": null }
```

### Notes

- `code` is **generated on first call** if the customer has none. Safe to call
  concurrently — the server assigns it with a conditional update against a unique
  index, so two devices cannot produce two codes.
- `link` is built from the public storefront origin, never from the API host, so
  it is always openable.
- Invitee identity is **deliberately masked**: `"Muhammad Fahad"` → `"Muhammad F."`,
  `"friend@example.com"` → `"fr•••@example.com"`. Render as received; do not try
  to recover the full values. Note that `rewards[].description` is **not** masked
  and carries the inviter's full name — that string is shown to the person who
  was invited, who already knows who invited them.
- A referral code is **8 characters**, `[A-Z0-9]`, e.g. `D8DAP3PK`.
- `rewards[].code` is the **inviter's code the referral was made with**, not a
  code the holder can give out. Their own shareable code is the top-level `code`.
- `invites` is capped at 200, `rewards` at 100. Neither is paginated.
- `tier` repeats `refereeDiscountValue` / `referrerDiscountValue` only for older
  clients. **Use `offer`.**

### `invites[].status`

| Value | Meaning |
|---|---|
| `pending` | signed up; the qualifying order has not landed yet |
| `qualified` | the friend's order reached `Delivered`; the inviter's reward exists |
| `cancelled` | the order was cancelled or returned, or the back office revoked it |

### `rewards[].status`

| Value | Spendable | Meaning |
|---|---|---|
| `active` | **yes** | available now |
| `used` | no | already spent — `usedAt` and `discountAppliedAed` are filled |
| `expired` | no | passed `expiresAt` unspent |
| `cancelled` | no | revoked by the back office, with a reason in `description` |

Only `role: "referee"` rewards exist in production today (6 of them, all
`active`) — no referral has yet reached `Delivered`.

---

## 4.4 Quote referral rewards for this order — Private

Backs the **Use Referral Discount** button.

```http
POST /api/referrals/quote
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{ "eligibleAmount": 1200 }
```

`eligibleAmount` is **goods only, after any coupon** — not shipping, not payment
fees, and not after points (points come last).

### Response `200`

```json
{
  "rewards": [
    {
      "id": "67b9...",
      "role": "referee",
      "code": "XY99ZZ",
      "referralTypeName": "Regular",
      "discountType": "fixed",
      "discountValue": 25,
      "maxDiscountAed": 0,
      "minOrderAed": 500,
      "firstOrderOnly": true,
      "status": "active",
      "expiresAt": null,
      "usedAt": null,
      "discountAppliedAed": 0,
      "description": "Welcome discount",
      "createdAt": "2026-10-02T07:41:19.000Z",
      "discountAed": 25,
      "blockedReason": null,
      "eligibleAmountAed": 1200,
      "applicable": true
    }
  ],
  "best": { "id": "67b9...", "discountAed": 25, "applicable": true, "...": "same shape" },
  "isFirstOrder": true
}
```

When the programme is off: `{ "rewards": [], "best": null }` — note `isFirstOrder`
is **absent** in that case.

| Field | Use |
|---|---|
| `rewards` | every reward, applicable or not. Show the blocked ones greyed out with their reason |
| `best` | the one worth most on this basket, or `null`. **Pre-select it**, but let the customer change it |
| `applicable` | `discountAed > 0` |
| `isFirstOrder` | whether the customer has no previous non-cancelled order |

### `blockedReason` values

| Value | Suggested message |
|---|---|
| `no_reward` | — (should not occur here) |
| `not_active` | "Already used" |
| `expired` | "Expired" |
| `first_order_only` | "Only valid on your first order" |
| `below_minimum` | "Spend 500 AED to use this" |
| `empty_cart` | hide |
| `no_value` | "Cannot be applied to this order" |

A reward can **never** discount more than the order is worth — the server clamps
it to `eligibleAmount`.

---

# 5. Checkout — applying all three to an order

```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>   # required for points and referral rewards
x-order-source: app
```

## The three fields

```json
{
  "orderItems": [ ... ],
  "shippingAddress": { ... },
  "paymentMethod": "cod",
  "orderSource": "app",

  "couponCode": "NEWAPPUSER",
  "referralRewardId": "67b9c1d2e3f4a5b6c7d8e9f0",
  "loyaltyPointsRedeemed": 3000
}
```

| Field | Type | Notes |
|---|---|---|
| `couponCode` | string | the raw code. Uppercased server-side |
| `referralRewardId` | ObjectId string | the `id` from §4.4, **not** the referral code |
| `loyaltyPointsRedeemed` | number | floored to an integer. `loyaltyPoints` is accepted as an alias |

**Nothing you send is trusted as money.** Item prices, the coupon, the reward and
the points are all re-read from the database and recomputed. Send the customer's
*choices*, never your computed amounts.

## The order the discounts stack in

This is fixed and matters, because each layer shrinks the base for the next:

```
goods            = Σ (verified item price × qty)
  ↓
coupon           applies to goods
                 → finalDiscountAmount
  ↓
referral reward  applies to (goods − coupon)
                 → referralDiscountAmount
  ↓
Grabian Points   applies to (goods − coupon − referral)
                 → loyaltyDiscountAmount
  ↓
total = goods + shipping − coupon − referral − points + payment fees
```

So when you call the two quote endpoints, pass:

- `/api/referrals/quote` → `eligibleAmount = goods − couponDiscount`
- `/api/loyalty/quote` → `eligibleAmount = goods − couponDiscount − referralDiscount`

Getting this wrong will not corrupt the order — the server recomputes — but your
quoted figures will not match the order the customer receives.

**None of the three ever touches shipping or payment-method fees.**

## Order of operations on the server

1. An `AppDiscount` is resolved **only** if `orderSource === "app"` **and** the
   customer is signed in.
2. An ordinary `Coupon` is resolved **only** if `orderSource === "web"`.
3. `finalDiscountAmount = appDiscount > 0 ? appDiscount : couponDiscount` — the
   app discount wins when both somehow exist.
4. The referral reward is **claimed** (atomically marked used) *before* the order
   is written.
5. Points are **debited** before the order is written.
6. If writing the order then fails, the reward is released and the points are
   refunded.

Steps 4–6 mean a failed checkout does not silently eat a voucher. They also mean
**two devices cannot spend the same reward or the same points** — the second gets
a `400`.

## Checkout-specific errors — all `400`

| Message | Cause |
|---|---|
| `Sign in to use your referral discount` | `referralRewardId` sent without a token (this one is `401`) |
| `The referral programme is not currently active` | programme switched off between quote and submit |
| `That referral discount could not be found` | malformed ObjectId |
| `That referral discount could not be found on your account` | the reward belongs to someone else |
| `That referral discount has already been used or is no longer valid` | `not_active` |
| `That referral discount has expired` | `expired` |
| `That welcome discount can only be used on your first order` | `first_order_only` |
| `Your order must be at least 500 AED to use this discount` | `below_minimum` |
| `That referral discount has just been used. Please review your order and try again.` | lost a race with another checkout |

Points shortfalls fail the checkout outright rather than quietly charging full
price.

## What comes back on the order

```json
{
  "_id": "67c0...",
  "itemsPrice": 1200,
  "shippingPrice": 0,
  "totalPrice": 1122,

  "couponCode": "NEWAPPUSER",
  "discountAmount": 50,

  "appDiscountApplied": true,
  "appDiscountId": "68b7...",
  "appDiscountName": "NEWAPPUSER",
  "appDiscountType": "fixed",
  "appDiscountValue": 50,
  "appDiscountAmount": 50,

  "referralRewardId": "67b9...",
  "referralRewardRole": "referee",
  "referralDiscountType": "fixed",
  "referralDiscountValue": 25,
  "referralDiscountAmount": 25,

  "loyaltyPointsRedeemed": 3000,
  "loyaltyDiscountAmount": 3,
  "loyaltyPointsEarned": 1172,

  "orderSource": "app"
}
```

Reading that example: 1200 goods − 50 coupon − 25 referral − 3 points = **1122
payable**, but **1172 points earned**.

Those two figures differ on purpose, and the rule is not obvious:

> Points are earned on the full item prices, then scaled down by the share of the
> basket paid for **with points or with a referral reward** — not by the coupon.

`1200 × (1200 − 25 − 3) ÷ 1200 = 1172`. The coupon's 50 AED is absent from that
sum. So a coupon does **not** reduce points earned, while a referral reward and
redeemed points both do.

(The scaling is governed by `earnOnRedeemedPortion`, which is `false` in
production — "the share paid for with points does not earn points back, otherwise
the programme slowly refunds itself". Setting it true would remove the scaling.)

**Do not predict `loyaltyPointsEarned` in the app.** Show what the order returns.

Buyer-protection lines (`isProtection: true`) earn **no** points and are excluded
from a general coupon's eligible subtotal.

**Render the order response, not your quotes.** If they disagree, the order is
right.

There is **no `orderNumber` field** — an order is identified by its `_id`.

`discountAmount` is the **winning** coupon discount — the app discount if one
applied, otherwise the web coupon's. When an app discount won, the same figure
also appears in `appDiscountAmount`, so the two agree rather than stacking.
**Never add `discountAmount` and `appDiscountAmount` together.**

`loyaltyPointsEarned` is what *will* be credited — it lands as a `pending`
transaction and only becomes spendable on delivery.

---

# 6. After the order — when things confirm, cancel and expire

Driven by order status, server-side. The app has nothing to call.

## Grabian Points

| Order reaches | Effect |
|---|---|
| `Delivered` (`awardOnOrderStatus`) | the `earn` row flips `pending` → `confirmed`; the balance rises |
| `Cancelled`, `Returned`, `Deleted` | the pending award is `cancelled`; redeemed points are **refunded** as a `refund` row |

## Referrals

| Order reaches | Effect |
|---|---|
| `Delivered` (`qualifyOnOrderStatus`) | the referral turns `qualified`; the **inviter's** reward is minted |
| `Cancelled`, `Returned`, `Deleted` | the referral is un-qualified; an unspent inviter reward is withdrawn; a reward spent on that order is handed back |

Qualification also requires `qualifyMinOrderAed` to be met (`0` today) and, since
`requireEmailVerified` is **true**, the friend's email to be verified.

## Expiry

Both expiry sweeps are **manual** — triggered from the back office, not
scheduled. `pointsExpiryDays` is `0` and all `expiryDays` are `0`, so nothing
expires in production today. Do not build an app feature that assumes expiry
runs on a timer.

---

# 7. Error format

Every failure is JSON with a `message`:

```json
{ "message": "Invalid or expired coupon code" }
```

| Status | Meaning |
|---|---|
| `400` | the request was understood and refused. **`message` is written for the customer — show it** |
| `401` | missing or invalid token |
| `404` | the resource does not exist |
| `500` | server fault. Show a generic message, never `message` |

> **Production currently also returns a `stack` field on errors.** Never display
> or log it client-side. It is a server misconfiguration (`NODE_ENV` is not
> `production` on the API host) and should be fixed — not worked around.

The `400` messages in this document are written in customer-facing English and
are safe to surface verbatim. They are **not localised** — there are no Arabic
equivalents from the API. Map them client-side if you need Arabic.

---

# 8. Known divergences — read before you build

These are real defects found while writing this document, verified against the
code on `main`. They are listed so the app is not built on a false assumption.
**None is fixed as of 2026-11-03.**

## 8.1 The app cannot use ordinary coupons at checkout

`routes/orderRoutes.js:491`

```js
if (req.body.couponCode && normalizedOrderSource === "web") {
```

`POST /api/coupons/validate` will happily validate an ordinary `Coupon` for an
app client and return a `discountAmount`. `POST /api/orders` with
`orderSource: "app"` then **ignores it entirely** — only `AppDiscount` codes are
applied.

**Consequence:** the app shows "50 AED off applied", the customer submits, and
the order arrives at full price with no explanation.

**Until this is fixed**, the app must either:
- only offer codes that come back with `coupon.isAppDiscount === true`, and
  reject the rest with its own message; or
- not send `orderSource: "app"` — which would disable app-only discounts and
  change reporting.

The first is the safe option. **Check `isAppDiscount` on every validate response.**

## 8.2 Checkout re-prices coupons with different rules from validate

The checkout branch reads `coupon.appliesTo`, `coupon.products` and
`coupon.subcategories`. **None of those fields exists on the `Coupon` schema** —
only `categories` does. So `appliesTo` is always `undefined` and the code always
falls through to the "all items" branch.

| | `/validate` | `POST /api/orders` |
|---|---|---|
| Category restriction | **honoured** | **ignored** — discounts the whole cart |
| `rules` slabs | **honoured** | **ignored** — uses the flat `discountValue` |
| `usageLimit` | checked | not checked |

A category-restricted or slab coupon therefore gives a **different, usually
larger** discount at checkout than the quote promised. Web only, since §8.1 means
the app never reaches this code.

## 8.3 `usageLimit` never actually stops anyone

`usedCount` is **read** at `routes/couponRoutes.js:345` and **never incremented
anywhere in the codebase.** A coupon limited to 100 uses is effectively
unlimited. Do not present a remaining-uses count in the app; the number is
always `0`.

## 8.4 Referral settings advertise terms nobody gets

Covered in [§4.1](#41-programme-settings--public). The flat `refereeDiscountValue: 20`
(percent) is not what a new customer receives — the default tier gives
`25 AED with a 500 AED minimum`. **Read `offer`.**

## 8.5 The coupon cart-item key is not symmetric

`productId` and `quantity` work for app discounts and are silently ignored for
ordinary coupons, producing a confusing "no eligible items" failure. **Always
send `product` and `qty`.**

---

# 9. Current live configuration

Read from production on **2026-11-03**. Everything here is back-office editable
and can change without notice — **fetch it, don't hardcode it.** Listed so the
app can be tested against real numbers.

## Grabian Points — enabled

| Setting | Value |
|---|---|
| Name (en / ar) | Grabian Points / عملات غرابيان |
| Singular | Grabian Coins |
| Earn | 1 point per AED |
| Redeem | 1000 points = 1 AED |
| Minimum redemption | 1000 points (= 1 AED) |
| Step | 100 points |
| Max share of order | 50% |
| Max points per order | unlimited |
| Awarded on | `Delivered` |
| Expiry | never |
| Category rules | none |
| Tiers | none |

## Referrals — enabled

| Setting | Value |
|---|---|
| Programme | Refer a Friend / أدعُ صديقاً |
| **Friend gets** | **25 AED off, min order 500 AED, first order only** |
| **Inviter gets** | **30 AED off, min order 500 AED** |
| Qualifies on | `Delivered` |
| Min qualifying order | none |
| Email verification | **required** |
| Expiry | never |
| Max referrals per user | unlimited |

Three tiers exist: `Regular` (default, the figures above), `Special` (35/50 AED,
min 500) and `Wolsale` (3%/2%, no minimum).

Volume: 6 referrals, 6 rewards — all `referee` / `active`. No referral has
reached `Delivered`.

## Coupons

Six exist. **All three public ones have expired**, so `GET /api/coupons`
returns `[]`.

| Code | Visibility | Valid until | Live? |
|---|---|---|---|
| `BTOC25` | public | 2025-08-18 | expired |
| `DIWALI2025` | public | 2025-10-24 | expired |
| `TESTING` | public | 2026-09-30 | expired |
| `SPECIAL40` | private | 2026-09-08 | expired |
| `SPECIAL100` | private | 2026-09-11 | expired |
| `NEWAPPUSER` | private | 2027-07-17 | **active** |

`NEWAPPUSER` is the only usable code today.

---

# 10. Admin endpoints (not for the app)

These exist, require an **admin** token plus a module permission, and are the web
back office. Listed only so they are not mistaken for customer endpoints. **The
app must never call them.**

## Coupons — `protect` + `admin`

| Method | Path |
|---|---|
| `GET` | `/api/coupons/admin` |
| `GET` | `/api/coupons/admin/inactive` |
| `GET` | `/api/coupons/admin/expired` |
| `POST` | `/api/coupons` |
| `PUT` | `/api/coupons/:id` |
| `DELETE` | `/api/coupons/:id` |

## Grabian Points — `protect` + `admin` + `checkPermission("loyalty")`

| Method | Path | Purpose |
|---|---|---|
| `GET` / `PUT` | `/api/loyalty/admin/settings` | programme configuration |
| `GET` / `PUT` | `/api/loyalty/admin/rules` | per-category earn rates |
| `DELETE` | `/api/loyalty/admin/rules/:id` | |
| `GET` | `/api/loyalty/admin/customers` | balances, paginated and searchable |
| `POST` | `/api/loyalty/admin/customers/:id/adjust` | manual credit/debit — **requires a `note`** |
| `GET` | `/api/loyalty/admin/transactions` | the ledger |
| `GET` | `/api/loyalty/admin/stats` | outstanding points and AED liability |
| `POST` | `/api/loyalty/admin/expire` | run the expiry sweep |
| `GET` / `POST` | `/api/loyalty/admin/types` | tiers |
| `PUT` / `DELETE` | `/api/loyalty/admin/types/:id` | |

## Referrals — `protect` + `admin` + `checkPermission("referrals")`

| Method | Path | Purpose |
|---|---|---|
| `GET` / `PUT` | `/api/referrals/admin/settings` | programme configuration |
| `GET` | `/api/referrals/admin/list` | every referral, filterable |
| `GET` | `/api/referrals/admin/stats` | totals, discount given, top referrers |
| `POST` | `/api/referrals/admin/rewards/:id/cancel` | revoke — **requires a `reason`** |
| `GET` / `POST` | `/api/referrals/admin/types` | tiers |
| `PUT` / `DELETE` | `/api/referrals/admin/types/:id` | |
| `POST` | `/api/referrals/admin/expire` | retire aged-out rewards |

---

# Quick reference

## Endpoints the app needs

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/coupons` | — | list public coupons |
| `POST` | `/api/coupons/validate` | optional | apply a typed code |
| `GET` | `/api/loyalty/settings` | — | programme config + earn rules |
| `GET` | `/api/loyalty/me` | **yes** | balance, pending, history |
| `POST` | `/api/loyalty/quote` | **yes** | slider bounds and value |
| `GET` | `/api/loyalty/announcements` | **yes** | points confirmed since last seen |
| `POST` | `/api/loyalty/announcements/ack` | **yes** | dismiss the dialog |
| `GET` | `/api/referrals/settings` | — | programme config |
| `GET` | `/api/referrals/validate/:code` | — | check a code at signup |
| `GET` | `/api/referrals/me` | **yes** | code, link, invites, rewards |
| `POST` | `/api/referrals/quote` | **yes** | which rewards apply to this basket |
| `POST` | `/api/orders` | optional | apply all three |

## Things that will bite you

- **Check `isAppDiscount`** on every validate response. See [§8.1](#81-the-app-cannot-use-ordinary-coupons-at-checkout).
- **Read `offer`**, not the flat referral fields. See [§4.1](#41-programme-settings--public).
- **`0` means unlimited** in every `max*` field, everywhere.
- **`pending` points are not spendable.** Never add them to `balance`.
- **An invalid referral code returns `200`.** Branch on `valid`.
- **A `blockedReason` is not an error.** It returns `200` and explains why a
  control is unavailable.
- **Quotes are not promises.** Render what the order response says.
- **Send `product` and `qty`** in `cartItems`, never `productId` / `quantity`.
- **Everything is renameable** from the back office, in English and Arabic. Read
  names from the API on every launch.
- **Never send computed money.** Send the customer's choices; the server prices
  everything.

---

*Verified against `main` and against production data on 2026-11-03. Every
endpoint, field, default and error message here was read from the source or
captured from a live response — none is assumed.*
