"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { Search, Mail, Calendar, User, Shield, Download } from "lucide-react"
import { downloadCsv } from "../../utils/csvExport"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [page, searchTerm])

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getUsers({ page, limit: 20, search: searchTerm.trim() })
      setUsers(data.users || [])
      setPages(data.pages || 1)
      setTotal(data.total || 0)
      setLoading(false)
    } catch (error) {
      setError("Failed to load users. Please try again later.")
      setLoading(false)
    }
  }

  const handleDownloadCsv = async () => {
    try {
      const allUsers = await adminAPI.getUsers()
      downloadCsv({
        rows: allUsers,
        columns: [
          { header: "User ID", accessor: (row) => row._id || "" },
          { header: "Name", accessor: (row) => row.name || "N/A" },
          { header: "Email", accessor: (row) => row.email || "N/A" },
          { header: "Role", accessor: (row) => (row.isAdmin ? "Admin" : "Customer") },
          {
            header: "Joined Date",
            accessor: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"),
          },
          { header: "Status", accessor: () => "Active" },
        ],
        filename: "users-management.csv",
      })
    } catch (err) {
      console.error("CSV download error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <button
            onClick={handleDownloadCsv}
            disabled={users.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={16} />
            Download CSV
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-96 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {user.isAdmin ? "Admin" : "Customer"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  className="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {(() => {
                  const buttons = [];
                  // Always show page 1
                  buttons.push(
                    <button
                      key={1}
                      className={`px-3 py-1 border rounded text-sm ${page === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setPage(1)}
                    >
                      1
                    </button>
                  );

                  let start = Math.max(2, page - 1);
                  let end = Math.min(pages - 1, page + 1);

                  if (page <= 2) {
                    start = 2;
                    end = Math.min(pages - 1, 3);
                  } else if (page >= pages - 1) {
                    start = Math.max(2, pages - 2);
                    end = pages - 1;
                  }

                  if (start > 2) {
                    buttons.push(<span key="start-ellipsis" className="px-1 text-gray-400">...</span>);
                  }

                  for (let i = start; i <= end; i++) {
                    buttons.push(
                      <button
                        key={i}
                        className={`px-3 py-1 border rounded text-sm ${page === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < pages - 1) {
                    buttons.push(<span key="end-ellipsis" className="px-1 text-gray-400">...</span>);
                  }

                  if (pages > 1) {
                    buttons.push(
                      <button
                        key={pages}
                        className={`px-3 py-1 border rounded text-sm ${page === pages ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setPage(pages)}
                      >
                        {pages}
                      </button>
                    );
                  }

                  return buttons;
                })()}
                <button
                  className="px-3 py-1 border rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
