"use client"

import { Mail } from "lucide-react"

import EmailSubscriptionCard from "../components/EmailSubscriptionCard"

/**
 * Where a customer manages the marketing email they get from us.
 *
 * Behind the sign-in gate, and reachable from Email Preferences in the account
 * menu. The same card appears on the profile page -- one component, so the two
 * can never show different states.
 *
 * The one-click link at the foot of every email still works without signing in;
 * that one carries a signed token naming the single address it may act on.
 */

const EmailPreferences = () => (
  <div className="mx-auto max-w-xl px-4 py-10">
    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
      <Mail className="text-lime-600" size={22} />
      Email preferences
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      Offers and news from GrabAtoZ. This does not affect order confirmations or delivery updates — those
      are part of buying from us and are always sent.
    </p>

    <div className="mt-6">
      <EmailSubscriptionCard />
    </div>
  </div>
)

export default EmailPreferences
