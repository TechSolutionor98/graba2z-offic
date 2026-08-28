"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"
import config from "../config/config"

const CurrencyContext = createContext(null)

const DEFAULT_GCC_COUNTRIES = [
  {
    code: "AE",
    name: "UAE",
    nameAr: "الإمارات",
    currencyCode: "AED",
    currencySymbol: "AED",
    currencySymbolAr: "د.إ",
    effectiveRate: 1.0,
    isDefault: true,
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    nameAr: "السعودية",
    currencyCode: "SAR",
    currencySymbol: "SAR",
    currencySymbolAr: "ر.س",
    effectiveRate: 1.021,
    isDefault: false,
  },
  {
    code: "QA",
    name: "Qatar",
    nameAr: "قطر",
    currencyCode: "QAR",
    currencySymbol: "QAR",
    currencySymbolAr: "ر.ق",
    effectiveRate: 0.991,
    isDefault: false,
  },
  {
    code: "OM",
    name: "Oman",
    nameAr: "عمان",
    currencyCode: "OMR",
    currencySymbol: "OMR",
    currencySymbolAr: "ر.ع",
    effectiveRate: 0.1048,
    isDefault: false,
  },
  {
    code: "BH",
    name: "Bahrain",
    nameAr: "البحرين",
    currencyCode: "BHD",
    currencySymbol: "BHD",
    currencySymbolAr: "د.ب",
    effectiveRate: 0.1026,
    isDefault: false,
  },
  {
    code: "KW",
    name: "Kuwait",
    nameAr: "الكويت",
    currencyCode: "KWD",
    currencySymbol: "KWD",
    currencySymbolAr: "د.ك",
    effectiveRate: 0.0835,
    isDefault: false,
  },
]

const ALL_PRESETS_MAP = new Map([
  ["AE", { nameAr: "الإمارات", currencySymbol: "AED", currencySymbolAr: "د.إ" }],
  ["SA", { nameAr: "السعودية", currencySymbol: "SAR", currencySymbolAr: "ر.س" }],
  ["QA", { nameAr: "قطر", currencySymbol: "QAR", currencySymbolAr: "ر.ق" }],
  ["OM", { nameAr: "عمان", currencySymbol: "OMR", currencySymbolAr: "ر.ع" }],
  ["BH", { nameAr: "البحرين", currencySymbol: "BHD", currencySymbolAr: "د.ب" }],
  ["KW", { nameAr: "الكويت", currencySymbol: "KWD", currencySymbolAr: "د.ك" }],
  ["EG", { nameAr: "مصر", currencySymbol: "EGP", currencySymbolAr: "ج.م" }],
  ["JO", { nameAr: "الأردن", currencySymbol: "JOD", currencySymbolAr: "د.أ" }],
  ["LB", { nameAr: "لبنان", currencySymbol: "LBP", currencySymbolAr: "ل.ل" }],
  ["IQ", { nameAr: "العراق", currencySymbol: "IQD", currencySymbolAr: "د.ع" }],
  ["TR", { nameAr: "تركيا", currencySymbol: "TRY", currencySymbolAr: "₺" }],
  ["GB", { nameAr: "المملكة المتحدة", currencySymbol: "GBP", currencySymbolAr: "£" }],
  ["US", { nameAr: "الولايات المتحدة", currencySymbol: "USD", currencySymbolAr: "$" }],
  ["IN", { nameAr: "الهند", currencySymbol: "INR", currencySymbolAr: "₹" }],
  ["PK", { nameAr: "باكستان", currencySymbol: "PKR", currencySymbolAr: "Rs" }],
])

export const CurrencyProvider = ({ children }) => {
  const [countries, setCountries] = useState(DEFAULT_GCC_COUNTRIES)
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
    return localStorage.getItem("selected-country-code") || "AE"
  })
  const [loading, setLoading] = useState(true)

  // Fetch active countries from public API
  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.API_URL}/api/countries/public`)
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Only include countries active in backend API
        const activeList = res.data.map((apiC) => {
          const codeUpper = apiC.code?.toUpperCase()
          const preset = ALL_PRESETS_MAP.get(codeUpper) || {}
          return {
            ...preset,
            ...apiC,
          }
        })
        setCountries(activeList)
      }
    } catch (err) {
      console.warn("Failed to fetch active countries, using defaults:", err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  useEffect(() => {
    const handleCountryChanged = (e) => {
      if (e.detail) {
        setSelectedCountryCode(String(e.detail).toUpperCase())
      }
    }
    window.addEventListener("country-changed", handleCountryChanged)
    return () => window.removeEventListener("country-changed", handleCountryChanged)
  }, [])

  // Current active country object
  const currentCountry =
    countries.find((c) => c.code.toUpperCase() === selectedCountryCode.toUpperCase()) ||
    countries.find((c) => c.isDefault) ||
    DEFAULT_COUNTRIES[0]

  const changeCountry = useCallback((countryCode) => {
    if (!countryCode) return
    const upperCode = String(countryCode).toUpperCase()
    setSelectedCountryCode(upperCode)
    localStorage.setItem("selected-country-code", upperCode)
  }, [])

  /**
   * Format price based on current country's currency and exchange rate.
   * @param {number|string} amountInAED Base price in AED
   * @param {boolean} isArabic Whether to format in Arabic symbol
   */
  const formatPrice = useCallback(
    (amountInAED, isArabic = false) => {
      const num = Number(amountInAED)
      if (isNaN(num) || num === null || num === undefined) return ""

      const rate = currentCountry?.effectiveRate > 0 ? currentCountry.effectiveRate : 1.0
      const converted = num * rate
      const formattedNum = new Intl.NumberFormat(isArabic ? "ar-AE" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted)

      const symbol = isArabic
        ? currentCountry?.currencySymbolAr || currentCountry?.currencyCode || "د.إ"
        : currentCountry?.currencySymbol || currentCountry?.currencyCode || "AED"

      return isArabic ? `${formattedNum} ${symbol}` : `${symbol} ${formattedNum}`
    },
    [currentCountry],
  )

  const value = {
    countries,
    currentCountry,
    selectedCountryCode,
    changeCountry,
    formatPrice,
    loading,
    refreshCountries: fetchCountries,
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}

export default CurrencyContext
