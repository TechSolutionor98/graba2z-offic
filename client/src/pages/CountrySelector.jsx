"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrency } from "../context/CurrencyContext"
import { useLanguage } from "../context/LanguageContext"
import StaticRouteSEO from "../components/StaticRouteSEO"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Footer from "../components/Footer"

export default function CountrySelector() {
  const navigate = useNavigate()
  const { countries, changeCountry, loading } = useCurrency()
  const { switchLanguage } = useLanguage()
  const [hoveredCode, setHoveredCode] = useState(null)
  const sliderRef = useRef(null)

  const handleSelectCountry = (e, countryCode, langCode) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const codeLower = String(countryCode).toLowerCase()
    const targetSlug = `/${codeLower}-${langCode}`
    changeCountry(countryCode)
    switchLanguage(langCode)
    if (typeof window !== "undefined") {
      window.location.assign(targetSlug)
    } else {
      navigate(targetSlug)
    }
  }

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: "smooth" })
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white font-sans overflow-hidden selection:bg-lime-500 selection:text-black">
      <StaticRouteSEO />

      {/* Dark Luxury Ambient Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 filter brightness-75 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 w-full max-w-6xl px-4 py-8 flex flex-col items-center">
        {/* Brand Logo Header */}
        <div className="text-center mb-8 flex justify-center items-center">
          <img 
            src="/COUNTRYLOGO.webp" 
            alt="Grab A2Z Logo" 
            className="h-20 md:h-28 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/COUNTRYLOGO.png"
            }}
          />
        </div>

        {/* Central Modal Box */}
        <div className="w-full max-w-5xl backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Original luxury electronics & tech across the GCC
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-medium mb-8">
            Select your country to start shopping
          </p>

          {loading ? (
            <div className="py-16">
              <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="relative w-full flex items-center">
              {/* Left Slider Navigation Arrow */}
              <button
                onClick={scrollLeft}
                aria-label="Previous countries"
                className="absolute -left-4 md:-left-6 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-lime-500 hover:text-black text-white border border-white/20 flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Single-Row Horizontal Slider */}
              <div
                ref={sliderRef}
                className="flex flex-row gap-5 overflow-x-auto scroll-smooth py-4 px-2 w-full no-scrollbar focus:outline-none"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {countries.map((country) => {
                  const isHovered = hoveredCode === country.code

                  return (
                    <div
                      key={country.code}
                      onMouseEnter={() => setHoveredCode(country.code)}
                      onMouseLeave={() => setHoveredCode(null)}
                      onClick={(e) => handleSelectCountry(e, country.code, "en")}
                      className={`w-[230px] md:w-[250px] shrink-0 rounded-2xl p-5 transition-all duration-300 backdrop-blur-md border flex flex-col items-center justify-between text-center min-h-[220px] cursor-pointer ${
                        isHovered
                          ? "bg-white/25 border-lime-400 shadow-2xl shadow-lime-500/20 -translate-y-1.5 scale-102"
                          : "bg-white/10 border-white/20 hover:border-white/40"
                      }`}
                    >
                      {/* Flag Container */}
                      <div className="w-full h-28 rounded-xl overflow-hidden shadow-lg border border-white/20 mb-4 flex items-center justify-center bg-transparent group-hover:scale-105 transition-transform duration-300">
                        {country.flagSvg ? (
                          <div
                            className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:object-cover"
                            dangerouslySetInnerHTML={{
                              __html: country.flagSvg.includes("preserveAspectRatio")
                                ? country.flagSvg
                                : country.flagSvg.replace("<svg", '<svg preserveAspectRatio="none"')
                            }}
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">{country.code}</span>
                        )}
                      </div>

                      {/* Country Name */}
                      <div className="mb-4 space-y-0.5">
                        <h3 className="text-base md:text-lg font-bold text-white tracking-widest uppercase">
                          {country.name}
                        </h3>
                        <p className="text-xs md:text-sm text-lime-400 font-semibold dir-rtl font-arabic">
                          {country.nameAr}
                        </p>
                      </div>

                      {/* Language Selection Buttons */}
                      <div className="w-full flex items-center justify-center gap-2 mt-auto relative z-30">
                        <button
                          type="button"
                          onClick={(e) => handleSelectCountry(e, country.code, "en")}
                          className="flex-1 py-2 px-3 rounded-full bg-white/20 hover:bg-lime-500 hover:text-black text-white font-semibold text-xs transition-all duration-200 border border-white/20 hover:border-lime-400 shadow-sm cursor-pointer relative z-30"
                        >
                          English
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleSelectCountry(e, country.code, "ar")}
                          className="flex-1 py-2 px-3 rounded-full bg-white/20 hover:bg-lime-500 hover:text-black text-white font-semibold text-xs transition-all duration-200 border border-white/20 hover:border-lime-400 shadow-sm font-arabic dir-rtl cursor-pointer relative z-30"
                        >
                          العربية
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right Slider Navigation Arrow */}
              <button
                onClick={scrollRight}
                aria-label="Next countries"
                className="absolute -right-4 md:-right-6 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-lime-500 hover:text-black text-white border border-white/20 flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Website Footer at Bottom */}
      <div className="relative z-10 w-full mt-12 border-t border-white/10">
        <Footer />
      </div>
    </div>
  )
}
