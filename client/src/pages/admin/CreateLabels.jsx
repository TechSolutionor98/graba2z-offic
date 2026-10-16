"use client"

import { useCallback, useMemo, useState } from "react"
import { Boxes, CheckSquare, Printer, RefreshCw, Sliders, Tag, X } from "lucide-react"

import AdminSidebar from "../../components/admin/AdminSidebar"
import InventoryFilterBar from "../../components/admin/inventory/InventoryFilterBar"
import LabelDesigner from "../../components/admin/inventory/LabelDesigner"
import {
  Pagination,
  ProductCell,
  SummaryTile,
  TriStateCheckbox,
  money,
  stockValue,
  units,
} from "../../components/admin/inventory/inventoryShared"
import useInventoryQuery from "../../hooks/useInventoryQuery"
import useProductSelection from "../../hooks/useProductSelection"
import { DEFAULT_LABEL_SETTINGS, canLabel, codeFor, printLabelSheet, summariseSheet } from "../../utils/labelSheet"

/**
 * Create Labels — for someone standing at the printer with a stack of blank
 * label paper.
 *
 * Same table as Store Stats, because the two are read the same way. What differs
 * is the job: here every row carries a quantity, because a box of forty needs
 * forty labels and nobody is going to press a button forty times.
 */

const DEFAULT_QUANTITY = 1

/** The stepper that lives in the row, not inside the print dialog. */
const QuantityStepper = ({ value, onChange, disabled }) => (
  <div className={`inline-flex items-center rounded-md border border-gray-300 ${disabled ? "opacity-40" : ""}`}>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(Math.max(0, value - 1))}
      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed"
      aria-label="One fewer label"
    >
      −
    </button>
    <input
      type="number"
      min={0}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
      className="w-14 border-x border-gray-300 py-1 text-center text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-lime-500 disabled:cursor-not-allowed disabled:bg-gray-50"
      aria-label="Number of labels"
    />
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(value + 1)}
      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed"
      aria-label="One more label"
    >
      +
    </button>
  </div>
)

