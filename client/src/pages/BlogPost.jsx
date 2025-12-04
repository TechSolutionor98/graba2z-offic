"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getFullImageUrl } from "../utils/imageUtils"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import axios from "axios"
import { Calendar, User, Eye, Star, ArrowLeft, Share2 } from "lucide-react"

import config from "../config/config"

const API_BASE_URL = `${config.API_URL}`

const BlogPost = () => {
  const { slug } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [blog, setBlog] = useState(null)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [userRating, setUserRating] = useState(null)
  const [blogRatings, setBlogRatings] = useState([])
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchBlog()
    }
  }, [slug])

  useEffect(() => {
    if (blog) {
      fetchRelatedBlogs()
      fetchBlogRatings()
      // Remove incrementViews() call since views are incremented server-side
    }
  }, [blog])

  // You can remove the incrementViews function entirely
  const fetchBlog = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API_BASE_URL}/api/blogs/slug/${slug}`)
      setBlog(data)
    } catch (error) {
      console.error("Error fetching blog:", error)
      showToast("Blog not found", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedBlogs = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/blogs`)
      const related = data
        .filter((b) => b._id !== blog._id && b.isPublished)
        .filter((b) => b.category?._id === blog.category?._id || b.topic?._id === blog.topic?._id)
        .slice(0, 3)
      setRelatedBlogs(related)
    } catch (error) {
      console.error("Error fetching related blogs:", error)
    }
  }

  const fetchBlogRatings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/blog-ratings/blog/${blog._id}`)
      // Fix: Use data.ratings instead of data
      setBlogRatings(data.ratings || [])
  
      // Check if current user has rated this blog
      if (user) {
        const userRatingData = data.ratings?.find((r) => r.user._id === user._id)
        if (userRatingData) {
          setUserRating(userRatingData)
          setRating(userRatingData.rating)
          setComment(userRatingData.comment || "")
        }
      }
    } catch (error) {
      console.error("Error fetching blog ratings:", error)
      // Set to empty array on error
      setBlogRatings([])
    }
  }

  const incrementViews = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/blogs/${blog._id}/view`)
    } catch (error) {
      console.error("Error incrementing views:", error)
    }
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      showToast("Please login to rate this blog", "error")
      return
    }

    if (rating === 0) {
      showToast("Please select a rating", "error")
      return
    }

    try {
      const ratingData = {
        blog: blog._id,
        rating,
        comment: comment.trim(),
      }

      if (userRating) {
        // Update existing rating
        await axios.put(`${API_BASE_URL}/api/blog-ratings/${userRating._id}`, ratingData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        showToast("Rating updated successfully", "success")
      } else {
        // Create new rating
        await axios.post(`${API_BASE_URL}/api/blog-ratings`, ratingData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        showToast("Rating submitted successfully", "success")
      }

      fetchBlogRatings()
    } catch (error) {
      console.error("Error submitting rating:", error)
      showToast("Error submitting rating", "error")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.metaDescription || truncateContent(blog.content, 100),
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      showToast("Link copied to clipboard", "success")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateContent = (content, maxLength = 150) => {
    const textContent = content.replace(/<[^>]*>/g, "")
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + "..." : textContent
  }

  const calculateAverageRating = () => {
    // Add safety check to ensure blogRatings is an array
    if (!Array.isArray(blogRatings) || blogRatings.length === 0) return 0
    const sum = blogRatings.reduce((acc, rating) => acc + rating.rating, 0)
    return (sum / blogRatings.length).toFixed(1)
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={interactive ? 24 : 16}
        className={`${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={interactive && onStarClick ? () => onStarClick(index + 1) : undefined}
      />
    ))
  }

  const bounceStyle = {
    animation: 'bounce 1s infinite',
  }

  const bounceKeyframes = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }
  `
  if (typeof document !== 'undefined' && !document.getElementById('bounce-keyframes')) {
    const style = document.createElement('style')
    style.id = 'bounce-keyframes'
    style.innerHTML = bounceKeyframes
    document.head.appendChild(style)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <img src="/g.png" alt="Loading..." style={{ width: 80, height: 80, ...bounceStyle }} />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
          <Link to="/blogs" className="text-orange-600 hover:text-orange-700">
            ← Back to blogs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/blogs" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium">
            <ArrowLeft size={20} className="mr-2" />
            Back to Blogs
          </Link>
        </div>

        {/* Blog Header */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Featured Image */}
          {blog.image && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={getFullImageUrl(blog.image) || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.category && (
                <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                  {blog.category.name}
                </span>
              )}
              {blog.topic && (
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{blog.topic.name}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span>{blog.author?.name || "Admin"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Eye size={16} className="mr-2" />
                  <span>{blog.views || 0} views</span>
                </div>
                <div className="flex items-center">
                  <div className="flex mr-2">{renderStars(Math.round(calculateAverageRating()))}</div>
                  <span>({blogRatings.length} reviews)</span>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center text-gray-500 hover:text-orange-600 transition-colors"
              >
                <Share2 size={16} className="mr-1" />
                Share
              </button>
            </div>

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: blog.description }} />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Rating Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mt-8">
          <h3 className="text-2xl font-bold mb-6">Rate This Blog</h3>

          {user ? (
            <form onSubmit={handleRatingSubmit} className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex space-x-1">{renderStars(rating, true, setRating)}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Share your thoughts about this blog..."
                />
              </div>

              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                {userRating ? "Update Rating" : "Submit Rating"}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-100 rounded-md">
              <p className="text-gray-600">
                <Link to="/login" className="text-orange-600 hover:text-orange-700">
                  Login
                </Link>{" "}
                to rate and review this blog.
              </p>
            </div>
          )}

          {/* Existing Ratings */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Reviews ({blogRatings.length})</h4>

            {blogRatings.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {blogRatings.map((rating) => (
                  <div key={rating._id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{rating.user.name}</span>
                        <div className="flex">{renderStars(rating.rating)}</div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(rating.createdAt)}</span>
                    </div>
                    {rating.comment && <p className="text-gray-700">{rating.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Related Blogs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <article key={relatedBlog._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {relatedBlog.image && (
                    <img
                      src={getFullImageUrl(relatedBlog.image) || "/placeholder.svg"}
                      alt={relatedBlog.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2 line-clamp-2">
                      <Link to={`/blog/${relatedBlog.slug}`} className="hover:text-orange-600 transition-colors">
                        {relatedBlog.title}
                      </Link>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{truncateContent(relatedBlog.content)}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(relatedBlog.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPost
