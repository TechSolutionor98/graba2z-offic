/* new reusable SEO component using react-helmet-async */
import { Helmet } from "react-helmet-async"

function absoluteUrl(urlOrPath) {
  // Accept absolute URLs as-is; otherwise prefix with window.location.origin
  if (!urlOrPath) return undefined
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath
  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/+$/, "")
    const path = (urlOrPath || "").startsWith("/") ? urlOrPath : `/${urlOrPath}`
    return `${origin}${path}`
  }
  return urlOrPath
}

/**
 * SEO component
 * props:
 * - title?: string
 * - description?: string
 * - canonicalPath?: string | absolute url
 * - image?: string (absolute or relative)
 * - noindex?: boolean
 */
export default function SEO({ title, description, canonicalPath, image, noindex = false }) {
  const canonical = absoluteUrl(canonicalPath || (typeof window !== "undefined" ? window.location.pathname : "/"))
  const ogImage = image ? absoluteUrl(image) : undefined

  return (
    <Helmet prioritizeSeoTags>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