const CreateLabels = () => {
  const inventory = useInventoryQuery()
  const selection = useProductSelection()
  const [labelSettings, setLabelSettings] = useState(DEFAULT_LABEL_SETTINGS)
  const [designerOpen, setDesignerOpen] = useState(false)

  // Quantities are kept apart from the selection on purpose. Typing a number
  // must not tick or untick anything, and a count the user set must survive the
  // row being unticked and ticked again — otherwise a careful count of forty is
  // lost to a misclick.
  const [quantities, setQuantities] = useState({})

  const { products, loading, error, hasFilters } = inventory
  const pageState = selection.pageState(products)

  const quantityFor = useCallback(
    (product) => {
      const stored = quantities[product._id]
      return stored === undefined ? DEFAULT_QUANTITY : stored
    },
    [quantities],
  )

  const setQuantity = (productId, value) => setQuantities((prev) => ({ ...prev, [productId]: value }))

  // The sheet is built from what is selected, at the quantity each row carries.
  const sheetItems = useMemo(
    () => selection.selectedList.map((product) => ({ product, quantity: quantityFor(product) })),
    [selection.selectedList, quantityFor],
  )

  const sheet = useMemo(() => summariseSheet(sheetItems), [sheetItems])

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Labels</h1>
            <p className="mt-1 text-gray-600">Pick products, set how many of each, and print the sheet.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDesignerOpen(true)}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Sliders className="h-4 w-4" />
              <span>Design label</span>
            </button>

            {selection.count > 0 && (
              <button
                onClick={selection.clearAll}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
              >
                <X size={15} />
                Clear {selection.count}
              </button>
            )}

            {/* The real sheet total, not a product count: "Generate 47 labels"
                is the number of stickers that come out of the printer. */}
            <button
              onClick={() => printLabelSheet(sheetItems, labelSettings)}
              disabled={sheet.labels === 0}
              className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Printer className="h-4 w-4" />
              <span>Generate {sheet.labels} label{sheet.labels === 1 ? "" : "s"}</span>
            </button>

            <button
              onClick={inventory.refresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-lime-500 px-4 py-2 text-white transition-colors hover:bg-lime-600 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryTile
            icon={Boxes}
            label="Products"
            value={units(inventory.summary?.skus)}
            hint="Matching these filters"
          />
          <SummaryTile icon={CheckSquare} label="Selected" value={units(selection.count)} hint="Across every page" />
          <SummaryTile
            icon={Tag}
            label="Labels to print"
            value={units(sheet.labels)}
            hint={
              sheet.skipped.length > 0
                ? `${sheet.skipped.length} selected product${sheet.skipped.length === 1 ? "" : "s"} left out — no code to encode`
                : "What the sheet will carry"
            }
            tone={sheet.skipped.length > 0 ? "warn" : "default"}
          />
        </div>

        <InventoryFilterBar {...inventory} />

        {sheet.skipped.length > 0 && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>
              {sheet.skipped.length} selected product{sheet.skipped.length === 1 ? "" : "s"}
            </strong>{" "}
            {sheet.skipped.length === 1 ? "has" : "have"} no barcode, GTIN or SKU, so there is nothing to encode.{" "}
            {sheet.skipped.length === 1 ? "It is" : "They are"} left off the sheet:{" "}
            {sheet.skipped
              .slice(0, 4)
              .map((product) => product.name)
              .join(", ")}
            {sheet.skipped.length > 4 && ` and ${sheet.skipped.length - 4} more`}.
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-md bg-red-50 p-4 text-red-600">
            <span>{error}</span>
            <button onClick={inventory.refresh} className="text-sm font-medium underline">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-lime-500" />
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <TriStateCheckbox
                        ariaLabel="Select every product on this page"
                        checked={pageState.all}
                        indeterminate={pageState.some}
                        disabled={products.length === 0}
                        onChange={() => selection.togglePage(products, !pageState.all)}
                      />
                    </th>
                    {[
                      ["Product", "left"],
                      ["Product code", "left"],
                      ["Price", "right"],
                      ["Stock value", "right"],
                      ["Labels", "right"],
                    ].map(([heading, align]) => (
                      <th
                        key={heading}
                        className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${
                          align === "left" ? "text-left" : "text-right"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                        No products match these filters.
                        {hasFilters && (
                          <button onClick={inventory.clearFilters} className="ml-2 font-medium text-lime-600 hover:underline">
                            Clear them
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const picked = selection.isSelected(product._id)
                      const labelable = canLabel(product)
                      const code = codeFor(product)

                      return (
                        <tr key={product._id} className={picked ? "bg-lime-50" : "hover:bg-gray-50"}>
                          <td className="px-4 py-4">
                            <TriStateCheckbox
                              ariaLabel={`Select ${product.name}`}
                              checked={picked}
                              onChange={() => selection.toggle(product)}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <ProductCell product={product} />
                          </td>

                          {/* Said here, in the code column, rather than when the
                              print fails: it is discovered before the paper is
                              loaded instead of after. */}
                          <td className="px-4 py-4">
                            {labelable ? (
                              <>
                                <p className="font-mono text-sm text-gray-900">{code}</p>
                                <p className="mt-0.5 text-xs text-gray-400">
                                  {product.barcode ? "Barcode" : product.gtin ? "GTIN" : "SKU"}
                                </p>
                              </>
                            ) : (
                              <span className="inline-block rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                No code — cannot label
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm tabular-nums text-gray-900">
                            {money(Number(product.offerPrice) > 0 ? product.offerPrice : product.price)}
                          </td>

                          <td className="px-4 py-4 text-right text-sm tabular-nums text-gray-700">
                            {money(stockValue(product))}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <QuantityStepper
                              value={quantityFor(product)}
                              disabled={!picked || !labelable}
                              onChange={(value) => setQuantity(product._id, value)}
                            />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination page={inventory.page} pages={inventory.pages} totalCount={inventory.totalCount} onChange={inventory.setPage} />
          </div>
        )}
      </div>

      <LabelDesigner
        open={designerOpen}
        onClose={() => setDesignerOpen(false)}
        items={sheetItems}
        settings={labelSettings}
        onSettingsChange={setLabelSettings}
      />
    </div>
  )
}

export default CreateLabels
