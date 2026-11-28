// Server-rendered head for product pages.
//
// The app is a single-page build: every route is served the same empty shell,
// and the title, meta tags and ProductSchema are written by react-helmet once
// React boots. A crawler never runs that JavaScript, so Googlebot sees a page
// with an empty <title>, no price and no structured data -- which is why
// Merchant Center keeps inventing priceless offers from the website.
//
// This function serves the same shell with the head filled in. The body is
// untouched: React still boots and takes over exactly as before, so nothing
// about the page a shopper sees changes.
//
// It must never break a product page. Every failure path falls through to the
// plain shell, which is what the site served before this existed.
import fs from "node:fs"
import path from "node:path"

const API = process.env.VITE_API_URL || "https://api.grabatoz.ae"
const SITE = "https://www.grabatoz.ae"
const CURRENCY = "AED"

// The built shell carries hashed asset names, so it has to come from the build
// output rather than the source app.html. Read once, keep for the lifetime of
// the warm function.
let shellCache = null
const SHELL_PATHS = ["dist/app.html", "public/app.html", "app.html"]

// Is this actually our application shell?
//
// Every candidate is checked, not just the ones read off disk. A fetch that
// returns 200 has not necessarily returned the shell: a deployment with Vercel
// Authentication switched on answers a request for its own pages with the
// Vercel login page, at status 200. Served without this check, that login page
// became the product page -- correct <title>, Vercel's sign-in form below it.
//
// The test is the built bundle. The source app.html points at /src/main.jsx and
// would not boot in production; a login page references neither.
const isAppShell = (html) =>
  typeof html === "string" && html.includes("/assets/") && html.includes('id="root"')

