"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react"
import axios from "axios"

import config from "../../config/config"
const AdminSubCategories = () => {
  const [subCategories, setSubCategories] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { showToast } = useToast()

  useEffect(() => {
    fetchSubCategories()
    fetchCategories()
  }, [])

  const fetchSubCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/subcategories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubCategories(response.data)
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      showToast("Error fetching subcategories", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (subCategoryId) => {
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        showToast("No authentication token found. Please login again.", "error")
        return
      }

      const subCategory = subCategories.find(sc => sc._id === subCategoryId)
      if (!subCategory) return

      const newStatus = !subCategory.isActive

      const response = await axios.put(`${config.API_URL}/api/subcategories/${subCategoryId}`, 
        { isActive: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.status === 200) {
        // Update the subcategory in the local state
        setSubCategories(subCategories.map(sc => 
          sc._id === subCategoryId ? { ...sc, isActive: newStatus } : sc
        ))
        showToast(`Subcategory ${newStatus ? 'activated' : 'deactivated'} successfully`, "success")
      } else {
        showToast("Failed to update subcategory status", "error")
      }
    } catch (error) {
      console.error("Failed to toggle subcategory status:", error)
      showToast("Failed to update subcategory status", "error")
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.get(`${config.API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`${config.API_URL}/api/subcategories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        showToast("SubCategory moved to trash successfully", "success")
        fetchSubCategories()
      } catch (error) {
        console.error("Error deleting subcategory:", error)
        showToast("Error deleting subcategory", "error")
      }
    }
  }

  const filteredSubCategories = subCategories.filter((subCategory) => {
    const matchesSearch = subCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || subCategory.category._id === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subcategories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sub Categories</h1>
              <p className="text-gray-600 mt-2">Manage your product sub categories</p>
            </div>
            <Link
              to="/admin/add-subcategory"
              className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus size={20} />
              <span>Add New Sub Category</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sort Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubCategories.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm || categoryFilter !== "all"
                          ? "No subcategories found matching your criteria"
                          : "No subcategories found"}
                      </td>
                    </tr>
                  ) : (
                    filteredSubCategories.map((subCategory) => (
                      <tr key={subCategory._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {subCategory.image && (
                              <img
                                src={subCategory.image || "/placeholder.svg"}
                                alt={subCategory.name}
                                className="h-10 w-10 rounded-full object-cover mr-4"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{subCategory.name}</div>
                              <div className="text-sm text-gray-500">/{subCategory.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{subCategory.category?.name || "Unknown"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {subCategory.description || "No description"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subCategory.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subCategory.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subCategory.sortOrder || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleStatus(subCategory._id)}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                subCategory.isActive 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title={subCategory.isActive ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {subCategory.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <Link
                              to={`/admin/subcategories/edit/${subCategory._id}`}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(subCategory._id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{subCategories.length}</div>
              <div className="text-sm text-gray-600">Total Sub Categories</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {subCategories.filter((sub) => sub.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Sub Categories</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Parent Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSubCategories
