import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import SEO from "./SEO"
import config from "../config/config"

const DYNAMIC_PATH_PATTERNS = [/^\/product\//i, /^\/offers\//i, /^\/gaming-zone\//i, /^\/blogs\/.+/i, /^\/shop(\/|$)/i, /^\/product-category(\/|$)/i]

const normalizePath = (pathname = "") => {
  const withSlash = String(pathname || "").startsWith("/") ? String(pathname || "") : `/${pathname || ""}`
  const strippedLang = withSlash.replace(/^\/(ae-en|ae-ar)(?=\/|$)/i, "") || "/"
  const noTrailing = strippedLang.length > 1 ? strippedLang.replace(/\/+$/, "") : strippedLang
  return noTrailing || "/"
}

const isDynamicPath = (path) => DYNAMIC_PATH_PATTERNS.some((pattern) => pattern.test(path))

export default function StaticRouteSEO() {
  const location = useLocation()
  const [seoData, setSeoData] = useState(null)

  const normalizedPath = useMemo(() => normalizePath(location.pathname), [location.pathname])

  useEffect(() => {
    let mounted = true

    if (isDynamicPath(normalizedPath)) {
      setSeoData(null)
      return () => {
        mounted = false
      }
    }

    const fetchSeo = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/seo-pages/public-by-path`, {
          params: { path: normalizedPath },
        })

        if (!mounted) return

        if (response.data?.found) {
          setSeoData(response.data.seo)
        } else {
          setSeoData(null)
        }
      } catch (error) {
        if (mounted) {
          setSeoData(null)
        }
      }
    }

    fetchSeo()

    return () => {
      mounted = false
    }
  }, [normalizedPath])

  if (!seoData) return null

  return (
    <SEO
      title={seoData.title || undefined}
      description={seoData.description || undefined}
      keywords={seoData.keywords || undefined}
      canonicalPath={seoData.canonicalUrl || normalizedPath}
      robots={seoData.robots || undefined}
      ogTitle={seoData.ogTitle || undefined}
      ogDescription={seoData.ogDescription || undefined}
      ogImage={seoData.ogImage || undefined}
      customSchema={seoData.customSchema || undefined}
    />
  )
}