const fetchShell = async (url) => {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 4000)
  try {
    const res = await fetch(url, { headers: { "x-shell-fetch": "1" } })
    if (!res.ok) return null
    const html = await res.text()
    return isAppShell(html) ? html : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

const readShell = async () => {
  if (shellCache) return shellCache

  for (const rel of SHELL_PATHS) {
    try {
      const html = fs.readFileSync(path.join(process.cwd(), rel), "utf8")
      if (isAppShell(html)) {
        shellCache = html
        return shellCache
      }
    } catch {
      /* try the next location */
    }
  }

  // Not on disk, so ask over HTTP -- the public site first. The deployment's own
  // VERCEL_URL is the wrong place to ask: it is the one address that deployment
  // protection guards, so it answers with a login page instead of the shell.
  for (const url of [`${SITE}/app.html`, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/app.html` : null]) {
    if (!url) continue
    const html = await fetchShell(url)
    if (html) {
      shellCache = html
      return shellCache
    }
  }

  throw new Error("no valid app shell from disk, site or deployment")
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")

// JSON inside a <script> block only has to be safe against an early </script>.
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c")

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

// Mirrors the feed: offerPrice is the sale price when it undercuts price.
const pricing = (p) => {
  const regular = num(p.price)
  const offer = num(p.offerPrice)
  if (!regular && !offer) return null
  if (regular && offer && offer < regular) return { price: offer, was: regular }
  return { price: regular || offer, was: null }
}

const availability = (p) => {
  if (p.stockStatus === "Out of Stock") return "https://schema.org/OutOfStock"
  if (p.stockStatus === "PreOrder") return "https://schema.org/PreOrder"
  if (Number(p.countInStock) > 0) return "https://schema.org/InStock"
  return "https://schema.org/OutOfStock"
}

const plain = (html, max) => {
  const t = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

/**
 * An admin-entered SEO field, ready to put in a tag.
 *
 * Blank and whitespace-only come back as "" so `||` falls through to the next
 * choice -- a field the admin cleared must not win over the product's own text.
 * The cap is a guard rail, not a style rule: at least one product carries a
 * 2,000-character ogTitle pasted in by accident, and a <title> that long is
 * worse for search than no override at all.
 */
const clean = (value, max = 320) => {
  const t = String(value ?? "").replace(/\s+/g, " ").trim()
  if (!t) return ""
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

const buildHead = (p, lang, url) => {
  const money = pricing(p)
  const arabic = lang === "ar"
  const name = (arabic && p.nameAr) || p.name || ""
  const brand = typeof p.brand === "object" ? p.brand?.name : p.brand

  // What the admin typed in the SEO tab wins over anything derived from the
  // product itself.
  //
  // This used to read `p.metaTitle` and `p.metaDescription`, which are not fields
  // on the product -- the schema calls them `seoTitle` and `seoDescription`. Both
  // were therefore always undefined, every page silently fell back to the raw
  // product name and a truncated feature list, and nothing an admin wrote in the
  // SEO tab ever reached Google or an SEO extension. The old names are still
  // accepted last in case anything really carries them.
  const seoTitle = clean(p.seoTitle) || clean(p.metaTitle)
  const seoDescription = clean(p.seoDescription) || clean(p.metaDescription)

  // The fallback, used only when the SEO tab was left empty.
  const derived = plain((arabic && p.descriptionAr) || p.shortDescription || p.description || name, 300)

  const title = seoTitle || `${name} | Grab A to Z`
  const description = seoDescription || derived

  // Open Graph has its own fields, and falls back to the SEO ones, then to the
  // product. A social card and a search result are allowed to read differently.
  const ogTitle = clean(p.ogTitle) || title
  const ogDescription = clean(p.ogDescription) || description
  const ogImage = clean(p.ogImage) || p.image

  const product = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    description,
    url,
    ...(p.image ? { image: [p.image] } : {}),
    ...(p.sku ? { sku: p.sku, mpn: p.sku } : {}),
    ...(p.gtin ? { gtin: p.gtin } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(money
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: CURRENCY,
            price: money.price.toFixed(2),
            availability: availability(p),
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Grab A to Z Trading LLC" },
          },
        }
      : {}),
  }

  // `data-rh="true"` marks a tag as belonging to react-helmet-async, which is what
  // the app uses on the client.
  //
  // Without it the page ends up with two of every tag: this one, written into the
  // shell, and Helmet's own, added when the app hydrates. Helmet only clears tags
  // carrying its marker, so it left these in place and added duplicates beside
  // them. Two `<meta name="description">` tags is a real defect even when both say
  // the same thing -- a crawler or an SEO extension picks one, and which one is
  // not defined anywhere. Marked, Helmet replaces these instead of doubling them.
  const rh = `data-rh="true"`

  const tags = [
    `<title ${rh}>${esc(title)}</title>`,
    `<meta ${rh} name="description" content="${esc(description)}" />`,
    clean(p.seoKeywords) ? `<meta ${rh} name="keywords" content="${esc(clean(p.seoKeywords))}" />` : "",
    `<link ${rh} rel="canonical" href="${esc(clean(p.seoCanonicalUrl) || url)}" />`,
    clean(p.seoRobots) ? `<meta ${rh} name="robots" content="${esc(clean(p.seoRobots))}" />` : "",
    `<meta ${rh} property="og:type" content="product" />`,
    `<meta ${rh} property="og:title" content="${esc(ogTitle)}" />`,
    `<meta ${rh} property="og:description" content="${esc(ogDescription)}" />`,
    `<meta ${rh} property="og:url" content="${esc(url)}" />`,
    ogImage ? `<meta ${rh} property="og:image" content="${esc(ogImage)}" />` : "",
    `<meta ${rh} name="twitter:card" content="summary_large_image" />`,
    `<meta ${rh} name="twitter:title" content="${esc(ogTitle)}" />`,
    `<meta ${rh} name="twitter:description" content="${esc(ogDescription)}" />`,
    ogImage ? `<meta ${rh} name="twitter:image" content="${esc(ogImage)}" />` : "",
  ]
  if (money) {
    tags.push(
      `<meta property="product:price:amount" content="${money.price.toFixed(2)}" />`,
      `<meta property="product:price:currency" content="${CURRENCY}" />`,
      `<meta property="product:availability" content="${esc(availability(p).split("/").pop())}" />`
    )
  }
  tags.push(`<script type="application/ld+json">${jsonLd(product)}</script>`)
  return tags.filter(Boolean).join("\n    ")
}

// The block of default share tags app.html carries, markers included.
//
// Those defaults describe the shop in general and exist for pages that have
// nothing better to say. A product page has something better, so the block is
// replaced rather than added to -- left in place it would leave the document
// with two <title> tags and two of every og: tag, and which one a crawler
// reads is not defined anywhere.
//
// Matched by the comment markers, not by the tags themselves: the wording
// inside app.html is free to change without this stopping to work.
const DEFAULT_SHARE_TAGS = /[ \t]*<!-- default-share-tags -->[\s\S]*?<!-- \/default-share-tags -->\n?/

// Slugs that are a bug somewhere upstream rather than a product.
//
// These arrive when something built a link out of a value it did not have --
// `/product/${product.slug}` where slug was missing gives "/product/null", and
// a crawler that saw it once asks for it forever after. No product can be named
// any of these, so forwarding them to the API is a guaranteed wasted round trip
// on every single request. One log file held 257 of them, more than any real
// product, all of them reaching the database to be told nothing is there.
//
// Treated as genuinely gone, which is both true and useful: 404 is the honest
// answer, and the 404 path is cached, so the CDN absorbs the repeats instead of
// waking this function and the origin API every time.
const INVALID_SLUGS = new Set(["null", "undefined", "nan", "none", "false", "[object object]"])

export default async function handler(req, res) {
  const requested = new URL(req.url, SITE)
  const lang = requested.searchParams.get("lang") === "ar" ? "ar" : "en"
  const slug = requested.searchParams.get("slug") || ""

  let shell = ""
  try {
    shell = await readShell()
  } catch (err) {
    // No trustworthy shell. Bounce back to this same product page with the flag
    // that makes the rewrite in vercel.json skip this function, so the visitor
    // gets the ordinary single-page app at the right address -- exactly what the
    // site served before this function existed -- rather than a broken page.
    console.error("product-page: no shell available", err)
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Location", `/ae-${lang}/product/${encodeURIComponent(slug)}?__shell=1`)
    return res.status(302).end()
  }

  // Set only when the API says plainly that this product does not exist, which is
  // a different thing from the API being slow or broken. See the catch below.
  let gone = false

  try {
    const url = requested
    if (!slug) throw new Error("no slug")
    if (INVALID_SLUGS.has(slug.trim().toLowerCase())) {
      gone = true
      throw new Error(`placeholder slug "${slug}"`)
    }

    const api = `${API}/api/products/slug/${encodeURIComponent(slug)}`
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const resp = await fetch(api, { signal: ctrl.signal, headers: { accept: "application/json" } })
    clearTimeout(timer)
    if (resp.status === 404) {
      gone = true
      throw new Error("api 404")
    }
    if (!resp.ok) throw new Error(`api ${resp.status}`)

    const body = await resp.json()
    const product = body?.product || body
    if (!product?.name) throw new Error("no product")

    const canonical = `${SITE}/ae-${lang}/product/${slug}`
    const head = buildHead(product, lang, canonical)

    // Swap this page's tags in for the shell's defaults. The two older branches
    // stay as fallbacks: a shell fetched from a previous deploy (see readShell)
    // may still be the version with the empty <title> and no default block.
    const html = DEFAULT_SHARE_TAGS.test(shell)
      ? shell.replace(DEFAULT_SHARE_TAGS, `    ${head}\n`)
      : shell.includes("<title></title>")
        ? shell.replace("<title></title>", head)
        : shell.replace("</head>", `    ${head}\n  </head>`)

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400")
    return res.status(200).send(html)
  } catch (err) {
    // Either way the visitor gets the ordinary single-page app, which shows its own
    // "not found" screen. Only the status code differs, and only Google reads it.
    //
    // A product that has been taken off the shop has to answer 404. Answering 200
    // with an empty page is a soft 404: Google keeps the address in its index,
    // goes on crawling it, and files it as a fault against the site.
    //
    // Every other failure -- a slow API, a 500, a dropped connection -- keeps 200.
    // A timeout is not evidence that a product is gone, and returning 404 for one
    // would drop live products out of the index over a momentary wobble.
    const status = gone ? 404 : 200
    console.error(`product-page: serving plain shell (${status}) -`, err?.message || err)
    res.setHeader("Content-Type", "text/html; charset=utf-8")

    // Only the 404 is cached, and the difference matters.
    //
    // A product that is genuinely gone is still gone five minutes later, and the
    // dead links are exactly the ones that get asked for over and over: search
    // engines and Facebook hold on to an address long after the slug changed,
    // and re-crawl it for weeks. Uncached, every one of those re-crawls ran this
    // function and put another lookup on the origin API, for an answer that
    // never changes. Cached, the first one answers and the CDN handles the rest.
    //
    // The 200 is deliberately NOT cached. It means the product does exist but
    // something went wrong on the way to it -- a slow API, a 500, a dropped
    // connection -- so the shell it returns is missing this page's title, meta
    // tags and structured data. Caching that would pin a degraded version of a
    // live product page in front of every later visitor, turning one bad second
    // into ten stale minutes. It has to be retried, not remembered.
    res.setHeader(
      "Cache-Control",
      gone ? "public, max-age=0, s-maxage=300, stale-while-revalidate=3600" : "public, max-age=0, must-revalidate",
    )
    return res.status(status).send(shell)
  }
}
