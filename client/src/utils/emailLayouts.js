import { DEFAULT_SETTINGS, createBlock, emptyColumn } from "./emailBlocks"

/**
 * Layouts: the shape of an email, before any of its words.
 *
 * Different from the template library next door. A template is a finished email
 * about something -- a flash sale, an order confirmation. A layout is the
 * arrangement alone: a heading here, two products there, a button at the end.
 * Someone who knows what they want to say but not how to arrange it starts here.
 *
 * `skeleton` is the wireframe drawn on the card. It is a plain description of
 * grey bars and boxes rather than a rendering of the blocks, because at
 * thumbnail size the real thing is an unreadable smudge -- the point of the card
 * is the shape, and a wireframe shows a shape better than a shrunken email.
 */

const b = (type, patch = {}) => ({ ...createBlock(type), ...patch })
const column = (...blocks) => ({ ...emptyColumn(), blocks })

export const EMAIL_LAYOUTS = [
  {
    id: "basic",
    name: "Basic",
    description: "Heading, words, a picture, a button.",
    skeleton: [
      { kind: "bar", width: 70, height: 10 },
      { kind: "line" },
      { kind: "line" },
      { kind: "line", width: 60 },
      { kind: "box", height: 40 },
      { kind: "line" },
      { kind: "line", width: 80 },
      { kind: "bar", width: 30, height: 8 },
    ],
    build: () => ({
      settings: { ...DEFAULT_SETTINGS },
      blocks: [
        b("heading", { html: "<p>Your heading</p>", text: "Your heading", paddingTop: 26 }),
        b("text", { html: "<p>Write your message here. Keep it short — the shorter it is, the more of it gets read.</p>" }),
        b("image", { alt: "" }),
        b("text", { html: "<p>Add anything else the reader needs to know.</p>" }),
        b("button", { text: "Shop now", align: "left" }),
      ],
    }),
  },
  {
    id: "commerce",
    name: "Commerce",
    description: "Four products in a grid.",
    skeleton: [
      { kind: "bar", width: 60, height: 10 },
      { kind: "line" },
      { kind: "line", width: 70 },
      { kind: "cols", count: 2, rows: [{ kind: "box", height: 30 }, { kind: "line" }, { kind: "line", width: 60 }] },
      { kind: "cols", count: 2, rows: [{ kind: "box", height: 30 }, { kind: "line" }, { kind: "line", width: 60 }] },
      { kind: "bar", width: 36, height: 8 },
    ],
    build: () => ({
      settings: { ...DEFAULT_SETTINGS },
      blocks: [
        b("heading", { html: "<p>Picked for you</p>", text: "Picked for you", align: "center", paddingTop: 26 }),
        b("text", { html: "<p>A short line about this selection.</p>", align: "center", color: "#6b7280" }),
        b("columns", {
          count: 2,
          columns: [
            column(b("product", { name: "Product one", price: "AED 0.00", buttonText: "View" })),
            column(b("product", { name: "Product two", price: "AED 0.00", buttonText: "View" })),
          ],
        }),
        b("columns", {
          count: 2,
          columns: [
            column(b("product", { name: "Product three", price: "AED 0.00", buttonText: "View" })),
            column(b("product", { name: "Product four", price: "AED 0.00", buttonText: "View" })),
          ],
        }),
        b("button", { text: "See everything", align: "center" }),
      ],
    }),
  },
  {
    id: "three-columns",
    name: "Three columns",
    description: "Three things side by side.",
    skeleton: [
      { kind: "bar", width: 55, height: 10 },
      { kind: "line" },
      { kind: "cols", count: 3, rows: [{ kind: "box", height: 26 }, { kind: "line" }, { kind: "line", width: 70 }] },
      { kind: "line" },
      { kind: "bar", width: 32, height: 8 },
    ],
    build: () => ({
      settings: { ...DEFAULT_SETTINGS },
      blocks: [
        b("heading", { html: "<p>Three to look at</p>", text: "Three to look at", align: "center", paddingTop: 26 }),
        b("text", { html: "<p>A line to introduce them.</p>", align: "center", color: "#6b7280" }),
        b("columns", {
          count: 3,
          gap: 12,
          columns: [
            column(b("product", { name: "One", price: "AED 0.00", buttonText: "View" })),
            column(b("product", { name: "Two", price: "AED 0.00", buttonText: "View" })),
            column(b("product", { name: "Three", price: "AED 0.00", buttonText: "View" })),
          ],
        }),
        b("button", { text: "Browse the shop", align: "center" }),
      ],
    }),
  },
  {
    id: "news",
    name: "News",
    description: "Article rows, words beside a picture.",
    skeleton: [
      { kind: "bar", width: 50, height: 10 },
      { kind: "split", left: [{ kind: "line" }, { kind: "line" }, { kind: "line", width: 60 }], right: { kind: "box", height: 28 } },
      { kind: "rule" },
      { kind: "split", left: [{ kind: "line" }, { kind: "line" }, { kind: "line", width: 60 }], right: { kind: "box", height: 28 } },
      { kind: "bar", width: 30, height: 8 },
    ],
    build: () => ({
      settings: { ...DEFAULT_SETTINGS },
      blocks: [
        b("heading", { html: "<p>This month</p>", text: "This month", paddingTop: 26 }),
        b("columns", {
          count: 2,
          columns: [
            column(
              b("heading", { html: "<p>First story</p>", text: "First story", level: "h3", size: 18, paddingBottom: 2 }),
              b("text", { html: "<p>A paragraph about it, with room for two or three sentences.</p>", size: 14, paddingTop: 0 }),
            ),
            column(b("image", { alt: "" })),
          ],
        }),
        b("divider", {}),
        b("columns", {
          count: 2,
          columns: [
            column(
              b("heading", { html: "<p>Second story</p>", text: "Second story", level: "h3", size: 18, paddingBottom: 2 }),
              b("text", { html: "<p>Another paragraph here.</p>", size: 14, paddingTop: 0 }),
            ),
            column(b("image", { alt: "" })),
          ],
        }),
        b("button", { text: "Read more", align: "left" }),
      ],
    }),
  },
  {
    id: "text",
    name: "Text only",
    description: "Words alone. Lands best in the inbox.",
    skeleton: [
      { kind: "bar", width: 45, height: 10 },
      { kind: "line" },
      { kind: "line" },
      { kind: "line" },
      { kind: "line", width: 85 },
      { kind: "line" },
      { kind: "line" },
      { kind: "line", width: 70 },
      { kind: "line" },
      { kind: "line", width: 40 },
    ],
    build: () => ({
      settings: { ...DEFAULT_SETTINGS, contentWidth: 560 },
      blocks: [
        b("heading", { html: "<p>A note from us</p>", text: "A note from us", level: "h3", size: 20, paddingTop: 26 }),
        b("text", { html: "<p>Hi {{first_name}},</p>" }),
        b("text", { html: "<p>Write what you want to say here, as you would in an ordinary email. A plain message with no pictures is the least likely of all to be treated as junk.</p>" }),
        b("text", { html: "<p>Thanks,<br/>The GrabAtoZ team</p>" }),
      ],
    }),
  },
]
