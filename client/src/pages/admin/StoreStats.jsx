"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Barcode, Boxes, PackageX, RefreshCw, Wallet, X } from "lucide-react"

import AdminSidebar from "../../components/admin/AdminSidebar"
import InventoryFilterBar from "../../components/admin/inventory/InventoryFilterBar"
import LabelDesigner from "../../components/admin/inventory/LabelDesigner"
import {
  Pagination,
  ProductCell,
  SummaryTile,
  TriStateCheckbox,
  money,
  stockTone,
  stockValue,
  units,
} from "../../components/admin/inventory/inventoryShared"
import useInventoryQuery from "../../hooks/useInventoryQuery"
import useProductSelection from "../../hooks/useProductSelection"
import { DEFAULT_LABEL_SETTINGS, canLabel } from "../../utils/labelSheet"

/**
 * Store Stats — what do we hold, and what is it worth.
 *
 * The totals above the table are calculated by the server across the whole
 * filtered set, never from the rows on screen: narrow to one brand and the value
 * shown is that brand's.
 *
 * The In / Out / Damage columns come from the stock ledger, which is the only
 * thing in the system that moves a stock figure. For every row,
 * In − Out − Damage should equal Stock. A row that does not add up means
 * something wrote to countInStock behind the ledger's back.
 */

/** A movement column. A dash, not a zero, when nothing has ever moved. */
const MovementCell = ({ value, tone }) => {
  const amount = Number(value) || 0
  if (amount === 0) return <span className="text-gray-300">—</span>
  return (
    <span className={`font-medium tabular-nums ${tone === "bad" ? "text-amber-700" : "text-gray-700"}`}>
      {units(amount)}
    </span>
  )
}

const StoreStats = () => {
  const inventory = useInventoryQuery()
  const selection = useProductSelection()
  const [labelSettings, setLabelSettings] = useState(DEFAULT_LABEL_SETTINGS)
  const [designerOpen, setDesignerOpen] = useState(false)
  // The rows the designer was opened for: either one row's button, or everything
  // currently selected.
  const [designerProducts, setDesignerProducts] = useState([])

  const { products, loading, error, summary, filters, hasFilters } = inventory
  const pageState = selection.pageState(products)

  const designerItems = useMemo(
    () => designerProducts.map((product) => ({ product, quantity: 1 })),
    [designerProducts],
  )

  const openDesignerFor = (list) => {
    setDesignerProducts(list)
    setDesignerOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Stats</h1>
            <p className="mt-1 text-gray-600">Stock held and what it is worth, across every product.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selection.count > 0 && (
              <>
                <button
                  onClick={() => openDesignerFor(selection.selectedList)}
                  className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
                >
                  <Barcode className="h-4 w-4" />
                  <span>Generate Barcode ({selection.count})</span>
                </button>
                <button
                  onClick={selection.clearAll}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                >
                  <X size={15} />
                  Clear {selection.count} selected
                </button>
              </>
            )}
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

        {/* The totals answer the question the page exists for, so they sit above
            the rows rather than under them, and they follow the filters. */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <SummaryTile icon={Boxes} label="Products" value={units(summary?.skus)} hint={`${units(summary?.units)} units in stock`} />
          <SummaryTile icon={Wallet} label="Stock value" value={money(summary?.sellingValue)} hint="At today's selling price" />
          <SummaryTile
            icon={Wallet}
            label="Wholesale value"
            value={money(summary?.wholesaleValue)}
            hint="Products with no wholesale price count as zero"
          />
          <SummaryTile icon={AlertTriangle} label="Low stock" value={units(summary?.lowStock)} hint="At or below its warning level" tone="warn" />
          <SummaryTile icon={PackageX} label="Out of stock" value={units(summary?.outOfStock)} tone="bad" />
        </div>

        <InventoryFilterBar {...inventory} />

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
                        // This page only. A header checkbox that silently dropped
                        // a selection made three pages ago throws away work.
                        onChange={() => selection.togglePage(products, !pageState.all)}
                      />
                    </th>
                    {[
                      ["Product", "left"],
                      ["SKU / Codes", "left"],
                      ["In", "right"],
                      ["Out", "right"],
                      ["Damage", "right"],
                      ["Stock", "right"],
                      ["Price", "right"],
                      ["Offer", "right"],
                      ["Discount", "right"],
                      ["Stock value", "right"],
                      ["", "right"],
                    ].map(([heading, align], index) => (
                      <th
                        key={heading || `col-${index}`}
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
                      <td colSpan={12} className="px-6 py-16 text-center text-gray-500">
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
                      const tone = stockTone(product)
                      const movements = product.movements || { in: 0, out: 0, damage: 0 }
                      const picked = selection.isSelected(product._id)

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

                          <td className="px-4 py-4">
                            <p className="font-mono text-sm text-gray-900">{product.sku || "—"}</p>
                            {(product.barcode || product.gtin) && (
                              <p className="mt-0.5 font-mono text-xs text-gray-500">{product.barcode || product.gtin}</p>
                            )}
                          </td>

                          {/* In − Out − Damage = Stock. All three come from the
                              ledger; Stock is the figure the ledger moved. */}
                          <td className="px-4 py-4 text-right text-sm">
                            <MovementCell value={movements.in} />
                          </td>
                          <td className="px-4 py-4 text-right text-sm">
                            <MovementCell value={movements.out} />
                          </td>
                          <td className="px-4 py-4 text-right text-sm">
                            <MovementCell value={movements.damage} tone="bad" />
                          </td>

                          <td className="px-4 py-4 text-right">
                            <p className="text-sm font-semibold tabular-nums text-gray-900">{units(product.countInStock)}</p>
                            <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${tone.className}`}>
                              {tone.label}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm tabular-nums text-gray-900">{money(product.price)}</td>

                          <td className="px-4 py-4 text-right text-sm tabular-nums">
                            {Number(product.offerPrice) > 0 ? (
                              <span className="font-medium text-lime-700">{money(product.offerPrice)}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm tabular-nums text-gray-700">
                            {Number(product.discount) > 0 ? `${product.discount}%` : "—"}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums text-gray-900">
                            {money(stockValue(product))}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => openDesignerFor([product])}
                              disabled={!canLabel(product)}
                              title={
                                canLabel(product)
                                  ? "Generate a barcode for this product"
                                  : "No barcode, GTIN or SKU — nothing to encode"
                              }
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Barcode size={14} />
                              Generate barcode
                            </button>
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
        items={designerItems}
        settings={labelSettings}
        onSettingsChange={setLabelSettings}
      />
    </div>
  )
}

export default StoreStats
