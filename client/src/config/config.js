const config = {
    // API Configuration - Handle both development and production
    API_URL: import.meta.env.VITE_API_URL || 
              (import.meta.env.PROD ? "http://148.230.70.160:5000" : "http://localhost:5000"),
     

    // Payment Gateway Configuration
    TAMARA_API_KEY: import.meta.env.VITE_TAMARA_API_KEY,
    TABBY_MERCHANT_CODE: import.meta.env.VITE_TABBY_MERCHANT_CODE,
    TABBY_SECRET_KEY: import.meta.env.VITE_TABBY_SECRET_KEY,
    NGENIUS_API_KEY: import.meta.env.VITE_NGENIUS_API_KEY,
  
    // App Configuration
    APP_NAME: "WatchCraft",
    APP_VERSION: "1.0.0",
  }
  
  export default config
  