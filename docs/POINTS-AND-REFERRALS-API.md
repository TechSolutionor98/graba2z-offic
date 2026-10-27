# Grabian Points & Referrals — API guide for the app

Two separate programmes with separate endpoints. They are **not** interchangeable:

| | Grabian Points | Referrals |
|---|---|---|
| What it is | Points earned on spend, redeemed for money off | Invite a friend; both sides get a discount |
| Base path | `/api/loyalty` | `/api/referrals` |
| Customer holds | a **points balance** | a list of **reward vouchers** |
| Applied at checkout as | a number of points | one chosen reward |

Base URL: `https://api.grabatoz.ae`

All responses are JSON. Send `Content-Type: application/json; charset=utf-8`.

## Authentication

Endpoints marked **Private** need the signed-in customer's token:

```
Authorization: Bearer <token>
```

Public endpoints need nothing. Nothing here uses an admin token — the `/admin/*`
routes exist but are for the web back office, not the app.

---

# 1. Grabian Points

## 1.1 Programme settings — public

```
GET /api/loyalty/settings
```

Call this on launch and cache it. It tells you what to call the points, the
rates, and where the shop wants them shown.

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

**Read these carefully, they are not all what they look like:**

- `earnPointsPerAed` — points earned per AED spent.
- `redeemPointsPerAed` — points needed **for one AED off**. Above, 1000 points = AED 1.
- `minPointsToRedeem` — below this, the customer cannot redeem at all.
- `redeemStep` — points must be a multiple of this. 100 above, so 1,250 is not allowed; 1,200 is.
- `maxRedeemPercentOfOrder` — a cap as a percentage of the order.
- `maxPointsPerOrder` — a hard cap in points. **`0` means no cap**, not "zero allowed".
- `isEnabled` — `false` means hide the whole feature.

**Never hardcode the name.** The shop calls them "Grabian Points" today and can
rename them, in English and Arabic, without an app release. Use `pointsName`,
or `pointsNameSingular` for one.

## 1.2 The customer's points — private

```
GET /api/loyalty/me?page=1&limit=20
Authorization: Bearer <token>
```

```json
{
  "balance": 2400,
  "pending": 150,
  "lifetime": 8900,
  "balanceValueAed": 2.4,
  "canRedeem": true,
  "tier": {
    "_id": "...",
    "name": "Gold",
    "color": "#f59e0b",
    "earnMultiplier": 1.5,
    "badgeText": "Gold member"
  },
  "settings": { "...": "same shape as 1.1" },
  "transactions": [
    {
      "_id": "...",
      "type": "earn",
      "status": "confirmed",
      "points": 240,
      "amountAed": 240,
      "description": "Order #1043",
      "order": "...",
      "expiresAt": "2027-10-23T00:00:00.000Z",
      "createdAt": "2026-10-23T07:25:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "totalCount": 37,
  "hasMore": true
}
```

- **`balance` is what can be spent. `pending` cannot be.** Points from an order
  stay pending until it is delivered. Show them separately — a customer who
  sees one number and cannot spend it will think the app is broken.
- `balanceValueAed` is the balance already converted to money, so you do not do
  the arithmetic yourself.
- `canRedeem` folds in `isEnabled` and `minPointsToRedeem`. Use it rather than
  comparing numbers.
- `tier` is `null` when the customer has no tier. `earnMultiplier` is already
  applied when points are awarded — do not multiply again for display.
- `transactions` is paginated; page with `page` and `limit` (max 100) and stop
  when `hasMore` is false.
- `type` is `earn`, `redeem`, `adjust` or `expire`. `status` is `pending`,
  `confirmed`, `used` or `expired` — cancelled ones are never returned.

## 1.3 What points are worth on this order — private

```
POST /api/loyalty/quote
Authorization: Bearer <token>

{ "eligibleAmount": 850.00, "requestedPoints": 2000 }
```

```json
{
  "maxPoints": 2000,
  "points": 2000,
  "discountAed": 2.0,
  "balance": 2400,
  "pending": 150,
  "pointsName": "Grabian Points",
  "redeemPointsPerAed": 1000,
  "minPointsToRedeem": 1000,
  "redeemStep": 100
}
```

Call it when the cart total changes and when the customer moves the slider.
`maxPoints` is the ceiling for this order with every cap applied; `points` is
what their request was rounded down to.

**This is a quote, not a commitment.** The order endpoint recalculates
everything from verified prices. Show this number, but expect the order
response to be the truth — and if they differ, trust the order.

## 1.4 Congratulating the customer — private

```
GET  /api/loyalty/announcements
POST /api/loyalty/announcements/ack
```

Points confirmed since the customer last looked, so the app can say
"you earned 240 points" once. `ack` marks them seen — call it after showing,
or the message repeats.

---

# 2. Referrals

## 2.1 Programme settings — public

