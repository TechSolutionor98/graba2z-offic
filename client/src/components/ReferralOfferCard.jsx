"use client"

import { useState, useRef } from "react"
import { Copy, Check, Share2, Gift } from "lucide-react"
import { Link } from "react-router-dom"
import { useReferral } from "../context/ReferralContext"
import { useCurrency } from "../context/CurrencyContext"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import TranslatedText from "./TranslatedText"

/**
 * The shared "Refer a Friend" offer card: the reward wording, the invite link with
 * copy/share, and the code. Used both on the profile page (ReferralPanel) and in the
 * navbar modal (ReferralModal) so the offer never says two different things in two places.
 *
 * A signed-out shopper has no link yet, so we show what the programme gives plus a prompt
 * to sign in / register instead of an empty field.
 *
 * Props:
 *  - onNavigate  {() => void}  called when a login/register link is followed (lets the modal close)
 */
const ReferralOfferCard = ({ onNavigate }) => {
  const { isEnabled, settings, summary } = useReferral()
  const { formatPrice } = useCurrency()
  const { isAuthenticated } = useAuth()
  const { getLocalizedPath } = useLanguage()

  const [copied, setCopied] = useState(false)
  const linkFieldRef = useRef(null)

  if (!isEnabled) return null

  const link = summary?.link || ""
  const code = summary?.code || ""

  const describeOffer = (type, value, cap) => {
    const headline = type === "fixed" ? formatPrice(value) : `${value}%`
    if (type !== "fixed" && cap > 0) return `${headline} off (up to ${formatPrice(cap)})`
    return `${headline} off`
  }

  // The figures come from the server's view of this customer's tier (assigned, else the
  // programme default). The base settings only stand in while the summary is still loading.
  const refereeOffer = summary?.offer?.referee || {
    discountType: settings.refereeDiscountType,
    discountValue: settings.refereeDiscountValue,
    maxDiscountAed: settings.refereeMaxDiscountAed,
    minOrderAed: settings.refereeMinOrderAed,
  }
  const referrerOffer = summary?.offer?.referrer || {
    discountType: settings.referrerDiscountType,
    discountValue: settings.referrerDiscountValue,
    maxDiscountAed: settings.referrerMaxDiscountAed,
    minOrderAed: settings.referrerMinOrderAed,
  }

  const handleCopy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Older browsers, and any page not served over https, have no clipboard API. Select
      // the field instead so the customer can copy it by hand.
      const field = linkFieldRef.current
      if (field) {
        field.focus()
        field.select()
      }
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShare = async () => {
    if (!link) return
    const message = String(settings.shareMessage || "").replace("{{link}}", link) || link
    if (navigator.share) {
      try {
        await navigator.share({ title: settings.programmeName || "Refer a friend", text: message, url: link })
        return
      } catch {
        return
      }
    }
    handleCopy()
  }

  return (
    <div className="rounded-2xl border border-lime-200 bg-lime-50 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-lime-600 p-2 text-white">
          <Gift size={22} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-extrabold text-gray-900">
              <TranslatedText>{settings.programmeName || "Refer a Friend"}</TranslatedText>
            </h2>
            {summary?.tier && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: summary.tier.color || "#3b82f6" }}
              >
                {summary.tier.name} Tier
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-700">
            <TranslatedText>Your friend gets</TranslatedText>{" "}
            <strong className="text-lime-800">
              {describeOffer(refereeOffer.discountType, refereeOffer.discountValue, refereeOffer.maxDiscountAed)}
            </strong>{" "}
            <TranslatedText>when they sign up with your link</TranslatedText>
            {refereeOffer.minOrderAed > 0 ? ` (on orders over ${formatPrice(refereeOffer.minOrderAed)})` : ""}.{" "}
            <TranslatedText>Once their first order is delivered, you get</TranslatedText>{" "}
            <strong className="text-lime-800">
              {describeOffer(referrerOffer.discountType, referrerOffer.discountValue, referrerOffer.maxDiscountAed)}
            </strong>{" "}
            <TranslatedText>on your next order</TranslatedText>
            {referrerOffer.minOrderAed > 0 ? ` over ${formatPrice(referrerOffer.minOrderAed)}` : ""}.
          </p>
        </div>
      </div>

      {/* ---- The link (or a prompt to sign in for one) ---- */}
      {isAuthenticated ? (
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-600">
            <TranslatedText>Your invite link</TranslatedText>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={linkFieldRef}
              readOnly
              value={link}
              onFocus={(event) => event.target.select()}
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-xs text-gray-700 sm:text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!link}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? <TranslatedText>Copied</TranslatedText> : <TranslatedText>Copy</TranslatedText>}
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={!link}
                className="inline-flex items-center gap-2 rounded-xl bg-lime-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Share2 size={16} />
                <TranslatedText>Share</TranslatedText>
              </button>
            </div>
          </div>
          {code && (
            <div className="rounded-xl border border-lime-300 bg-white px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-lime-700">
                <TranslatedText>Or share your code</TranslatedText>
              </p>
              <p className="mt-0.5 font-mono text-2xl font-extrabold tracking-widest text-lime-700 sm:text-3xl">
                {code}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to={getLocalizedPath("/login")}
            onClick={onNavigate}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-lime-700"
          >
            <TranslatedText>Log in to get your link</TranslatedText>
          </Link>
          <Link
            to={getLocalizedPath("/register")}
            onClick={onNavigate}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-lime-600 bg-white px-4 py-3 text-sm font-bold text-lime-700 transition hover:bg-lime-50"
          >
            <TranslatedText>Create an account</TranslatedText>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ReferralOfferCard
