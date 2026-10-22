"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Check, Loader2, Mail } from "lucide-react"

import { useAuth } from "../context/AuthContext"
import config from "../config/config"

/**
 * Where a customer manages the marketing email they get from us.
 *
 * Behind the sign-in gate on purpose. The address acted on is the one on the
 * session, never one typed into the page: a form that unsubscribed whatever
 * address it was given would let anybody unsubscribe anybody.
 *
 * The one-click link at the foot of every email still works without signing in
 * -- that one carries a signed token naming the single address it may act on.
 */
const EmailPreferences = () => {
  const { user } = useAuth()
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

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <Mail className="text-lime-600" size={22} />
        Email preferences
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Offers and news from GrabAtoZ. This does not affect order confirmations or delivery updates — those
        are part of buying from us and are always sent.
      </p>

      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={15} className="animate-spin" />
          Loading…
        </p>
      ) : (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Signed in as</p>
          <p className="font-semibold text-gray-900">{state?.email || user?.email}</p>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {notice && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-lime-50 px-4 py-3 text-sm text-lime-800">
              <Check size={15} className="mt-0.5 shrink-0" />
              {notice}
            </p>
          )}

          <div className="mt-5 border-t border-gray-100 pt-5">
            {state?.subscribed ? (
              <>
                <p className="text-sm text-gray-700">You are receiving our offers and news.</p>
                <button
                  type="button"
                  onClick={() => change("unsubscribe")}
                  disabled={working}
                  className="mt-3 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {working ? "Working…" : "Unsubscribe"}
                </button>
                <p className="mt-2 text-xs text-gray-400">
                  You can turn this back on here at any time.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  You are unsubscribed. We will not send you offers or news.
                </p>
                <button
                  type="button"
                  onClick={() => change("resubscribe")}
                  disabled={working}
                  className="mt-3 rounded-lg bg-lime-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-lime-600 disabled:opacity-50"
                >
                  {working ? "Working…" : "Subscribe again"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailPreferences
