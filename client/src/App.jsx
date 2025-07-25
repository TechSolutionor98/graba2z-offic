import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { ToastProvider } from "./context/ToastContext"

// Import components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import ScrollToTop from "./components/ScrollToTop"
import CacheStatus from "./components/CacheStatus"

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
import TermAndCondition from "./pages/TermAndCondition"
import RefundAndReturn from "./pages/RefundAndReturn"
import CookiesAndPolicy from "./pages/CookiesAndPolicy"
import ReqBulkPurchase from "./pages/ReqBulkPurchase";
import ContactUs from "./pages/ContactUs"
import NotFound from "./pages/NotFound";
import GuestOrder from "./pages/GuestOrder";
import Guest from "./pages/Guest"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentCancel from "./pages/PaymentCancel"

// Import admin pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminBrands from "./pages/admin/AdminBrands"
import AdminColors from "./pages/admin/AdminColors"
import AdminSizes from "./pages/admin/AdminSizes"
import AdminUnits from "./pages/admin/AdminUnits"
import AdminVolumes from "./pages/admin/AdminVolumes"
import AdminWarranty from "./pages/admin/AdminWarranty"
import AdminTax from "./pages/admin/AdminTax"
import AllCoupons from "./pages/admin/AllCoupons"
import AdminBanners from "./pages/admin/AdminBanners"
import AdminDeliveryCharges from "./pages/admin/AdminDeliveryCharges"
import AdminSettings from "./pages/admin/AdminSettings"
import AdminBlogs from "./pages/admin/AdminBlogs"
import AdminRequestCallbacks from "./pages/admin/AdminRequestCallbacks"
import AdminSubCategories from "./pages/admin/AdminSubCategories"
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminNewsletter from "./pages/admin/AdminNewsletter";

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
import EditCategory from "./pages/admin/EditCategory";

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

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <div className="App">
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/grabiansadmin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
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
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="categories/add" element={<AddCategory />} />
                          <Route path="categories/edit/:id" element={<EditCategory />} />
                          <Route path="categories/trash" element={<TrashCategories />} />
                          <Route path="subcategories" element={<AdminSubCategories />} />
                          <Route path="subcategories/add" element={<AddSubCategory />} />
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
                          <Route path="email-templates" element={<AdminEmailTemplates />} />
                          <Route path="newsletter-subscribers" element={<AdminNewsletter />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                     
                      </AdminRoute>
                    }
                  />

                  {/* Public Routes */}
                  <Route
                    path="/*"
                    element={
                      <>
                        <Navbar />
                        <CacheStatus />
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/shop" element={<Shop />} />
                          <Route path="/product/:slug" element={<ProductDetails />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/verify-email" element={<EmailVerification />} />
                          <Route path="/track-order" element={<TrackOrder />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/blogs" element={<BlogList />} />
                          <Route path="/blog/:id" element={<BlogPost />} />
                          <Route path="/privacy-policy" element={<PrivacyAndPolicy />} />
                          <Route path="/terms-conditions" element={<TermAndCondition />} />
                          <Route path="/refund-return" element={<RefundAndReturn />} />
                          <Route path="/cookies-policy" element={<CookiesAndPolicy />} />
                          <Route path="/bulk-purchase" element={<ReqBulkPurchase />} />
                          <Route path="/contact" element={<ContactUs />} />
                          <Route path="/guest" element={<Guest />} />
                          <Route path="/guest-order" element={<GuestOrder />} />
                          <Route path="/payment/success" element={<PaymentSuccess />} />
                          <Route path="/payment/cancel" element={<PaymentCancel />} />
                          {/* Protected Routes */}
                          <Route
                            path="/checkout"
                            element={
                              <ProtectedRoute>
                                <Checkout />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/orders"
                            element={
                              <ProtectedRoute>
                                <UserOrders />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/wishlist"
                            element={
                              <ProtectedRoute>
                                <Wishlist />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <Footer />
                      </>
                    }
                  />
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
