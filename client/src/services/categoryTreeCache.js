import axios from "axios"
import config from "../config/config"

const CACHE_KEY = "graba2z_category_tree_cache_v1"
const CACHE_TTL = 10 * 60 * 1000

let inflightPromise = null

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.timestamp || !Array.isArray(parsed?.data)) return null
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    )
  } catch {
    // Ignore cache write failures.
  }
}

export async function getCategoryTreeCached() {
  const cached = readCache()
  if (cached) return cached

  if (inflightPromise) return inflightPromise

  inflightPromise = axios
    .get(`${config.API_URL}/api/categories/tree`)
    .then((resp) => (Array.isArray(resp.data) ? resp.data : []))
    .then((data) => {
      writeCache(data)
      return data
    })
    .finally(() => {
      inflightPromise = null
    })

  return inflightPromise
}

