const mongoose = require("mongoose");
const WishList = require("../model/wishListModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.addToWishList = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  let wishlist = await WishList.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new WishList({ user: userId, products: [] });
  }

  const product = new mongoose.Types.ObjectId(productId);

  if (wishlist.products.find((item) => item.equals(product))) {
    return next(new AppError("Product already in wishlist", 400));
  }

  wishlist.products.push(product);
  await wishlist.save();
  res.status(200).json({
    status: "success",
    message: "Product added to wishlist",
    data: wishlist,
  });
});

exports.getWishList = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const wishlist = await WishList.findOne({ user: userId });
  if (!wishlist) {
    return next(new AppError("No wishlish found", 404));
  }
  res.status(200).json({
    status: "success",
    data: wishlist,
  });
});

exports.removeWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const wishlist = await WishList.findOne({ user: userId });
  if (!wishlist) {
    return next(new AppError("No wishlist found", 404));
  }
  const productId = new mongoose.Types.ObjectId(req.params.id);

  wishlist.products = wishlist.products.filter(
    (product) => !product.equals(productId),
  );

  await wishlist.save();

  res.status(200).json({
    status: "success",
    message: "Product removed successfully",
    data: wishlist,
  });
});

exports.deleteWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const wishlistId = new mongoose.Types.ObjectId(req.params.id);

  const wishlist = await WishList.findOne({
    user: userId,
    _id: wishlistId,
  });
  if (!wishlist) {
    return next(new AppError("No wishlist found", 404));
  }
  await wishlist.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
