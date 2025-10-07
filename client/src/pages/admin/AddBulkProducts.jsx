"use client"

import config from "../../config/config"
import { useState } from "react"
import Papa from "papaparse"
import AdminSidebar from "../../components/admin/AdminSidebar" // Add this import

const AddBulkProducts = () => {
  const [previewProducts, setPreviewProducts] = useState([])
  const [invalidRows, setInvalidRows] = useState([])
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saveResult, setSaveResult] = useState(null)

  // Helper to get admin token
  const getAdminToken = () => localStorage.getItem("adminToken")

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    setFileName(file?.name || "")
    setError("")
    setPreviewProducts([])
    setInvalidRows([])
    setSaveResult(null)

    if (!file) return

    // Check if file is CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    setLoading(true)

    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          console.log("CSV parsed:", results)

          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors)
            setError("Error parsing CSV file: " + results.errors[0].message)
            setLoading(false)
            return
          }

          // Send parsed data to backend for preview
          try {
            const token = getAdminToken()
            const res = await fetch(`${config.API_URL}/api/products/bulk-preview-csv`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ csvData: results.data }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Preview failed")

            console.log("Preview response:", data)
            setPreviewProducts(data.previewProducts || [])
            setInvalidRows(data.invalidRows || [])
          } catch (err) {
            console.error("Preview error:", err)
            setError(err.message)
          } finally {
            setLoading(false)
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error)
          setError("Error reading CSV file: " + error.message)
          setLoading(false)
        },
      })
    } catch (err) {
      console.error("File upload error:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleExport = () => {
    const sampleData = [
      {
        name: "Sample Product",
        slug: "sample-product",
        sku: "SP001",
        parent_category: "Electronics",
        category: "Smartphones",
        brand: "Sample Brand",
        buyingPrice: 80,
        price: 100,
        offerPrice: 90,
        tax: "VAT 5%",
        stockStatus: "Available Product",
        showStockOut: "true",
        canPurchase: "true",
        refundable: "true",
        maxPurchaseQty: 10,
        lowStockWarning: 5,
        unit: "piece",
        weight: 0.5,
        tags: "electronics,smartphone,mobile",
        description: "Sample product description with detailed features",
        discount: 10,
        specifications: "Display: 6.1 inch, RAM: 8GB, Storage: 128GB",
        details: "Additional product details",
        shortDescription: "Brief product description",
        barcode: "1234567890123",
      },
    ]

    // Convert to CSV
    const csv = Papa.unparse(sampleData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "products_sample.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBulkSave = async () => {
    setLoading(true)
    setSaveResult(null)
    try {
      const token = getAdminToken()
      const res = await fetch(`${config.API_URL}/api/products/bulk-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ products: previewProducts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Bulk save failed")

      console.log("Save response:", data)
      setSaveResult(data)
    } catch (err) {
      console.error("Save error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Add Bulk Products</h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">CSV Format Guidelines:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use CSV format with column headers: name, parent_category, category, brand, price, etc.</li>
            <li>
              • <strong>parent_category</strong>: Main category (shown in navbar, e.g., "Electronics")
            </li>
            <li>
              • <strong>category</strong>: Subcategory (shown in dropdown, e.g., "Smartphones")
            </li>
            <li>• Categories and Brands will be created automatically if they don't exist</li>
            <li>• Required fields: name, parent_category, price</li>
            <li>• Stock Status options: "Available Product", "Out of Stock", "PreOrder"</li>
            <li>• Boolean fields (showStockOut, canPurchase, refundable): use "true" or "false"</li>
          </ul>
        </div>

        <div className="flex gap-4 mb-6">
          <label className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded cursor-pointer">
            Import CSV File
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={handleExport} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
            Download Sample CSV
          </button>
          {fileName && <span className="text-gray-600 ml-2 flex items-center">📄 {fileName}</span>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-700">Processing...</p>
          </div>
        )}

        {(previewProducts.length > 0 || invalidRows.length > 0) && (
          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Import Summary:</h3>
              <div className="flex gap-6 mb-2">
                <span>Total Rows: {previewProducts.length + invalidRows.length}</span>
                <span className="text-green-600">✓ Valid: {previewProducts.length}</span>
                <span className="text-red-600">✗ Invalid: {invalidRows.length}</span>
              </div>

              {invalidRows.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-red-600 mb-2">Invalid Rows:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {invalidRows.slice(0, 5).map((row, i) => (
                      <div key={i} className="text-sm text-red-600">
                        Row {row.row}: {row.reason}
                      </div>
                    ))}
                    {invalidRows.length > 5 && (
                      <div className="text-sm text-red-600">...and {invalidRows.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}

              {previewProducts.length > 0 && (
                <button
                  onClick={handleBulkSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-3"
                  disabled={loading}
                >
                  {loading ? "Saving..." : `Save ${previewProducts.length} Products`}
                </button>
              )}
            </div>
          </div>
        )}

        {saveResult && (
          <div className="mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Save Results:</h3>
              <div className="flex gap-6 mb-2">
                <span>Total: {saveResult.total}</span>
                <span className="text-green-600">✓ Success: {saveResult.success}</span>
                <span className="text-red-600">✗ Failed: {saveResult.failed}</span>
              </div>

              {saveResult.failed > 0 && saveResult.results && (
                <div className="mt-3">
                  <h4 className="font-medium text-red-600 mb-2">Failed Products:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {saveResult.results
                      .filter((r) => r.status === "error")
                      .slice(0, 5)
                      .map((r, i) => (
                        <div key={i} className="text-sm text-red-600">
                          {r.product?.name || `Product ${i + 1}`}: {r.message}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {previewProducts.length > 0 && (
          <div className="overflow-x-auto bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-3">Preview Products ({previewProducts.length})</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Parent Category</th>
                  <th className="px-2 py-1 text-left">Sub Category</th>
                  <th className="px-2 py-1 text-left">Brand</th>
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-left">Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {previewProducts.slice(0, 20).map((product, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-2 py-1">{product.name || "N/A"}</td>
                    <td className="px-2 py-1">{product.parentCategory?.name || product.parentCategory || "N/A"}</td>
                    <td className="px-2 py-1">{product.category?.name || product.category || "N/A"}</td>
                    <td className="px-2 py-1">{product.brand?.name || product.brand || "N/A"}</td>
                    <td className="px-2 py-1">{product.price || 0}</td>
                    <td className="px-2 py-1">{product.stockStatus || "Available Product"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewProducts.length > 20 && (
              <div className="text-xs text-gray-500 mt-2">Showing first 20 of {previewProducts.length} products...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddBulkProducts
