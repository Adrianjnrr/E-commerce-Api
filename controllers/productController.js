const Products = require("../model/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Category = require("../model/categoryModel");
const factory = require("./factoryHandler");

exports.getProductByCategory = catchAsync(async (req, res, next) => {
  const { categoryName } = req.params;
  const category = await Category.findOne({ name: categoryName });
  if (!category) {
    return next(new AppError("There is no category found", 404));
  }
  const product = await Products.find({ category: category._id }).setOptions({
    populateReviews: true,
  });
  res.status(200).json({
    status: "success",

    data: product,
  });
});

exports.getProducts = factory.getAll(Products);
exports.getProductById = factory.getOne(Products, { path: "reviews" });
exports.createProduct = factory.createOne(Products);
exports.updateProduct = factory.updateOne(Products);
exports.deleteProduct = factory.deleteOne(Products);
