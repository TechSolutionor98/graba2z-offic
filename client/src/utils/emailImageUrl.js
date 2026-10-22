/**
 * An image URL that will still load from inside somebody's inbox.
 *
 * Everywhere else in the admin, an image URL is built against whichever API
 * this browser is talking to. On a developer's machine that is
 * http://localhost:5000, which is fine on screen and useless in an email: the
 * picture is broken for every recipient, and there is nothing in the delivered
 * message able to repair it.
 *
 * So any host that only exists on the machine that built the email is rewritten
 * to the public one. Cloudinary and other absolute URLs pass through untouched.
 */

// Where uploaded media is actually served from in production.
export const PUBLIC_MEDIA = "https://api.grabatoz.ae"

/** True for a host that cannot be reached from outside this machine or LAN. */
export const isMachineOnlyHost = (hostname) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname.endsWith(".local") ||
  /^10\./.test(hostname) ||
  /^192\.168\./.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
  /^\d+\.\d+\.\d+\.\d+$/.test(hostname)

export const toPublicImageUrl = (value) => {
  const raw = String(value || "").trim()
  if (!raw) return ""

  try {
    const url = new URL(raw)
    if (isMachineOnlyHost(url.hostname)) return `${PUBLIC_MEDIA}${url.pathname}${url.search}`
    return raw
  } catch {
    // Not an absolute URL -- a bare path like /uploads/email/x.jpg.
    return raw.startsWith("/") ? `${PUBLIC_MEDIA}${raw}` : raw
  }
}

export default toPublicImageUrl
