"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Calendar, User, Eye, Tag, Search, Filter } from "lucide-react"
import { getFullImageUrl } from "../utils/imageUtils"

import config from "../config/config"

const API_BASE_URL = `${config.API_URL}`

// Add this to the top-level of the file or in a global CSS file if you want it app-wide
const bounceKeyframes = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`
if (typeof document !== 'undefined' && !document.getElementById('bounce-keyframes')) {
  const style = document.createElement('style')
  style.id = 'bounce-keyframes'
  style.innerHTML = bounceKeyframes
  document.head.appendChild(style)
}

const BlogList = () => {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [blogsPerPage] = useState(6)

  useEffect(() => {
    fetchBlogs()
    fetchCategories()
    fetchTopics()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API_BASE_URL}/api/blogs`)
      setBlogs(data.filter((blog) => blog.status === "published"))
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/blog-categories`)
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchTopics = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/blog-topics`)
      setTopics(data)
    } catch (error) {
      console.error("Error fetching topics:", error)
    }
  }

  // Filter blogs based on search and filters
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || blog.category?._id === selectedCategory
    const matchesTopic = !selectedTopic || blog.topic?._id === selectedTopic

    return matchesSearch && matchesCategory && matchesTopic
  })

  // Pagination
  const indexOfLastBlog = currentPage * blogsPerPage
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog)
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return "";
    const textContent = content.replace(/<[^>]*>/g, "");
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + "..." : textContent;
  }

  // Add this style for bounce animation
  const bounceStyle = {
    animation: 'bounce 1s infinite',
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <img src="/g.png" alt="Loading..." style={{ width: 80, height: 80, ...bounceStyle }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-lime-300 to-lime-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl md:text-2xl opacity-90">Discover insights, tips, and stories from our community</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option value="">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("")
                setSelectedTopic("")
                setCurrentPage(1)
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {currentBlogs.length} of {filteredBlogs.length} blog posts
          </p>
        </div>

        {/* Blog Grid */}
        {currentBlogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No blogs found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentBlogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Blog Image */}
                <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={getFullImageUrl(blog.mainImage || blog.image) || "/placeholder.svg"}
                    alt={blog.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {/* Category/Tag */}
                  {blog.mainCategory && (
                    <span className="inline-block bg-lime-100 text-lime-700 text-xs px-3 py-1 rounded-full mb-2">
                      {blog.mainCategory.name}
                    </span>
                  )}
                  {/* Title */}
                  <h2 className="text-lg font-bold mb-2 line-clamp-2">{blog.title}</h2>
                  {/* Description/Snippet */}
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {truncateContent(blog.description || blog.content)}
                  </p>
                  {/* Meta Info */}
                  <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
                    <span className="flex items-center gap-1">
                      <User size={14} /> {blog.postedBy || "Admin"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {formatDate(blog.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {blog.views || 0}
                    </span>
                  </div>
                  {/* Read More */}
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="text-lime-600 hover:text-lime-500 hover:underline font-semibold mt-auto"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === index + 1
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogList
