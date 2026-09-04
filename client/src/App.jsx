import { lazyWithRetry } from "./utils/lazyWithRetry"
import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { ToastProvider } from "./context/ToastContext"
import { LanguageProvider } from "./context/LanguageContext"
import { CurrencyProvider } from "./context/CurrencyContext"
import { LoyaltyProvider } from "./context/LoyaltyContext"
import LoyaltyRewardDialog from "./components/LoyaltyRewardDialog"

// Import components
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import ScrollToTop from "./components/ScrollToTop"
import RedirectHandler from "./components/RedirectHandler"
import ReturnPathTracker from "./components/ReturnPathTracker"

import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"

// Import pages
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"

const Shop = lazyWithRetry(() => import("./pages/Shop"))
const ProductDetails = lazyWithRetry(() => import("./pages/ProductDetails"))
const Cart = lazyWithRetry(() => import("./pages/Cart"))
const Checkout = lazyWithRetry(() => import("./pages/Checkout"))
const Login = lazyWithRetry(() => import("./pages/Login"))
const Register = lazyWithRetry(() => import("./pages/Register"))
const EmailVerification = lazyWithRetry(() => import("./pages/EmailVerification"))
const Profile = lazyWithRetry(() => import("./pages/Profile"))
const UserOrders = lazyWithRetry(() => import("./pages/UserOrders"))
const Wishlist = lazyWithRetry(() => import("./pages/Wishlist"))
const TrackOrder = lazyWithRetry(() => import("./pages/TrackOrder"))
const About = lazyWithRetry(() => import("./pages/About"))
const BlogList = lazyWithRetry(() => import("./pages/BlogList"))
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"))
const PrivacyAndPolicy = lazyWithRetry(() => import("./pages/PrivacyAndPolicy"))
const ArabicContent = lazyWithRetry(() => import("./pages/ArabicContent"))
const DisclaimerPolicy = lazyWithRetry(() => import("./pages/DisclaimerPolicy"))
const TermAndCondition = lazyWithRetry(() => import("./pages/TermAndCondition"))
const RefundAndReturn = lazyWithRetry(() => import("./pages/RefundAndReturn"))
const CookiesAndPolicy = lazyWithRetry(() => import("./pages/CookiesAndPolicy"))
const ReqBulkPurchase = lazyWithRetry(() => import("./pages/ReqBulkPurchase"))
const ContactUs = lazyWithRetry(() => import("./pages/ContactUs"))
const GuestOrder = lazyWithRetry(() => import("./pages/GuestOrder"))
const Guest = lazyWithRetry(() => import("./pages/Guest"))
const PaymentSuccess = lazyWithRetry(() => import("./pages/PaymentSuccess"))
const PaymentCancel = lazyWithRetry(() => import("./pages/PaymentCancel"))
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"))
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"))
const PromotionalPage = lazyWithRetry(() => import("./pages/PromotionalPage"))
const BackToSchoolProfessional = lazyWithRetry(() => import("./pages/BackToSchoolProfessional"))
const VoucherTerms = lazyWithRetry(() => import("./pages/VoucherTerms"))
const DeliveryTerms = lazyWithRetry(() => import("./pages/DeliveryTerms"))
const OfferPage = lazyWithRetry(() => import("./pages/OfferPage"))
const GamingZonePage = lazyWithRetry(() => import("./pages/GamingZonePage"))
const CountrySelector = lazyWithRetry(() => import("./pages/CountrySelector"))

const AdminLogin = lazyWithRetry(() => import("./pages/admin/AdminLogin"))
const SuperAdminLogin = lazyWithRetry(() => import("./pages/superadmin/SuperAdminLogin"))
const AdminPortal = lazyWithRetry(() => import("./routes/AdminPortal"))
const SuperAdminPortal = lazyWithRetry(() => import("./routes/SuperAdminPortal"))

function DefaultCanonical() {
  const location = useLocation()
  if (location.pathname !== "/") {
    return null
  }
  const href = typeof window !== "undefined" ? `${window.location.origin.replace(/\/+$/, "")}/ae-en` : "/ae-en"
  return (
    <Helmet prioritizeSeoTags>
      <link rel="canonical" href={href} />
    </Helmet>
  )
}

