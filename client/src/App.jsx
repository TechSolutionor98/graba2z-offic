import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { ToastProvider } from "./context/ToastContext"

// Import components
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import ScrollToTop from "./components/ScrollToTop"
import RedirectHandler from "./components/RedirectHandler"
import CreateOrder from "./pages/admin/CreateOrder"

import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"

// Import admin components
import AdminHeader from "./components/admin/AdminHeader"
import AdminSidebar from "./components/admin/AdminSidebar"

// Import pages
import Home from "./pages/Home"
import Shop from "./pages/Shop"
import ProductDetails from "./pages/ProductDetails"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import EmailVerification from "./pages/EmailVerification"
import Profile from "./pages/Profile"
import UserOrders from "./pages/UserOrders"
import Wishlist from "./pages/Wishlist"
import TrackOrder from "./pages/TrackOrder"
import About from "./pages/About"
import BlogList from "./pages/BlogList"
import BlogPost from "./pages/BlogPost"
import PrivacyAndPolicy from "./pages/PrivacyAndPolicy"
import ArabicContent from "./pages/ArabicContent"
import DisclaimerPolicy from "./pages/DisclaimerPolicy"
import TermAndCondition from "./pages/TermAndCondition"
import RefundAndReturn from "./pages/RefundAndReturn"
import CookiesAndPolicy from "./pages/CookiesAndPolicy"
import ReqBulkPurchase from "./pages/ReqBulkPurchase"
import ContactUs from "./pages/ContactUs"
import NotFound from "./pages/NotFound"
import GuestOrder from "./pages/GuestOrder"
import Guest from "./pages/Guest"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentCancel from "./pages/PaymentCancel"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import PromotionalPage from "./pages/PromotionalPage"
import BackToSchoolProfessional from "./pages/BackToSchoolProfessional"
import VoucherTerms from "./pages/VoucherTerms"
import DeliveryTerms from "./pages/DeliveryTerms"
import OfferPage from "./pages/OfferPage"
import GamingZonePage from "./pages/GamingZonePage"

// Import admin pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminCategorySlider from "./pages/admin/AdminCategorySlider"
import AdminBrands from "./pages/admin/AdminBrands"
import AdminColors from "./pages/admin/AdminColors"
import AdminSizes from "./pages/admin/AdminSizes"
import AdminUnits from "./pages/admin/AdminUnits"
import AdminVolumes from "./pages/admin/AdminVolumes"
import AdminWarranty from "./pages/admin/AdminWarranty"
import AdminTax from "./pages/admin/AdminTax"
import AllCoupons from "./pages/admin/AllCoupons"
import AdminBanners from "./pages/admin/AdminBanners"
import AdminBannerCards from "./pages/admin/AdminBannerCards"
import AddBannerCard from "./pages/admin/AddBannerCard"
import AddHomeSection from "./pages/admin/AddHomeSection"
import OfferPages from "./pages/admin/OfferPages"
import AddOfferPage from "./pages/admin/AddOfferPage"
import AddOfferProduct from "./pages/admin/AddOfferProduct"
import AddOfferBrand from "./pages/admin/AddOfferBrand"
import AddOfferCategory from "./pages/admin/AddOfferCategory"
import GamingZonePages from "./pages/admin/GamingZonePages"
import AddGamingZonePage from "./pages/admin/AddGamingZonePage"
import AddGamingZoneBrand from "./pages/admin/AddGamingZoneBrand"
import AddGamingZoneCategory from "./pages/admin/AddGamingZoneCategory"
import AdminDeliveryCharges from "./pages/admin/AdminDeliveryCharges"
import AdminSettings from "./pages/admin/AdminSettings"
import AdminBlogs from "./pages/admin/AdminBlogs"
import AdminRequestCallbacks from "./pages/admin/AdminRequestCallbacks"
import AdminBulkPurchase from "./pages/admin/AdminBulkPurchase"
import BuyerProtectionAdmin from "./pages/admin/BuyerProtectionAdmin"
import AdminSubCategories from "./pages/admin/AdminSubCategories"
import AdminSubCategories2 from "./pages/admin/AdminSubCategories2"
import AdminSubCategories3 from "./pages/admin/AdminSubCategories3"
import AdminSubCategories4 from "./pages/admin/AdminSubCategories4"
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates"
import AdminNewsletter from "./pages/admin/AdminNewsletter"
import ResetCache from "./pages/admin/ResetCache"

// Add review management imports
import AdminReviews from "./pages/admin/AdminReviews"
import AdminReviewsPending from "./pages/admin/AdminReviewsPending"
import AdminReviewsApproved from "./pages/admin/AdminReviewsApproved"
import AdminReviewsRejected from "./pages/admin/AdminReviewsRejected"

// Add other admin pages as needed
import AddProduct from "./pages/admin/AddProduct"
import AddCategory from "./pages/admin/AddCategory"
import AddSubCategory from "./pages/admin/AddSubCategory"
import AddBrand from "./pages/admin/AddBrand"
import AddColor from "./pages/admin/AddColor"
import AddSize from "./pages/admin/AddSize"
import AddUnit from "./pages/admin/AddUnit"
import AddVolume from "./pages/admin/AddVolume"
import AddWarranty from "./pages/admin/AddWarranty"
import AddTax from "./pages/admin/AddTax"
import AddDeliveryCharge from "./pages/admin/AddDeliveryCharge"
import AddBlog from "./pages/admin/AddBlog"
import EditBlog from "./pages/admin/EditBlog"
import AddBlogCategory from "./pages/admin/AddBlogCategory"
import AddBlogTopic from "./pages/admin/AddBlogTopic"
import BlogCategories from "./pages/admin/BlogCategories"
import BlogTopics from "./pages/admin/BlogTopics"
import BlogRating from "./pages/admin/BlogRating"
import AddBulkProducts from "./pages/admin/AddBulkProducts"
import EditCategory from "./pages/admin/EditCategory"
import EditSubCategory from "./pages/admin/EditSubCategory"
import AdminSEOSettings from "./pages/admin/AdminSEOSettings"

// Order status pages
import ReceivedOrders from "./pages/admin/ReceivedOrders"
import InprogressOrders from "./pages/admin/InprogressOrders"
import ReadyForShipment from "./pages/admin/ReadyForShipment"
import OnTheWay from "./pages/admin/OnTheWay"
import Delivered from "./pages/admin/Delivered"
import OnHold from "./pages/admin/OnHold"
import Rejected from "./pages/admin/Rejected"
import OnlineOrders from "./pages/admin/OnlineOrders"
import TrashCategories from "./pages/admin/TrashCategories"
import TrashSubCategories from "./pages/admin/TrashSubCategories"

import NewOrders from "./pages/admin/NewOrders"
import ConfirmedOrders from "./pages/admin/ConfirmedOrders"
import ProcessingOrders from "./pages/admin/ProcessingOrders"
import OnHoldOrders from "./pages/admin/OnHoldOrders"
import CancelledOrders from "./pages/admin/CancelledOrders"
import DeletedOrders from "./pages/admin/DeletedOrders"
import CriticalOrders from "./pages/admin/CriticalOrders"

// Stock Adjustment page imports
import PriceAdjustment from "./pages/admin/PriceAdjustment"
import PriceAdjustmentReports from "./pages/admin/PriceAdjustmentReports"

function DefaultCanonical() {
  const location = useLocation()
  if (location.pathname !== "/") {
    return null
  }
  const href = typeof window !== "undefined" ? `${window.location.origin.replace(/\/+$/, "")}/` : "/"
  return (
    <Helmet prioritizeSeoTags>
      {/* Default Site Title can be adjusted by SEO team */}
      <title>Grabatoz</title>
      <link rel="canonical" href={href} />
    </Helmet>
  )
}

