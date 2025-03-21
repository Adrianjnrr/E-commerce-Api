const Category = require("../model/categoryModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./factoryHandler");

exports.getAllCategory = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .pagination();
  const categories = await features.query;
  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});

exports.getCategory = factory.getOne(Category);
exports.createCategory = factory.createOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
