import { DEFAULT_SETTINGS, createBlock, emptyColumn } from "./emailBlocks"

/**
 * The default templates.
 *
 * Each entry is `{ id, name, category, description, build }`, and `build()` must
 * return fresh objects every call -- returning a shared constant would have two
 * templates created from the same entry pointing at the same blocks, so editing
 * one would silently change the other.
 *
 * Everything here is made of ordinary blocks: nothing is special-cased in the
 * renderer, so anything a default produces can be taken apart and edited by
 * hand afterwards like any other template.
 */

const b = (type, patch = {}) => ({ ...createBlock(type), ...patch })
const column = (...blocks) => ({ ...emptyColumn(), blocks })

const SITE = "https://www.grabatoz.ae"
// Not /logo.png -- that one is the white version for dark backgrounds, and it
// disappears against the light panels an email uses. Not the .webp either:
// Outlook renders mail with Word's engine, which cannot display WebP at all.
const LOGO = `${SITE}/email-logo.png`
const BRAND = "#84cc16"
const INK = "#111827"
const ADDRESS = "GrabAtoZ, Shop 2, Building 716, Khalid Bin Waleed Road, Al Souq Al Kabeer, Bur Dubai, Dubai"

/**
 * The sign-off, matching the shop's other mail: the do-not-reply line, a real
 * postal address (required by anti-spam law nearly everywhere), the help links
 * and the shop's mark.
 */
const footer = () =>
  b("footer", {
    note: "Don't reply to this email, which was sent from an unmonitored mailbox.",
    company: "GrabAtoZ",
    address: ADDRESS.replace("GrabAtoZ, ", ""),
    links: [
      { id: "help", text: "Help", href: `${SITE}/contact` },
      { id: "support", text: "Support", href: `${SITE}/contact` },
      { id: "privacy", text: "Privacy statement", href: `${SITE}/privacy-policy` },
    ],
    // Filled in with a real address by the sending code, per recipient.
    unsubscribeText: "Unsubscribe",
    unsubscribeHref: "{{unsubscribe_url}}",
    logo: LOGO,
    logoWidth: 130,
    align: "left",
    size: 12,
    background: "#f3f4f6",
    paddingTop: 22,
    paddingBottom: 22,
  })

/**
 * The bar across the top: the shop's mark on the left, a short line on the
 * right. Built as two columns because that is what survives Outlook -- a
 * flexbox row would collapse.
 */
const masthead = (rightText) =>
  b("columns", {
    count: 2,
    gap: 12,
    verticalAlign: "middle",
    paddingTop: 14,
    paddingBottom: 14,
    columns: [
      column(b("image", { src: LOGO, alt: "GrabAtoZ", align: "left", width: 55, paddingTop: 0, paddingBottom: 0 })),
      column(
        b("text", {
          html: `<p style="text-align:right"><strong>${rightText}</strong></p>`,
          text: rightText,
          align: "right",
          color: INK,
          size: 14,
          paddingTop: 0,
          paddingBottom: 0,
        }),
      ),
    ],
  })

/** One product, laid out as the picture beside the words in a tinted panel. */
const productCard = () =>
  b("product", {
    layout: "card",
    name: "Pick a product",
    price: "AED 0.00",
    blurb: "Choose a product from the catalogue and this fills in by itself. Duplicate this block for each one you want to show.",
    buttonText: "View product",
    buttonBackground: BRAND,
    cardBackground: "#f3f4f6",
    href: SITE,
    paddingTop: 8,
    paddingBottom: 8,
  })

/**
 * One product as the shop's own cards show it: picture, discount flag, name,
 * category, the VAT line, the price with what it was, and a button.
 */
const shopCard = () =>
  b("product", {
    layout: "stacked",
    name: "Pick a product",
    price: "AED 0.00",
    oldPrice: "",
    badge: "",
    category: "Category",
    note: "Inclusive VAT",
    buttonText: "Shop now",
    buttonBackground: BRAND,
    href: SITE,
    paddingTop: 0,
    paddingBottom: 0,
  })

/**
 * Three of them side by side.
 *
 * A columns block rather than three separate ones, because that is what makes
 * them a row: an email client stacks the columns on a narrow phone by itself,
 * which is the behaviour wanted, while three loose blocks would be three rows
 * everywhere.
 */
const shopRow = () =>
  b("columns", {
    count: 3,
    gap: 12,
    verticalAlign: "top",
    paddingTop: 6,
    paddingBottom: 6,
    columns: [column(shopCard()), column(shopCard()), column(shopCard())],
  })

