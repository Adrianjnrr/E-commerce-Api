const Order = require("../model/orderModel");
const catchAsync = require("../utils/catchAsync");
const Products = require("../model/productModel");

exports.getRevenueStats = catchAsync(async (req, res, next) => {
  const revenueStats = await Order.aggregate([
    {
      $match: { status: "delivered" },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalOrder: { $sum: 1 },
        avgOrderedValue: { $avg: "$totalPrice" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: revenueStats,
  });
});

exports.getTopProducts = catchAsync(async (req, res, next) => {
  const topProducts = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },

    { $unwind: "$productDetails" },

    {
      $project: {
        _id: 1,
        name: "$productDetails.name",
        price: "$productDetails.price",
        totalSold: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: topProducts.length,
    data: topProducts,
  });
});

exports.getTopCustomers = catchAsync(async (req, res, next) => {
  const topCustomer = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$totalPrice" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },

    {
      $project: {
        _id: 1,
        name: "$userDetails.name",
        email: "$userDetails.email",
        totalSpent: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: topCustomer.length,
    data: topCustomer,
  });
});

exports.getlowStocks = catchAsync(async (req, res, next) => {
  const lowStocks = await Products.find({
    stock: { $lt: 10 },
  }).select("name stock");

  res.status(200).json({
    status: "success",
    result: lowStocks.length,
    data: lowStocks,
  });
});

exports.getTotalOrderByStatus = catchAsync(async (req, res, next) => {
  const orderStatus = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { totalOrders: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    results: orderStatus.length,
    data: orderStatus,
  });
});

exports.getHighestRatingProduct = catchAsync(async (req, res, next) => {
  const highestRatingProduct = await Products.aggregate([
    {
      $match: { ratings: { $gt: 0 } },
    },
    {
      $sort: { ratings: -1 },
    },
    { $limit: 5 },

    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        ratings: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: highestRatingProduct.length,
    data: highestRatingProduct,
  });
});
