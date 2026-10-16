"use client"

import { useCallback, useMemo, useState } from "react"

/**
 * Which products are picked, for the barcode and label sheets.
 *
 * Two decisions worth stating:
 *
 * 1. The whole product is kept, not just its id. The sheet needs the name, the
 *    price and the code, and by the time it is printed the page or the filters
 *    have usually moved on and those rows are gone. Keeping ids would mean
 *    re-fetching products the browser already had.
 *
 * 2. Select-all covers the current page only, and clearing it clears the current
 *    page only. A header checkbox that silently dropped a selection made three
 *    pages earlier would throw away work nobody asked it to throw away. The
 *    toolbar's "Clear N selected" is the deliberate way to drop the lot.
 */
export default function useProductSelection() {
  const [selected, setSelected] = useState({})

  const selectedList = useMemo(() => Object.values(selected), [selected])
  const count = selectedList.length

  const isSelected = useCallback((id) => Boolean(selected[id]), [selected])

  const toggle = useCallback((product) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[product._id]) delete next[product._id]
      else next[product._id] = product
      return next
    })
  }, [])

  /** Add every row on this page, or remove every row on this page. */
  const togglePage = useCallback((pageProducts, shouldSelect) => {
    setSelected((prev) => {
      const next = { ...prev }
      pageProducts.forEach((product) => {
        if (shouldSelect) next[product._id] = product
        else delete next[product._id]
      })
      return next
    })
  }, [])

  const clearAll = useCallback(() => setSelected({}), [])

  /** How much of the current page is picked, for the header checkbox. */
  const pageState = useCallback(
    (pageProducts) => {
      if (pageProducts.length === 0) return { all: false, some: false }
      const picked = pageProducts.filter((product) => selected[product._id]).length
      return { all: picked === pageProducts.length, some: picked > 0 && picked < pageProducts.length }
    },
    [selected],
  )

  return { selected, selectedList, count, isSelected, toggle, togglePage, clearAll, pageState }
}
