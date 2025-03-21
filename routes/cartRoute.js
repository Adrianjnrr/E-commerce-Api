const express = require("express");
const cartController = require("../controllers/cartController");
const authController = require("../controllers/authController");

const cartRoute = express.Router();

cartRoute
  .route("/add-to-cart")
  .post(authController.protect, cartController.addToCart);

cartRoute
  .route("/userCart")
  .get(authController.protect, cartController.getCart);

cartRoute
  .route("/userCart/update-quantity")
  .patch(authController.protect, cartController.updateCartQuantity);

cartRoute
  .route("/userCart/delete-user")
  .delete(authController.protect, cartController.deleteUserCart);
module.exports = cartRoute;
