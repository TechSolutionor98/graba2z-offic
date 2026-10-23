"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Check, Loader2, Mail } from "lucide-react"

import config from "../config/config"

/**
 * A customer's own marketing-email switch.
 *
 * Shared by the profile page and the standalone preferences page so the two can
 * never disagree about what somebody's setting is.
 *
 * The address acted on comes from the session, never from the page: a control
 * that changed whatever address it was handed would let anyone unsubscribe
 * anyone.
 */
const EmailSubscriptionCard = () => {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("authToken")}` },
  }

  useEffect(() => {
    axios
      .get(`${config.API_URL}/api/campaigns/me/subscription`, authHeader)
      .then((r) => setState(r.data))
      .catch(() => setError("We could not load your preference. Try again in a moment."))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const change = async (action) => {
    setError("")
    setNotice("")
    setWorking(true)
    try {
      const { data } = await axios.post(`${config.API_URL}/api/campaigns/me/${action}`, {}, authHeader)
      setState({ ...state, subscribed: data.subscribed })
      setNotice(data.message)
    } catch {
      setError("That did not go through. Try again in a moment.")
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={15} className="animate-spin" />
          Loading your email preference…
        </p>
      </div>
    )
  }

  const subscribed = state?.subscribed !== false

  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${subscribed ? "bg-lime-100 text-lime-700" : "bg-gray-200 text-gray-500"}`}>
          <Mail size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs text-gray-500 font-medium block">Marketing emails</span>
          <span className="font-bold text-gray-800 text-sm md:text-base">
            {subscribed ? "You are subscribed" : "You are unsubscribed"}
          </span>
          <p className="mt-1 text-xs text-gray-500">
            {subscribed
              ? "Offers and news from GrabAtoZ."
              : "We are not sending you offers or news."}{" "}
            Order confirmations and delivery updates are always sent.
          </p>

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          {notice && (
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-lime-50 px-3 py-2 text-xs text-lime-800">
              <Check size={13} className="mt-0.5 shrink-0" />
              {notice}
            </p>
          )}

          <button
            type="button"
            onClick={() => change(subscribed ? "unsubscribe" : "resubscribe")}
            disabled={working}
            className={`mt-3 rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50 ${
              subscribed
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                : "bg-lime-500 text-white hover:bg-lime-600"
            }`}
          >
            {working ? "Working…" : subscribed ? "Unsubscribe" : "Subscribe again"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailSubscriptionCard
