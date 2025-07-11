import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import config from "./config/config.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"

// Routes
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import subCategoryRoutes from "./routes/subCategoryRoutes.js"
import brandRoutes from "./routes/brandRoutes.js"
import colorRoutes from "./routes/colorRoutes.js"
import sizeRoutes from "./routes/sizeRoutes.js"
import unitRoutes from "./routes/unitRoutes.js"
import volumeRoutes from "./routes/volumeRoutes.js"
import warrantyRoutes from "./routes/warrantyRoutes.js"
import taxRoutes from "./routes/taxRoutes.js"
import deliveryChargeRoutes from "./routes/deliveryChargeRoutes.js"
import couponRoutes from "./routes/couponRoutes.js"
import bannerRoutes from "./routes/bannerRoutes.js"
import blogRoutes from "./routes/blogRoutes.js"
import blogCategoryRoutes from "./routes/blogCategoryRoutes.js"
import blogTopicRoutes from "./routes/blogTopicRoutes.js"
import blogRatingRoutes from "./routes/blogRatingRoutes.js"
import settingsRoutes from "./routes/settingsRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js"
import requestCallbackRoutes from "./routes/requestCallbackRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"

dotenv.config()

// Connect to database
connectDB()

const app = express()

// // CORS configuration
// app.use(cors({
//   // origin: 'https://graba2z-official.vercel.app',
//     origin: 'http://localhost:3000',
//   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
//   exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//   maxAge: 5,
//   credentials: true,
//   keepHeadersOnError: true
// }));








// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://graba2z-official.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  keepHeadersOnError: true
}));













// Body parser middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Routes
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/subcategories", subCategoryRoutes)
app.use("/api/brands", brandRoutes)
app.use("/api/colors", colorRoutes)
app.use("/api/sizes", sizeRoutes)
app.use("/api/units", unitRoutes)
app.use("/api/volumes", volumeRoutes)
app.use("/api/warranties", warrantyRoutes)
app.use("/api/taxes", taxRoutes)
app.use("/api/delivery-charges", deliveryChargeRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/banners", bannerRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/blog-categories", blogCategoryRoutes)
app.use("/api/blog-topics", blogTopicRoutes)
app.use("/api/blog-ratings", blogRatingRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/request-callback", requestCallbackRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/admin", adminRoutes)

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "GrabA2Z API is running!",
    version: "1.0.0",
    environment: config.NODE_ENV,
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

const PORT = config.PORT

app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`)
})
