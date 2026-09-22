// Builds the static country-selection landing page served at "/".
//
// The page is plain HTML with the flags, text, styles and background image
// already in it, so a visitor sees the finished page as soon as the document
// arrives -- no React bundle, no API round-trip, no placeholders.
//
// Countries and SEO copy come from the live API when it is reachable and are
// snapshotted into landing/*.json so a build never fails offline. Adding or
// changing a country in admin therefore needs a redeploy to show up here.
//
//   node scripts/build-landing.mjs            fetch fresh data, then build
//   node scripts/build-landing.mjs --offline  build from the snapshots only
//
// Output: public/index.html (copied to dist/ by Vite; ignored by git).

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..")
const landingDir = path.join(root, "landing")
const outFile = path.join(root, "public", "index.html")

const API_URL = (process.env.LANDING_API_URL || "https://api.grabatoz.ae").replace(/\/$/, "")
const SITE_ORIGIN = "https://www.grabatoz.ae"
const offline = process.argv.includes("--offline")

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(landingDir, file), "utf8"))
const writeJson = (file, data) => fs.writeFileSync(path.join(landingDir, file), JSON.stringify(data, null, 2) + "\n")

const fetchJson = async (url, timeoutMs = 8000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const normalizeCountries = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.countries || payload?.data || []
  return list
    .filter((c) => c && c.code)
    .map((c) => ({
      code: String(c.code).toUpperCase(),
      name: c.name || String(c.code).toUpperCase(),
      nameAr: c.nameAr || "",
      flagSvg: c.flagSvg || "",
      sortOrder: Number.isFinite(c.sortOrder) ? c.sortOrder : 0,
    }))
}

const loadCountries = async () => {
  if (!offline) {
    try {
      const fresh = normalizeCountries(await fetchJson(`${API_URL}/api/countries/public`))
      if (fresh.length) {
        writeJson("countries.json", fresh)
        console.log(`countries: ${fresh.length} from API`)
        return fresh
      }
    } catch (error) {
      console.warn(`countries: API unavailable (${error.message}); using snapshot`)
    }
  }
  const snapshot = normalizeCountries(readJson("countries.json"))
  console.log(`countries: ${snapshot.length} from snapshot`)
  return snapshot
}

const loadSeo = async () => {
  if (!offline) {
    try {
      const result = await fetchJson(`${API_URL}/api/seo-pages/public-by-path?path=/`)
      if (result?.found && result.seo) {
        const seo = {
          title: result.seo.title || "",
          description: result.seo.description || "",
          keywords: result.seo.keywords || "",
          canonicalUrl: result.seo.canonicalUrl || "",
          robots: result.seo.robots || "index, follow",
          customSchema: result.seo.customSchema || "",
        }
        writeJson("seo.json", seo)
        console.log("seo: from API")
        return seo
      }
    } catch (error) {
      console.warn(`seo: API unavailable (${error.message}); using snapshot`)
    }
  }
  console.log("seo: from snapshot")
  return readJson("seo.json")
}

// The store renders the flag with preserveAspectRatio="none" so it fills the
// card. Same here, so the two pages look identical.
const flagMarkup = (country) => {
  if (!country.flagSvg) return `<span>${escapeHtml(country.code)}</span>`
  const svg = country.flagSvg.includes("preserveAspectRatio")
    ? country.flagSvg
    : country.flagSvg.replace("<svg", '<svg preserveAspectRatio="none"')
  return svg.replace("<svg", '<svg role="img" aria-hidden="true" focusable="false"')
}

const cardMarkup = (country) => {
  const slug = country.code.toLowerCase()
  const nameAr = country.nameAr
    ? `\n                <p class="name-ar" dir="rtl" lang="ar">${escapeHtml(country.nameAr)}</p>`
    : ""
  // The whole card is one link. English is the default language; Arabic is a
  // switch in the store header, so the store URL is always /<country>-en.
  // The link's own text (country name + "Shop now") is its accessible name, and
  // the name is not a heading: the page has one h1, then the footer's h2s.
  return `            <a class="card" href="/${slug}-en" data-country="${country.code}">
              <div class="flag">${flagMarkup(country)}</div>
              <div>
                <span class="name">${escapeHtml(country.name)}</span>${nameAr}
              </div>
              <span class="go">Shop now</span>
            </a>`
}

const hreflangMarkup = (countries) => {
  const lines = []
  for (const country of countries) {
    const slug = country.code.toLowerCase()
    lines.push(`    <link rel="alternate" hreflang="en-${country.code}" href="${SITE_ORIGIN}/${slug}-en" />`)
    lines.push(`    <link rel="alternate" hreflang="ar-${country.code}" href="${SITE_ORIGIN}/${slug}-ar" />`)
  }
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/" />`)
  return lines.join("\n")
}

const schemaMarkup = (seo) => {
  const raw = String(seo.customSchema || "").trim()
  if (!raw) return ""
  const block = raw.startsWith("<script") ? raw : `<script type="application/ld+json">\n${raw}\n</script>`
  return block
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n")
}

const build = async () => {
  const [countries, seo] = await Promise.all([loadCountries(), loadSeo()])
  countries.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  const template = fs.readFileSync(path.join(landingDir, "landing.template.html"), "utf8")
  const fill = {
    TITLE: escapeHtml(seo.title || "Grabatoz"),
    DESCRIPTION: escapeHtml(seo.description),
    KEYWORDS: escapeHtml(seo.keywords),
    ROBOTS: escapeHtml(seo.robots || "index, follow"),
    CANONICAL: escapeHtml(seo.canonicalUrl || `${SITE_ORIGIN}/`),
    HREFLANG_LINKS: hreflangMarkup(countries),
    SCHEMA: schemaMarkup(seo),
    CARDS: countries.map(cardMarkup).join("\n"),
    YEAR: String(new Date().getFullYear()),
    BUILD_STAMP: new Date().toISOString(),
  }

  const html = template.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => {
    if (!(key in fill)) throw new Error(`Template placeholder without a value: ${match}`)
    return fill[key]
  })

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, html)
  console.log(`wrote ${path.relative(root, outFile)} (${(html.length / 1024).toFixed(1)} KB, ${countries.length} countries)`)
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})
