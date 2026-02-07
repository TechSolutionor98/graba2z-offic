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
 * - keywords?: string
 * - ogTitle?: string (custom Open Graph title, falls back to title)
 * - ogDescription?: string (custom Open Graph description, falls back to description)
 * - article?: object (for blog posts) - { author, datePublished, dateModified, tags }
 */
export default function SEO({ title, description, canonicalPath, image, noindex = false, keywords, ogTitle, ogDescription, article }) {
  const canonical = absoluteUrl(canonicalPath || (typeof window !== "undefined" ? window.location.pathname : "/"))
  const ogImage = image ? absoluteUrl(image) : undefined
  const finalOgTitle = ogTitle || title
  const finalOgDescription = ogDescription || description

  // Build Article structured data (JSON-LD)
  let articleSchema = null
  if (article) {
    articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": ogImage,
      "url": canonical,
      "datePublished": article.datePublished,
      "dateModified": article.dateModified || article.datePublished,
      "author": {
        "@type": "Person",
        "name": article.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Graba2z",
        "logo": {
          "@type": "ImageObject",
          "url": typeof window !== "undefined" ? `${window.location.origin}/logo.png` : ""
        }
      }
    }
    
    if (article.tags && article.tags.length > 0) {
      articleSchema.keywords = article.tags.join(", ")
    }
  }

  return (
    <Helmet prioritizeSeoTags>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      {finalOgTitle && <meta property="og:title" content={finalOgTitle} />}
      {finalOgDescription && <meta property="og:description" content={finalOgDescription} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content={article ? "article" : "website"} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {article && article.datePublished && <meta property="article:published_time" content={article.datePublished} />}
      {article && article.dateModified && <meta property="article:modified_time" content={article.dateModified} />}
      {article && article.author && <meta property="article:author" content={article.author} />}
      {article && article.tags && article.tags.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {finalOgTitle && <meta name="twitter:title" content={finalOgTitle} />}
      {finalOgDescription && <meta name="twitter:description" content={finalOgDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Structured Data (JSON-LD) */}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  )
}
