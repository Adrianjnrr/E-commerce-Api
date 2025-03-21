const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const productRoute = require("./routes/productRoute");
const AppError = require("./utils/appError");
const globalError = require("./controllers/errorController");
const categoryRoute = require("./routes/categoryRoute");
const userRouter = require("./routes/userRoute");
const reviewRoute = require("./routes/reviewRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const wishlistRoute = require("./routes/wishListRoute");
const adminRoute = require("./routes/adminRoute");

const app = express();
app.use(express.json({ limit: "10kb" }));

app.use(sanitize());

app.use(helmet());

app.use(hpp());

app.use(xss());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(morgan);
}

// Reducing the limit per request from an IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request! Please try again in an hour",
});
app.use("/api", limiter);

app.use("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the API!",
  });
});
// Route middleware
app.use("/api/v1/products", productRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/admin", adminRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} path on this server`, 404));
});
app.use(globalError);

module.exports = app;
