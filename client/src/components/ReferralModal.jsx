"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Link } from "react-router-dom"
import { useReferral } from "../context/ReferralContext"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import ReferralOfferCard from "./ReferralOfferCard"
import TranslatedText from "./TranslatedText"

/**
 * The "Refer a Friend" modal opened from the navbar. Shows the offer, the invite link and,
 * for a signed-in shopper, their headline referral numbers — with a link through to the full
 * page on their profile.
 */
const ReferralModal = ({ open, onClose }) => {
  const { isEnabled } = useReferral()
  const { isAuthenticated } = useAuth()
  const { getLocalizedPath } = useLanguage()

  // Escape closes, and the body must not scroll behind the modal.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open || !isEnabled) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <div className="p-4 sm:p-6">
          <ReferralOfferCard onNavigate={onClose} />

          {isAuthenticated && (
            <Link
              to={getLocalizedPath("/profile")}
              onClick={onClose}
              className="mt-4 block w-full rounded-xl border border-gray-200 py-2.5 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <TranslatedText>See invites &amp; rewards</TranslatedText>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReferralModal
