const express = require("express");
const authController = require("../controllers/authController");
const wishListController = require("../controllers/wishLishController");

const wishlistRoute = express.Router();

wishlistRoute
  .route("/add-to-wishlist")
  .post(authController.protect, wishListController.addToWishList);

wishlistRoute
  .route("/wish-list")
  .get(authController.protect, wishListController.getWishList);

wishlistRoute
  .route("/:id/remove-wishlist")
  .delete(authController.protect, wishListController.removeWishlist);

wishlistRoute
  .route("/:id/delete-wishlist")
  .delete(authController.protect, wishListController.deleteWishlist);

module.exports = wishlistRoute;
