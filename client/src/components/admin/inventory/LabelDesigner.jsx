"use client"

import { useEffect, useMemo, useState } from "react"
import { Info, Printer, X } from "lucide-react"

import {
  DEFAULT_LABEL_SETTINGS,
  LABEL_GAP_MM,
  LIMITS,
  USABLE_WIDTH_MM,
  buildLabelHtml,
  canLabel,
  clampSetting,
  labelsPerRow,
  printLabelSheet,
  summariseSheet,
} from "../../../utils/labelSheet"

/**
 * Design a label and print the sheet.
 *
 * Controls on the left, a live sample on the right. Nobody can picture "barcode
 * height 40" until they see it next to the price, so the sample redraws on every
 * change — the alternative is finding out by printing a sheet.
 */

/**
 * A slider and a number box for the same value.
 *
 * Both, not one: the slider is for finding a size by eye, the box is for typing
 * the figure off the label packet. The box keeps whatever is typed while it has
 * focus and is only clamped on blur, so clearing it to retype does not snap to
 * the minimum under the cursor.
 */
const Measure = ({ label, hint, settingKey, value, onChange, disabled, suffix = "mm" }) => {
  const limit = LIMITS[settingKey]
  const [draft, setDraft] = useState(String(value))

  // Follow the slider while it moves, but never while the box is being typed in.
  useEffect(() => {
    setDraft(String(value))
  }, [value])

  return (
    <div className={disabled ? "opacity-40" : ""}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={draft}
            disabled={disabled}
            step={limit.step}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onChange(clampSetting(settingKey, draft))}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur()
            }}
            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-right text-sm tabular-nums focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:cursor-not-allowed"
          />
          <span className="text-xs text-gray-500">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={limit.min}
        max={limit.max}
        step={limit.step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-lime-600 disabled:cursor-not-allowed"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

const Toggle = ({ label, hint, checked, onChange, children }) => (
  <div className="rounded-lg border border-gray-200 p-3">
    <label className="flex items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
      />
      <span className="text-sm">
        <span className="font-medium text-gray-900">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
    {checked && children && <div className="mt-2 pl-6">{children}</div>}
  </div>
)

const inputClass =
  "w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500"

const LabelDesigner = ({ open, onClose, items, settings, onSettingsChange }) => {
  const set = (patch) => onSettingsChange({ ...settings, ...patch })

  const summary = useMemo(() => summariseSheet(items), [items])
  const perRow = labelsPerRow(settings.widthMm)

  // The sample is the first product that can actually be labelled, so the
  // preview is never a blank rectangle just because the first row has no code.
  const sample = useMemo(
    () => items.find(({ product }) => canLabel(product))?.product || items[0]?.product || null,
    [items],
  )

  const sampleHtml = useMemo(
    () => (sample ? buildLabelHtml(sample, settings) : ""),
    [sample, settings],
  )

  if (!open) return null

  // The preview is drawn at the label's real width-to-height ratio, scaled to
  // fit the panel. A label set too short for everything on it then looks wrong
  // here, rather than after the paper is loaded.
  const PREVIEW_WIDTH_PX = 320
  const scale = PREVIEW_WIDTH_PX / settings.widthMm
  const previewHeightPx = settings.heightMm * scale

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Design label</h2>
            <p className="text-sm text-gray-500">
              {summary.labels > 0
                ? `${summary.labels} label${summary.labels === 1 ? "" : "s"} across ${summary.products} product${summary.products === 1 ? "" : "s"}`
                : "Nothing selected to print yet"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[1fr_380px]">
          {/* ---- Controls ---- */}
          <div className="space-y-5">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Size</h3>
              <Measure label="Label width" settingKey="widthMm" value={settings.widthMm} onChange={(v) => set({ widthMm: v })} />
              <Measure label="Label height" settingKey="heightMm" value={settings.heightMm} onChange={(v) => set({ heightMm: v })} />

              {/* A read-out, not a setting. Offering "labels per row" as well as
                  a width lets the two contradict each other. */}
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <span>
                  <strong className="text-gray-900">{perRow} per row</strong> on A4 at this width — {USABLE_WIDTH_MM}mm of
                  usable page with a {LABEL_GAP_MM}mm gap. Set the width to match your paper and the fit follows.
                </span>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Barcode</h3>
              <Measure
                label="Barcode height"
                settingKey="barcodeHeightMm"
                value={settings.barcodeHeightMm}
                onChange={(v) => set({ barcodeHeightMm: v })}
                disabled={!settings.showBarcode}
              />
              <Measure
                label="Bar thickness"
                settingKey="moduleWidthMm"
                value={settings.moduleWidthMm}
                onChange={(v) => set({ moduleWidthMm: v })}
                disabled={!settings.showBarcode}
                hint="If a scanner struggles with your labels, raise this first. Thin bars blur together on cheap thermal printers and stop scanning — it is the least obvious and most useful setting here."
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">What goes on the label</h3>

              <Toggle
                label="Company name or logo"
                checked={settings.showCompany}
                onChange={(v) => set({ showCompany: v })}
              >
                <div className="space-y-2">
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={settings.companyMode === "name"}
                        onChange={() => set({ companyMode: "name" })}
                        className="text-lime-600 focus:ring-lime-500"
                      />
                      Name
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={settings.companyMode === "logo"}
                        onChange={() => set({ companyMode: "logo" })}
                        className="text-lime-600 focus:ring-lime-500"
                      />
                      Logo
                    </label>
                  </div>
                  {settings.companyMode === "name" ? (
                    <input
                      className={inputClass}
                      value={settings.companyName}
                      onChange={(e) => set({ companyName: e.target.value })}
                      placeholder="Company name"
                    />
                  ) : (
                    <input
                      className={inputClass}
                      value={settings.logoUrl}
                      onChange={(e) => set({ logoUrl: e.target.value })}
                      placeholder="https://… or /uploads/logo.png"
                    />
                  )}
                  <p className="text-xs text-gray-500">
                    The name is the safer choice. A logo printed at 5mm on a thermal printer usually comes out as a grey
                    smudge, where text stays readable.
                  </p>
                </div>
              </Toggle>

              <Toggle
                label="Product name"
                hint="Wraps to two lines, then truncates."
                checked={settings.showProductName}
                onChange={(v) => set({ showProductName: v })}
              />
              <Toggle
                label="SKU"
                hint="Its own line above the barcode."
                checked={settings.showSku}
                onChange={(v) => set({ showSku: v })}
              />
              <Toggle
                label="Barcode"
                hint="The scannable bars."
                checked={settings.showBarcode}
                onChange={(v) => set({ showBarcode: v })}
              />
              <Toggle
                label="Code under the barcode"
                hint="The digits a person can read and type. Keep this on with the bars off for a clean price tag that still carries a reference."
                checked={settings.showCode}
                onChange={(v) => set({ showCode: v })}
              />
              <Toggle label="Price" checked={settings.showPrice} onChange={(v) => set({ showPrice: v })} />
              <Toggle
                label="Custom field"
                hint="The same line on every label."
                checked={settings.showCustom}
                onChange={(v) => set({ showCustom: v })}
              >
                <input
                  className={inputClass}
                  value={settings.customText}
                  onChange={(e) => set({ customText: e.target.value })}
                  placeholder="e.g. Made in UAE"
                />
              </Toggle>
            </section>

            <button
              type="button"
              onClick={() => onSettingsChange({ ...DEFAULT_LABEL_SETTINGS })}
              className="text-sm text-gray-500 underline hover:text-gray-800"
            >
              Reset to defaults
            </button>
          </div>

          {/* ---- Live preview ---- */}
          <div className="lg:sticky lg:top-0">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Preview</h3>
            <div className="rounded-xl bg-gray-100 p-5">
              {sample ? (
                <>
                  <div
                    className="mx-auto overflow-hidden bg-white shadow-sm"
                    style={{ width: `${PREVIEW_WIDTH_PX}px`, height: `${previewHeightPx}px` }}
                  >
                    {/* The label is built at real millimetre sizes, then scaled
                        as a whole, so what is on screen is the same geometry the
                        printer is given — not a second layout that can disagree. */}
                    <div
                      style={{
                        transform: `scale(${scale / MM_PER_CSS_MM_AT_96DPI})`,
                        transformOrigin: "top left",
                        width: `${settings.widthMm}mm`,
                        height: `${settings.heightMm}mm`,
                      }}
                      dangerouslySetInnerHTML={{ __html: `<style>${PREVIEW_CSS(settings)}</style>${sampleHtml}` }}
                    />
                  </div>
                  <p className="mt-3 text-center text-xs text-gray-500">
                    {settings.widthMm} × {settings.heightMm}mm · {perRow} per row · {sample.name}
                  </p>
                </>
              ) : (
                <p className="py-10 text-center text-sm text-gray-500">Select a product to see its label.</p>
              )}
            </div>

            {summary.skipped.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <strong>{summary.skipped.length}</strong> selected product
                {summary.skipped.length === 1 ? " has" : "s have"} no barcode, GTIN or SKU, so there is nothing to
                encode. {summary.skipped.length === 1 ? "It is" : "They are"} left off the sheet.
              </div>
            )}

            <button
              type="button"
              disabled={summary.labels === 0}
              onClick={() => printLabelSheet(items, settings)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-lime-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={16} />
              Print {summary.labels} label{summary.labels === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// A CSS millimetre is 96/25.4 pixels. Dividing by it converts the preview's
// "pixels per millimetre" scale into a plain CSS transform factor.
const MM_PER_CSS_MM_AT_96DPI = 96 / 25.4

// The same rules the printed sheet uses, minus the page setup. Kept here rather
// than imported wholesale so the preview never carries @page into the app.
const PREVIEW_CSS = (settings) => `
  .lbl {
    width: ${settings.widthMm}mm; height: ${settings.heightMm}mm;
    border: 0.2mm solid #d4d4d4; padding: 1mm;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.4mm; overflow: hidden; text-align: center;
    font-family: Arial, Helvetica, sans-serif; background: #fff; box-sizing: border-box;
  }
  .lbl-company { font-size: 2.6mm; font-weight: 700; letter-spacing: 0.1mm; }
  .lbl-logo { max-height: 5mm; max-width: 80%; object-fit: contain; }
  .lbl-name {
    font-size: 2.4mm; line-height: 1.15; max-width: 100%;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .lbl-sku { font-size: 2.2mm; font-family: "Courier New", monospace; color: #444; }
  .lbl-barcode { line-height: 0; }
  .lbl-barcode svg { display: block; }
  .lbl-code { font-size: 2.4mm; font-family: "Courier New", monospace; letter-spacing: 0.2mm; }
  .lbl-price { font-size: 3.4mm; font-weight: 700; }
  .lbl-custom { font-size: 2.2mm; color: #444; }
`

export default LabelDesigner
