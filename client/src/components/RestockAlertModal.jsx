import { useState, useEffect } from "react"
import { Bell, X, User, Mail, CheckCircle } from "lucide-react"
import PhoneInput, { isValidPhoneNumber, isPossiblePhoneNumber } from "react-phone-number-input/max"
import metadata from "libphonenumber-js/max/metadata"
import { Metadata } from "libphonenumber-js/core"
import "react-phone-number-input/style.css"
import "../styles/phoneInput.css"

import { useAuth } from "../context/AuthContext"
import { useCurrency } from "../context/CurrencyContext"
import { useToast } from "../context/ToastContext"
import { useLanguage } from "../context/LanguageContext"
import { backInStockAPI } from "../services/api"
import TranslatedText from "./TranslatedText"

const WHATSAPP_COMPANY_NUMBER = "923257847744"

const phoneMetadata = new Metadata(metadata)

const sanitizePhoneNumber = (val, countryCode) => {
  if (!val) return val
  try {
    phoneMetadata.selectNumberingPlan(countryCode || "AE")
    const callingCode = String(phoneMetadata.numberingPlan?.callingCode() || "971")
    const prefix = `+${callingCode}`

    const mobileLengths = phoneMetadata.numberingPlan?.type("MOBILE")?.possibleLengths()
    const maxLen = mobileLengths && mobileLengths.length > 0
      ? mobileLengths[mobileLengths.length - 1]
      : 15

    if (val.startsWith(prefix)) {
      let nationalDigits = val.slice(prefix.length).replace(/\D/g, "")
      // Strip accidental leading 0 (e.g. 0348 -> 348)
      if (nationalDigits.startsWith("0")) {
        nationalDigits = nationalDigits.replace(/^0+/, "")
      }
      if (nationalDigits.length > maxLen) {
        nationalDigits = nationalDigits.slice(0, maxLen)
      }
      return `${prefix}${nationalDigits}`
    }
  } catch (e) {
    console.error("sanitizePhoneNumber error:", e)
  }
  return val
}

