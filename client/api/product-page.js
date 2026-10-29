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

const buildHead = (p, lang, url) => {
  const money = pricing(p)
  const arabic = lang === "ar"
  const name = (arabic && p.nameAr) || p.name || ""
  const description =
    plain((arabic && p.descriptionAr) || p.shortDescription || p.description || name, 300)
  const brand = typeof p.brand === "object" ? p.brand?.name : p.brand
  const title = p.metaTitle || `${name} | Grab A to Z`

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

  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(p.metaDescription || description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    p.image ? `<meta property="og:image" content="${esc(p.image)}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
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

  try {
    const url = requested
    if (!slug) throw new Error("no slug")

    const api = `${API}/api/products/slug/${encodeURIComponent(slug)}`
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const resp = await fetch(api, { signal: ctrl.signal, headers: { accept: "application/json" } })
    clearTimeout(timer)
    if (!resp.ok) throw new Error(`api ${resp.status}`)

    const body = await resp.json()
    const product = body?.product || body
    if (!product?.name) throw new Error("no product")

    const canonical = `${SITE}/ae-${lang}/product/${slug}`
    const head = buildHead(product, lang, canonical)

    // Replace the empty placeholder title; everything else is added beside it.
    const html = shell.includes("<title></title>")
      ? shell.replace("<title></title>", head)
      : shell.replace("</head>", `    ${head}\n  </head>`)

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400")
    return res.status(200).send(html)
  } catch (err) {
    // A missing product, a slow API, anything at all: serve what the site
    // served before. The page still works, it just has no server-side head.
    console.error("product-page: serving plain shell -", err?.message || err)
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate")
    return res.status(200).send(shell)
  }
}
