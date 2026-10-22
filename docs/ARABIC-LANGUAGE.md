# Arabic language — guide for the app developer

How Arabic works in the GrabAtoZ backend, and what the mobile app has to do to
support it.

Read §1 and §2 first. Everything else is detail you can come back to.

---

## 1. The short version

There are **three separate sources** of Arabic text, and the app needs all
three. They are not interchangeable.

| What | Where it comes from | Example |
|---|---|---|
| **Catalogue content** — product names, categories, brands, blogs | Already in the normal API responses, in fields ending `Ar` | `nameAr` |
| **Static page copy** — About, Privacy, Terms | `GET /api/static-page-translations/by-path` | a lookup map |
| **App interface labels** — "Add to cart", "Checkout" | **Not supplied by this backend.** Ship them in the app | your own strings file |

The backend does **not** have a "give me everything in Arabic" switch. There is
no `?lang=ar` parameter that translates a whole response. The app picks the
Arabic field itself.

---

## 2. Catalogue content: pick the field, don't ask the server

Every translatable record carries its English field and an Arabic twin whose
name ends in `Ar`. Both are always returned. Nothing needs to be requested.

A real response from `GET /api/products?limit=1`, trimmed:

```json
{
  "name":   "Apple iPhone 18 Pro Max 2TB Silver TDRA UAE",
  "nameAr": "آبل آيفون 18 برو ماكس 2 تيرابايت فضي TDRA الإمارات",
  "stockStatusAr": "متوفر في المخزون",
  "slug": "apple-iphone-18-pro-max-2tb-silver",
  "sku":  "APP-IP18PM-2TB-SLV"
}
```

### The rule the app must follow

**Fall back to English when the Arabic field is empty.** Not every record has
been translated, and an empty `nameAr` must show the English name — never a
blank space where a product name should be.

```
displayName = (lang == "ar" && nameAr?.isNotEmpty == true) ? nameAr : name
```

Write that once as a helper and use it everywhere. Doing it inline at each call
site is how one screen ends up blank.

### Every Arabic field, by record type

| Record | Fields ending `Ar` |
|---|---|
| **Product** | `nameAr`, `descriptionAr`, `shortDescriptionAr`, `stockStatusAr`, `tagsAr`, and inside attributes/variations: `keyAr`, `valueAr`, `variationTextAr`, `reverseVariationTextAr`, `selfVariationTextAr`, `selfAvailableModelTextAr` |
| **Category** | `nameAr`, `descriptionAr`, `seoContentAr`, `metaTitleAr`, `metaDescriptionAr` |
| **Sub-category** | same five as Category |
| **Brand** | `nameAr`, `descriptionAr` |
| **Blog** | `blogNameAr`, `titleAr`, `postedByAr`, `descriptionAr`, `metaTitleAr`, `metaDescriptionAr`, `tagsAr` |
| **Blog category / brand / topic** | `nameAr`, `descriptionAr` (plus meta fields on some) |
| **Home section** | `nameAr`, `descriptionAr` |
| **Banner card** | `titleAr`, `subtitleAr` |
| **Country** | `nameAr`, `currencySymbolAr` |

### What is never translated

**`slug` and `sku` stay English in both languages.** They are identifiers, not
copy. Build product URLs from the English `slug` whatever the language is —
only the locale prefix in the path changes (see §5).

Prices and currency codes are numbers and codes, not text. Format them for the
locale on the device; do not expect translated price strings.

---

## 3. Static page copy

Long-form pages (About, Privacy, Terms…) are translated line by line and stored
server-side.

```
GET /api/static-page-translations/by-path?path=/about-us
```

No authentication. Response:

```json
{
  "success": true,
  "pageKey": "about",
  "routePath": "/about-us",
  "translations": [ … ],
  "translationMap": {
    "Who we are": "من نحن",
    "We deliver across the UAE": "نقوم بالتوصيل في جميع أنحاء الإمارات"
  }
}
```

Use **`translationMap`**: look up each English string you are about to show and
use the Arabic value if present. `translations` is the same data as an array and
is only useful if you need the extra fields.

**A page with no translations yet returns `success: true` with `pageKey: null`
and an empty map.** That is not an error — show the English page.

Known page keys: `about`, `privacy-policy`, `disclaimer-policy`,
`terms-conditions`, `refund-return`, `cookies-policy`, `track-order`,
`voucher-terms`.

---

## 4. Interface labels — the app's own job

Buttons, menus, form labels, error messages and validation text are **not**
served by this backend. The website keeps its own strings and so must the app:
use the platform's normal localisation (`Localizable.strings` on iOS,
`strings.xml` on Android, ARB files on Flutter).

There is a machine-translation service the website uses for on-the-fly
translation of loose text, at `https://langaimodel.grabatoz.ae`:

```
POST /api/translate/en-ar     body: { "texts": ["Add to cart", "Checkout"] }
                              →    { "success": true, "translations": ["…", "…"] }
POST /api/translate/ar-en     same shape, other direction
GET  /health                  readiness check
```

**Do not build the app on this.** Three reasons:

1. It returned nothing when this document was written — treat it as unavailable
   until you confirm otherwise.
2. It answers `503` while the model is loading. The website retries and falls
   back to the English text; an app would have to do the same.
3. Machine translation of UI labels is worse than a human-written strings file,
   and it costs a network round trip on every screen.

Use it, if at all, for user-generated text you could not translate in advance —
never for fixed interface copy.

---

## 5. Choosing and remembering the language

How the website does it, for consistency:

- Language codes are **`en`** and **`ar`**.
- The choice is remembered under the key **`preferred-language`**.
- URLs carry a locale prefix of `{country}-{lang}`: **`ae-en`** and **`ae-ar`**.
  A product page is `/ae-ar/product/{slug}` — note the slug is still English.
- In Arabic the document direction is set to **RTL**.

The app should do the same: persist the choice, send the user to the matching
prefix when opening web links, and lay out right-to-left in Arabic.

### RTL is not just text direction

Mirror the layout, not only the alignment: back arrows, carousel direction,
drawer side, progress bars, and any icon that implies direction. Leave
**numbers, prices, SKUs, phone numbers and dates** unmirrored — they read
left-to-right inside Arabic text.

---

## 6. Sending Arabic back to the server

Nothing special. The API is UTF-8 throughout, and Arabic in a name, an address
or an order note is stored and returned as sent. Send
`Content-Type: application/json; charset=utf-8`.

Transactional email and WhatsApp messages are **English-only today**. If Arabic
versions of those are wanted, that is backend work and not something the app can
switch on.

---

## 7. Checklist before release

- [ ] One shared helper does the Arabic-or-fall-back-to-English choice
- [ ] No screen shows a blank where an untranslated field should be
- [ ] `slug` and `sku` are never swapped for Arabic
- [ ] Static pages read `translationMap`, and an empty map shows English
- [ ] Interface labels ship in the app, not fetched at runtime
- [ ] The language choice survives a restart
- [ ] RTL mirrors the layout; numbers and prices stay LTR
- [ ] Long Arabic product names do not clip — they run longer than English
- [ ] An Arabic name typed into checkout saves and comes back correctly

---

## 8. Open points for the backend team

These are gaps, not instructions — raise them if the app needs them:

- No `?lang=` parameter; the app does the field selection itself.
- Translation coverage is partial. Admin → **Arabic Conversion** is where
  content gets translated; expect English fallbacks until it is run.
- The machine-translation service was unreachable when this was written.
- Emails and WhatsApp messages are English-only.