const RestockAlertModal = ({
  isOpen,
  onClose,
  product,
  selectedColor = null,
  selectedDos = null,
  selectedOption = "",
  onSubscribed,
}) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { formatPrice, currentCountry } = useCurrency()
  const { isArabic } = useLanguage()

  const [selectedCountry, setSelectedCountry] = useState(currentCountry?.code || "AE")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Pre-fill user data if logged in
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false)
      const initialCountry = currentCountry?.code || "AE"
      setSelectedCountry(initialCountry)
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
      })
    }
  }, [isOpen, user, currentCountry])

  if (!isOpen || !product) return null

  // Variant description (e.g., Color: Space Gray, DOS: Windows 11)
  const variantParts = []
  if (selectedColor?.color) variantParts.push(`Color: ${selectedColor.color}`)
  if (selectedDos?.dosType) variantParts.push(`OS: ${selectedDos.dosType}`)
  if (selectedOption) variantParts.push(selectedOption)
  const variantText = variantParts.join(" | ")

  // Product price & image
  const displayPrice = selectedColor?.offerPrice > 0
    ? selectedColor.offerPrice
    : selectedColor?.price > 0
    ? selectedColor.price
    : product?.offerPrice > 0
    ? product.offerPrice
    : product?.price || 0

  const displayImage = selectedColor?.image || product?.image || "/placeholder.png"

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showToast(isArabic ? "يرجى إدخال اسمك" : "Please enter your name", "error")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      showToast(isArabic ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address", "error")
      return
    }
    if (!formData.phone || (!isValidPhoneNumber(formData.phone) && !isPossiblePhoneNumber(formData.phone))) {
      showToast(
        isArabic
          ? "يرجى إدخال رقم هاتف واتساب صحيح"
          : "Please enter a valid WhatsApp mobile number for the selected country",
        "error",
      )
      return
    }

    setLoading(true)

    try {
      const payload = {
        productId: product._id,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        country: selectedCountry || currentCountry?.code || "AE",
        countryCode: selectedCountry || currentCountry?.code || "AE",
        variant: variantText,
        selectedColor: selectedColor?.color || "",
        selectedDos: selectedDos?.dosType || "",
        selectedOption: selectedOption || "",
      }

      await backInStockAPI.subscribe(payload)

      setSubmitted(true)
      showToast(
        isArabic
          ? "تم تسجيل طلبك بنجاح! سنقوم بإعلامك فور توفر المنتج."
          : "Alert registered successfully! We'll notify you when it's back in stock.",
        "success",
      )

      if (onSubscribed) {
        onSubscribed(payload)
      }

      // Instant WhatsApp chat redirection with bilingual pre-filled message (Direct Web on desktop, App on mobile)
      const productUrl = `${window.location.origin}/product/${encodeURIComponent(product.slug || product._id)}`
      const waMessage = [
        "*RESTOCK ALERT REQUEST*",
        "*طلب إشعار توفر المنتج*",
        "",
        `*Product:* ${product.name}`,
        variantText ? `*Option:* ${variantText}` : null,
        `*Customer:* ${formData.name.trim()}`,
        `*Product Link:* ${productUrl}`,
        "",
        "Please notify me when this product is back in stock. I’m interested in purchasing it.",
        "يرجى إعلامي عندما يتوفر هذا المنتج مرة أخرى. أنا مهتم بشرائه.",
      ]
        .filter(Boolean)
        .join("\n")

      const isMobileDevice =
        typeof navigator !== "undefined" &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const waUrl = isMobileDevice
        ? `https://api.whatsapp.com/send?phone=${WHATSAPP_COMPANY_NUMBER}&text=${encodeURIComponent(waMessage)}`
        : `https://web.whatsapp.com/send?phone=${WHATSAPP_COMPANY_NUMBER}&text=${encodeURIComponent(waMessage)}`
      window.open(waUrl, "_blank", "noopener,noreferrer")

      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (error) {
      console.error("Restock alert subscription failed:", error)
      showToast(error.message || "Failed to register alert. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center text-lime-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                <TranslatedText>Notify Me When Available</TranslatedText>
              </h3>
              <p className="text-xs text-gray-300">
                <TranslatedText>Get notified instantly via Email & WhatsApp</TranslatedText>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="px-6 pt-5 pb-4 bg-slate-50 border-b border-gray-200">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <img
              src={displayImage}
              alt={product.name}
              className="w-16 h-16 object-contain rounded-lg bg-white p-1 border border-gray-200 shrink-0"
              onError={(e) => {
                e.target.src = "/placeholder.png"
              }}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm font-bold text-lime-600">
                  {formatPrice(displayPrice)}
                </span>
                {variantText && (
                  <span className="text-[11px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">
                    {variantText}
                  </span>
                )}
                <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                  <TranslatedText>Out of Stock</TranslatedText>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              <TranslatedText>You're On The Waitlist!</TranslatedText>
            </h4>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              <TranslatedText>We've logged your request and opened WhatsApp support. As soon as this product is restocked, you'll be the first to know!</TranslatedText>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <TranslatedText>Full Name</TranslatedText> <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <TranslatedText>Email Address</TranslatedText> <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isArabic ? "example@email.com" : "you@example.com"}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all text-gray-900"
                />
              </div>
            </div>

            {/* WhatsApp Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <TranslatedText>WhatsApp Number</TranslatedText> <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl border border-gray-300 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-lime-500 focus-within:border-lime-500 transition-all">
                <PhoneInput
                  international
                  country={selectedCountry}
                  defaultCountry={selectedCountry}
                  onCountryChange={(c) => {
                    if (c) {
                      setSelectedCountry(c)
                      setFormData((prev) => ({
                        ...prev,
                        phone: sanitizePhoneNumber(prev.phone, c) || "",
                      }))
                    }
                  }}
                  addInternationalOption={false}
                  countryCallingCodeEditable={false}
                  limitMaxLength={true}
                  value={formData.phone}
                  onChange={(val) => {
                    const sanitized = sanitizePhoneNumber(val, selectedCountry)
                    setFormData((prev) => ({ ...prev, phone: sanitized || "" }))
                  }}
                  className="px-3 py-2.5 text-sm text-gray-900"
                  placeholder={isArabic ? "رقم الهاتف" : "Phone number"}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-lime-500 hover:bg-lime-600 active:scale-[0.99] text-slate-900 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg shadow-lime-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span><TranslatedText>Notify Me When Available</TranslatedText></span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default RestockAlertModal

