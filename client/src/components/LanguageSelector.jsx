"use client"

import { useState, useRef, useCallback } from "react"
import { useLanguage, LANGUAGES } from "../context/LanguageContext"
import { ChevronDown, Globe } from "lucide-react"
import { useDismissable } from "../hooks/useDismissable"

const LANGUAGE_OPTIONS = [LANGUAGES.EN, LANGUAGES.AR]

/**
 * Website language picker. The country and currency picker lives in
 * CountrySwitcher so the two can be changed independently.
 */
const LanguageSelector = ({ className = "" }) => {
  const { currentLanguage, switchLanguage, isArabic } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const close = useCallback(() => setIsOpen(false), [])
  useDismissable(dropdownRef, isOpen, close)

  const handleLanguageChange = (langCode) => {
    if (langCode !== currentLanguage.code) {
      switchLanguage(langCode)
    }
    close()
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 shadow-sm"
        aria-label="Select website language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-gray-600 shrink-0" />
        <span dir="ltr">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${isArabic ? "left-0" : "right-0"} top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-52 overflow-hidden text-xs`}
        >
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            <Globe className="w-3.5 h-3.5" />
            Language
          </div>

          <div className="p-2 space-y-1">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = currentLanguage.code === lang.code
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isSelected ? "bg-emerald-50 text-emerald-800 font-bold" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className={`font-semibold ${lang.dir === "rtl" ? "font-arabic" : ""}`}>
                    {lang.nativeName}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400 text-[10px] font-mono uppercase" dir="ltr">
                      {lang.code}
                    </span>
                    {isSelected && <span className="text-emerald-600 font-bold">✓</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
