const express = require("express");
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");

const orderRoute = express.Router();

orderRoute
  .route("/admin")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.getAllOrderAdmin,
  );

orderRoute
  .route("/")
  .post(authController.protect, orderController.processOrder);

orderRoute
  .route("/user-order")
  .get(authController.protect, orderController.getUserOrderd);

orderRoute
  .route("/admin/:orderId/status")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.updateOrderStatus,
  );

orderRoute
  .route("/:orderId/cancel")
  .patch(authController.protect, orderController.cancelOrder);
module.exports = orderRoute;