```
GET /api/referrals/settings
```

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
    "offer": { "referee": { "...": "" }, "referrer": { "...": "" } }
  }
}
```

- **referee** = the friend who was invited. **referrer** = the customer who
  invited them. Getting these the wrong way round shows each person the other's
  offer.
- `discountType` is `percentage` or `fixed`. For `fixed`, the value is in AED.
- `*MaxDiscountAed` and `*MinOrderAed` of **`0` mean no limit**, not zero.
- `qualifyOnOrderStatus` is when the inviter's reward unlocks — `Delivered`
  above, so there is a real delay between the friend ordering and the reward
  appearing. Say so in the UI or it reads as broken.
- `shareMessage` contains `{{link}}`. Replace that token with the customer's
  own link from §2.2, do not append it.

## 2.2 The customer's referral panel — private

```
GET /api/referrals/me?country=ae&lang=en
Authorization: Bearer <token>
```

```json
{
  "code": "FAHAD7X2",
  "link": "https://www.grabatoz.ae/ae-en/?ref=FAHAD7X2",
  "invites": [
    {
      "id": "...",
      "name": "Ahmed",
      "email": "ah•••@gmail.com",
      "status": "qualified",
      "joinedAt": "2026-10-01T10:00:00.000Z",
      "qualifiedAt": "2026-10-09T12:00:00.000Z",
      "rewarded": true,
      "notRewardedReason": ""
    }
  ],
  "rewards": [
    {
      "id": "...",
      "role": "referrer",
      "code": "FAHAD7X2",
      "referralTypeName": "Gold referrer",
      "discountType": "percentage",
      "discountValue": 10,
      "maxDiscountAed": 0,
      "minOrderAed": 0,
      "firstOrderOnly": false,
      "status": "active",
      "expiresAt": "2026-12-31T00:00:00.000Z",
      "usedAt": null,
      "discountAppliedAed": 0,
      "description": "Thanks for inviting Ahmed"
    }
  ],
  "tier": null,
  "offer": { "referee": { "...": "" }, "referrer": { "...": "" } },
  "stats": {
    "total": 4,
    "pending": 2,
    "qualified": 1,
    "cancelled": 1,
    "activeRewards": 1,
    "totalEarnedAed": 37.5
  },
  "settings": { "...": "same shape as 2.1" }
}
```

- **When the programme is off**, this returns `{ settings: { isEnabled: false },
  code: null, link: "", invites: [], rewards: [], stats: null }`. Handle
  `stats: null` — it is not an empty object.
- `invites[].name` and `.email` are **deliberately masked** by the server. Show
  them as given; do not try to recover the full address, and do not treat this
  as a contact list.
- `invites[].status`: `pending` (joined, not yet qualified), `qualified`,
  `cancelled`. `notRewardedReason` explains a qualified invite that paid
  nothing — show it, it saves a support message.
- `rewards[].status`: `active` (spendable), `used`, `expired`, `cancelled`.
  Only `active` ones go in the cart.
- `rewards[].role` says whose reward it is: `referrer` for inviting, `referee`
  for being invited.
- `offer` is what each side is promised **right now** for this customer,
  including their tier. Prefer it over the flat numbers in `settings` for
  "you get X, your friend gets Y".
- `country` and `lang` only shape the `link` — pass the customer's current
  locale so the link opens in the right language.

## 2.3 Is this code real? — public

```
GET /api/referrals/validate/<CODE>
```

Used on the signup screen when the app opens from a referral link.

```json
{ "valid": true, "firstName": "Fahad", "offer": { "...": "" } }
```

Rejections name the reason, so the message can be specific:

```json
{ "valid": false, "reason": "unknown_code" }
```

`reason` is `programme_disabled`, `empty` or `unknown_code`. **Only the
inviter's first name comes back** — the code cannot be used to look anyone up.

Note this returns **HTTP 200 with `valid: false`**, not a 4xx. Check the field,
not the status code.

## 2.4 What can be spent on this order — private

```
POST /api/referrals/quote
Authorization: Bearer <token>

{ "eligibleAmount": 850.00 }
```

```json
{ "rewards": [ { "...": "each spendable reward, with its discount for this order" } ],
  "best": { "...": "the one worth most" } }
```

`best` is the reward to preselect. When the programme is off you get
`{ "rewards": [], "best": null }`.

Same caveat as the points quote: **the order endpoint is the authority.**

---

# 3. Things that will bite you

- **Points and referral rewards are separate** and may both apply to one order.
  Do not add them into a single "discount" figure in your UI — the customer
  needs to see which is which to understand their balance afterwards.
- **`0` means unlimited** in every `max*` field in both programmes.
- **Pending is not spendable.** Points pend until the order is delivered, and
  a referral reward does not exist until the friend's order reaches
  `qualifyOnOrderStatus`. Both have a real delay, and both generate support
  messages if the app implies otherwise.
- **Everything is renameable from the back office** — programme names, point
  names, in English and Arabic. Read them from the API on every launch.
- **Quotes are not promises.** Always render what the order response says, not
  what the quote said, and never block checkout on a quote that disagrees.
- **Arabic:** pass `lang=ar` where an endpoint accepts it, and use the `*Ar`
  name fields. See `ARABIC-LANGUAGE.md` for the wider rules.

# 4. Not for the app

`/api/loyalty/admin/*` and `/api/referrals/admin/*` exist and require an admin
token. They are the web back office — settings, tiers, manual adjustments,
expiry runs. The app should never call them.