function RouteCanonical() {
  const location = useLocation()
  if (location.pathname === "/") return null
  if (location.pathname.includes("/offers/") || location.pathname.includes("/gaming-zone/")) return null
  const href =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(/\/+$/, "")}${location.pathname}`
      : location.pathname || "/"
  return (
    <Helmet prioritizeSeoTags>
      <link rel="canonical" href={href} />
    </Helmet>
  )
}

function RootRedirect() {
  const hasCountry = typeof window !== "undefined" && localStorage.getItem("selected-country-code")
  const savedLang = typeof window !== "undefined" && localStorage.getItem("preferred-language")
  if (!hasCountry) {
    return <Navigate to="/select-country" replace />
  }
  return <Navigate to={savedLang === "ar" ? "/ae-ar" : "/ae-en"} replace />
}

function CountryLangLayout({ lazyFallback }) {
  const { countryLang } = useParams()

  if (
    countryLang === "admin" ||
    countryLang === "superadmin" ||
    countryLang === "grabiansadmin" ||
    countryLang === "grabiansuperadmin"
  ) {
    if (countryLang === "superadmin") {
      return (
        <Suspense fallback={lazyFallback}>
          <SuperAdminPortal />
        </Suspense>
      )
    }
    if (countryLang === "grabiansadmin") {
      return (
        <Suspense fallback={lazyFallback}>
          <AdminLogin />
        </Suspense>
      )
    }
    if (countryLang === "grabiansuperadmin") {
      return (
        <Suspense fallback={lazyFallback}>
          <SuperAdminLogin />
        </Suspense>
      )
    }
    return (
      <Suspense fallback={lazyFallback}>
        <AdminPortal />
      </Suspense>
    )
  }

  return (
    <>
      <RouteCanonical />
      <Layout />
    </>
  )
}

function App() {
  const lazyFallback = (
    <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>
  )

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CurrencyProvider>
              <LoyaltyProvider>
              <Router>
                <LanguageProvider>
                <DefaultCanonical />
                <ScrollToTop />
                <LoyaltyRewardDialog />
                <ReturnPathTracker />
                <RedirectHandler />
                <div className="App">
                  <Suspense fallback={lazyFallback}>
                  <Routes>
                    {/* Country Selector Landing Page (Directly on root / with no slug) */}
                    <Route index element={<CountrySelector />} />
                    <Route path="/" element={<CountrySelector />} />
                    <Route path="/select-country" element={<CountrySelector />} />
                  

                  
                  {/* Super Admin Portal Routes (separate green-themed portal) */}
                  <Route
                    path="/grabiansuperadmin/login"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <SuperAdminLogin />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/superadmin/*"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <SuperAdminPortal />
                      </Suspense>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/grabiansadmin/login"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <AdminLogin />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <Suspense fallback={lazyFallback}>
                        <AdminPortal />
                      </Suspense>
                    }
                  />

                  {/* Public Routes with Dynamic Country & Language Prefix (e.g. /sa-en, /sa-ar, /qa-en, /om-en, /kw-en, /bh-en, /eg-en, /ae-en) */}
                  <Route
                    path="/:countryLang/*"
                    element={<CountryLangLayout lazyFallback={lazyFallback} />}
                  >
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="shop/:parentCategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3" element={<Shop />} />
                    <Route
                      path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product-category" element={<Shop />} />
                    <Route path="product-category/:parentCategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3"
                      element={<Shop />}
                    />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<EmailVerification />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="about" element={<About />} />
                    <Route path="blogs" element={<BlogList />} />
                    <Route path="blogs/:slug" element={<BlogPost />} />
                    <Route path="privacy-policy" element={<PrivacyAndPolicy />} />
                    <Route path="privacy-policy-arabic" element={<ArabicContent />} />
                    <Route path="disclaimer-policy" element={<DisclaimerPolicy />} />
                    <Route path="terms-conditions" element={<TermAndCondition />} />
                    <Route path="refund-return" element={<RefundAndReturn />} />
                    <Route path="cookies-policy" element={<CookiesAndPolicy />} />
                    <Route path="bulk-purchase" element={<ReqBulkPurchase />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="guest" element={<Guest />} />
                    <Route path="guest-order" element={<GuestOrder />} />
                    <Route path="payment/success" element={<PaymentSuccess />} />
                    <Route path="payment/cancel" element={<PaymentCancel />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="green-friday-promotional" element={<PromotionalPage />} />
                    <Route path="backtoschool-acer-professional" element={<BackToSchoolProfessional />} />
                    <Route path="voucher-terms" element={<VoucherTerms />} />
                    <Route path="delivery-terms" element={<DeliveryTerms />} />
                    <Route path="offers/:slug" element={<OfferPage />} />
                    <Route path="gaming-zone/:slug" element={<GamingZonePage />} />

                    {/* Protected Routes */}
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute>
                          <UserOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Public Routes with Language Prefix (Arabic) */}
                  <Route
                    path="/ae-ar/*"
                    element={
                      <>
                        <RouteCanonical />
                        <Layout />
                      </>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="shop/:parentCategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3" element={<Shop />} />
                    <Route
                      path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product-category" element={<Shop />} />
                    <Route path="product-category/:parentCategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3"
                      element={<Shop />}
                    />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<EmailVerification />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="about" element={<About />} />
                    <Route path="blogs" element={<BlogList />} />
                    <Route path="blogs/:slug" element={<BlogPost />} />
                    <Route path="privacy-policy" element={<PrivacyAndPolicy />} />
                    <Route path="privacy-policy-arabic" element={<ArabicContent />} />
                    <Route path="disclaimer-policy" element={<DisclaimerPolicy />} />
                    <Route path="terms-conditions" element={<TermAndCondition />} />
                    <Route path="refund-return" element={<RefundAndReturn />} />
                    <Route path="cookies-policy" element={<CookiesAndPolicy />} />
                    <Route path="bulk-purchase" element={<ReqBulkPurchase />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="guest" element={<Guest />} />
                    <Route path="guest-order" element={<GuestOrder />} />
                    <Route path="payment/success" element={<PaymentSuccess />} />
                    <Route path="payment/cancel" element={<PaymentCancel />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="green-friday-promotional" element={<PromotionalPage />} />
                    <Route path="backtoschool-acer-professional" element={<BackToSchoolProfessional />} />
                    <Route path="voucher-terms" element={<VoucherTerms />} />
                    <Route path="delivery-terms" element={<DeliveryTerms />} />
                    <Route path="offers/:slug" element={<OfferPage />} />
                    <Route path="gaming-zone/:slug" element={<GamingZonePage />} />

                    {/* Protected Routes */}
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute>
                          <UserOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Fallback for old routes without language prefix - redirect to English */}
                  <Route
                    path="*"
                    element={
                      <>
                        <RouteCanonical />
                        <Layout />
                      </>
                    }
                  >
                    <Route path="shop" element={<Shop />} />
                    <Route path="shop/:parentCategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3" element={<Shop />} />
                    <Route
                      path="shop/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product-category" element={<Shop />} />
                    <Route path="product-category/:parentCategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory" element={<Shop />} />
                    <Route path="product-category/:parentCategory/:subcategory/:subcategory2" element={<Shop />} />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3"
                      element={<Shop />}
                    />
                    <Route
                      path="product-category/:parentCategory/:subcategory/:subcategory2/:subcategory3/:subcategory4"
                      element={<Shop />}
                    />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<EmailVerification />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="about" element={<About />} />
                    <Route path="blogs" element={<BlogList />} />
                    <Route path="blogs/:slug" element={<BlogPost />} />
                    <Route path="privacy-policy" element={<PrivacyAndPolicy />} />
                    <Route path="privacy-policy-arabic" element={<ArabicContent />} />
                    <Route path="disclaimer-policy" element={<DisclaimerPolicy />} />
                    <Route path="terms-conditions" element={<TermAndCondition />} />
                    <Route path="refund-return" element={<RefundAndReturn />} />
                    <Route path="cookies-policy" element={<CookiesAndPolicy />} />
                    <Route path="bulk-purchase" element={<ReqBulkPurchase />} />
                    <Route path="contact" element={<ContactUs />} />
                    <Route path="guest" element={<Guest />} />
                    <Route path="guest-order" element={<GuestOrder />} />
                    <Route path="payment/success" element={<PaymentSuccess />} />
                    <Route path="payment/cancel" element={<PaymentCancel />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="green-friday-promotional" element={<PromotionalPage />} />
                    <Route path="backtoschool-acer-professional" element={<BackToSchoolProfessional />} />
                    <Route path="voucher-terms" element={<VoucherTerms />} />
                    <Route path="delivery-terms" element={<DeliveryTerms />} />
                    <Route path="offers/:slug" element={<OfferPage />} />
                    <Route path="gaming-zone/:slug" element={<GamingZonePage />} />

                    {/* Protected Routes */}
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute>
                          <UserOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
                </Suspense>
              </div>
            </LanguageProvider>
          </Router>
              </LoyaltyProvider>
          </CurrencyProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
