"use client"

import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Plus, Minus, Linkedin } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPinterest } from "@fortawesome/free-brands-svg-icons"
import { useState, useEffect } from "react"
import axios from "axios"


import config from "../config/config"
import NewsletterModal from "./NewsletterModal";

const API_BASE_URL = `${config.API_URL}`

const Footer = ({ className = "" }) => {
  // State for mobile accordion sections
  const [openSections, setOpenSections] = useState({
    categories: false,
    legal: false,
    support: false,
    connect: false,
  })
  const [categories, setCategories] = useState([])
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/categories`)
        // Filter to only show parent categories
        const validCategories = data.filter((cat) => {
          const isValid =
            cat &&
            typeof cat === "object" &&
            cat.name &&
            typeof cat.name === "string" &&
            cat.name.trim() !== "" &&
            cat.isActive !== false &&
            !cat.isDeleted &&
            !cat.name.match(/^[0-9a-fA-F]{24}$/) && // Not an ID
            !cat.parentCategory // Only include categories without a parent
          return isValid
        })
        // Sort categories alphabetically
        validCategories.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(validCategories)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleNewsletterInput = (e) => setNewsletterEmail(e.target.value);
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) setShowNewsletterModal(true);
  };

  return (
    <>
      {/* Desktop Footer - Hidden on mobile */}
      <footer className={`hidden md:block bg-[#1F1F39] text-white pt-8 pb-9 ${className}`}>
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Column 1 - Newsletter Subscription */}
            <div className="md:col-span-4">
              {/* Logo and Heading */}
              <h3 className="text-2xl font-bold mb-4">
                <img src="/logo.png" alt="Logo" className="w-32" />
              </h3>
              {/* Text */}
              <p className="text-white mb-4">Subscribe to our newsletter</p>

              {/* Form */}
              <form className="mb-4 p-1 bg-white rounded-full  w-[280px]" onSubmit={handleNewsletterSubmit}>
                <div className="flex w-[270px]">
                  {/* Search Input Div */}
                  <div className="flex-grow">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full pl-4 py-3 bg-white placeholder-gray-400 rounded-full border-white  text-black"
                      value={newsletterEmail}
                      onChange={handleNewsletterInput}
                      required
                    />
                  </div>

                  {/* Button Div */}
                  <div>
                    <button type="submit" className="h-full bg-lime-500 text-white rounded-full px-5">
                      Subscribe
                    </button>
                  </div>
                </div>
              </form>
              {showNewsletterModal && (
                <NewsletterModal
                  email={newsletterEmail}
                  onClose={() => setShowNewsletterModal(false)}
                />
              )}

              {/* Social Icons */}
              <div className="flex space-x-6 pl-4">
                <a href="https://www.facebook.com/grabatozae/" className="text-white hover:text-lime-400">
                  <Facebook size={20} />
                </a>
                <a href="https://x.com/GrabAtoz" className="text-white hover:text-lime-400">
                  <Twitter size={20} />
                </a>
                <a href="https://www.instagram.com/grabatoz/" className="text-white hover:text-lime-400">
                  <Instagram size={20} />
                </a>
                <a href="https://www.linkedin.com/company/grabatozae" className="text-white hover:text-lime-400">
                  <Linkedin size={20} />
                </a>
                <a href="https://www.pinterest.com/grabatoz/" className="text-white hover:text-lime-400">
                  <FontAwesomeIcon icon={faPinterest} style={{width: '20px', height: '20px'}} />
                </a>
              </div>
            </div>

            {/* Column 2 - Top Categories */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold mb-4">Top Categories</h3>
              <ul className="space-y-2 text-white text-sm">
                {categories.slice(0, 6).map((category) => (
                  <li key={category._id}>
                    <Link to={`/shop?parentCategory=${category._id}`} className="hover:text-lime-400">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 - More Categories */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold mb-4">More Categories</h3>
              <ul className="space-y-2 text-white text-sm">
                {categories.slice(6, 12).map((category) => (
                  <li key={category._id}>
                    <Link to={`/shop?parentCategory=${category._id}`} className="hover:text-lime-400">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 - Support */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white text-sm">
                <li>
                  <Link to="/refund-return" className="hover:text-lime-400">
                    Refund and Return
                  </Link>
                </li>
                <li>
                  <Link to="/cookies-policy" className="hover:text-lime-400">
                    Cookies Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-conditions" className="hover:text-lime-400">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-lime-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/track-order" className="hover:text-lime-400">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-lime-400">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-lime-400 font-semibold">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5 - Legal */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-white text-sm">
                <li>
                  <Link to="/about" className="hover:text-lime-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-lime-400">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="hover:text-lime-400">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-lime-400">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-lime-400">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-lime-400">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Desktop Bottom Footer */}
      <section className="hidden md:block">
        <div className="flex flex-row justify-between items-center space-x-4 p-2">
          {/* 1st Column: Text */}
          <div className="w-1/3">
            <b>© 2025 Grabatoz Powered By Crown Excel</b>
          </div>

          {/* 2nd Column: Image */}
          <div className="w-1/3">
            <img src="/1.svg" alt="Payment Methods" className="rounded-lg w-full h-auto" />
          </div>

          {/* 3rd Column: App Store Images */}
          <div className="w-1/3 justify-end flex items-center">
            <div className="flex space-x-2">
              <img src="/google_play.png" alt="Google Play" className="rounded-lg h-9" />
              <img src="/app_store.png" alt="App Store" className="rounded-lg h-9" />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Footer - Only visible on mobile */}
      <footer className="md:hidden bg-white">
        {/* Categories Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("categories")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-lg font-semibold text-gray-900">Categories</span>
            {openSections.categories ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.categories && (
            <div className="px-4 pb-4">
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link to={`/shop?parentCategory=${category._id}`} className="text-gray-700 hover:text-orange-500">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Legal Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("legal")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-lg font-semibold text-gray-900">Legal</span>
            {openSections.legal ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.legal && (
            <div className="px-4 pb-4">
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-700 hover:text-orange-500">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-700 hover:text-orange-500">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="text-gray-700 hover:text-orange-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-gray-700 hover:text-orange-500">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-700 hover:text-orange-500">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-700 hover:text-orange-500">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("support")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-lg font-semibold text-gray-900">Support</span>
            {openSections.support ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.support && (
            <div className="px-4 pb-4">
              <ul className="space-y-3">
                <li>
                  <Link to="/refund-return" className="text-gray-700 hover:text-orange-500">
                    Refund and Return
                  </Link>
                </li>
                <li>
                  <Link to="/cookies-policy" className="text-gray-700 hover:text-orange-500">
                    Cookies Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-conditions" className="text-gray-700 hover:text-orange-500">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-gray-700 hover:text-orange-500">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/track-order" className="text-gray-700 hover:text-orange-500">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-gray-700 hover:text-orange-500">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-gray-700 hover:text-orange-500 font-semibold">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Connect Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("connect")}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="text-lg font-semibold text-gray-900">Connect</span>
            {openSections.connect ? <Minus size={20} /> : <Plus size={20} />}
          </button>
          {openSections.connect && (
            <div className="px-4 pb-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800"
                  >
                    <Twitter size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shop On The Go Section - Always Visible */}
        <div className="bg-[#1F1F39] text-white p-6">
          <h3 className="text-xl font-bold text-center mb-4">Shop On The Go</h3>
          <div className="flex justify-center space-x-4 mb-6 ">
            <img src="/google_play.png" alt="Google Play" className="h-8" />
            <img src="/app_store.png" alt="App Store" className="h-8" />
          </div>

          {/* Payment Methods */}
          <div className="flex justify-center mb-4">
            <img src="/1.svg" alt="Payment Methods" className="h-8 w-auto" />
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-gray-300">
            <p>© 2025 Grabatoz powered by Crown Excel.</p>
            <p className="mt-1">Develop By Tech Solutionor</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer