import { buildBarcodeSvg, escapeAttribute } from "./barcodeSvg"

/**
 * Turning a selection of products into a sheet of labels, and getting it to the
 * printer.
 *
 * The sheet is laid out at real millimetre sizes, because label paper is sold as
 * "50 x 25mm" and the only thing that matters is whether the ink lands on the
 * sticker.
 */

// A4, and the margin a typical printer cannot print inside.
export const PAGE_WIDTH_MM = 210
export const PAGE_MARGIN_MM = 5
export const LABEL_GAP_MM = 2
export const USABLE_WIDTH_MM = PAGE_WIDTH_MM - PAGE_MARGIN_MM * 2

// What each control may be set to. The sliders and the number boxes share these,
// so a figure typed off the packet is clamped to the same range the slider offers.
export const LIMITS = {
  widthMm: { min: 20, max: 200, step: 0.05 },
  heightMm: { min: 10, max: 150, step: 0.05 },
  barcodeHeightMm: { min: 5, max: 60, step: 1 },
  moduleWidthMm: { min: 0.15, max: 0.8, step: 0.01 },
}

/**
 * Where the labels are going.
 *
 * "sheet" is A4 full of stickers in a normal printer. "roll" is a thermal label
 * printer, where the paper IS the label: the page has to be the size of one
 * sticker, because the printer stops at the end of each one. Sending an A4 page
 * to a 1.25 x 0.75 inch label prints the top-left corner of the A4 and throws
 * the rest away -- which looks like a smudge in the corner and blank stickers.
 */
export const PAPER_MODES = [
  { id: "sheet", label: "A4 sheet", hint: "Sticker sheets in a normal printer" },
  { id: "roll", label: "Label roll", hint: "Thermal printer, one label at a time" },
]

const inch = (n) => Math.round(n * 25.4 * 100) / 100

/** Sizes off the packet, so nobody has to convert inches by hand. */
export const LABEL_PRESETS = [
  // At 19mm tall there is no room for a product name as well as a readable
  // barcode, so this preset leaves it off rather than clipping it.
  { id: "1.25x0.75", label: '1.25" x 0.75"', paperMode: "roll", widthMm: inch(1.25), heightMm: inch(0.75), barcodeHeightMm: 7, moduleWidthMm: 0.25, showProductName: false },
  { id: "2x1", label: '2" x 1"', paperMode: "roll", widthMm: inch(2), heightMm: inch(1), barcodeHeightMm: 9, moduleWidthMm: 0.3 },
  { id: "50x25", label: "50 x 25mm", paperMode: "roll", widthMm: 50, heightMm: 25, barcodeHeightMm: 10, moduleWidthMm: 0.33 },
  { id: "50x30", label: "50 x 30mm", paperMode: "sheet", widthMm: 50, heightMm: 30, barcodeHeightMm: 12, moduleWidthMm: 0.33 },
]

// The label stock actually in use: 1.25 x 0.75 inch on a thermal roll. Starting
// anywhere else means the first print of the day comes out on the wrong paper,
// and nothing here is remembered between visits -- the designer opens on these
// values every time.
export const DEFAULT_LABEL_SETTINGS = {
  paperMode: "roll",
  widthMm: 31.75,
  heightMm: 19.05,
  barcodeHeightMm: 7,
  // The width of the narrowest bar. Raising it is the fix for a scanner that
  // struggles; see the note on the designer panel.
  moduleWidthMm: 0.25,

  showCompany: true,
  // "name" by default: a logo at 5mm on a thermal printer usually comes out as a
  // grey smudge, where text stays readable.
  companyMode: "name",
  companyName: "GrabAtoZ",
  logoUrl: "",

  // No room for a product name beside a scannable barcode at 19mm tall.
  showProductName: false,
  showSku: false,
  showBarcode: true,
  showCode: true,
  showPrice: true,
  showCustom: false,
  customText: "",
}

/**
 * Hold a value inside its range. Called on blur, never on every keystroke --
 * clamping as each character is typed means clearing the box to retype snaps it
 * to the minimum mid-edit, and the user ends up fighting the control.
 *
 * An empty box falls back to the default rather than to the minimum. Number("")
 * is 0, which is a perfectly finite number, so without this a cleared field
 * silently becomes the smallest label the designer offers.
 */
export function clampSetting(key, value) {
  const limit = LIMITS[key]
  if (!limit) return value
  if (value === "" || value === null || value === undefined) return DEFAULT_LABEL_SETTINGS[key]
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return DEFAULT_LABEL_SETTINGS[key]
  return Math.min(limit.max, Math.max(limit.min, numeric))
}

/**
 * How many labels of this width fit across the page.
 *
 * This is a read-out, not a setting. Offering "labels per row" as well as a
 * width lets the two contradict each other — a 95mm label and 4 per row cannot
 * both be true — so the width is authoritative and this follows from it.
 */
export function labelsPerRow(widthMm) {
  const width = Number(widthMm) || LIMITS.widthMm.min
  const fit = Math.floor((USABLE_WIDTH_MM + LABEL_GAP_MM) / (width + LABEL_GAP_MM))
  return Math.max(1, fit)
}

/** The code a label carries: barcode, then GTIN, then SKU. */
export function codeFor(product) {
  return product?.barcode || product?.gtin || product?.sku || ""
}

/** A product with none of the three cannot be labelled at all. */
export function canLabel(product) {
  return Boolean(codeFor(product))
}

export function sellingPriceOf(product) {
  return Number(product?.offerPrice) > 0 ? Number(product.offerPrice) : Number(product?.price) || 0
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/**
 * The print frame is its own document, so a root-relative path like
 * "/uploads/logo.png" resolves against nothing and the image silently fails to
 * load. Every address has to be absolute before it goes in.
 */
export function absoluteUrl(url) {
  if (!url) return ""
  try {
    return new URL(url, window.location.origin).href
  } catch {
    return ""
  }
}

/** The markup for one label. Shared by the preview and the sheet. */
export function buildLabelHtml(product, settings) {
  const code = codeFor(product)
  const price = sellingPriceOf(product)
  const { svg } = settings.showBarcode
    ? buildBarcodeSvg({ value: code, moduleWidthMm: settings.moduleWidthMm, heightMm: settings.barcodeHeightMm })
    : { svg: "" }

  const parts = []

  if (settings.showCompany) {
    if (settings.companyMode === "logo" && settings.logoUrl) {
      parts.push(
        `<img class="lbl-logo" src="${escapeAttribute(absoluteUrl(settings.logoUrl))}" alt="${escapeAttribute(settings.companyName)}"/>`,
      )
    } else if (settings.companyName) {
      parts.push(`<div class="lbl-company">${escapeHtml(settings.companyName)}</div>`)
    }
  }

  if (settings.showProductName) parts.push(`<div class="lbl-name">${escapeHtml(product?.name)}</div>`)
  if (settings.showSku && product?.sku) parts.push(`<div class="lbl-sku">${escapeHtml(product.sku)}</div>`)
  if (svg) parts.push(`<div class="lbl-barcode">${svg}</div>`)
  // Kept separate from the bars on purpose: the digits alone make a clean price
  // tag with a reference a person can read out over the phone.
  if (settings.showCode && code) parts.push(`<div class="lbl-code">${escapeHtml(code)}</div>`)
  if (settings.showPrice) parts.push(`<div class="lbl-price">AED ${price.toFixed(2)}</div>`)
  if (settings.showCustom && settings.customText) {
    parts.push(`<div class="lbl-custom">${escapeHtml(settings.customText)}</div>`)
  }

  return `<div class="lbl">${parts.join("")}</div>`
}

/** The stylesheet for a sheet of labels at real size. */
export function buildLabelCss(settings) {
  const roll = settings.paperMode === "roll"

  // On a roll the page IS the label: its own size, no margin, one per page, and
  // no border -- a thermal printer cannot print a hairline at the very edge and
  // the paper is already cut to shape.
  const page = roll
    ? `@page { size: ${settings.widthMm}mm ${settings.heightMm}mm; margin: 0; }`
    : `@page { size: A4; margin: ${PAGE_MARGIN_MM}mm; }`

  const sheet = roll
    ? `.sheet { display: block; }`
    : `.sheet {
      display: flex;
      flex-wrap: wrap;
      gap: ${LABEL_GAP_MM}mm;
      align-content: flex-start;
    }`

  return `
    ${page}
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    ${sheet}
    .lbl {
      width: ${settings.widthMm}mm;
      height: ${settings.heightMm}mm;
      border: ${roll ? "0" : "0.2mm solid #d4d4d4"};
      padding: ${roll ? "0.6mm" : "1mm"};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.4mm;
      overflow: hidden;
      text-align: center;
      /* A label split down the middle by a page break is a wasted sticker. */
      break-inside: avoid;
      page-break-inside: avoid;
      ${roll ? "break-after: page; page-break-after: always;" : ""}
    }
    ${roll ? ".lbl:last-child { break-after: auto; page-break-after: auto; }" : ""}
    .lbl-company { font-size: 2.6mm; font-weight: 700; letter-spacing: 0.1mm; }
    .lbl-logo { max-height: 5mm; max-width: 80%; object-fit: contain; }
    .lbl-name {
      font-size: 2.4mm;
      line-height: 1.15;
      /* Two lines, then truncate: a long product name must not push the barcode
         off its own label. */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 100%;
    }
    .lbl-sku { font-size: 2.2mm; font-family: "Courier New", monospace; color: #444; }
    .lbl-barcode { line-height: 0; }
    .lbl-barcode svg { display: block; }
    .lbl-code { font-size: 2.4mm; font-family: "Courier New", monospace; letter-spacing: 0.2mm; }
    .lbl-price { font-size: 3.4mm; font-weight: 700; }
    .lbl-custom { font-size: 2.2mm; color: #444; }
  `
}

/**
 * Build the whole sheet, repeating each product by the number of labels asked
 * for.
 *
 * This is built from the data, not copied from the preview's markup. A sheet
 * cloned from the preview prints one of each however many were ordered — so
 * "40 copies" comes out as a single label, and nobody finds out until the paper
 * is already through the printer.
 */
export function buildSheetHtml(items, settings) {
  const labels = []
  for (const { product, quantity } of items) {
    const copies = Math.max(0, Math.trunc(Number(quantity) || 0))
    const markup = buildLabelHtml(product, settings)
    for (let copy = 0; copy < copies; copy += 1) labels.push(markup)
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Labels</title>
    <style>${buildLabelCss(settings)}</style>
  </head>
  <body><div class="sheet">${labels.join("")}</div></body>
</html>`
}

/** How many labels a selection adds up to, and what is being left out. */
export function summariseSheet(items) {
  let labels = 0
  let products = 0
  const skipped = []

  for (const { product, quantity } of items) {
    const copies = Math.max(0, Math.trunc(Number(quantity) || 0))
    if (!canLabel(product)) {
      skipped.push(product)
      continue
    }
    if (copies <= 0) continue
    labels += copies
    products += 1
  }

  return { labels, products, skipped }
}

/**
 * Send the sheet to the printer through a hidden frame.
 *
 * Printing the page itself would put the sidebar, the filters and the toolbar on
 * the paper. The frame carries nothing but the labels.
 */
export function printLabelSheet(items, settings) {
  const printable = items.filter(({ product, quantity }) => canLabel(product) && Number(quantity) > 0)
  if (printable.length === 0) return { printed: 0 }

  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.style.position = "fixed"
  frame.style.right = "0"
  frame.style.bottom = "0"
  frame.style.width = "0"
  frame.style.height = "0"
  frame.style.border = "0"
  document.body.appendChild(frame)

  const doc = frame.contentWindow.document
  doc.open()
  doc.write(buildSheetHtml(printable, settings))
  doc.close()

  const cleanUp = () => {
    if (frame.parentNode) frame.parentNode.removeChild(frame)
  }

  const send = () => {
    // The frame needs a moment to lay the vector graphics out. Asked to print
    // the instant the markup lands, some browsers hand over a blank page.
    setTimeout(() => {
      try {
        frame.contentWindow.focus()
        frame.contentWindow.print()
      } catch (error) {
        console.error("Could not print the label sheet:", error)
      }
      // Left in place well past the print dialog: removing the frame while the
      // dialog is still open cancels the job in some browsers.
      setTimeout(cleanUp, 60000)
    }, 350)
  }

  if (frame.contentWindow.document.readyState === "complete") send()
  else frame.onload = send

  return { printed: summariseSheet(printable).labels }
}