function RouteCanonical() {
  const location = useLocation()
  if (location.pathname === "/") return null
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

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <DefaultCanonical />
              <ScrollToTop />
              <RedirectHandler />
              <div className="App">
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/grabiansadmin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <div className="min-h-screen bg-gray-100">
                          <AdminSidebar />
                          <AdminHeader />
                          <div className=" ">
                            <Routes>
                              <Route path="dashboard" element={<AdminDashboard />} />
                              <Route path="products" element={<AdminProducts />} />
                              <Route path="products/add" element={<AddProduct />} />
                              <Route path="products/bulk-add" element={<AddBulkProducts />} />
                              <Route path="orders" element={<AdminOrders />} />
                              <Route path="orders/received" element={<ReceivedOrders />} />
                              <Route path="orders/in-progress" element={<InprogressOrders />} />
                              <Route path="orders/ready-for-shipment" element={<ReadyForShipment />} />
                              <Route path="orders/on-the-way" element={<OnTheWay />} />
                              <Route path="orders/delivered" element={<Delivered />} />
                              <Route path="orders/on-hold" element={<OnHold />} />
                              <Route path="orders/rejected" element={<Rejected />} />
                              <Route path="orders/online" element={<OnlineOrders />} />

                              {/* Review Management Routes */}
                              <Route path="reviews" element={<AdminReviews />} />
                              <Route path="reviews/pending" element={<AdminReviewsPending />} />
                              <Route path="reviews/approved" element={<AdminReviewsApproved />} />
                              <Route path="reviews/rejected" element={<AdminReviewsRejected />} />

                              <Route path="users" element={<AdminUsers />} />
                              <Route path="categories" element={<AdminCategories />} />
                              <Route path="categories/add" element={<AddCategory />} />
                              <Route path="categories/edit/:id" element={<EditCategory />} />
                              <Route path="categories/trash" element={<TrashCategories />} />
                              <Route path="categories/slider" element={<AdminCategorySlider />} />
                              <Route path="subcategories" element={<AdminSubCategories />} />
                              <Route path="subcategories/add" element={<AddSubCategory />} />
                              <Route path="subcategories/edit/:id" element={<EditSubCategory />} />
                              <Route path="subcategories/trash" element={<TrashSubCategories />} />
                              <Route path="subcategories-2" element={<AdminSubCategories2 />} />
                              <Route path="subcategories-2/add" element={<AddSubCategory />} />
                              <Route path="subcategories-2/edit/:id" element={<EditSubCategory />} />
                              <Route path="subcategories-3" element={<AdminSubCategories3 />} />
                              <Route path="subcategories-3/add" element={<AddSubCategory />} />
                              <Route path="subcategories-3/edit/:id" element={<EditSubCategory />} />
                              <Route path="subcategories-4" element={<AdminSubCategories4 />} />
                              <Route path="subcategories-4/add" element={<AddSubCategory />} />
                              <Route path="subcategories-4/edit/:id" element={<EditSubCategory />} />
                              <Route path="brands" element={<AdminBrands />} />
                              <Route path="brands/add" element={<AddBrand />} />
                              <Route path="edit-brand/:id" element={<AddBrand />} />
                              <Route path="colors" element={<AdminColors />} />
                              <Route path="colors/add" element={<AddColor />} />
                              <Route path="sizes" element={<AdminSizes />} />
                              <Route path="sizes/add" element={<AddSize />} />
                              <Route path="units" element={<AdminUnits />} />
                              <Route path="units/add" element={<AddUnit />} />
                              <Route path="volumes" element={<AdminVolumes />} />
                              <Route path="volumes/add" element={<AddVolume />} />
                              <Route path="warranty" element={<AdminWarranty />} />
                              <Route path="warranty/add" element={<AddWarranty />} />
                              <Route path="tax" element={<AdminTax />} />
                              <Route path="tax/add" element={<AddTax />} />
                              <Route path="coupons" element={<AllCoupons />} />
                              <Route path="coupons/all" element={<AllCoupons />} />
                              <Route path="banners" element={<AdminBanners />} />
                              <Route path="banner-cards" element={<AdminBannerCards />} />
                              <Route path="banner-cards/add" element={<AddBannerCard />} />
                              <Route path="banner-cards/edit/:id" element={<AddBannerCard />} />
                              <Route path="home-sections" element={<AdminBannerCards />} />
                              <Route path="home-sections/add" element={<AddHomeSection />} />
                              <Route path="home-sections/edit/:id" element={<AddHomeSection />} />
                              <Route path="offer-pages" element={<OfferPages />} />
                              <Route path="offer-pages/add" element={<AddOfferPage />} />
                              <Route path="offer-pages/edit/:id" element={<AddOfferPage />} />
                              <Route path="offer-products/add" element={<AddOfferProduct />} />
                              <Route path="offer-products/edit/:id" element={<AddOfferProduct />} />
                              <Route path="offer-brands/add" element={<AddOfferBrand />} />
                              <Route path="offer-brands/edit/:id" element={<AddOfferBrand />} />
                              <Route path="offer-categories/add" element={<AddOfferCategory />} />
                              <Route path="offer-categories/edit/:id" element={<AddOfferCategory />} />
                              <Route path="gaming-zone" element={<GamingZonePages />} />
                              <Route path="gaming-zone/add" element={<AddGamingZonePage />} />
                              <Route path="gaming-zone/edit/:id" element={<AddGamingZonePage />} />
                              <Route path="gaming-zone-brands/add" element={<AddGamingZoneBrand />} />
                              <Route path="gaming-zone-brands/edit/:id" element={<AddGamingZoneBrand />} />
                              <Route path="gaming-zone-categories/add" element={<AddGamingZoneCategory />} />
                              <Route path="gaming-zone-categories/edit/:id" element={<AddGamingZoneCategory />} />
                              <Route path="delivery-charges" element={<AdminDeliveryCharges />} />
                              <Route path="delivery-charges/add" element={<AddDeliveryCharge />} />
                              <Route path="settings" element={<AdminSettings />} />
                              <Route path="blogs" element={<AdminBlogs />} />
                              <Route path="blogs/add" element={<AddBlog />} />
                              <Route path="blogs/edit/:id" element={<EditBlog />} />
                              <Route path="blogs/categories" element={<BlogCategories />} />
                              <Route path="blogs/categories/add" element={<AddBlogCategory />} />
                              <Route path="blogs/topics" element={<BlogTopics />} />
                              <Route path="blogs/topics/add" element={<AddBlogTopic />} />
                              <Route path="blogs/rating" element={<BlogRating />} />
                              <Route path="request-callbacks" element={<AdminRequestCallbacks />} />
                              <Route path="bulk-purchase" element={<AdminBulkPurchase />} />
                              <Route path="buyer-protection" element={<BuyerProtectionAdmin />} />
                              <Route path="email-templates" element={<AdminEmailTemplates />} />
                              <Route path="newsletter-subscribers" element={<AdminNewsletter />} />
                              <Route path="reset-cache" element={<ResetCache />} />
                              <Route path="*" element={<NotFound />} />

                              {/* SEO Settings Routes */}
                              <Route path="seo-settings/redirects" element={<AdminSEOSettings />} />

                              {/* Stock Adjustment routes */}
                              <Route path="stock-adjustment/price-adjustment" element={<PriceAdjustment />} />
                              <Route path="stock-adjustment/reports" element={<PriceAdjustmentReports />} />

                              {/* New Order Status Routes */}
                              <Route path="orders/new" element={<NewOrders />} />
                              <Route path="orders/confirmed" element={<ConfirmedOrders />} />
                              <Route path="orders/processing" element={<ProcessingOrders />} />
                              <Route path="orders/on-hold" element={<OnHoldOrders />} />
                              <Route path="orders/cancelled" element={<CancelledOrders />} />
                              <Route path="orders/deleted" element={<DeletedOrders />} />
                              <Route path="orders/critical" element={<CriticalOrders />} />

                              <Route path="orders/create" element={<CreateOrder />} />
                            </Routes>
                          </div>
                        </div>
                      </AdminRoute>
                    }
                  />

                  {/* Public Routes */}
                  <Route
                    path="*"
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
                </Routes>
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
