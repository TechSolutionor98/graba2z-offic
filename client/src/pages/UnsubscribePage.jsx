"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { Check, Loader2, Mail } from "lucide-react"

import config from "../config/config"

/**
 * The page the unsubscribe link in an email opens.
 *
 * On the shop's own site rather than served raw by the API, so somebody who
 * clicks arrives somewhere that looks like us, with the header and footer they
 * know, and can carry on shopping afterwards.
 *
 * It asks before it acts. Mail scanners, corporate link checkers and spam
 * filters all follow links in email, and if arriving here were enough to opt
 * somebody out, any of them could quietly do it on a customer's behalf.
 *
 * The signed token in the URL names the one address this page may change. The
 * one-click header in the email still points at the API, because mail clients
 * cannot run this page.
 */

const REASONS = [
  "",
  "Too many emails",
  "Not relevant to me",
  "I never signed up",
  "No longer shopping here",
]

const UnsubscribePage = ({ mode = "unsubscribe" }) => {
  const { token } = useParams()
  const [email, setEmail] = useState("")
  const [reasonText, setReasonText] = useState("")
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState(false)
  const [invalid, setInvalid] = useState(false)
  // Already in the state this page would put them in -- say so rather than
  // asking them to confirm something that has already happened.
  const [already, setAlready] = useState(false)
  const [error, setError] = useState("")

  const API = config.API_URL
  const base = `${API}/api/campaigns/${mode}/${encodeURIComponent(token || "")}`

  // Asks the server whose address this token refers to. It changes nothing --
  // the decision is made by the button below.
  useEffect(() => {
    axios
      .get(base, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (r.data?.email) {
          setEmail(r.data.email)
          setAlready(mode === "unsubscribe" ? r.data.subscribed === false : r.data.subscribed === true)
        } else {
          setInvalid(true)
        }
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mode])

  const submit = async () => {
    setWorking(true)
    setError("")
    try {
      const body = new URLSearchParams()
      if (mode === "unsubscribe" && reasonText) body.set("reasonText", reasonText)
      await axios.post(base, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      })
      setDone(true)
    } catch {
      setError("That did not go through. Try again in a moment.")
    } finally {
      setWorking(false)
    }
  }

  const card = "mx-auto my-10 max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"

  if (loading) {
    return (
      <div className={card}>
        <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </p>
      </div>
    )
  }

  if (invalid) {
    return (
      <div className={`${card} text-center`}>
        <h1 className="text-xl font-bold text-gray-900">That link is not valid</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          It may have been broken by your mail app. Reply to any of our emails and we will sort it out for you.
        </p>
        <a
          href="/"
          className="mt-5 inline-block rounded-lg bg-lime-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-lime-600"
        >
          Go to the shop
        </a>
      </div>
    )
  }

  if (done) {
    const left = mode === "unsubscribe"
    return (
      <div className={`${card} text-center`}>
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-lime-100 text-lime-700">
          <Check size={22} />
        </span>
        <h1 className="text-xl font-bold text-gray-900">
          {left ? "You have been unsubscribed" : "You are subscribed again"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {left
            ? `We will not send marketing email to ${email} again.`
            : `We will send our offers and news to ${email}.`}
        </p>

        {left && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-500">Unsubscribed by mistake?</p>
            <a
              href={`/resubscribe/${encodeURIComponent(token)}`}
              className="mt-3 inline-block rounded-lg bg-lime-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-lime-600"
            >
              Subscribe me again
            </a>
          </div>
        )}

        <a href="/" className="mt-5 block text-sm font-medium text-lime-700 hover:underline">
          Back to the shop
        </a>
      </div>
    )
  }

  const leaving = mode === "unsubscribe"

  if (already) {
    return (
      <div className={`${card} text-center`}>
        <h1 className="text-xl font-bold text-gray-900">
          {leaving ? "You are already unsubscribed" : "You are already subscribed"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {leaving
            ? `We are not sending marketing email to ${email}.`
            : `We are sending our offers and news to ${email}.`}
        </p>
        <a
          href={leaving ? `/resubscribe/${encodeURIComponent(token)}` : "/"}
          className="mt-5 inline-block rounded-lg bg-lime-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-lime-600"
        >
          {leaving ? "Subscribe me again" : "Go to the shop"}
        </a>
      </div>
    )
  }

  return (
    <div className={card}>
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Mail size={22} />
      </span>

      <h1 className="text-center text-xl font-bold text-gray-900">
        {leaving ? "Unsubscribe from our emails?" : "Start receiving our emails again?"}
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        {leaving ? "This will stop offers and news going to" : "Offers and news will go to"}
      </p>
      <p className="mt-1 text-center text-base font-bold text-gray-900">{email}</p>

      {leaving && (
        <>
          <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
            You will still get order confirmations and delivery updates. Those are part of buying from us and
            are not marketing.
          </p>

          <label className="mt-5 block text-sm font-bold text-gray-700">
            Why are you leaving? <span className="font-normal text-gray-400">Optional</span>
          </label>
          <select
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          >
            {REASONS.map((r) => (
              <option key={r || "none"} value={r}>
                {r || "Prefer not to say"}
              </option>
            ))}
          </select>
        </>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={working}
        className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-bold text-white disabled:opacity-50 ${
          leaving ? "bg-red-600 hover:bg-red-700" : "bg-lime-500 hover:bg-lime-600"
        }`}
      >
        {working ? "Working…" : leaving ? "Yes, unsubscribe me" : "Yes, subscribe me again"}
      </button>

      {leaving && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Changed your mind?{" "}
          <a href="/" className="font-medium text-lime-700 hover:underline">
            Keep receiving them
          </a>
        </p>
      )}
    </div>
  )
}

export default UnsubscribePage
