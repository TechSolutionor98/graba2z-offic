# Vercel Deployment Fix Guide

## Issue: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

This error occurs when your API endpoints return HTML instead of JSON, typically due to:
1. Incorrect API URLs
2. Missing environment variables
3. CORS issues
4. Server not deployed or not running

## ✅ Fixed Issues:

### 1. **API Configuration Updated**
- Updated `client/src/config/config.js` to handle production URLs
- Added fallback for Vercel deployment

### 2. **CORS Configuration Fixed**
- Updated `server/server.js` to allow multiple domains:
  - `https://www.graba2z.ae`
  - `https://graba2z.vercel.app`
  - `https://graba2z-offic.vercel.app`
  - `http://localhost:3000`
  - `http://localhost:5173`

### 3. **Error Handling Improved**
- Removed verbose console logs
- Added silent error handling for API calls
- Better fallback mechanisms

## 🔧 Required Actions:

### 1. **Set Environment Variables in Vercel**

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```bash
VITE_API_URL=https://your-backend-domain.vercel.app
```

Replace `your-backend-domain.vercel.app` with your actual backend domain.

### 2. **Deploy Backend to Vercel**

Make sure your backend is deployed to Vercel and accessible.

### 3. **Update API URL in Config**

In `client/src/config/config.js`, replace:
```javascript
API_URL: import.meta.env.VITE_API_URL || 
          (import.meta.env.PROD ? "https://your-backend-domain.vercel.app" : "http://localhost:5000"),
```

With your actual backend URL:
```javascript
API_URL: import.meta.env.VITE_API_URL || 
          (import.meta.env.PROD ? "https://your-actual-backend.vercel.app" : "http://localhost:5000"),
```

### 4. **Test API Endpoints**

Test these endpoints directly in browser:
- `https://your-backend.vercel.app/api/products`
- `https://your-backend.vercel.app/api/categories`
- `https://your-backend.vercel.app/api/brands`

They should return JSON, not HTML.

## 🚀 Deployment Steps:

1. **Deploy Backend First**
   ```bash
   cd server
   vercel --prod
   ```

2. **Get Backend URL**
   - Note the deployment URL from Vercel

3. **Update Frontend Config**
   - Replace `your-backend-domain.vercel.app` with actual URL

4. **Set Environment Variables**
   - Add `VITE_API_URL` in Vercel dashboard

5. **Deploy Frontend**
   ```bash
   cd client
   vercel --prod
   ```

## 🔍 Debugging:

If still getting HTML responses:

1. **Check Backend URL**: Ensure it's correct and accessible
2. **Test API Directly**: Visit API URLs in browser
3. **Check CORS**: Ensure your domain is in allowed origins
4. **Check Environment Variables**: Verify `VITE_API_URL` is set correctly

## 📝 Common Issues:

- **404 Errors**: Backend not deployed or wrong URL
- **CORS Errors**: Domain not in allowed origins
- **Environment Variables**: Not set in Vercel dashboard
- **API Routes**: Incorrect endpoint paths

The caching system will work once the API endpoints are accessible and returning JSON data. 