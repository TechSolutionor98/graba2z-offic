/**
 * The building blocks of an email, and how they become HTML.
 *
 * Two things govern everything in this file:
 *
 * 1. **Email HTML is not web HTML.** Outlook renders with Word's engine, Gmail
 *    strips <style> blocks, and flexbox and grid are not available anywhere
 *    worth relying on. So: tables for layout, inline styles for everything, and
 *    no shorthand Outlook mis-parses. It looks like 2005 because 2005 is what
 *    the clients support.
 *
 * 2. **The blocks are the source of truth, the HTML is the output.** A template
 *    stores both: `blocks` so the builder can reopen and edit it, and `html` so
 *    the sending path -- which knows nothing about blocks -- keeps working
 *    exactly as it did.
 */

// ---------------------------------------------------------------------------
// The palette
// ---------------------------------------------------------------------------

export const BLOCK_LIBRARY = [
  { type: "heading", label: "Heading", icon: "Heading", hint: "A title line", group: "Content" },
  { type: "text", label: "Text", icon: "Type", hint: "A paragraph", group: "Content" },
  { type: "list", label: "List", icon: "List", hint: "Bulleted points", group: "Content" },
  { type: "image", label: "Image", icon: "Image", hint: "A picture", group: "Content" },
  { type: "button", label: "Button", icon: "MousePointerClick", hint: "A call to action", group: "Content" },
  { type: "video", label: "Video", icon: "Play", hint: "Thumbnail that links out", group: "Content" },

  { type: "columns", label: "Columns", icon: "Columns", hint: "Two or three side by side", group: "Layout" },
  { type: "divider", label: "Divider", icon: "Minus", hint: "A horizontal rule", group: "Layout" },
  { type: "spacer", label: "Spacer", icon: "MoveVertical", hint: "Empty space", group: "Layout" },

  { type: "product", label: "Product", icon: "ShoppingBag", hint: "Image, price and a button", group: "Shop" },
  { type: "coupon", label: "Coupon", icon: "Ticket", hint: "A code to copy, with terms", group: "Shop" },
  { type: "social", label: "Social links", icon: "Share2", hint: "Follow us row", group: "Shop" },
  { type: "footer", label: "Footer", icon: "AlignEndHorizontal", hint: "Address and unsubscribe", group: "Shop" },
  { type: "html", label: "Custom HTML", icon: "Code", hint: "Paste your own markup", group: "Shop" },
]

export const BLOCK_GROUPS = ["Content", "Layout", "Shop"]

let nextId = 0
const makeId = () => `b${Date.now().toString(36)}${(nextId += 1)}`
export const newId = makeId

/**
 * Spacing and background every block carries, so any block can be nudged
 * without needing its own one-off controls.
 */
export const COMMON_STYLE = {
  paddingTop: 12,
  paddingBottom: 12,
  // Added to whatever the email body already pads by, rather than replacing it,
  // so nudging one block in from the left cannot pull it out of line with the
  // rest of the email.
  paddingLeft: 0,
  paddingRight: 0,
  background: "",
}

/** A block made before side spacing existed simply has none. */
export const sidePad = (block) => ({
  left: Number(block?.paddingLeft) || 0,
  right: Number(block?.paddingRight) || 0,
})

/** A new block of the given type, with defaults that look right immediately. */
export function createBlock(type) {
  const base = { id: makeId(), type, ...COMMON_STYLE }
  switch (type) {
    case "heading":
      return { ...base, text: "Your heading here", html: "<p>Your heading here</p>", level: "h2", align: "left", color: "#111827", size: 26, lineHeight: 1.3, weight: "bold" }
    case "text":
      return { ...base, text: "Write your message here.", html: "<p>Write your message here, and link any words in it.</p>", align: "left", color: "#374151", size: 15, lineHeight: 1.6 }
    case "list":
      return { ...base, items: "First point\nSecond point\nThird point", style: "bullet", color: "#374151", size: 15 }
    case "image":
      return { ...base, src: "", alt: "", href: "", align: "center", width: 100, radius: 0 }
    // `buttonBackground`, not `background`: every block uses `background` for
    // the strip it sits on, and the button reusing it painted the whole row its
    // own colour -- which hid the button inside it, corners and all.
    case "button":
      return {
        ...base,
        text: "Shop now",
        href: "https://www.grabatoz.ae",
        align: "center",
        buttonBackground: "#84cc16",
        color: "#ffffff",
        radius: 6,
        size: 15,
        widthMode: "auto",
        width: 60,
        paddingX: 28,
        paddingY: 12,
      }
    case "video":
      return { ...base, thumbnail: "", href: "", alt: "Watch the video", align: "center", width: 100 }
    case "columns":
      return {
        ...base,
        count: 2,
        gap: 16,
        verticalAlign: "top",
        columns: [emptyColumn(), emptyColumn()],
      }
    case "divider":
      return { ...base, color: "#e5e7eb", thickness: 1, width: 100 }
    case "spacer":
      return { ...base, paddingTop: 0, paddingBottom: 0, height: 24 }
    case "product":
      return {
        ...base,
        // "stacked" is image over details; "card" is the picture beside the
        // words inside a tinted panel.
        layout: "stacked",
        image: "",
        name: "Product name",
        price: "AED 0.00",
        oldPrice: "",
        blurb: "",
        // The extras from the shop's own product cards. All optional and empty
        // by default, so a product block made before these existed renders
        // exactly as it always did.
        badge: "",
        category: "",
        note: "",
        href: "https://www.grabatoz.ae",
        buttonText: "View product",
        buttonBackground: "#84cc16",
        buttonColor: "#ffffff",
        cardBackground: "#f3f4f6",
        // Set when the product was picked from the catalogue rather than typed.
        // Kept so the block can say what it is pointing at; the fields above are
        // still what gets sent, because a price must not change under a
        // customer after the email has gone out.
        productId: "",
        sku: "",
      }
    case "coupon":
      return {
        ...base,
        label: "Use code",
        code: "SAVE10",
        headline: "10% off your next order",
        terms: "Valid until the end of the month. One use per customer.",
        buttonText: "Shop now",
        href: "https://www.grabatoz.ae",
        background: "",
        panelBackground: "#f7fee7",
        borderColor: "#84cc16",
        codeColor: "#3f6212",
        align: "center",
      }
    case "social":
      return {
        ...base,
        align: "center",
        iconSize: 28,
        links: [
          { id: makeId(), network: "facebook", href: "https://facebook.com/" },
          { id: makeId(), network: "instagram", href: "https://instagram.com/" },
          { id: makeId(), network: "whatsapp", href: "https://wa.me/971505033860" },
        ],
      }
    case "footer":
      return {
        ...base,
        company: "GrabAtoZ",
        address: "Bur Dubai, Dubai, United Arab Emirates",
        note: "You are receiving this because you subscribed to our updates.",
        unsubscribeText: "Unsubscribe",
        unsubscribeHref: "{{unsubscribe_url}}",
        // A row of plain links before the unsubscribe one -- help, support,
        // privacy. Empty by default so an existing footer renders unchanged.
        links: [],
        // The shop's mark at the foot. Empty means no image.
        logo: "",
        logoWidth: 120,
        color: "#6b7280",
        size: 12,
        align: "center",
      }
    case "html":
      return { ...base, html: "<p>Your own HTML here.</p>" }
    default:
      return base
  }
}

/** A column starts empty; blocks are added into it from the palette. */
export function emptyColumn() {
  return { id: makeId(), blocks: [] }
}

// Blocks that cannot sit inside a column -- nesting a column in a column, or a
// footer halfway down one, produces markup no client renders predictably.
export const COLUMN_SAFE = ["heading", "text", "list", "image", "button", "divider", "spacer", "product", "coupon"]

export const DEFAULT_SETTINGS = {
  backgroundColor: "#f3f4f6",
  contentBackground: "#ffffff",
  contentWidth: 600,
  fontFamily: "Arial, Helvetica, sans-serif",
  padding: 24,
  radius: 8,
  linkColor: "#65a30d",
  // The line of text shown after the subject in an inbox listing. Left empty,
  // clients grab whatever words come first in the email -- usually "View in
  // browser" or an image's alt text.
  preheader: "",
}

// ---------------------------------------------------------------------------
// Merge fields
// ---------------------------------------------------------------------------

