// Central app configuration
// - Picks API base from env in production
// - Forces localhost API when running the frontend on localhost for easier dev
const resolveApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_API_URL || "").trim()
  const forceRemoteApi = String(import.meta.env?.VITE_FORCE_REMOTE_API || "")
    .trim()
    .toLowerCase() === "true"
  const isLocalHost =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)

  // Use local API by default when frontend runs on localhost.
  // Set VITE_FORCE_REMOTE_API=true only when you intentionally want remote API in local UI.
  if (isLocalHost && !forceRemoteApi) return "http://localhost:5000"
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  // Production fallback.
  return "https://api.grabatoz.ae"
}

// Resolve Translation API URL
const resolveTranslationApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_TRANSLATION_API_URL || "").trim()
  const forceRemoteApi = String(import.meta.env?.VITE_FORCE_REMOTE_API || "")
    .trim()
    .toLowerCase() === "true"
  const isLocalHost =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)

  // Keep translation API local too when frontend runs on localhost.
  if (isLocalHost && !forceRemoteApi) return "http://localhost:5001"
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")

  // Production fallback.
  return "https://langaimodel.grabatoz.ae" // Production translation API on VPS
}

const config = {
  // API Configuration - Handle both development and production
  API_URL: resolveApiUrl(),

  // Translation Model API
  TRANSLATION_API_URL: resolveTranslationApiUrl(),

  // Payment Gateway Configuration
  TAMARA_API_KEY: import.meta.env.VITE_TAMARA_API_KEY,
  TABBY_MERCHANT_CODE: import.meta.env.VITE_TABBY_MERCHANT_CODE,
  TABBY_SECRET_KEY: import.meta.env.VITE_TABBY_SECRET_KEY,
  NGENIUS_API_KEY: import.meta.env.VITE_NGENIUS_API_KEY,

  // App Configuration
  APP_NAME: "GrabAtoZ",
  APP_VERSION: "1.0.0",
}

export default config




// const config = {
//     // API Configuration - Handle both development and production
//   API_URL:  'ht tp://localhost:5000', // Make sure to include http:// or https://
// //  API_URL: import.meta.env.VITE_API_URL || 'https://api.grabatoz.ae',
   
     
 


//     // Payment Gateway Configuration
//     TAMARA_API_KEY: import.meta.env.VITE_TAMARA_API_KEY,
//     TABBY_MERCHANT_CODE: import.meta.env.VITE_TABBY_MERCHANT_CODE,
//     TABBY_SECRET_KEY: import.meta.env.VITE_TABBY_SECRET_KEY,
//     NGENIUS_API_KEY: import.meta.env.VITE_NGENIUS_API_KEY,
  
//     // App Configuration
//     APP_NAME: "GrabAtoZ",
//     APP_VERSION: "1.0.0",
//   }
  
//   export default config
  
