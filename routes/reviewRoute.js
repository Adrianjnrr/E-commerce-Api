const express = require("express");
const reviewsController = require("../controllers/reviewsController");
const authController = require("../controllers/authController");

const reviewRoute = express.Router({ mergeParams: true });

reviewRoute.use(authController.protect);

reviewRoute
  .route("/")
  .post(
    authController.restrictTo("user"),
    reviewsController.setProductUserId,
    reviewsController.createReviews,
  )
  .get(reviewsController.getAllReviews);

reviewRoute
  .route("/:id")
  .patch(
    authController.restrictTo("user", "admin"),
    reviewsController.updateReviews,
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewsController.deleteReview,
  );

module.exports = reviewRoute;
