"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { ShoppingBag, Users, DollarSign, TrendingUp, ArrowUpRight, PackagePlus, ClipboardList, UserPlus } from "lucide-react"
import { adminAPI } from "../../services/api"

const AdminDashboard = () => {
  const { admin } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString()}`
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await adminAPI.getDashboardStats()
        setStats(statsData)
        const ordersData = await adminAPI.getRecentOrders()
        setRecentOrders(ordersData)
        setLoading(false)
      } catch (error) {
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AdminSidebar />
      
        <div className="ml-64 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1f6f78]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <AdminSidebar />
        
        <div className="ml-64 p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />
    

      <div
        className="ml-64 p-8 relative overflow-hidden"
        style={{ fontFamily: '"Sora", "Noto Sans Arabic", sans-serif' }}
      >
        <div className="absolute inset-0 pointer-events-none bg-white" />

        <div className="relative">
          <div
            className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm"
            style={{ fontFamily: '"Sora", "Noto Sans Arabic", sans-serif', animation: "fadeDown 550ms ease both" }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6b645a]">Admin Overview</p>
                <h1 className="text-2xl md:text-3xl font-semibold text-[#1f2a27]">
                  Welcome back{admin?.name ? `, ${admin.name}` : ""}
                </h1>
                <p className="text-sm text-[#5c5b57]">
                  {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/admin/orders/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f6f78] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:translate-y-[-1px] hover:bg-[#185a61]"
                >
                  <ClipboardList className="h-4 w-4" />
                  Review Orders
                </Link>
                <Link
                  to="/admin/products/add"
                  className="inline-flex items-center gap-2 rounded-full border border-[#1f6f78] bg-white px-4 py-2 text-sm font-medium text-[#1f6f78] shadow-sm transition hover:translate-y-[-1px]"
                >
                  <PackagePlus className="h-4 w-4" />
                  Add Product
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 my-8">
            {[
              {
                label: "Total Orders",
                value: stats.totalOrders,
                icon: ShoppingBag,
                accent: "from-[#1f6f78] to-[#2aa3a1]",
              },
              {
                label: "Total Revenue",
                value: formatPrice(stats.totalRevenue),
                icon: DollarSign,
                accent: "from-[#0f766e] to-[#14b8a6]",
              },
              {
                label: "Total Products",
                value: stats.totalProducts,
                icon: TrendingUp,
                accent: "from-[#f59e0b] to-[#f97316]",
              },
              {
                label: "Total Users",
                value: stats.totalUsers,
                icon: Users,
                accent: "from-[#111827] to-[#374151]",
              },
            ].map((card, index) => (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-2xl border border-[#e4ddd3] bg-white p-6 shadow-sm transition hover:-translate-y-1"
                style={{ animation: `fadeUp 450ms ease ${index * 70}ms both` }}
              >
                <div className={`absolute right-4 top-4 h-12 w-12 rounded-xl bg-gradient-to-br ${card.accent} opacity-20`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6b645a]">{card.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1f2a27]">{card.value}</p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${card.accent} p-2 text-white shadow-sm`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-[#5c5b57]">
                  <ArrowUpRight className="h-4 w-4 text-[#1f6f78]" />
                  Live snapshot
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e5e7eb]">
              <div className="px-6 py-4 border-b border-[#e5e7eb] bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-[#1f2a27]">Recent Orders</h2>
                  <Link to="/admin/orders/new" className="text-sm font-medium text-[#1f6f78] hover:text-[#185a61]">
                    View all
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e5e7eb]">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b645a]">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b645a]">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b645a]">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b645a]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b645a]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#e5e7eb]">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td className="px-6 py-8 text-sm text-[#6b645a]" colSpan={5}>
                          No recent orders yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1f6f78]">
                              <Link to="/admin/orders/new" state={{ orderId: order._id }}>
                                #{order._id.slice(-6)}
                              </Link>
                            </div>
                            <div className="text-xs text-[#6b645a]">{order.deliveryType || "standard"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.deliveryType === "pickup" ? (
                              <>
                                <div className="text-sm text-[#1f2a27]">{order.pickupDetails?.location || "N/A"}</div>
                                <div className="text-xs text-[#6b645a]">{order.pickupDetails?.phone || "N/A"}</div>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-[#1f2a27]">{order.shippingAddress?.name || "N/A"}</div>
                                <div className="text-xs text-[#6b645a]">{order.shippingAddress?.email || "N/A"}</div>
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#1f2a27]">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full 
                              ${
                                order.status === "Processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "Shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "Delivered"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1f2a27]">
                            {formatPrice(order.totalPrice)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1f2a27]">Quick Actions</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-[#6b645a]">Essentials</span>
              </div>
              <div className="mt-6 grid gap-4">
                <Link
                  to="/admin/orders/new"
                  className="group flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#1f2a27] transition hover:-translate-y-0.5 hover:border-[#1f6f78]"
                >
                  <span className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-[#1f6f78]" />
                    Review Orders
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#1f6f78]" />
                </Link>
                <Link
                  to="/admin/products"
                  className="group flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#1f2a27] transition hover:-translate-y-0.5 hover:border-[#f59e0b]"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-[#f59e0b]" />
                    Manage Products
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#f59e0b]" />
                </Link>
                <Link
                  to="/admin/products/add"
                  className="group flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#1f2a27] transition hover:-translate-y-0.5 hover:border-[#0f766e]"
                >
                  <span className="flex items-center gap-3">
                    <PackagePlus className="h-5 w-5 text-[#0f766e]" />
                    Add New Product
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#0f766e]" />
                </Link>
                <Link
                  to="/admin/users"
                  className="group flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#1f2a27] transition hover:-translate-y-0.5 hover:border-[#111827]"
                >
                  <span className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-[#111827]" />
                    View Users
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#111827]" />
                </Link>
              </div>
              <div className="mt-8 rounded-2xl border border-dashed border-[#e5e7eb] bg-white p-4 text-xs text-[#6b645a]">
                Keep this view focused on essentials. For deeper reporting, open the Reports tab in the superadmin panel.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard
