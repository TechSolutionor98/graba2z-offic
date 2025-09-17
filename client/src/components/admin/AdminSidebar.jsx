"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Tag,
  ImageIcon,
  Percent,
  ChevronDown,
  ChevronRight,
  Palette,
  Shield,
  Calculator,
  Ruler,
  Box,
  Layers,
  BookOpen,
  Truck,
  Phone,
  Star,
  TrendingUp,
} from "lucide-react"

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminLogout } = useAuth()
  const [openDropdowns, setOpenDropdowns] = useState({
    productSystem: false,
    products: false,
    categories: false,
    brands: false,
    volumes: false,
    warranty: false,
    colors: false,
    units: false,
    tax: false,
    sizes: false,
    orders: false,
    blogs: false,
    subcategories: false,
    coupons: false,
    reviews: false, // Add reviews dropdown
    stockAdjustment: false, // Added stockAdjustment dropdown state
  })

  // Auto-open dropdowns based on current route
  useEffect(() => {
    const path = location.pathname
    const newOpenDropdowns = { ...openDropdowns }

    // Product System dropdown - open if any product-related route is active
    if (
      path.includes("/admin/products") ||
      path.includes("/admin/add-product") ||
      path.includes("/admin/categories") ||
      path.includes("/admin/add-category") ||
      path.includes("/admin/trash-categories") ||
      path.includes("/admin/brands") ||
      path.includes("/admin/add-brand") ||
      path.includes("/admin/volumes") ||
      path.includes("/admin/add-volume") ||
      path.includes("/admin/warranty") ||
      path.includes("/admin/add-warranty") ||
      path.includes("/admin/colors") ||
      path.includes("/admin/add-color") ||
      path.includes("/admin/units") ||
      path.includes("/admin/add-unit") ||
      path.includes("/admin/tax") ||
      path.includes("/admin/add-tax") ||
      path.includes("/admin/sizes") ||
      path.includes("/admin/add-size") ||
      path.includes("/admin/subcategories") ||
      path.includes("/admin/add-subcategory")
    ) {
      newOpenDropdowns.productSystem = true
    }

    // Orders dropdown - open if any order-related route is active
    if (
      path.includes("/admin/orders") ||
      path.includes("/admin/online-orders") ||
      path.includes("/admin/received-orders") ||
      path.includes("/admin/inprogress-orders") ||
      path.includes("/admin/ready-shipment") ||
      path.includes("/admin/on-the-way") ||
      path.includes("/admin/delivered") ||
      path.includes("/admin/on-hold") ||
      path.includes("/admin/rejected")
    ) {
      newOpenDropdowns.orders = true
    }

    // Blogs dropdown - open if any blog-related route is active
    if (
      path.includes("/admin/blogs") ||
      path.includes("/admin/add-blog") ||
      path.includes("/admin/blog-topics") ||
      path.includes("/admin/add-blog-topic") ||
      path.includes("/admin/blog-categories") ||
      path.includes("/admin/add-blog-category") ||
      path.includes("/admin/blog-rating")
    ) {
      newOpenDropdowns.blogs = true
    }

    // Coupons dropdown - open if any coupon-related route is active
    if (path.includes("/admin/coupons")) {
      newOpenDropdowns.coupons = true
    }

    // Reviews dropdown - open if any review-related route is active
    if (path.includes("/admin/reviews")) {
      newOpenDropdowns.reviews = true
    }

    if (path.includes("/admin/stock-adjustment")) {
      newOpenDropdowns.stockAdjustment = true
    }

    // Individual dropdowns
    if (path.includes("/admin/products") || path.includes("/admin/add-product")) {
      newOpenDropdowns.products = true
    }
    if (
      path.includes("/admin/categories") ||
      path.includes("/admin/add-category") ||
      path.includes("/admin/trash-categories")
    ) {
      newOpenDropdowns.categories = true
    }
    if (path.includes("/admin/brands") || path.includes("/admin/add-brand")) {
      newOpenDropdowns.brands = true
    }
    if (path.includes("/admin/volumes") || path.includes("/admin/add-volume")) {
      newOpenDropdowns.volumes = true
    }
    if (path.includes("/admin/warranty") || path.includes("/admin/add-warranty")) {
      newOpenDropdowns.warranty = true
    }
    if (path.includes("/admin/colors") || path.includes("/admin/add-color")) {
      newOpenDropdowns.colors = true
    }
    if (path.includes("/admin/units") || path.includes("/admin/add-unit")) {
      newOpenDropdowns.units = true
    }
    if (path.includes("/admin/tax") || path.includes("/admin/add-tax")) {
      newOpenDropdowns.tax = true
    }
    if (path.includes("/admin/sizes") || path.includes("/admin/add-size")) {
      newOpenDropdowns.sizes = true
    }
    if (path.includes("/admin/subcategories") || path.includes("/admin/add-subcategory")) {
      newOpenDropdowns.subcategories = true
    }

    setOpenDropdowns(newOpenDropdowns)
  }, [location.pathname])

  const handleLogout = () => {
    adminLogout()
    navigate("/grabiansadmin/login")
  }

  const toggleDropdown = (dropdown, e) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "Product System",
      icon: Layers,
      dropdown: "productSystem",
      items: [
        {
          title: "Products",
          icon: Package,
          dropdown: "products",
          section: "products",
          items: [
            { title: "List Products", path: "/admin/products" },
            { title: "Add Product", path: "/admin/products/add" },
            { title: "Add Bulk Products", path: "/admin/products/bulk-add" },
          ],
        },
        {
          title: "Categories",
          icon: Tag,
          dropdown: "categories",
          section: "categories",
          items: [
            { title: "List Categories", path: "/admin/categories" },
            { title: "Add Category", path: "/admin/categories/add" },
            { title: "Trash Categories", path: "/admin/categories/trash" },
          ],
        },
        {
          title: "Sub Categories",
          icon: Tag,
          dropdown: "subcategories",
          section: "subcategories",
          items: [
            { title: "List Sub Categories", path: "/admin/subcategories" },
            { title: "Add Sub Category", path: "/admin/subcategories/add" },
          ],
        },
        {
          title: "Brands",
          icon: Tag,
          dropdown: "brands",
          section: "brands",
          items: [
            { title: "List Brands", path: "/admin/brands" },
            { title: "Add Brand", path: "/admin/brands/add" },
          ],
        },
        {
          title: "Volumes",
          icon: Box,
          dropdown: "volumes",
          section: "volumes",
          items: [
            { title: "List Volumes", path: "/admin/volumes" },
            { title: "Add Volume", path: "/admin/volumes/add" },
          ],
        },
        {
          title: "Warranty",
          icon: Shield,
          dropdown: "warranty",
          section: "warranty",
          items: [
            { title: "List Warranty", path: "/admin/warranty" },
            { title: "Add Warranty", path: "/admin/warranty/add" },
          ],
        },
        {
          title: "Colors",
          icon: Palette,
          dropdown: "colors",
          section: "colors",
          items: [
            { title: "List Colors", path: "/admin/colors" },
            { title: "Add Color", path: "/admin/colors/add" },
          ],
        },
        {
          title: "Units",
          icon: Ruler,
          dropdown: "units",
          section: "units",
          items: [
            { title: "List Units", path: "/admin/units" },
            { title: "Add Unit", path: "/admin/units/add" },
          ],
        },
        {
          title: "Tax",
          icon: Calculator,
          dropdown: "tax",
          section: "tax",
          items: [
            { title: "List Tax", path: "/admin/tax" },
            { title: "Add Tax", path: "/admin/tax/add" },
          ],
        },
        {
          title: "Sizes",
          icon: Ruler,
          dropdown: "sizes",
          section: "sizes",
          items: [
            { title: "List Sizes", path: "/admin/sizes" },
            { title: "Add Size", path: "/admin/sizes/add" },
          ],
        },
      ],
    },
    {
      title: "Stock Adjustment",
      icon: TrendingUp,
      dropdown: "stockAdjustment",
      items: [
        { title: "Price Adjustment", path: "/admin/stock-adjustment/price-adjustment" },
        { title: "Reports", path: "/admin/stock-adjustment/reports" },
      ],
    },
    {
      title: "Delivery Charges",
      icon: Truck,
      dropdown: "deliveryCharges",
      items: [
        { title: "List Delivery Charges", path: "/admin/delivery-charges" },
        { title: "Add Delivery Charge", path: "/admin/delivery-charges/add" },
      ],
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      dropdown: "orders",
      items: [
        { title: "Online Orders", path: "/admin/orders/online" },
        { title: "Received Orders", path: "/admin/orders/received" },
        { title: "Inprogress Orders", path: "/admin/orders/in-progress" },
        { title: "Ready for Shipment", path: "/admin/orders/ready-for-shipment" },
        { title: "On the Way", path: "/admin/orders/on-the-way" },
        { title: "Delivered", path: "/admin/orders/delivered" },
        { title: "On Hold", path: "/admin/orders/on-hold" },
        { title: "Rejected", path: "/admin/orders/rejected" },
      ],
    },
    {
      title: "Reviews",
      icon: Star,
      dropdown: "reviews",
      items: [
        { title: "All Reviews", path: "/admin/reviews" },
        { title: "Pending Reviews", path: "/admin/reviews/pending" },
        { title: "Approved Reviews", path: "/admin/reviews/approved" },
        { title: "Rejected Reviews", path: "/admin/reviews/rejected" },
      ],
    },
    {
      title: "Request Callbacks",
      icon: Phone,
      path: "/admin/request-callbacks",
    },
    {
      title: "Blogs",
      icon: BookOpen,
      dropdown: "blogs",
      items: [
        { title: "Blogs", path: "/admin/blogs" },
        { title: "Add Blog", path: "/admin/blogs/add" },
        { title: "Blog Categories", path: "/admin/blogs/categories" },
        { title: "Add Blog Category", path: "/admin/blogs/categories/add" },
        { title: "Blog Topics", path: "/admin/blogs/topics" },
        { title: "Add Blog Topic", path: "/admin/blogs/topics/add" },
        { title: "Blog Rating", path: "/admin/blogs/rating" },
      ],
    },
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Banners",
      icon: ImageIcon,
      path: "/admin/banners",
    },
    {
      title: "Coupons",
      icon: Percent,
      dropdown: "coupons",
      items: [{ title: "All Coupons", path: "/admin/coupons/all" }],
    },
    {
      title: "Email Templates",
      icon: Settings,
      path: "/admin/email-templates",
    },
    {
      title: "Newsletter Subscribers",
      icon: Users,
      path: "/admin/newsletter-subscribers",
    },
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   path: "/admin/settings",
    // },
  ]

  const renderMenuItem = (item, level = 0) => {
    const paddingLeft = level === 0 ? "px-6" : level === 1 ? "px-8" : "px-12"
    const textSize = level === 0 ? "font-medium" : level === 1 ? "text-sm font-medium" : "text-sm"

    // Special case: Dropdown with only one item (e.g., Coupons)
    if (item.dropdown && item.items && item.items.length === 1) {
      const subItem = item.items[0]
      return (
        <Link
          key={item.title}
          to={subItem.path}
          className={`block ${paddingLeft} py-3 ${textSize} transition-colors duration-200 flex items-center space-x-3 ${
            isActive(subItem.path)
              ? "bg-lime-100 text-lime-800 border-r-2 border-lime-400"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {item.icon && <item.icon size={20} />}
          <span>{item.title}</span>
        </Link>
      )
    }

    if (item.dropdown) {
      return (
        <div key={item.title}>
          <button
            onClick={(e) => toggleDropdown(item.dropdown, e)}
            className={`w-full flex items-center justify-between ${paddingLeft} py-3 transition-colors duration-200 text-gray-700 hover:bg-gray-100`}
          >
            <div className="flex items-center space-x-3">
              {item.icon && <item.icon size={20} />}
              <span className={textSize}>{item.title}</span>
            </div>
            {openDropdowns[item.dropdown] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openDropdowns[item.dropdown] && (
            <div className={level === 0 ? "bg-gray-50" : "bg-gray-100"}>
              {item.items.map((subItem) => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
      )
    } else {
      return (
        <Link
          key={item.title}
          to={item.path}
          className={`block ${paddingLeft} py-2 ${textSize} transition-colors duration-200 ${
            isActive(item.path)
              ? "bg-lime-100 text-lime-800 border-r-4 border-lime-400"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {item.title}
        </Link>
      )
    }
  }

  return (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto fixed left-0 top-0 z-50">
      <div className="p-6 border-b">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <img src="/admin-logo.svg" alt="Admin" className="" />
        </Link>
      </div>

      <nav className="mt-6 pb-6">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.dropdown ? (
              renderMenuItem(item)
            ) : (
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-lime-100 text-lime-800 border-r-4 border-lime-400"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default AdminSidebar
