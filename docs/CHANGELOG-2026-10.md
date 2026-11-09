# What shipped in October 2026 — GrabAtoZ

A record of what was built, why it was built that way, and which parts are worth
carrying into another project.

**33 commits · 123 files · +24,370 / −1,344 lines · 2026-10-01 → 2026-10-29**

The commit messages are not useful (`Fixeddd`, `Cide Pushed`, `Fixeddddd`), so
everything below was reconstructed from the diffs, not from the log. Where a
design decision is recorded in a source comment, it is quoted rather than
paraphrased.

---

## At a glance

| # | Feature | Size | Reusable elsewhere? |
|---|---|---|---|
| 1 | [Email campaign system](#1-email-campaign-system) | ~6,000 lines | **Yes — the biggest win** |
| 2 | [WhatsApp Business integration](#2-whatsapp-business-integration) | ~1,500 lines | **Yes** |
| 3 | [Stock ledger](#3-stock-ledger) | ~600 lines | **Yes — small and high value** |
| 4 | [Inventory + barcode labels](#4-inventory-rebuild--barcode-labels) | ~1,900 lines | Partly |
| 5 | [Quotations](#5-quotations) | ~1,300 lines | Partly |
| 6 | [Push notification sounds](#6-push-notification-sounds) | ~150 lines | **Yes** |
| 7 | [Product search rewrite](#7-product-search-rewrite) | ~320 lines | **Yes** |
| 8 | [Out-of-stock enforcement](#8-out-of-stock-enforcement) | ~200 lines | **Yes** |
| 9 | [SEO + soft-404 fix](#9-seo-fields--the-soft-404-fix) | ~400 lines | Partly |
| 10 | [Catalogue clean-up scripts](#10-catalogue-clean-up-scripts) | ~350 lines | **Yes — the pattern** |
| 11 | [Smaller changes](#11-smaller-changes) | — | — |

---

# 1. Email campaign system

**The month's largest piece of work.** A drag-and-drop email builder, a campaign
sender, and the compliance machinery around both.

### What it does

- A **block-based email builder** — the admin assembles an email from typed
  blocks (heading, text, image, button, product grid, divider, spacer) rather
  than writing HTML.
- A **rich text editor** built on TipTap with custom extensions.
- An **image manager** with its own upload/serve route.
- **Campaign sending** to a combined audience of registered users, newsletter
  subscribers and bulk-purchase enquiries.
- A **bulk mail report** showing per-recipient delivery state.
- **Unsubscribe and email preferences** pages, plus a suppression list.

### Files

```
client/src/components/admin/email/EmailBuilder.jsx      (867)
client/src/components/admin/email/BlockSettings.jsx     (888)
client/src/components/admin/email/RichTextEditor.jsx    (457)
client/src/components/admin/email/ImageManager.jsx      (371)
client/src/components/admin/email/BulkMailReport.jsx    (312)
client/src/components/admin/email/richTextExtensions.js  (64)
client/src/components/admin/email/email-editor.css       (50)
client/src/pages/admin/AdminCampaigns.jsx              (1,216)
client/src/pages/admin/AdminEmailTemplates.jsx         (+1,228)
client/src/pages/EmailPreferences.jsx                    (123)
client/src/pages/UnsubscribePage.jsx
client/src/utils/emailBlocks.js emailLayouts.js emailPresets.js emailImageUrl.js
server/services/campaignService.js
server/routes/campaignRoutes.js  server/routes/mediaRoutes.js
server/models/emailCampaignModel.js campaignRecipientModel.js
server/models/emailLogModel.js emailSuppressionModel.js
server/utils/emailImages.js
```

### Three decisions worth copying

**Email HTML is not web HTML.** From `emailBlocks.js`:

> Outlook renders with Word's engine, Gmail strips `<style>` blocks, and flexbox
> and grid are not available anywhere worth relying on. So: tables for layout,
> inline styles for everything, and no shorthand Outlook mis-parses. It looks
> like 2005 because 2005 is what the clients support.

**Blocks are the source of truth; HTML is the output.** A template stores
*both* — `blocks` so the builder can reopen and edit it, and `html` so the
sending path, which knows nothing about blocks, keeps working unchanged. This
is what let a visual builder be added to an existing mailer without rewriting
the mailer.

**Three rules in `campaignService.js` that should not be loosened:**

1. *One person gets one email.* Somebody who is a registered user, a newsletter
   subscriber **and** a bulk-purchase enquiry is one human being — three copies
   of the same offer reads as spam to them and to Gmail.
2. *The unsubscribe list is re-checked immediately before each send*, not only
   when the audience was gathered. A campaign to several thousand people takes a
   while; opting out has to work during it.
3. *Sending is paced.* A loop firing a few thousand messages at a shared mailbox
   provider is how a domain gets rate-limited or blocked.

### Carrying it over

The builder (`emailBlocks.js` + `EmailBuilder.jsx` + `BlockSettings.jsx`) is the
most portable part — it depends on TipTap and React, not on this app. The
campaign service depends on the user/subscriber/enquiry models and would need
its audience query rewritten.

---

# 2. WhatsApp Business integration

Order notifications and customer support over Meta's **official WhatsApp
Business Platform (Cloud API)**.

### Why the official API, not a QR-code library

Quoted from `whatsappService.js`, because this is the part people get wrong:

> Anything that logs in by scanning the WhatsApp Web code is the server
> impersonating a linked phone. It breaks WhatsApp's terms, and it — not message
> volume — is what gets a business banned.

If you reuse this, **do not** swap in `whatsapp-web.js` or Baileys to avoid the
Meta setup. The setup cost is the point.

### Files

```
server/services/whatsappService.js
server/routes/whatsappRoutes.js
server/models/whatsappSettingsModel.js
server/models/whatsappContactModel.js
server/models/whatsappMessageModel.js
client/src/pages/admin/AdminWhatsApp.jsx   (947 lines — inbox UI)
docs/WHATSAPP_SETUP.md
```

`AdminWhatsApp.jsx` is a full two-pane inbox: contact list, conversation
thread, send box, and settings. Webhook signature verification is in the service
(`crypto` import at the top) — keep it.

---

# 3. Stock ledger

Small, and the highest-value-per-line change of the month.

### The rule

From `server/utils/stockLedger.js`:

> **The only way stock changes.** Every movement is posted here and nowhere
> else, because this function does two things that have to happen together: it
> adjusts the product's stock figure and it writes the ledger row that explains
> the adjustment. Anything that changed `countInStock` on its own would put the
> figure and its history out of step, and once they disagree neither can be
> trusted again.

Every stock change — sale, return, manual correction, opening balance — becomes
a `StockMovement` row with a typed reason. The product's `countInStock` is never
written directly from anywhere else.

### Files

```
server/utils/stockLedger.js
server/models/stockMovementModel.js        (MOVEMENT_REASONS enum)
server/scripts/backfill-opening-stock.js   (+ npm scripts stock:backfill-opening[:dry])
docs/STOCK_LEDGER.md
```

### Carrying it over

**Copy this one first.** It is about 200 lines of real logic, has no dependency
on anything GrabAtoZ-specific beyond the product model's field name, and it
solves a problem ("why is this number wrong?") that otherwise becomes
unanswerable six months in. The backfill script handles the awkward part —
establishing an opening balance for stock that already existed.

---

# 4. Inventory rebuild + barcode labels

The 585-line `pages/admin/Inventory.jsx` was deleted and replaced by composable
pieces.

### Files

```
client/src/components/admin/inventory/InventoryFilterBar.jsx   (149)
client/src/components/admin/inventory/inventoryShared.jsx      (190)
client/src/components/admin/inventory/LabelDesigner.jsx        (366)
client/src/hooks/useInventoryQuery.js                          (201)
client/src/hooks/useProductSelection.js                         (62)
client/src/pages/admin/CreateLabels.jsx                        (324)
client/src/pages/admin/StoreStats.jsx                          (296)
client/src/utils/labelSheet.js
client/src/utils/barcodeSvg.js
client/src/utils/code128.js
```

### The label printing

Code 128 barcodes generated as **inline SVG** — no image server, no external
barcode library. The sheet is laid out at **real millimetre sizes**, because
label paper is sold as "50 × 25 mm" and, per the source comment, *"the only
thing that matters is whether the ink lands on the sticker."*

One detail that cost time and is worth knowing: the label CSS is written into a
hidden `<iframe>` via `doc.write()`, so its `@page { size: … }` rule cannot leak
into the rest of the app. Every other print surface — all nine invoice screens —
stays on `size: A4; margin: 0.5in`. Set a thermal roll size globally and you
silently break every invoice.

### Carrying it over

`code128.js` + `barcodeSvg.js` + `labelSheet.js` are self-contained and portable.
`useInventoryQuery` and `useProductSelection` are good patterns but assume this
API's shape.

---

# 5. Quotations

A quotation is an order that has not become an order yet. Rather than a separate
collection, `orderModel` gained a `documentType: "order" | "quotation"`
discriminator plus `quotationStatus: "Draft" | "Hold" | "Converted"`.

### Why a discriminator and not a second collection

Everything that already knew how to price, print and total an order kept
working. `"Hold"` parks a document that is agreed but not ready for the
warehouse.

The cost: **every order query in the codebase now needs a `documentType`
filter**, and the ones written before this change default to including
quotations. Watch for that if you copy the approach — in this codebase the guard
is a shared `ORDER_DOCUMENT_QUERY` constant.

### Files

```
client/src/components/admin/QuotationInvoiceComponent.jsx  (763)
client/src/pages/admin/RecentQuotation.jsx
client/src/pages/admin/WholesaleOrders.jsx
client/src/pages/admin/CreateOrder.jsx
server/models/orderModel.js   (documentType, quotationStatus, taxRate, showBankDetails, stagedAs)
server/routes/adminRoutes.js
```

Also added: a per-document **VAT rate** (so an invoice splits lines at the rate
the admin set rather than the store default forever) and a per-document
**"show bank details"** toggle — *"a cash sale should not advertise a transfer
account."*

---

# 6. Push notification sounds

Firebase push with a selectable notification sound per message.

### The trap this encodes

From `server/utils/pushSounds.js` — this is the knowledge, not the code:

> The server only sends the **name** of a sound. The audio file itself has to
> ship inside the mobile app, or the device falls back to the default tone.
>
> - Android: `android/app/src/main/res/raw/<id>.mp3` (lowercase, no spaces or hyphens)
> - iOS: bundled in the app, ≤ 30s, e.g. `<id>.caf` / `.aiff` / `.wav`
>
> **Android 8+ takes the sound from the notification *channel*, not from the
> message**, so the app must also create one channel per sound using `channelId`.
> Without that channel a modern Android device plays the default tone no matter
> what is sent.

Channel ids: `push_default`, `push_chime`, `push_ding`, `push_cash`,
`push_alert`, `push_silent` — and they must match what the app registers
character for character.

### Files

```
server/utils/pushSounds.js
server/utils/push.js
server/models/pushNotificationModel.js
client/src/pages/admin/AdminPushNotifications.jsx
docs/APP_NOTIFICATIONS_API.md
```

---

# 7. Product search rewrite

**The bug:** searching a product's exact full name returned nothing.

### What changed

`server/utils/productSearch.js` was rewritten as the one shared search module,
and `client/src/services/productCache.js` was made to mirror it so client-side
and server-side ranking agree.

- Token normalisation strips leading/trailing punctuation (Unicode-aware).
- A stopword list (`a an and for from in of on or the to with &`).
- **Strict match first, then widen.** A long query must match every term; only
  if that yields nothing does it fall back to a partial match requiring
  `max(4, ceil(terms × 0.6))` hits, and only then to searching descriptions.
- Weighted relevance scoring — exact name 200, name prefix 120, coverage 60,
  category all-terms 80, code all-terms 90, and so on.
- Relevance now **leads** the sort: `{ _searchRelevance: -1, _stockRank: 1, … }`.
  Previously stock rank led, so the right product sat below in-stock noise.
- Search results ignore the in-stock filter unless the shopper sets it
  themselves — *"no matter if it's in stock or out of stock."*

### Carrying it over

`productSearch.js` is portable to any Mongo catalogue — the weights and the
strict-then-widen fallback are the valuable parts. The "keep the server and
client scorers in step" arrangement is a liability worth noting: nothing
enforces that they match.

---

# 8. Out-of-stock enforcement

**The bug:** on the product page, the "frequently bought together" bundle let an
out-of-stock item be ticked, added to cart, and ordered.

Closed at both layers:

- **UI** (`ProductDetails.jsx`) — out-of-stock items are excluded from bundle
  candidates, skipped by auto-select, shown with a disabled checkbox and an
  "Out of stock" badge, and filtered again when building the cart payload.
- **Server** (`orderRoutes.js`) — a stock guard before the order is written.

### The subtlety in the server guard

A naive `countInStock > 0` check would have **refused real sales**.
`countInStock` defaults to `0`, and some products carry blank placeholder
variations (`countInStock: null`) while actually holding stock. The guard
therefore distinguishes "no stock figure was set" from "the stock figure is
zero":

```js
const variationStockIsSet =
  variationStock !== null && variationStock !== undefined && variationStock !== ""
if (variationStockIsSet) {
  if (!(Number(variationStock) > 0)) throw new Error(`${product.name} (${label}) is out of stock`)
} else if (product.stockStatus === "Out of Stock") {
  throw new Error(`${product.name} is out of stock`)
}
```

**The general rule, which is the transferable part:** the admin-set status
decides. A product marked In Stock is in stock whatever the count says; one
marked Out of Stock stays out whatever the count says. The count only speaks
when no status was set at all.

---

# 9. SEO fields + the soft-404 fix

### SEO

Per-page SEO fields on `seoPageModel`, edited from `AdminHomePageSEO.jsx` and
rendered by `StaticRouteSEO.jsx`. An unused Google site-verification token was
removed.

### The soft-404

`client/api/product-page.js` (a Vercel serverless function) served the app shell
for product URLs. Two faults:

1. A deleted product returned **HTTP 200** with an empty shell — a soft 404, which
   Google treats as a live page and keeps indexed.
2. The function could fetch and cache a page that was not the app shell at all.
   On one occasion it cached Vercel's **"Log in to Vercel"** deployment-protection
   page and served it to every product URL on the live site.

Fixed with shell validation before caching (`html.includes("/assets/") &&
html.includes('id="root"')`), a real `404` when the API says the product is gone,
and `"missing": [{ "type": "query", "key": "__shell" }]` on the `vercel.json`
rewrites so the function can fetch the shell without recursing into itself.

**Worth knowing in any Vercel project:** Deployment Protection applies to the
preview/deployment hostname. If a serverless function fetches its own origin by
`VERCEL_URL`, it can get the login page back and cache it.

---

# 10. Catalogue clean-up scripts

Two one-off data fixes, both following the same shape:

```
server/scripts/fix-trademark-titles/   apply.mjs, rules.mjs, overrides.mjs + 3 backups
server/scripts/fix-weapon-words/       apply.mjs + 3 backups
```

`fix-trademark-titles` strips trademark noise from product titles with a rules
file plus a hand-maintained overrides file. `fix-weapon-words` rewrites wording
that ad platforms reject.

### The pattern — this is the part to copy, not the scripts

Every bulk-write script in this repo now follows it:

1. **Dry run by default.** Nothing is written without an explicit `--write`.
2. **Report before acting** — matched, not found, already correct.
3. **A full EJSON backup of every affected document, written before the first
   write.** EJSON (`mongoose.mongo.BSON.EJSON`) keeps ObjectIds and dates as
   themselves, so a restore is byte-exact rather than approximately right.
4. **`--restore <backup>` in the same script.** The undo lives with the script —
   a backup whose restore code has to be rewritten later is not a backup.
5. **Prefer hiding to deleting.** Records referenced by order history are
   deactivated, never destroyed, so invoices still resolve.

The backup JSON files are committed alongside the scripts deliberately.

---

# 11. Smaller changes

| Date | Change |
|---|---|
| 10-01 | Firebase admin credentials moved out of the repo (`server/.gitignore`) |
| 10-02 | Grabian Points and Referral Programme **terms pages** (1,129 lines of policy copy) |
| 10-02 | Invoice layout rework; quotation delete; QTY/unit-price corrections |
| 10-16 | Checkout and order-route fixes |
| 10-17 | Cart context, checkout and product-detail rework (+531 lines) |
| 10-19 | Dead code removed from product form, cart, checkout, add-product |
| 10-22 | Email preferences page; `emailLogModel` |
| 10-23 | Unsubscribe page hardening; RFC 8058 one-click unsubscribe |
| 10-27 | `docs/POINTS-AND-REFERRALS-API.md` written for the app developer |
| 10-28 | Country-selector landing page: panel border removed, logo and cards sized in viewport-height units (`clamp()` / `min(px, vh)`) so every card fits on one screen |

### Documentation written this month

```
docs/APP_NOTIFICATIONS_API.md
docs/ARABIC-LANGUAGE.md
docs/COUNTRIES_CURRENCIES_PAYMENTS_API.md
docs/POINTS-AND-REFERRALS-API.md
docs/STOCK_LEDGER.md
docs/WHATSAPP_SETUP.md
```

(`docs/COUPONS-POINTS-REFERRALS-API.md` followed in November and supersedes the
points/referrals one.)

---

# If you are starting a new project from this

Ranked by value-per-effort:

| Priority | Take | Why |
|---|---|---|
| 1 | **Stock ledger** (`stockLedger.js` + `stockMovementModel.js`) | ~200 lines; makes stock history answerable forever. Almost no coupling |
| 2 | **Bulk-script pattern** (§10) | Costs nothing to adopt, prevents the unrecoverable mistake |
| 3 | **Email block builder** (`emailBlocks.js` + the three components) | Large but self-contained; TipTap + React only |
| 4 | **Barcode/label printing** (`code128.js`, `barcodeSvg.js`, `labelSheet.js`) | Zero dependencies; the iframe trick is the non-obvious part |
| 5 | **`pushSounds.js`** | Copy the comment even if you drop the code — the Android channel rule is the thing |
| 6 | **Search module** (`productSearch.js`) | Portable to any Mongo catalogue |
| 7 | **WhatsApp service** | Only if you will do the Meta Cloud API setup properly |

## Known liabilities carried forward

Be honest about these when reusing the code:

- **The search scorer exists twice** — server (`productSearch.js`) and client
  (`productCache.js`). Nothing enforces that they stay in step.
- **The quotation discriminator** means every pre-existing order query silently
  includes quotations unless it filters `documentType`.
- **Coupon validate and coupon checkout apply different rules.** Documented in
  `COUPONS-POINTS-REFERRALS-API.md` §8; not fixed.
- **`labelSheet.js`'s `@page` isolation is load-bearing.** If you lift the label
  code without the iframe, you change the paper size of every invoice.

---

*Reconstructed from the git history on 2026-11-04, covering `982f903^..50dd53d`
(2026-10-01 → 2026-10-29). Design rationale is quoted from source comments; the
rest is read from the diffs.*
