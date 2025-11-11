// Central app configuration
// - Picks API base from env in production
// - Forces localhost API when running the frontend on localhost for easier dev
const resolveApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_API_URL || "").trim()
  const isLocalHost =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)

  // Prefer local API when developing locally
  if (isLocalHost) return "http://localhost:5000"

  // Otherwise use env if valid, or fall back to the public API
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "")
  return "https://api.grabatoz.ae"
}

const config = {
  // API Configuration - Handle both development and production
  API_URL: resolveApiUrl(),

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
  