import { useState } from "react"
import { useNavigate } from "react-router-dom"

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setGuestInfo({ ...guestInfo, [name]: value })
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 9)
    setGuestInfo({ ...guestInfo, phone: val })
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
    if (guestInfo.phone.length !== 9) {
      setError("Please enter a valid 9-digit phone number.")
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
                <div>
                  <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    id="guest-email"
                    name="email"
                    type="email"
                    required
                    value={guestInfo.email}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="guest-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm select-none">+971</span>
                    <input
                      id="guest-phone"
                      name="phone"
                      type="tel"
                      required
                      pattern="[0-9]{9}"
                      maxLength={9}
                      minLength={9}
                      value={guestInfo.phone}
                      onChange={handlePhoneChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      placeholder="5XXXXXXXX"
                      autoComplete="tel"
                    />
                  </div>
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
                disabled={loading}
              >
                {loading ? "Continuing..." : "Continue to Payment"}
              </button>
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