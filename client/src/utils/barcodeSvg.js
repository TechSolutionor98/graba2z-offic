import { encodeCode128B, modulesToBars, QUIET_ZONE_MODULES } from "./code128"

/**
 * Draw a Code 128 symbol as vector graphics.
 *
 * Vector, not canvas. A canvas barcode is drawn at the screen's resolution and
 * then scaled up for the sheet, which softens every edge; a scanner wants hard
 * ones. An SVG is drawn by the printer at the printer's resolution instead.
 *
 * There is one of these functions, used by both the designer's preview and the
 * printed sheet. Two implementations would drift, and the way that drift is
 * discovered is a wasted box of labels.
 */

/**
 * @param {string} value          what to encode
 * @param {number} moduleWidthMm  width of the narrowest bar, in millimetres
 * @param {number} heightMm       height of the bars, in millimetres
 * @returns {{ svg: string, widthMm: number, text: string, substituted: boolean }}
 *   svg is "" when there is nothing to encode.
 */
export function buildBarcodeSvg({ value, moduleWidthMm = 0.33, heightMm = 12 }) {
  const { modules, text, substituted } = encodeCode128B(value)
  if (!modules) return { svg: "", widthMm: 0, text: "", substituted: false }

  // The quiet zone is part of the symbol, not margin around it. Without it a
  // scanner cannot find where the symbol starts — far and away the most common
  // reason a barcode that looks perfect refuses to scan.
  const totalModules = modules.length + QUIET_ZONE_MODULES * 2
  const widthMm = Number((totalModules * moduleWidthMm).toFixed(3))

  const bars = modulesToBars(modules)
    .map(
      (bar) =>
        `<rect x="${bar.x + QUIET_ZONE_MODULES}" y="0" width="${bar.width}" height="${HEIGHT_UNITS}" fill="#000"/>`,
    )
    .join("")

  // The viewBox counts in modules, so the geometry is exact integers and the
  // millimetre size is carried by width/height alone. preserveAspectRatio is
  // off because the bars must take the width they were given, whatever height
  // the label allows.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" ` +
    `viewBox="0 0 ${totalModules} ${HEIGHT_UNITS}" preserveAspectRatio="none" ` +
    `shape-rendering="crispEdges" role="img" aria-label="Barcode ${escapeAttribute(text)}">` +
    `<rect x="0" y="0" width="${totalModules}" height="${HEIGHT_UNITS}" fill="#fff"/>` +
    bars +
    `</svg>`

  return { svg, widthMm, text, substituted }
}

// The vertical unit count in the viewBox. Arbitrary — the real height comes from
// the height attribute — but a round number keeps the markup readable.
const HEIGHT_UNITS = 100

export function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** The widest a symbol will be at this module width, for fit calculations. */
export function barcodeWidthMm(value, moduleWidthMm) {
  return buildBarcodeSvg({ value, moduleWidthMm }).widthMm
}

export default buildBarcodeSvg
