const express = require("express");
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(categoryController.getAllCategory);
router.route("/:id").get(categoryController.getCategory);

router.use(authController.protect, authController.restrictTo("admin"));

router.route("/").post(categoryController.createCategory);

router
  .route("/:id")
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
