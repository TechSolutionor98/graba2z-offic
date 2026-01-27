"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../context/ToastContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Hash,
  MessageSquare,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import axios from "axios"
import config from "../../config/config"

const BlogDashboard = () => {
  const { showToast } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        showToast("Please login as admin first", "error")
        return
      }

      const { data } = await axios.get(`${config.API_URL}/api/blog-dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setStats(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      showToast(error.response?.data?.message || "Failed to fetch dashboard stats", "error")
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link
      to={link || "#"}
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${!link && "pointer-events-none"}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Dashboard</h1>
            <p className="text-gray-600">Overview of your blog system</p>
          </div>

          {/* Overview Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Blogs" value={stats?.overview?.totalBlogs || 0} icon={BookOpen} color="bg-blue-500" link="/admin/blogs" />
              <StatCard title="Published" value={stats?.overview?.publishedBlogs || 0} icon={CheckCircle} color="bg-green-500" />
              <StatCard title="Drafts" value={stats?.overview?.draftBlogs || 0} icon={Clock} color="bg-yellow-500" />
              <StatCard title="Archived" value={stats?.overview?.archivedBlogs || 0} icon={XCircle} color="bg-gray-500" />
            </div>
          </div>

          {/* Comments Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Comments"
                value={stats?.overview?.totalComments || 0}
                icon={MessageSquare}
                color="bg-blue-500"
                link="/admin/blog-comments"
              />
              <StatCard
                title="Pending"
                value={stats?.overview?.pendingComments || 0}
                icon={AlertCircle}
                color="bg-yellow-500"
                link="/admin/blog-comments?status=pending"
              />
              <StatCard title="Approved" value={stats?.overview?.approvedComments || 0} icon={CheckCircle} color="bg-green-500" />
              <StatCard title="Rejected" value={stats?.overview?.rejectedComments || 0} icon={XCircle} color="bg-red-500" />
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Total Views" value={stats?.overview?.totalViews?.toLocaleString() || 0} icon={Eye} color="bg-cyan-500" />
              <StatCard title="Total Likes" value={stats?.overview?.totalLikes?.toLocaleString() || 0} icon={Heart} color="bg-rose-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Blogs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Recent Blogs</h2>
              </div>
              {stats?.recentBlogs?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentBlogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Link to={`/admin/blogs/${blog._id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium">
                              {blog.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{blog.blogCategory?.name || blog.mainCategory?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                blog.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : blog.status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {blog.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent blogs</p>
              )}
            </div>

            {/* Popular Blogs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Popular Blogs</h2>
              </div>
              {stats?.popularBlogs?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.popularBlogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Link to={`/admin/blogs/${blog._id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium">
                              {blog.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{blog.blogCategory?.name || blog.mainCategory?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {blog.views}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {blog.likes}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No popular blogs yet</p>
              )}
            </div>
          </div>

          {/* Recent Comments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Comments</h2>
              <Link to="/admin/blog-comments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentComments?.length > 0 ? (
                stats.recentComments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{comment.name}</span>
                        <span className="text-gray-500 text-sm ml-2">on</span>
                        <Link to={`/admin/blogs/${comment.blog?._id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm ml-1">
                          {comment.blog?.title}
                        </Link>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          comment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : comment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {comment.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">{comment.comment}</p>
                    <p className="text-gray-400 text-xs mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default BlogDashboard