export const EMAIL_PRESETS = [
  {
    id: "product-announcement",
    name: "Product Announcement",
    category: "Promotion",
    description: "Masthead, hero picture, a message, a button, then as many products as you like.",
    build: () => ({
      settings: { ...DEFAULT_SETTINGS, padding: 0, contentWidth: 640 },
      blocks: [
        masthead("New at GrabAtoZ"),

        // The hero. Left without a picture on purpose -- a stock image nobody
        // chose is worse than an obvious empty slot asking to be filled.
        b("image", {
          src: "",
          alt: "",
          align: "center",
          width: 100,
          paddingTop: 0,
          paddingBottom: 0,
        }),

        b("heading", {
          html: "<p>Your headline goes here</p>",
          text: "Your headline goes here",
          level: "h1",
          align: "center",
          size: 30,
          color: INK,
          paddingTop: 28,
          paddingBottom: 8,
        }),

        b("text", {
          html:
            "<p>Hi {{first_name}}, write the message here. Keep it to a couple of lines — " +
            "the part people act on is the button underneath.</p>",
          text: "Hi {{first_name}}, write the message here.",
          align: "center",
          size: 16,
          paddingTop: 0,
          paddingBottom: 18,
        }),

        b("button", {
          text: "Shop now",
          href: SITE,
          align: "center",
          buttonBackground: BRAND,
          paddingTop: 0,
          paddingBottom: 26,
        }),

        b("divider", { color: "#e5e7eb", paddingTop: 0, paddingBottom: 18 }),

        b("heading", {
          html: "<p>Picked for you</p>",
          text: "Picked for you",
          level: "h2",
          align: "center",
          size: 20,
          color: INK,
          paddingTop: 0,
          paddingBottom: 10,
        }),

        productCard(),

        b("spacer", { height: 18 }),
        footer(),
      ],
    }),
  },
  {
    id: "three-products",
    name: "Three Products",
    category: "Promotion",
    description: "The same email, with three shop-style product cards in a row.",
    build: () => ({
      settings: { ...DEFAULT_SETTINGS, padding: 0, contentWidth: 640 },
      blocks: [
        masthead("New at GrabAtoZ"),

        b("image", { src: "", alt: "", align: "center", width: 100, paddingTop: 0, paddingBottom: 0 }),

        b("heading", {
          html: "<p>Your headline goes here</p>",
          text: "Your headline goes here",
          level: "h1",
          align: "center",
          size: 30,
          color: INK,
          paddingTop: 28,
          paddingBottom: 8,
        }),

        b("text", {
          html:
            "<p>Hi {{first_name}}, write the message here. Keep it to a couple of lines — " +
            "the part people act on is the button underneath.</p>",
          text: "Hi {{first_name}}, write the message here.",
          align: "center",
          size: 16,
          paddingTop: 0,
          paddingBottom: 18,
        }),

        b("button", {
          text: "Shop now",
          href: SITE,
          align: "center",
          buttonBackground: BRAND,
          paddingTop: 0,
          paddingBottom: 26,
        }),

        b("divider", { color: "#e5e7eb", paddingTop: 0, paddingBottom: 18 }),

        b("heading", {
          html: "<p>Picked for you</p>",
          text: "Picked for you",
          level: "h2",
          align: "center",
          size: 20,
          color: INK,
          paddingTop: 0,
          paddingBottom: 12,
        }),

        shopRow(),

        b("spacer", { height: 18 }),
        footer(),
      ],
    }),
  },
  {
    id: "banner-promotion",
    name: "Banner & Promotion",
    category: "Promotion",
    description: "Two banners and a coupon — no products. For a sale, an offer or an announcement.",
    build: () => ({
      settings: { ...DEFAULT_SETTINGS, padding: 0, contentWidth: 640 },
      blocks: [
        masthead("New at GrabAtoZ"),

        b("image", { src: "", alt: "", align: "center", width: 100, paddingTop: 0, paddingBottom: 0 }),

        b("heading", {
          html: "<p>Your headline goes here</p>",
          text: "Your headline goes here",
          level: "h1",
          align: "center",
          size: 30,
          color: INK,
          paddingTop: 28,
          paddingBottom: 8,
        }),

        b("text", {
          html:
            "<p>Hi {{first_name}}, write the message here. Keep it to a couple of lines — " +
            "the part people act on is the button underneath.</p>",
          text: "Hi {{first_name}}, write the message here.",
          align: "center",
          size: 16,
          paddingTop: 0,
          paddingBottom: 18,
        }),

        b("button", {
          text: "Shop now",
          href: SITE,
          align: "center",
          buttonBackground: BRAND,
          paddingTop: 0,
          paddingBottom: 26,
        }),

        // The second banner, which is what this template has instead of
        // products. Empty like the first -- artwork is the whole point of it,
        // and a stock picture nobody chose would only be deleted.
        b("image", {
          src: "",
          alt: "",
          align: "center",
          width: 100,
          radius: 8,
          paddingTop: 0,
          paddingBottom: 22,
        }),

        // The slot for whatever is being offered. A coupon by default because
        // that is the most common thing to put here; the block can be deleted
        // and replaced with anything else.
        b("coupon", {
          headline: "Here is something for you",
          label: "Use code",
          code: "SAVE10",
          terms: "Valid until the end of the month. One use per customer.",
          buttonText: "Shop now",
          href: SITE,
          align: "center",
          paddingTop: 0,
          paddingBottom: 8,
        }),

        b("spacer", { height: 18 }),
        footer(),
      ],
    }),
  },
]

/** Filter chips above the gallery. Hidden while there is nothing to filter. */
export const PRESET_CATEGORIES = ["All", "Promotion", "Orders", "Customer", "Newsletter"]
