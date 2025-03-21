const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const reviewRoute = require("./reviewRoute");

const router = express.Router();

//nested route for reviews
router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    productController.createProduct,
  );
router.route("/").get(productController.getProducts);

router
  .route("/category/:categoryName")
  .get(productController.getProductByCategory);

router
  .route("/:id")
  .get(productController.getProductById)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    productController.deleteProduct,
  );

module.exports = router;
