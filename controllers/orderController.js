const mongoose = require("mongoose");
const Cart = require("../model/cartModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Products = require("../model/productModel");
const Order = require("../model/orderModel");

exports.processOrder = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }
  // check stock avaliability for each item
  await Promise.all(
    cart.items.map(async (item) => {
      const product = await Products.findById(item.product._id);
      if (!product) return;
      if (product.stock < item.quantity) {
        return next(
          new AppError(
            `Insufficient stock for ${product.name}. Avaliable ${product.stock}`,
            400,
          ),
        );
      }
      product.stock -= item.quantity;
      await product.save();
    }),
  );

  const order = await Order.create({
    user: userId,
    items: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    })),
    totalPrice: cart.totalPrice,
    status: "pending",
    shippingAddress,
  });
  cart.items = [];
  await cart.save();

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

exports.getUserOrderd = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const order = await Order.findOne({ user: userId }).populate(
    "items.product",
    "name price images description ",
  );

  if (!order) {
    return next(new AppError("No order found", 404));
  }
  const orderObject = order.toObject({ virtuals: false });
  res.status(200).json({
    status: "success",
    data: orderObject,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { orderId } = req.params;

  if (req.user.role !== "admin") {
    return next(
      new AppError("You do not have permission to update the status", 403),
    );
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("No order found", 404));
  }
  order.status = status;
  await order.save();
  res.status(200).json({
    status: "success",
    message: `Order status updated to ${status}`,
    data: order,
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (!order.user.equals(new mongoose.Types.ObjectId(userId))) {
    return next(new AppError("You are not allowed to cancel this order", 403));
  }
  if (order.status === "shipped" || order.status === "delivered") {
    return next(
      new AppError(
        "You can not cancel an order that has already been shipped or delivered",
        400,
      ),
    );
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({
    status: "success",
    message: "Order has been cancelled",
    data: order,
  });
});

exports.getAllOrderAdmin = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate({
    path: "user",
    select: "name email",
  });

  if (orders.length === 0) {
    return next(new AppError("No orders found", 404));
  }
  res.status(200).json({
    status: "success",
    data: orders,
  });
});