export const MERGE_FIELDS = [
  { token: "{{name}}", label: "Customer name" },
  { token: "{{email}}", label: "Customer email" },
  { token: "{{first_name}}", label: "First name" },
  { token: "{{order_number}}", label: "Order number" },
  { token: "{{order_total}}", label: "Order total" },
  { token: "{{shop_name}}", label: "Shop name" },
  { token: "{{unsubscribe_url}}", label: "Unsubscribe link" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** Text as the reader typed it: escaped, with line breaks preserved. */
const richText = (value) => escapeHtml(value).split("\n").join("<br/>")

/**
 * A link's address, or "#" when it is empty or not a plain http(s)/mailto link.
 * An unchecked href in generated markup is an injection point, and a javascript:
 * URL in an email is a spam-filter flag even where the client ignores it.
 *
 * Merge tokens pass through: {{unsubscribe_url}} is replaced with a real address
 * by the sending code, long after this runs.
 */
export const safeHref = (value) => {
  const url = String(value ?? "").trim()
  if (!url) return "#"
  if (/^\{\{[\w.]+\}\}$/.test(url)) return url
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return escapeHtml(url)
  return "#"
}

/**
 * Turn the rich-text editor's HTML into something safe to put in an email.
 *
 * The editor speaks web HTML, and a paste from Word or a web page drags in far
 * more than that: classes, ids, event handlers, <script>, Office namespaces,
 * entire stylesheets. Email wants a small vocabulary and inline styles only, and
 * any attribute that survives unchecked is an attribute nobody checked.
 *
 * So: an allowlist of tags, an allowlist of CSS properties on the tags that may
 * carry style, a validated href, and everything else dropped. Text content is
 * passed through untouched -- it arrives already escaped from the editor, and
 * escaping it twice would show "&amp;" to the reader.
 */

// Tags that may appear, and what each is rewritten to.
const RICH_TAGS = {
  // inline
  b: "strong", strong: "strong",
  i: "em", em: "em",
  u: "u",
  s: "s", strike: "s", del: "s",
  sub: "sub", sup: "sup",
  code: "code",
  br: "br",
  span: "span",
  // block
  p: "p",
  h1: "h1", h2: "h2", h3: "h3",
  ul: "ul", ol: "ol", li: "li",
  blockquote: "blockquote",
}

/**
 * CSS properties allowed to survive.
 *
 * Every one of these is a property email clients actually honour inline. Left
 * out on purpose: position, display, float and anything that could lift content
 * out of its box, and background shorthand, which can carry a url().
 */
const RICH_STYLES = new Set([
  "color",
  "background-color",
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "text-align",
  "text-decoration",
  "margin-left",
  "line-height",
])

/** A style attribute reduced to the properties above, with unsafe values dropped. */
function safeStyle(raw) {
  return String(raw ?? "")
    .split(";")
    .map((rule) => {
      const at = rule.indexOf(":")
      if (at < 0) return null
      const property = rule.slice(0, at).trim().toLowerCase()
      const value = rule.slice(at + 1).trim()
      if (!RICH_STYLES.has(property)) return null
      // url() can fetch a tracker or worse; expression() is old IE script; a
      // quote or backslash is how an attribute gets broken out of.
      if (/url\s*\(|expression\s*\(|javascript:|["'\\]/i.test(value)) return null
      if (!value || value.length > 80) return null
      return `${property}:${value}`
    })
    .filter(Boolean)
    .join(";")
}

// The spacing each block tag carries when the editor gave it none.
const BLOCK_MARGINS = {
  p: "margin:0 0 10px",
  h1: "margin:0 0 10px",
  h2: "margin:0 0 10px",
  h3: "margin:0 0 8px",
  ul: "margin:0 0 10px;padding-left:22px",
  ol: "margin:0 0 10px;padding-left:22px",
  li: "margin:0 0 4px",
  blockquote: "margin:0 0 10px;padding-left:12px;border-left:3px solid #e5e7eb",
}

const readAttribute = (tag, name) => {
  const match =
    tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i")) ||
    tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, "i"))
  return match ? match[1] : ""
}

export function sanitizeRichText(html, settings = DEFAULT_SETTINGS) {
  const source = String(html ?? "")
  let out = ""
  let index = 0

  while (index < source.length) {
    const open = source.indexOf("<", index)
    if (open === -1) {
      out += source.slice(index)
      break
    }
    out += source.slice(index, open)

    const close = source.indexOf(">", open)
    if (close === -1) {
      // A stray "<" in the text, not the start of a tag.
      out += "&lt;"
      index = open + 1
      continue
    }

    const tag = source.slice(open + 1, close).trim()
    const isClosing = tag.startsWith("/")
    const name = (isClosing ? tag.slice(1) : tag).split(/[\s/]/)[0].toLowerCase()
    const mapped = RICH_TAGS[name]

    if (mapped === "br") {
      out += "<br/>"
    } else if (name === "a") {
      if (isClosing) out += "</a>"
      else {
        out +=
          `<a href="${safeHref(readAttribute(tag, "href"))}" target="_blank" ` +
          `style="color:${settings.linkColor};text-decoration:underline;">`
      }
    } else if (mapped) {
      if (isClosing) {
        out += `</${mapped}>`
      } else {
        const style = safeStyle(readAttribute(tag, "style"))
        // A span with nothing left to say is only noise in the markup.
        if (mapped === "span" && !style) {
          out += "<span>"
        } else {
          // There is no stylesheet in an email, so a block tag that carries no
          // margin of its own takes whatever each client defaults to -- which
          // differs enough to move a layout around.
          const base = BLOCK_MARGINS[mapped] || ""
          const merged = [base, style].filter(Boolean).join(";")
          out += `<${mapped}${merged ? ` style="${merged}"` : ""}>`
        }
      }
    }
    // Everything else -- script, img, div, Word's leftovers -- is dropped.

    index = close + 1
  }

  return out.trim()
}

/**
 * Remove per-word colours from a block's content.
 *
 * The block has one colour setting and the words inside can carry their own. An
 * inline colour always beats the colour it inherits, so setting the block to
 * white while a leftover span still says dark grey looks, to the person doing
 * it, like the setting is broken. Changing the block colour therefore clears
 * the per-word ones: the control they just used is the one that wins.
 */
export function stripTextColor(html) {
  return String(html ?? "").replace(/style\s*=\s*"([^"]*)"/gi, (whole, style) => {
    const kept = style
      .split(";")
      .filter((rule) => rule.trim() && !/^\s*color\s*:/i.test(rule))
      .join(";")
      .trim()
    return kept ? `style="${kept}"` : ""
  })
}

/** Rich HTML when the block has it, plain escaped text when it does not. */
const bodyText = (block, settings) =>
  block.html != null && String(block.html).trim() !== ""
    ? sanitizeRichText(block.html, settings)
    : richText(block.text)

const SOCIAL_ICONS = {
  facebook: { label: "Facebook", color: "#1877f2", letter: "f" },
  instagram: { label: "Instagram", color: "#e1306c", letter: "in" },
  twitter: { label: "X", color: "#111827", letter: "X" },
  linkedin: { label: "LinkedIn", color: "#0a66c2", letter: "in" },
  youtube: { label: "YouTube", color: "#ff0000", letter: "▶" },
  whatsapp: { label: "WhatsApp", color: "#25d366", letter: "W" },
  tiktok: { label: "TikTok", color: "#111827", letter: "t" },
}

export const SOCIAL_NETWORKS = Object.entries(SOCIAL_ICONS).map(([id, meta]) => ({ id, ...meta }))

/** The button's own colour, wherever an older template happened to store it. */
export const buttonColour = (block) => block.buttonBackground || block.background || "#84cc16"

/**
 * Bring a template saved before the button had its own colour key up to date.
 *
 * Without this, an old block's colour would paint the row behind it as well as
 * the button -- which is the bug the separate key exists to fix.
 */
export function normalizeBlocks(blocks = []) {
  return blocks.map((block) => {
    if (block.type === "columns") {
      return { ...block, columns: (block.columns || []).map((c) => ({ ...c, blocks: normalizeBlocks(c.blocks || []) })) }
    }
    if (block.type !== "button" || block.buttonBackground) return block
    return { ...block, buttonBackground: block.background || "#84cc16", background: "" }
  })
}

/** Padding and background shared by every block. */
const shell = (block, inner, settings, { horizontal = true } = {}) => {
  const sidePadding = horizontal ? settings.padding : 0
  // An older button kept its own colour in `background`. Painting the row with
  // it would hide the button inside a strip of the same colour, so a button
  // that has not been migrated yet gets no row background at all.
  const legacyButton = block.type === "button" && !block.buttonBackground
  const background = block.background && !legacyButton ? `background:${block.background};` : ""
  const { left, right } = sidePad(block)
  // Four values, because the shorthand's three-value form cannot say "different
  // on each side": padding is top, right, bottom, left.
  return (
    `<tr><td style="${background}padding:${block.paddingTop}px ${sidePadding + right}px ` +
    `${block.paddingBottom}px ${sidePadding + left}px;">` +
    inner +
    `</td></tr>`
  )
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** The inner markup of a block, with no padding shell -- used inside columns. */
export function renderBlockInner(block, settings, width) {
  const font = settings.fontFamily

  switch (block.type) {
    // Both carry rich content now -- paragraphs, lists, headings -- so the
    // wrapper is a div. An <h2> or <p> cannot legally contain one.
    case "heading":
      return (
        `<div style="font-family:${font};font-size:${block.size}px;line-height:${block.lineHeight};` +
        `color:${block.color};text-align:${block.align};font-weight:${block.weight};">` +
        `${bodyText(block, settings)}</div>`
      )

    case "text":
      return (
        `<div style="font-family:${font};font-size:${block.size}px;line-height:${block.lineHeight};` +
        `color:${block.color};text-align:${block.align};">${bodyText(block, settings)}</div>`
      )

    case "list": {
      const tag = block.style === "number" ? "ol" : "ul"
      const items = String(block.items || "")
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => `<li style="margin:0 0 6px;">${escapeHtml(line)}</li>`)
        .join("")
      return (
        `<${tag} style="margin:0;padding-left:20px;font-family:${font};font-size:${block.size}px;` +
        `line-height:1.6;color:${block.color};">${items}</${tag}>`
      )
    }

    case "image": {
      if (!block.src) return ""
      const pixels = Math.round((width * block.width) / 100)
      const img =
        `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" width="${pixels}" ` +
        `style="display:block;border:0;outline:none;text-decoration:none;max-width:100%;height:auto;` +
        `width:${block.width}%;border-radius:${block.radius}px;` +
        `margin:${block.align === "center" ? "0 auto" : block.align === "right" ? "0 0 0 auto" : "0"};"/>`
      return `<div style="text-align:${block.align};">${block.href ? `<a href="${safeHref(block.href)}" target="_blank">${img}</a>` : img}</div>`
    }

    case "button": {
      // A table, not a styled <a>: Outlook ignores padding on inline elements,
      // so a plain link button collapses to bare text there.
      const margin = block.align === "center" ? "0 auto" : block.align === "right" ? "0 0 0 auto" : "0"
      const colour = buttonColour(block)
      // "auto" lets the table shrink to the label. Any other width is a
      // percentage of the content column, so it holds whatever the email is
      // read at rather than a pixel size that only suits one screen.
      const sized = block.widthMode === "custom" || block.fullWidth
      const percent = block.fullWidth && block.widthMode !== "custom" ? 100 : block.width || 60
      return (
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ` +
        `style="margin:${margin};${sized ? `width:${percent}%;` : ""}">` +
        `<tr><td align="center" bgcolor="${colour}" ` +
        `style="border-radius:${block.radius}px;background:${colour};">` +
        `<a href="${safeHref(block.href)}" target="_blank" ` +
        `style="display:block;padding:${block.paddingY}px ${block.paddingX}px;font-family:${font};` +
        `font-size:${block.size}px;font-weight:bold;color:${block.color};text-decoration:none;` +
        `border-radius:${block.radius}px;text-align:center;">${escapeHtml(block.text)}</a>` +
        `</td></tr></table>`
      )
    }

    case "video": {
      if (!block.thumbnail) return ""
      const pixels = Math.round((width * block.width) / 100)
      // A still with a play badge drawn over it. Video does not play inline in
      // any mail client worth targeting, so every "video in email" is this.
      return (
        `<div style="text-align:${block.align};">` +
        `<a href="${safeHref(block.href)}" target="_blank" style="display:inline-block;position:relative;text-decoration:none;">` +
        `<img src="${escapeHtml(block.thumbnail)}" alt="${escapeHtml(block.alt)}" width="${pixels}" ` +
        `style="display:block;border:0;max-width:100%;height:auto;width:${block.width}%;border-radius:6px;"/>` +
        `<span style="display:block;margin-top:8px;font-family:${font};font-size:14px;color:${settings.linkColor};">` +
        `▶ ${escapeHtml(block.alt || "Watch the video")}</span>` +
        `</a></div>`
      )
    }

    case "divider":
      return (
        `<table role="presentation" width="${block.width}%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>` +
        `<td style="border-top:${block.thickness}px solid ${block.color};font-size:0;line-height:0;">&nbsp;</td>` +
        `</tr></table>`
      )

    case "spacer":
      return `<div style="height:${block.height}px;font-size:0;line-height:0;">&nbsp;</div>`

    case "product": {
      const old = block.oldPrice
        ? `<span style="font-size:13px;color:#9ca3af;text-decoration:line-through;margin-left:6px;">${escapeHtml(block.oldPrice)}</span>`
        : ""

      // The picture beside the words, inside a tinted panel. Built as nested
      // tables with an explicit width on the image cell: Outlook ignores
      // percentage widths on a table cell that contains an image, and the two
      // columns collapse on top of each other without them.
      if (block.layout === "card") {
        const panel = block.cardBackground || "#f3f4f6"
        const thumb = block.image
          ? `<img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.name)}" width="180" ` +
            `style="display:block;border:0;width:180px;max-width:180px;height:auto;border-radius:8px;"/>`
          : `<div style="width:180px;height:120px;background:#e5e7eb;border-radius:8px;">&nbsp;</div>`
        const blurb = block.blurb
          ? `<tr><td style="font-family:${font};font-size:14px;line-height:1.55;color:#374151;padding-bottom:10px;">` +
            `${escapeHtml(block.blurb)}</td></tr>`
          : ""
        const was = block.oldPrice
          ? `<tr><td style="font-family:${font};font-size:13px;color:#9ca3af;text-decoration:line-through;padding-bottom:8px;">` +
            `${escapeHtml(block.oldPrice)}</td></tr>`
          : ""

        return (
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
          `bgcolor="${panel}" style="background:${panel};border-radius:10px;">` +
          `<tr><td style="padding:20px;">` +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
          // align="left" plus a fixed width is what keeps these side by side in
          // Outlook; on a phone the client stacks them, which is what we want.
          `<td width="180" valign="top" style="width:180px;padding-right:18px;">${thumb}</td>` +
          `<td valign="top">` +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
          `<tr><td style="font-family:${font};font-size:16px;font-weight:bold;color:#111827;line-height:1.4;padding-bottom:6px;">` +
          `${escapeHtml(block.name)}</td></tr>` +
          `<tr><td style="font-family:${font};font-size:18px;font-weight:bold;color:#dc2626;padding-bottom:4px;">` +
          `${escapeHtml(block.price)}</td></tr>` +
          was +
          blurb +
          `<tr><td><a href="${safeHref(block.href)}" target="_blank" ` +
          `style="font-family:${font};font-size:14px;font-weight:bold;color:${block.buttonBackground};text-decoration:none;">` +
          `${escapeHtml(block.buttonText)} &rsaquo;</a></td></tr>` +
          `</table></td></tr></table>` +
          `</td></tr></table>`
        )
      }

      const image = block.image
        ? `<img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.name)}" width="${width}" ` +
          `style="display:block;border:0;max-width:100%;height:auto;width:100%;border-radius:6px;"/>`
        : ""

      // A discount flag, as a one-cell table rather than a styled span:
      // Outlook ignores padding and background on an inline element, and the
      // label would come out as bare text on no background.
      const badge = block.badge
        ? `<tr><td style="padding-bottom:8px;">` +
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
          `<td bgcolor="#fbbf24" style="background:#fbbf24;border-radius:4px;padding:3px 8px;font-family:${font};` +
          `font-size:11px;font-weight:bold;color:#111827;">${escapeHtml(block.badge)}</td>` +
          `</tr></table></td></tr>`
        : ""
      const category = block.category
        ? `<tr><td style="font-family:${font};font-size:12px;color:#ea580c;padding-bottom:3px;">` +
          `${escapeHtml(block.category)}</td></tr>`
        : ""
      const note = block.note
        ? `<tr><td style="font-family:${font};font-size:12px;color:#16a34a;padding-bottom:6px;">` +
          `${escapeHtml(block.note)}</td></tr>`
        : ""

      return (
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
        (image ? `<tr><td style="padding-bottom:10px;">${image}</td></tr>` : "") +
        badge +
        `<tr><td style="font-family:${font};font-size:15px;font-weight:bold;color:#111827;line-height:1.4;padding-bottom:4px;">` +
        `${escapeHtml(block.name)}</td></tr>` +
        category +
        note +
        `<tr><td style="font-family:${font};font-size:17px;font-weight:bold;color:#dc2626;padding-bottom:10px;">` +
        `${escapeHtml(block.price)}${old}</td></tr>` +
        `<tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0">` +
        `<tr><td align="center" bgcolor="${block.buttonBackground}" style="border-radius:6px;background:${block.buttonBackground};">` +
        `<a href="${safeHref(block.href)}" target="_blank" style="display:block;padding:10px 20px;font-family:${font};` +
        `font-size:14px;font-weight:bold;color:${block.buttonColor};text-decoration:none;border-radius:6px;">` +
        `${escapeHtml(block.buttonText)}</a></td></tr></table></td></tr>` +
        `</table>`
      )
    }

    case "coupon": {
      // The code sits in its own bordered panel rather than being styled text:
      // a dashed border on an inline element is dropped by Outlook, and the
      // code is the one thing in the email that has to look like something you
      // can copy.
      const panel = block.panelBackground || "#f7fee7"
      const border = block.borderColor || "#84cc16"
      const codeColor = block.codeColor || "#3f6212"

      const headline = block.headline
        ? `<tr><td align="${block.align}" style="font-family:${font};font-size:18px;font-weight:bold;` +
          `color:#111827;line-height:1.35;padding-bottom:10px;">${escapeHtml(block.headline)}</td></tr>`
        : ""
      const label = block.label
        ? `<tr><td align="${block.align}" style="font-family:${font};font-size:12px;letter-spacing:1px;` +
          `text-transform:uppercase;color:#6b7280;padding-bottom:6px;">${escapeHtml(block.label)}</td></tr>`
        : ""
      const code = block.code
        ? `<tr><td align="${block.align}" style="padding-bottom:10px;">` +
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ` +
          `style="margin:${block.align === "center" ? "0 auto" : block.align === "right" ? "0 0 0 auto" : "0"};"><tr>` +
          `<td style="border:2px dashed ${border};border-radius:8px;padding:10px 22px;` +
          `font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:bold;letter-spacing:2px;` +
          `color:${codeColor};">${escapeHtml(block.code)}</td>` +
          `</tr></table></td></tr>`
        : ""
      const terms = block.terms
        ? `<tr><td align="${block.align}" style="font-family:${font};font-size:12px;line-height:1.5;` +
          `color:#6b7280;padding-bottom:${block.buttonText ? 12 : 0}px;">${escapeHtml(block.terms)}</td></tr>`
        : ""
      const button = block.buttonText
        ? `<tr><td align="${block.align}">` +
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ` +
          `style="margin:${block.align === "center" ? "0 auto" : block.align === "right" ? "0 0 0 auto" : "0"};"><tr>` +
          `<td align="center" bgcolor="${border}" style="border-radius:6px;background:${border};">` +
          `<a href="${safeHref(block.href)}" target="_blank" style="display:block;padding:10px 24px;` +
          `font-family:${font};font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">` +
          `${escapeHtml(block.buttonText)}</a></td></tr></table></td></tr>`
        : ""

      return (
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
        `bgcolor="${panel}" style="background:${panel};border-radius:10px;">` +
        `<tr><td style="padding:24px;">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
        headline + label + code + terms + button +
        `</table></td></tr></table>`
      )
    }

    case "social": {
      const cells = (block.links || [])
        .filter((link) => link.href)
        .map((link) => {
          const meta = SOCIAL_ICONS[link.network] || { color: "#6b7280", letter: "?" , label: link.network }
          return (
            `<td style="padding:0 4px;">` +
            `<a href="${safeHref(link.href)}" target="_blank" title="${escapeHtml(meta.label)}" ` +
            `style="display:inline-block;width:${block.iconSize}px;height:${block.iconSize}px;line-height:${block.iconSize}px;` +
            `background:${meta.color};color:#ffffff;border-radius:50%;text-align:center;font-family:${font};` +
            `font-size:${Math.round(block.iconSize * 0.45)}px;font-weight:bold;text-decoration:none;">${meta.letter}</a>` +
            `</td>`
          )
        })
        .join("")
      if (!cells) return ""
      const margin = block.align === "center" ? "0 auto" : block.align === "right" ? "0 0 0 auto" : "0"
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};"><tr>${cells}</tr></table>`
    }

    case "footer": {
      const link = (text, href) =>
        `<a href="${safeHref(href)}" style="color:${block.color};text-decoration:underline;">${escapeHtml(text)}</a>`

      // The named links and the unsubscribe one are one row separated by wide
      // spaces rather than a table: a table would not wrap on a narrow phone,
      // and these are the last thing anyone needs to be able to tap.
      const row = [
        ...(block.links || []).filter((l) => l.text).map((l) => link(l.text, l.href)),
        block.unsubscribeText ? link(block.unsubscribeText, block.unsubscribeHref) : "",
      ]
        .filter(Boolean)
        .join("&nbsp; &nbsp;&nbsp; ")

      const logo = block.logo
        ? `<div style="padding-top:14px;"><img src="${escapeHtml(block.logo)}" alt="${escapeHtml(block.company || "")}" ` +
          `width="${block.logoWidth || 120}" style="display:inline-block;border:0;width:${block.logoWidth || 120}px;max-width:60%;height:auto;"/></div>`
        : ""

      return (
        `<div style="font-family:${font};font-size:${block.size}px;line-height:1.6;color:${block.color};text-align:${block.align};">` +
        (block.note ? `${escapeHtml(block.note)}<br/>` : "") +
        (block.company ? `<strong>${escapeHtml(block.company)}</strong>${block.address ? ", " : ""}` : "") +
        (block.address ? `${escapeHtml(block.address)}` : "") +
        (block.company || block.address ? `<br/>` : "") +
        (row ? `<div style="padding-top:10px;">${row}</div>` : "") +
        logo +
        `</div>`
      )
    }

    // Deliberately not escaped -- the point of this block is to pass markup
    // through. Only an admin can reach the builder, and it is their own email.
    case "html":
      return String(block.html || "")

    default:
      return ""
  }
}

/** One top-level block, padding shell and all. */
export function renderBlock(block, settings) {
  const innerWidth = settings.contentWidth - settings.padding * 2

  if (block.type === "columns") {
    const count = Math.max(1, Math.min(3, Number(block.count) || 2))
    const columns = (block.columns || []).slice(0, count)
    const gap = Number(block.gap) || 0
    const columnWidth = Math.floor((innerWidth - gap * (count - 1)) / count)

    const cells = columns
      .map((column, index) => {
        const body = (column.blocks || [])
          .map(
            (child) =>
              `<tr><td style="padding:${child.paddingTop}px ${sidePad(child).right}px ` +
              `${child.paddingBottom}px ${sidePad(child).left}px;` +
              `${child.background ? `background:${child.background};` : ""}">` +
              `${renderBlockInner(child, settings, columnWidth)}</td></tr>`,
          )
          .join("")
        // A columns block made before this setting existed, or one that came in
        // through an import, has no verticalAlign at all -- and `undefined`
        // written into valign is markup no client can act on. Top is what a
        // table cell does by default anyway, so it is the honest fallback.
        const valign = ["top", "middle", "bottom"].includes(block.verticalAlign) ? block.verticalAlign : "top"

        return (
          `<td width="${columnWidth}" valign="${valign}" ` +
          `style="width:${columnWidth}px;vertical-align:${valign};` +
          `${index < count - 1 ? `padding-right:${gap}px;` : ""}">` +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table>` +
          `</td>`
        )
      })
      .join("")

    return shell(
      block,
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`,
      settings,
    )
  }

  const inner = renderBlockInner(block, settings, innerWidth)
  if (!inner) return ""
  return shell(block, inner, settings)
}

/** The whole email: a complete, sendable HTML document. */
export function renderEmailHtml(blocks = [], settings = DEFAULT_SETTINGS) {
  const config = { ...DEFAULT_SETTINGS, ...settings }
  const body = blocks.map((block) => renderBlock(block, config)).join("")

  // Hidden, but read by the inbox listing as the line after the subject. The
  // padding characters stop the client pulling the first visible words in after
  // it when the preheader is shorter than the space available.
  const preheader = config.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${config.contentBackground};">` +
      `${escapeHtml(config.preheader)}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>`
    : ""

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>Email</title>
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${config.backgroundColor};-webkit-text-size-adjust:100%;">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${config.backgroundColor};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="${config.contentWidth}" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${config.contentWidth}px;background:${config.contentBackground};border-radius:${config.radius}px;">
${body}
</table>
</td></tr>
</table>
</body>
</html>`
}

/** A plain-text summary of a block, for the canvas row. */
export function blockSummary(block) {
  switch (block.type) {
    case "heading":
    case "text":
      return (
        String(block.html ?? block.text ?? "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim() || "(empty)"
      )
    case "list":
      return String(block.items || "").split("\n").filter(Boolean).join(" · ") || "(empty)"
    case "image":
      return block.src ? block.alt || block.src : "No image chosen yet"
    case "video":
      return block.thumbnail ? block.alt || block.href : "No thumbnail chosen yet"
    case "button":
      return block.text || "(no label)"
    case "columns":
      return `${block.count} columns · ${(block.columns || []).reduce((sum, c) => sum + (c.blocks?.length || 0), 0)} blocks inside`
    case "divider":
      return "Divider"
    case "spacer":
      return `${block.height}px of space`
    case "product":
      return `${block.name} · ${block.price}`
    case "coupon":
      return block.code || "Coupon"
    case "social":
      return `${(block.links || []).filter((l) => l.href).length} links`
    case "footer":
      return block.company || "Footer"
    case "html":
      return "Custom HTML"
    default:
      return block.type
  }
}
