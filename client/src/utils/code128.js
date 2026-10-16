/**
 * Code 128, subset B — encoder.
 *
 * Written rather than installed. It is a lookup table and a weighted sum, and
 * writing it means no dependency to keep current, no CDN to reach, and a label
 * that still prints on a stockroom machine with no internet. Subset B covers
 * every printable ASCII character from space to DEL, which is more than any
 * product code needs.
 *
 * The output is a string of "1" and "0" — one character per module (the width
 * of the narrowest bar). "1" is a bar, "0" is a space. Turning that into bars is
 * the renderer's job, so the encoder can be checked against the specification on
 * its own.
 */

// The 107 patterns of Code 128, indexed by value. Each is eleven modules wide,
// except the stop pattern, which is thirteen.
const PATTERNS = [
  "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
  "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
  "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
  "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
  "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
  "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
  "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
  "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
  "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
  "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
  "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
  "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
  "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
  "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
  "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
  "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
  "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
  "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
  "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
  "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
  "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
  "11010011100", "1100011101011",
]

// Start code B, and the stop pattern that closes every symbol.
export const START_B = 104
export const STOP = 106
export const START_B_PATTERN = PATTERNS[START_B] // "11010010000"
export const STOP_PATTERN = PATTERNS[STOP] // "1100011101011"
export const MODULES_PER_SYMBOL = 11
export const STOP_MODULES = 13

// Subset B runs from space (32) to DEL (127), mapped onto values 0..95.
const MIN_CHAR = 32
const MAX_CHAR = 127

// A character the subset cannot carry is replaced, never dropped. A label that
// scans to a code missing a character is worse than one with a visible "?" in
// it: the first is wrong and looks right.
export const SUBSTITUTE = "?"

/** True when this character can be carried by subset B as it stands. */
export function isEncodable(character) {
  const code = String(character).charCodeAt(0)
  return code >= MIN_CHAR && code <= MAX_CHAR
}

/**
 * The text as it will actually be encoded, with anything outside subset B
 * replaced. Render *this* under the barcode, so the digits a person reads match
 * the bars a scanner reads.
 */
export function sanitize(text) {
  return String(text ?? "")
    .split("")
    .map((character) => (isEncodable(character) ? character : SUBSTITUTE))
    .join("")
}

/** Whether anything had to be substituted, so the label screen can say so. */
export function hasSubstitutions(text) {
  return String(text ?? "").split("").some((character) => !isEncodable(character))
}

/**
 * Encode a string as Code 128 subset B.
 *
 * @returns {{ modules: string, text: string, substituted: boolean, values: number[] }}
 *   `modules` is the bar pattern; empty string for empty input, because half a
 *   symbol is worse than none.
 */
export function encodeCode128B(text) {
  const clean = sanitize(text)
  if (clean.length === 0) {
    return { modules: "", text: "", substituted: false, values: [] }
  }

  const values = [...clean].map((character) => character.charCodeAt(0) - MIN_CHAR)

  // The check character: start value, plus each data value weighted by its
  // position, modulo 103. This is what lets a scanner reject a misread rather
  // than hand the till the wrong product.
  let sum = START_B
  values.forEach((value, index) => {
    sum += value * (index + 1)
  })
  const checkValue = sum % 103

  const sequence = [START_B, ...values, checkValue, STOP]
  return {
    modules: sequence.map((value) => PATTERNS[value]).join(""),
    text: clean,
    substituted: hasSubstitutions(text),
    values: sequence,
  }
}

/**
 * The runs of equal modules, as {x, width, bar} — what a renderer draws.
 * Merging runs here means one rectangle per bar instead of one per module, which
 * matters on a sheet carrying a few hundred labels.
 */
export function modulesToBars(modules) {
  const bars = []
  let index = 0
  while (index < modules.length) {
    const value = modules[index]
    let width = 1
    while (index + width < modules.length && modules[index + width] === value) width += 1
    if (value === "1") bars.push({ x: index, width })
    index += width
  }
  return bars
}

/**
 * The quiet zone, in modules, on each side of the symbol.
 *
 * Ten is the specification's minimum. Without it a scanner cannot tell where the
 * symbol starts, which is the single most common reason a barcode that looks
 * perfectly good will not scan.
 */
export const QUIET_ZONE_MODULES = 10

export default encodeCode128B
