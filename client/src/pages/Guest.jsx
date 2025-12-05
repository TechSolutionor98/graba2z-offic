import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '../styles/phoneInput.css'
import config from "../config/config"

const UAE_STATES = [
  "Abu Dhabi",
  "Ajman",
  "Al Ain",
  "Dubai",
  "Fujairah",
  "Ras Al Khaimah",
  "Sharjah",
  "Umm al-Qaywain",
]

const Guest = () => {
  const navigate = useNavigate()
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    zipCode: "",
    state: "",
    city: "",
    country: "UAE",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Email verification states
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationVerified, setVerificationVerified] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [originalEmail, setOriginalEmail] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setGuestInfo({ ...guestInfo, [name]: value })
    
    // Reset verification if email changes
    if (name === "email" && value !== originalEmail) {
      setVerificationSent(false)
      setVerificationVerified(false)
      setVerificationCode("")
    }
  }

  const handlePhoneChange = (value) => {
    setGuestInfo({ ...guestInfo, phone: value || "" })
  }

  const handleSendVerificationCode = async () => {
    if (!guestInfo.email || !/^\S+@\S+\.\S+$/.test(guestInfo.email)) {
      setError("Please enter a valid email address first.")
      return
    }
    
    setVerificationLoading(true)
    setError("")
    try {
      await axios.post(`${config.API_URL}/api/request-callback/send-verification`, {
        email: guestInfo.email
      })
      setVerificationSent(true)
      setOriginalEmail(guestInfo.email)
      setError("")
    } catch (error) {
      console.error("Error sending verification code:", error)
      setError("Failed to send verification code. Please try again.")
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code.")
      return
    }
    
    setVerificationLoading(true)
    setError("")
    try {
      await axios.post(`${config.API_URL}/api/request-callback/verify-code`, {
        email: guestInfo.email,
        code: verificationCode
      })
      setVerificationVerified(true)
      setError("")
    } catch (error) {
      console.error("Error verifying code:", error)
      setError(error.response?.data?.message || "Invalid verification code. Please try again.")
    } finally {
      setVerificationLoading(false)
    }
  }

  const validate = () => {
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address || !guestInfo.zipCode || !guestInfo.state || !guestInfo.city) {
      setError("Please fill in all required fields.")
      return false
    }
    if (!/^\S+@\S+\.\S+$/.test(guestInfo.email)) {
      setError("Please enter a valid email address.")
      return false
    }
    if (!verificationVerified) {
      setError("Please verify your email address before continuing.")
      return false
    }
    if (!guestInfo.phone || guestInfo.phone.length < 8) {
      setError("Please enter a valid phone number.")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setLoading(true)
    // Save guest info and shipping address to localStorage
    localStorage.setItem("guestInfo", JSON.stringify({
      name: guestInfo.name,
      email: guestInfo.email,
      phone: guestInfo.phone,
    }))
    localStorage.setItem("savedShippingAddress", JSON.stringify({
      name: guestInfo.name,
      address: guestInfo.address,
      zipCode: guestInfo.zipCode,
      state: guestInfo.state,
      city: guestInfo.city,
      country: guestInfo.country,
      email: guestInfo.email,
      phone: guestInfo.phone,
    }))
    setLoading(false)
    navigate("/checkout?step=3")
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Left: Guest Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Continue as Guest</h2>
            </div>
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 animate-fade-in">
                {error}
              </div>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    id="guest-name"
                    name="name"
                    type="text"
                    required
                    value={guestInfo.name}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="Enter your name"
                  />
                </div>
                
                {/* Email with verification */}
                <div>
                  <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <div className="flex gap-2">
                    <input
                      id="guest-email"
                      name="email"
                      type="email"
                      required
                      value={guestInfo.email}
                      onChange={handleChange}
                      disabled={verificationVerified}
                      className={`block flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 ${verificationVerified ? 'bg-green-50 border-green-300' : ''}`}
                      placeholder="Enter your email"
                    />
                    {!verificationVerified && (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={verificationLoading || !guestInfo.email}
                        className="px-3 py-2 bg-lime-500 text-white text-sm font-medium rounded-lg hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {verificationLoading ? "Sending..." : verificationSent ? "Resend" : "Verify"}
                      </button>
                    )}
                  </div>
                  
                  {/* Verification code input */}
                  {verificationSent && !verificationVerified && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 mb-2">A verification code has been sent to your email.</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="block flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={verificationLoading || verificationCode.length !== 6}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verificationLoading ? "..." : "Confirm"}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Verified badge */}
                  {verificationVerified && (
                    <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Email verified
                    </div>
                  )}
                </div>
                
                {/* Phone Number with International Input */}
                <div>
                  <label htmlFor="guest-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <PhoneInput
                    international
                    defaultCountry="AE"
                    value={guestInfo.phone}
                    onChange={handlePhoneChange}
                    className="w-full"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="guest-address" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    id="guest-address"
                    name="address"
                    type="text"
                    required
                    value={guestInfo.address}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="Enter your address"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="guest-state" className="block text-sm font-medium text-gray-700 mb-1">State/Region *</label>
                    <select
                      id="guest-state"
                      name="state"
                      required
                      value={guestInfo.state}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                      <option value="">Select State</option>
                      {UAE_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="guest-city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      id="guest-city"
                      name="city"
                      type="text"
                      required
                      value={guestInfo.city}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      placeholder="City"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="guest-zip" className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                    <input
                      id="guest-zip"
                      name="zipCode"
                      type="text"
                      required
                      value={guestInfo.zipCode}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      placeholder="Zip Code"
                    />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="guest-country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      id="guest-country"
                      name="country"
                      value={guestInfo.country}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      disabled
                    >
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 mt-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-lime-500 hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !verificationVerified}
              >
                {loading ? "Continuing..." : "Continue to Payment"}
              </button>
              {!verificationVerified && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Please verify your email before continuing
                </p>
              )}
            </form>
          </div>
        </div>
        {/* Right: Image */}
        <div className="hidden lg:flex items-center justify-center md:block md:w-1/2 bg-white relative">
          <img
            src="/guest.jpg"
            alt="Guest Visual"
            className="w-full h-[300px] cover object-center"
          />
        </div>
      </div>
    </div>
  )
}

export default Guest 