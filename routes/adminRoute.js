const express = require("express");
const {
  getRevenueStats,
  getTopProducts,
  getTopCustomers,
  getlowStocks,
  getTotalOrderByStatus,
  getHighestRatingProduct,
} = require("../controllers/adminStatsController");
const authController = require("../controllers/authController");

const adminRoute = express.Router();

//Middleware for admin restriction route
adminRoute.use(authController.protect, authController.restrictTo("admin"));

adminRoute.route("/stats/revenue").get(getRevenueStats);
adminRoute.route("/best-selling").get(getTopProducts);
adminRoute.route("/top-customers").get(getTopCustomers);
adminRoute.route("/low-stock").get(getlowStocks);
adminRoute.route("/order-status").get(getTotalOrderByStatus);
adminRoute.route("/high-ratings").get(getHighestRatingProduct);

module.exports = adminRoute;
