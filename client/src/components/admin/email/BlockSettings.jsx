"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { Images, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react"

import config from "../../../config/config"
import { getFullImageUrl } from "../../../utils/imageUtils"
import { toPublicImageUrl } from "../../../utils/emailImageUrl"
import { MERGE_FIELDS, SOCIAL_NETWORKS, newId, stripTextColor } from "../../../utils/emailBlocks"
import ImageManager from "./ImageManager"

/**
 * The right-hand panel: every control for whichever block is selected.
 *
 * Split out of the builder because it is the part that grows -- a new block type
 * means a new case here and nothing else, which keeps the editor shell small
 * enough to still read as one idea.
 */

const SITE = "https://www.grabatoz.ae"

/** The category can come back as an id, a name, or a populated object. */
const categoryName = (product) => {
  const raw = product.category
  if (!raw) return ""
  if (typeof raw === "string") return /^[a-f0-9]{24}$/i.test(raw) ? "" : raw
  return String(raw.name || "").trim()
}

const money = (value) => `AED ${Number(value || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * Pick a real product out of the catalogue instead of retyping it.
 *
 * What it copies across is a snapshot -- name, price, picture, link -- not a
 * reference. An email is a thing already sent: if the block pointed at the live
 * product, a price change tomorrow would silently rewrite what a customer was
 * promised today, in an email they can still open.
 */
const ProductPicker = ({ onPick, onClose }) => {
  const [term, setTerm] = useState("")
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!term.trim()) {
      setRows([])
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError("")
    // Held back briefly: this searches the whole catalogue, and firing on every
    // keystroke would mean a query per letter typed.
    const timer = setTimeout(() => {
      axios
        .get(`${config.API_URL}/api/products/admin`, {
          // `light=1` skips the description-text search, which is an unindexed
          // scan of every product's spec blurb. An older server ignores the
          // parameter and simply stays slow; it never breaks.
          params: { search: term.trim(), limit: 12, light: 1 },
          headers: { Authorization: `Bearer ${getAdminToken()}` },
          // Without this the request waits for ever, and the panel sits on
          // "Searching…" with nothing to tell the person it has given up.
          timeout: 20000,
        })
        .then((r) => {
          if (cancelled) return
          const list = Array.isArray(r.data) ? r.data : r.data?.products || []
          setRows(list)
        })
        .catch((err) => {
          if (cancelled) return
          if (err?.code === "ECONNABORTED") {
            setError("That search took too long. Try a shorter term, or part of the SKU.")
          } else if (err?.response?.status === 401) {
            setError("Your session has expired. Sign in again.")
          } else {
            setError("The catalogue could not be searched.")
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [term])

  const choose = (product) => {
    const offer = Number(product.offerPrice || 0)
    const list = Number(product.price || 0)
    // An offer price is only a discount when it is actually lower; some rows
    // carry an offerPrice equal to or above the list price.
    const discounted = offer > 0 && offer < list

    // Rounded, because "15% Off" is the shop's own wording on its product
    // cards and "15.384% Off" is nobody's.
    const percentOff = discounted ? Math.round(((list - offer) / list) * 100) : 0

    onPick({
      productId: product._id || "",
      sku: product.sku || "",
      name: product.name || "",
      image: toPublicImageUrl(getFullImageUrl(product.image)),
      price: money(discounted ? offer : list),
      oldPrice: discounted ? money(list) : "",
      badge: percentOff > 0 ? `${percentOff}% Off` : "",
      category: categoryName(product) ? `Category: ${categoryName(product)}` : "",
      note: "Inclusive VAT",
      href: product.slug ? `${SITE}/ae-en/product/${product.slug}` : SITE,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-24">
      <div className="flex max-h-[70vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b border-gray-200 p-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search a product by name or SKU"
              className={`${inputClass} pl-9`}
            />
          </div>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="flex items-center gap-2 p-6 text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Searching…
            </p>
          ) : error ? (
            <p className="p-6 text-sm text-red-600">{error}</p>
          ) : !term.trim() ? (
            <p className="p-6 text-center text-sm text-gray-500">Type a name or SKU to find a product.</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">Nothing matches that.</p>
          ) : (
            rows.map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() => choose(product)}
                className="flex w-full items-center gap-3 border-b border-gray-100 p-3 text-left last:border-b-0 hover:bg-lime-50"
              >
                <img
                  src={getFullImageUrl(product.image) || "/placeholder.svg"}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded border border-gray-200 object-contain"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">{product.name}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {product.sku ? `SKU ${product.sku}` : "No SKU"} · {money(product.offerPrice || product.price)}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export const inputClass =
  "w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
const labelClass = "block text-[11px] font-semibold uppercase tracking-wide text-gray-500"

export const Field = ({ children, title, hint }) => (
  <label className="block">
    <span className={labelClass}>{title}</span>
    {hint && <span className="mb-1 block text-[11px] font-normal leading-snug text-gray-400">{hint}</span>}
    <div className="mt-1">{children}</div>
  </label>
)

export const Segmented = ({ value, onChange, options }) => (
  <div className="flex gap-1">
    {options.map((option) => {
      const id = typeof option === "string" ? option : option.value
      const text = typeof option === "string" ? option : option.label
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize ${
            value === id ? "border-lime-500 bg-lime-50 text-lime-700" : "border-gray-300 bg-white text-gray-600"
          }`}
        >
          {text}
        </button>
      )
    })}
  </div>
)

export const ColorField = ({ title, value, onChange, allowEmpty = false }) => (
  <Field title={title}>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 shrink-0 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
      />
      <input
        value={value || ""}
        placeholder={allowEmpty ? "none" : ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} font-mono`}
      />
      {allowEmpty && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          title="Clear"
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  </Field>
)

export const NumberField = ({ title, value, onChange, min, max, step = 1, suffix = "px", hint }) => (
  <Field title={title} hint={hint}>
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-lime-600"
      />
      <span className="w-14 shrink-0 text-right text-xs tabular-nums text-gray-600">
        {value}
        {suffix}
      </span>
    </div>
  </Field>
)

/** Insert a merge token at the cursor rather than making people type braces. */
const MergeFieldMenu = ({ onInsert }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[11px] font-semibold text-lime-700 hover:underline"
      >
        + Insert field
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {MERGE_FIELDS.map((f) => (
            <button
              key={f.token}
              type="button"
              onClick={() => {
                onInsert(f.token)
                setOpen(false)
              }}
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-lime-50"
            >
              <span className="block font-medium text-gray-800">{f.label}</span>
              <span className="block font-mono text-[10px] text-gray-400">{f.token}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Pick an image by uploading one or pasting an address. */
const ImageField = ({ title, value, onChange, hint }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [libraryOpen, setLibraryOpen] = useState(false)
  const fileRef = useRef(null)

  const upload = async (file) => {
    if (!file) return
    setError("")
    setBusy(true)
    try {
      const body = new FormData()
      body.append("image", file)
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      const { data } = await axios.post(`${config.API_URL}/api/upload/single`, body, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // An email is opened days later on someone else's machine, so a relative
      // path is useless -- the address has to be absolute and public.
      const url = data?.url || data?.path || ""
      onChange(url.startsWith("http") ? url : `${config.API_URL}${url}`)
    } catch {
      setError("Upload failed. Paste an image address instead.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Field title={title} hint={hint}>
      <div className="space-y-1.5">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className={inputClass} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <Images size={13} />
            Library
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
        <ImageManager
          open={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          onPick={(url) => {
            onChange(url)
            setLibraryOpen(false)
          }}
        />
        {error && <p className="text-[11px] text-red-600">{error}</p>}
        {value && (
          <img src={value} alt="" className="h-20 w-full rounded border border-gray-200 object-contain" />
        )}
      </div>
    </Field>
  )
}

const ALIGN = ["left", "center", "right"]

const BlockSettings = ({ block, onChange }) => {
  const set = (patch) => onChange(patch)
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="space-y-3.5">
      {(block.type === "heading" || block.type === "text") && (
        <>
          <p className="rounded-lg bg-lime-50 p-2.5 text-[11px] leading-snug text-lime-900">
            Click the text on the canvas to edit it. The toolbar appears above it with bold, links, colours, lists and
            merge fields — and you see the words at the size they will actually be sent.
          </p>
          {block.type === "heading" && (
            <Field title="Level">
              <Segmented
                value={block.level}
                onChange={(level) => set({ level })}
                options={[
                  { value: "h1", label: "H1" },
                  { value: "h2", label: "H2" },
                  { value: "h3", label: "H3" },
                ]}
              />
            </Field>
          )}
          <NumberField title="Font size" value={block.size} min={10} max={48} onChange={(size) => set({ size })} />
          <NumberField
            title="Line height"
            value={block.lineHeight}
            min={1}
            max={2.4}
            step={0.1}
            suffix=""
            onChange={(lineHeight) => set({ lineHeight })}
          />
          {block.type === "heading" && (
            <Field title="Weight">
              <Segmented
                value={block.weight}
                onChange={(weight) => set({ weight })}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "bold", label: "Bold" },
                ]}
              />
            </Field>
          )}
          {/* Clearing per-word colours too, so the control just used is the one
              that wins -- see stripTextColor. */}
          <ColorField
            title="Colour"
            value={block.color}
            onChange={(color) => set({ color, html: stripTextColor(block.html) })}
          />
          <Field title="Align">
            <Segmented value={block.align} onChange={(align) => set({ align })} options={ALIGN} />
          </Field>
        </>
      )}

      {block.type === "list" && (
        <>
          <Field title="Items" hint="One per line.">
            <textarea rows={6} value={block.items} onChange={(e) => set({ items: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Style">
            <Segmented
              value={block.style}
              onChange={(style) => set({ style })}
              options={[
                { value: "bullet", label: "Bullets" },
                { value: "number", label: "Numbers" },
              ]}
            />
          </Field>
          <NumberField title="Font size" value={block.size} min={10} max={28} onChange={(size) => set({ size })} />
          <ColorField title="Colour" value={block.color} onChange={(color) => set({ color })} />
        </>
      )}

      {block.type === "image" && (
        <>
          <ImageField
            title="Image"
            value={block.src}
            onChange={(src) => set({ src })}
            hint="Must be reachable from the public internet — a mail client cannot see your network."
          />
          <Field title="Alt text" hint="Shown when images are blocked, which many clients do by default.">
            <input value={block.alt} onChange={(e) => set({ alt: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Links to">
            <input value={block.href} onChange={(e) => set({ href: e.target.value })} placeholder="https://… (optional)" className={inputClass} />
          </Field>
          <NumberField title="Width" value={block.width} min={20} max={100} suffix="%" onChange={(width) => set({ width })} />
          <NumberField title="Corner radius" value={block.radius} min={0} max={32} onChange={(radius) => set({ radius })} />
          <Field title="Align">
            <Segmented value={block.align} onChange={(align) => set({ align })} options={ALIGN} />
          </Field>
        </>
      )}

      {block.type === "video" && (
        <>
          <ImageField
            title="Thumbnail"
            value={block.thumbnail}
            onChange={(thumbnail) => set({ thumbnail })}
            hint="No mail client plays video inline, so this is a still that links out."
          />
          <Field title="Video link">
            <input value={block.href} onChange={(e) => set({ href: e.target.value })} placeholder="https://youtube.com/…" className={inputClass} />
          </Field>
          <Field title="Caption">
            <input value={block.alt} onChange={(e) => set({ alt: e.target.value })} className={inputClass} />
          </Field>
          <NumberField title="Width" value={block.width} min={20} max={100} suffix="%" onChange={(width) => set({ width })} />
          <Field title="Align">
            <Segmented value={block.align} onChange={(align) => set({ align })} options={ALIGN} />
          </Field>
        </>
      )}

      {block.type === "button" && (
        <>
          <Field title="Label">
            <input value={block.text} onChange={(e) => set({ text: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Links to">
            <input value={block.href} onChange={(e) => set({ href: e.target.value })} placeholder="https://…" className={inputClass} />
          </Field>
          <ColorField
            title="Button colour"
            value={block.buttonBackground ?? block.background ?? "#84cc16"}
            onChange={(buttonBackground) => set({ buttonBackground })}
          />
          <ColorField title="Text colour" value={block.color} onChange={(color) => set({ color })} />
          <NumberField title="Font size" value={block.size} min={11} max={24} onChange={(size) => set({ size })} />
          <NumberField title="Corner radius" value={block.radius} min={0} max={32} onChange={(radius) => set({ radius })} />

          {/* Width is a percentage of the content column, not pixels: an email
              is read at whatever width the client gives it, and a fixed size
              that suits one screen overflows another. */}
          <Field title="Width">
            <Segmented
              value={block.widthMode === "custom" || block.fullWidth ? "custom" : "auto"}
              onChange={(mode) =>
                set(
                  mode === "auto"
                    ? { widthMode: "auto", fullWidth: false }
                    : { widthMode: "custom", fullWidth: false, width: block.width || 60 },
                )
              }
              options={[
                { value: "auto", label: "Fit text" },
                { value: "custom", label: "Set width" },
              ]}
            />
          </Field>
          {(block.widthMode === "custom" || block.fullWidth) && (
            <NumberField
              title="Button width"
              value={block.fullWidth && block.widthMode !== "custom" ? 100 : block.width || 60}
              min={20}
              max={100}
              suffix="%"
              onChange={(width) => set({ width, widthMode: "custom", fullWidth: false })}
            />
          )}

          <NumberField title="Side padding" value={block.paddingX} min={8} max={60} onChange={(paddingX) => set({ paddingX })} />
          <NumberField title="Height padding" value={block.paddingY} min={6} max={30} onChange={(paddingY) => set({ paddingY })} />
          <Field title="Align">
            <Segmented value={block.align} onChange={(align) => set({ align })} options={ALIGN} />
          </Field>
        </>
      )}

      {block.type === "columns" && (
        <>
          <Field title="Columns" hint="Drag blocks into a column on the canvas.">
            <Segmented
              value={String(block.count)}
              onChange={(count) => {
                const next = Number(count)
                const columns = [...(block.columns || [])]
                while (columns.length < next) columns.push({ id: newId(), blocks: [] })
                set({ count: next, columns: columns.slice(0, next) })
              }}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
              ]}
            />
          </Field>
          <NumberField title="Gap" value={block.gap} min={0} max={40} onChange={(gap) => set({ gap })} />
          <Field title="Vertical align" hint="Only visible when the columns end up different heights — with equal ones there is nothing to shift.">
            <Segmented
              value={block.verticalAlign}
              onChange={(verticalAlign) => set({ verticalAlign })}
              options={[
                { value: "top", label: "Top" },
                { value: "middle", label: "Middle" },
                { value: "bottom", label: "Bottom" },
              ]}
            />
          </Field>
          <p className="rounded-lg bg-amber-50 p-2 text-[11px] leading-snug text-amber-800">
            Columns stack one above the other on narrow phones in most clients. Keep each one able to stand alone.
          </p>
        </>
      )}

      {block.type === "divider" && (
        <>
          <ColorField title="Colour" value={block.color} onChange={(color) => set({ color })} />
          <NumberField title="Thickness" value={block.thickness} min={1} max={8} onChange={(thickness) => set({ thickness })} />
          <NumberField title="Width" value={block.width} min={20} max={100} suffix="%" onChange={(width) => set({ width })} />
        </>
      )}

      {block.type === "spacer" && (
        <NumberField title="Height" value={block.height} min={4} max={160} onChange={(height) => set({ height })} />
      )}

      {block.type === "product" && (
        <>
          <Field title="From your catalogue" hint="Fills the fields below. You can still edit them afterwards.">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Search size={14} />
              {block.productId ? "Choose a different product" : "Choose a product"}
            </button>
            {block.sku && <p className="mt-1 text-[11px] text-gray-400">Picked: SKU {block.sku}</p>}
          </Field>

          <Field title="Layout">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: "stacked", label: "Image on top" },
                { key: "card", label: "Beside the words" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => set({ layout: option.key })}
                  className={`rounded-md border px-2 py-1.5 text-xs font-medium ${
                    (block.layout || "stacked") === option.key
                      ? "border-lime-500 bg-lime-50 text-lime-700"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>

          <ImageField title="Product image" value={block.image} onChange={(image) => set({ image })} />
          <Field title="Name">
            <input value={block.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Price">
            <input value={block.price} onChange={(e) => set({ price: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Was price" hint="Shown struck through. Leave empty for none.">
            <input value={block.oldPrice} onChange={(e) => set({ oldPrice: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Badge" hint="Shown above the name. The picker fills in the discount.">
            <input value={block.badge || ""} onChange={(e) => set({ badge: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Category line">
            <input value={block.category || ""} onChange={(e) => set({ category: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Small note" hint='Such as "Inclusive VAT".'>
            <input value={block.note || ""} onChange={(e) => set({ note: e.target.value })} className={inputClass} />
          </Field>

          {(block.layout || "stacked") === "card" && (
            <>
              <Field title="Short description" hint="A line or two beside the picture.">
                <textarea
                  rows={3}
                  value={block.blurb || ""}
                  onChange={(e) => set({ blurb: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <ColorField
                title="Panel colour"
                value={block.cardBackground || "#f3f4f6"}
                onChange={(cardBackground) => set({ cardBackground })}
              />
            </>
          )}
          <Field title="Links to">
            <input value={block.href} onChange={(e) => set({ href: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Button label">
            <input value={block.buttonText} onChange={(e) => set({ buttonText: e.target.value })} className={inputClass} />
          </Field>
          <ColorField title="Button colour" value={block.buttonBackground} onChange={(buttonBackground) => set({ buttonBackground })} />

          {pickerOpen && (
            <ProductPicker onPick={(fields) => set(fields)} onClose={() => setPickerOpen(false)} />
          )}
        </>
      )}

      {block.type === "coupon" && (
        <>
          <Field title="Headline">
            <input value={block.headline || ""} onChange={(e) => set({ headline: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Label above the code">
            <input value={block.label || ""} onChange={(e) => set({ label: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Code" hint="Shown large, in a dashed box, so it reads as something to copy.">
            <input
              value={block.code || ""}
              onChange={(e) => set({ code: e.target.value })}
              className={`${inputClass} font-mono uppercase`}
            />
          </Field>
          <Field title="Terms" hint="Expiry, minimum spend, anything that limits it.">
            <textarea rows={2} value={block.terms || ""} onChange={(e) => set({ terms: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Button label" hint="Leave empty for no button.">
            <input value={block.buttonText || ""} onChange={(e) => set({ buttonText: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Links to">
            <input value={block.href || ""} onChange={(e) => set({ href: e.target.value })} className={inputClass} />
          </Field>
          <ColorField title="Panel colour" value={block.panelBackground || "#f7fee7"} onChange={(panelBackground) => set({ panelBackground })} />
          <ColorField title="Border and button" value={block.borderColor || "#84cc16"} onChange={(borderColor) => set({ borderColor })} />
          <ColorField title="Code colour" value={block.codeColor || "#3f6212"} onChange={(codeColor) => set({ codeColor })} />
          <Field title="Align">
            <Segmented value={block.align} onChange={(align) => set({ align })} options={ALIGN} />
          </Field>
        </>
      )}

      {block.type === "social" && (
        <>
          <Field title="Links">
            <div className="space-y-2">
              {(block.links || []).map((link, index) => (
                <div key={link.id} className="flex items-center gap-1.5">
                  <select
                    value={link.network}
                    onChange={(e) => {
                      const links = [...block.links]
                      links[index] = { ...link, network: e.target.value }
                      set({ links })
                    }}
                    className={`${inputClass} w-28 shrink-0`}
                  >
                    {SOCIAL_NETWORKS.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={link.href}
                    onChange={(e) => {
                      const links = [...block.links]
                      links[index] = { ...link, href: e.target.value }
                      set({ links })
                    }}
                    placeholder="https://…"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => set({ links: block.links.filter((l) => l.id !== link.id) })}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => set({ links: [...(block.links || []), { id: newId(), network: "facebook", href: "" }] })}
                className="flex items-center gap-1 text-xs font-semibold text-lime-700 hover:underline"
              >
                <Plus size={13} />
                Add a link
              </button>
            </div>
          </Field>
          <NumberField title="Icon size" value={block.iconSize} min={18} max={48} onChange={(iconSize) => set({ iconSize })} />
          <Field title="Align">
            <Segmented value={block.align} onChange={(align) => set({ align })} options={ALIGN} />
          </Field>
        </>
      )}

      {block.type === "footer" && (
        <>
          <Field title="Company">
            <input value={block.company} onChange={(e) => set({ company: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Address" hint="A real postal address is required by anti-spam law in most countries.">
            <textarea rows={2} value={block.address} onChange={(e) => set({ address: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Note">
            <textarea rows={2} value={block.note} onChange={(e) => set({ note: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Unsubscribe label">
            <input value={block.unsubscribeText} onChange={(e) => set({ unsubscribeText: e.target.value })} className={inputClass} />
          </Field>
          <Field title="Unsubscribe link" hint="Leave the {{unsubscribe_url}} field in place and sending fills it in.">
            <input value={block.unsubscribeHref} onChange={(e) => set({ unsubscribeHref: e.target.value })} className={`${inputClass} font-mono text-xs`} />
          </Field>

          <Field title="Links" hint="Shown in a row before Unsubscribe.">
            <div className="space-y-2">
              {(block.links || []).map((item, index) => (
                <div key={item.id} className="space-y-1 rounded-md border border-gray-200 p-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      value={item.text}
                      onChange={(e) => {
                        const links = [...(block.links || [])]
                        links[index] = { ...item, text: e.target.value }
                        set({ links })
                      }}
                      placeholder="Label"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => set({ links: (block.links || []).filter((_, i) => i !== index) })}
                      className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    value={item.href}
                    onChange={(e) => {
                      const links = [...(block.links || [])]
                      links[index] = { ...item, href: e.target.value }
                      set({ links })
                    }}
                    placeholder="https://"
                    className={`${inputClass} text-xs`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => set({ links: [...(block.links || []), { id: newId(), text: "", href: "" }] })}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <Plus size={13} />
                Add a link
              </button>
            </div>
          </Field>

          <ImageField title="Logo" value={block.logo || ""} onChange={(logo) => set({ logo })} />
          {block.logo && (
            <NumberField
              title="Logo width"
              value={block.logoWidth || 120}
              min={60}
              max={260}
              suffix="px"
              onChange={(logoWidth) => set({ logoWidth })}
            />
          )}

          <NumberField title="Font size" value={block.size} min={9} max={16} onChange={(size) => set({ size })} />
          <ColorField title="Colour" value={block.color} onChange={(color) => set({ color })} />
          <Field title="Align">
            <Segmented value={block.align} onChange={(align) => set({ align })} options={ALIGN} />
          </Field>
        </>
      )}

      {block.type === "html" && (
        <Field title="HTML" hint="Passed through exactly as written. Keep to tables and inline styles.">
          <textarea
            rows={10}
            value={block.html}
            onChange={(e) => set({ html: e.target.value })}
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>
      )}

      {/* Spacing and background, on every block */}
      {block.type !== "spacer" && (
        <div className="space-y-3 border-t border-gray-200 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Spacing</p>
          <NumberField title="Space above" value={block.paddingTop} min={0} max={80} onChange={(paddingTop) => set({ paddingTop })} />
          <NumberField title="Space below" value={block.paddingBottom} min={0} max={80} onChange={(paddingBottom) => set({ paddingBottom })} />
          <NumberField
            title="Space left"
            hint="Added to the email's own side margin, so the block moves in from where it sits now."
            value={block.paddingLeft || 0}
            min={0}
            max={120}
            onChange={(paddingLeft) => set({ paddingLeft })}
          />
          <NumberField
            title="Space right"
            value={block.paddingRight || 0}
            min={0}
            max={120}
            onChange={(paddingRight) => set({ paddingRight })}
          />
          <ColorField title="Background" value={block.background} onChange={(background) => set({ background })} allowEmpty />
        </div>
      )}
    </div>
  )
}

export default BlockSettings
