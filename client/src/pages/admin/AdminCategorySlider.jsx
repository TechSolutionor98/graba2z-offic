"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { useToast } from "../../context/ToastContext"
import { getFullImageUrl } from "../../utils/imageUtils"
import config from "../../config/config"
import { Search } from "lucide-react"

const AdminCategorySlider = () => {
  const [allCategories, setAllCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all") // all, parent, 1, 2, 3, 4
  const [statusFilter, setStatusFilter] = useState("all") // all, active, inactive
  const [sliderFilter, setSliderFilter] = useState("all") // all, showing, notShowing
  const [sliderShape, setSliderShape] = useState("circle")
  const [layoutType, setLayoutType] = useState("default")
  const { showToast } = useToast()

  useEffect(() => {
    fetchAllCategories()
    fetchSettings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, levelFilter, statusFilter, sliderFilter, allCategories])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      const response = await fetch(`${config.API_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setSliderShape(data.categorySliderShape || "circle")
      setLayoutType(data.categorySliderLayoutType || "default")
    } catch (err) {
      console.error("Error fetching settings:", err)
    }
  }

  const updateSettings = async (updates) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const response = await fetch(`${config.API_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showToast("Settings updated successfully! Refreshing...", "success")
        // Update local state
        if (updates.categorySliderShape) setSliderShape(updates.categorySliderShape)
        if (updates.categorySliderLayoutType) setLayoutType(updates.categorySliderLayoutType)
        
        // Refresh the page after a short delay to see changes on home page
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        console.error("Settings update failed:", data)
        showToast(data.message || "Failed to update settings", "error")
      }
    } catch (err) {
      console.error("Error updating settings:", err)
      showToast("Error updating settings: " + err.message, "error")
    }
  }

  const fetchAllCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        setLoading(false)
        return
      }

      // Fetch both categories and subcategories
      const [catRes, subRes] = await Promise.all([
        fetch(`${config.API_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
        fetch(`${config.API_URL}/api/subcategories`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
      ])

      if (!catRes.ok || !subRes.ok) {
        showToast("Failed to load categories", "error")
        setLoading(false)
        return
      }

      const categories = await catRes.json()
      const subcategories = await subRes.json()

      // Combine and mark level
      const allItems = [
        ...categories
          .filter((c) => !c.isDeleted)
          .map((c) => ({
            ...c,
            levelType: "parent",
            levelLabel: "Parent Category",
            displayName: c.name,
            type: "category",
          })),
        ...subcategories
          .filter((s) => !s.isDeleted)
          .map((s) => ({
            ...s,
            levelType: s.level || 1,
            levelLabel: `Level ${s.level || 1}`,
            displayName: `${s.name} (${s.categoryName || "Unknown"})`,
            type: "subcategory",
          })),
      ]

      setAllCategories(allItems)
      setFilteredCategories(allItems)
    } catch (err) {
      console.error(err)
      showToast("Error loading categories", "error")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allCategories]

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((item) => String(item.levelType) === String(levelFilter))
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((item) => item.isActive === true)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((item) => item.isActive === false)
    }

    // Apply slider filter
    if (sliderFilter === "showing") {
      filtered = filtered.filter((item) => item.showInSlider === true)
    } else if (sliderFilter === "notShowing") {
      filtered = filtered.filter((item) => item.showInSlider === false)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.displayName?.toLowerCase().includes(term) ||
          item.categoryName?.toLowerCase().includes(term)
      )
    }

    setFilteredCategories(filtered)
  }

  const toggleSlider = async (id, type, current) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const newVal = !current
      // Optimistic UI
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, showInSlider: newVal } : it))
      )

      const endpoint = type === "category" ? `${config.API_URL}/api/categories/${id}` : `${config.API_URL}/api/subcategories/${id}`

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ showInSlider: newVal }),
      })

      if (!res.ok) {
        showToast("Failed to update slider setting", "error")
        // revert
        setAllCategories(
          allCategories.map((it) => (it._id === id && it.type === type ? { ...it, showInSlider: current } : it))
        )
        return
      }

      showToast(`${newVal ? "Added to" : "Removed from"} slider`, "success")
    } catch (err) {
      console.error(err)
      showToast("Error updating slider", "error")
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, showInSlider: current } : it))
      )
    }
  }

  const toggleStatus = async (id, type, current) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        showToast("No authentication token found. Please login.", "error")
        return
      }

      const newVal = !current
      // Optimistic UI
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, isActive: newVal } : it))
      )

      const endpoint = type === "category" ? `${config.API_URL}/api/categories/${id}` : `${config.API_URL}/api/subcategories/${id}`

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newVal }),
      })

      if (!res.ok) {
        showToast("Failed to update status", "error")
        // revert
        setAllCategories(
          allCategories.map((it) => (it._id === id && it.type === type ? { ...it, isActive: current } : it))
        )
        return
      }

      showToast(`${newVal ? "Activated" : "Deactivated"} successfully`, "success")
    } catch (err) {
      console.error(err)
      showToast("Error updating status", "error")
      setAllCategories(
        allCategories.map((it) => (it._id === id && it.type === type ? { ...it, isActive: current } : it))
      )
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Category Slider Manager</h1>
            <p className="text-sm text-gray-600">Select which categories should appear in the Home slider</p>
          </div>

          {/* Slider Design Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Slider Design Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Shape Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Image Shape</label>
                <select
                  value={sliderShape}
                  onChange={(e) => {
                    setSliderShape(e.target.value)
                    updateSettings({ categorySliderShape: e.target.value })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                  <option value="octagon">Octagon</option>
                </select>
              </div>

              {/* Layout Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Card Design Type</label>
                <select
                  value={layoutType}
                  onChange={(e) => {
                    setLayoutType(e.target.value)
                    updateSettings({ categorySliderLayoutType: e.target.value })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="default">Default - Standard layout</option>
                  <option value="compact">Compact - Smaller with tight spacing</option>
                  <option value="modern">Modern - Rounded with shadow effects</option>
                  <option value="minimal">Minimal - Clean with subtle borders</option>
                  <option value="card">Card - Elevated card design</option>
                  <option value="banner">Banner - Gradient background style</option>
                  <option value="circularCard">Circular Card - Entire card in circular shape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
           
            
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({allCategories.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "active"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Active ({allCategories.filter(c => c.isActive).length})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "inactive"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Inactive ({allCategories.filter(c => !c.isActive).length})
              </button>
            </div>
              


               {/* Slider Status Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSliderFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sliderFilter === "all"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({allCategories.length})
              </button>
              <button
                onClick={() => setSliderFilter("showing")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sliderFilter === "showing"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Showing in Slider ({allCategories.filter(c => c.showInSlider).length})
              </button>
              <button
                onClick={() => setSliderFilter("notShowing")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sliderFilter === "notShowing"
                    ? "bg-gray-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Not Showing ({allCategories.filter(c => !c.showInSlider).length})
              </button>
            </div>
            {/* Level Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setLevelFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "all"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setLevelFilter("parent")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "parent"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Parent Category
              </button>
              <button
                onClick={() => setLevelFilter("1")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "1"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 1
              </button>
              <button
                onClick={() => setLevelFilter("2")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "2"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 2
              </button>
              <button
                onClick={() => setLevelFilter("3")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "3"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 3
              </button>
              <button
                onClick={() => setLevelFilter("4")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  levelFilter === "4"
                    ? "bg-lime-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Level 4
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Bulk Actions */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                {/* Slider Selection Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Slider:</span>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ showInSlider: true }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, showInSlider: true } : cat
                        }))
                        
                        showToast("All categories selected successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error selecting all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-lime-500 text-white text-sm rounded-lg hover:bg-lime-600 transition-colors font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ showInSlider: false }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, showInSlider: false } : cat
                        }))
                        
                        showToast("All categories deselected successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error deselecting all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Deselect All
                  </button>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-300"></div>

                {/* Status Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ isActive: true }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, isActive: true } : cat
                        }))
                        
                        showToast("All categories activated successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error activating all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Activate All
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken")
                      if (!token) {
                        showToast("No authentication token found. Please login.", "error")
                        return
                      }
                      
                      try {
                        const updatePromises = filteredCategories.map(item => {
                          const endpoint = item.type === "category" 
                            ? `${config.API_URL}/api/categories/${item._id}` 
                            : `${config.API_URL}/api/subcategories/${item._id}`
                          
                          return fetch(endpoint, {
                            method: "PUT",
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              "Content-Type": "application/json" 
                            },
                            body: JSON.stringify({ isActive: false }),
                          })
                        })
                        
                        await Promise.all(updatePromises)
                        
                        setAllCategories(allCategories.map(cat => {
                          const isFiltered = filteredCategories.some(f => f._id === cat._id && f.type === cat.type)
                          return isFiltered ? { ...cat, isActive: false } : cat
                        }))
                        
                        showToast("All categories deactivated successfully", "success")
                      } catch (err) {
                        console.error(err)
                        showToast("Error deactivating all categories", "error")
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Deactivate All
                  </button>
                </div>

                {/* Stats */}
                <div className="ml-auto text-sm text-gray-600">
                  <span className="font-medium">{filteredCategories.filter(c => c.showInSlider).length}</span> selected | 
                  <span className="font-medium ml-1">{filteredCategories.filter(c => c.isActive).length}</span> active
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checkbox</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((item) => (
                      <tr key={`${item.type}-${item._id}`} className="hover:bg-gray-50 border-b">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={!!item.showInSlider}
                            onChange={() => toggleSlider(item._id, item.type, !!item.showInSlider)}
                            className="w-4 h-4 text-lime-500 border-gray-300 rounded focus:ring-lime-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {item.image ? (
                            <img
                              src={getFullImageUrl(item.image)}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.displayName || item.name}</div>
                          <div className="text-xs text-gray-500">{item.levelLabel}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">
                            {item.showInSlider ? (
                              <span className="text-lime-600">Showing</span>
                            ) : (
                              <span className="text-gray-600">Not Showing</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(item._id, item.type, !!item.isActive)}
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full focus:outline-none transition-colors ${
                              item.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                            title={item.isActive ? "Click to deactivate" : "Click to activate"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredCategories.length} of {allCategories.length} categories
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCategorySlider
