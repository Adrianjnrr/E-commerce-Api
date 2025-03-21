const mongoose = require("mongoose");
const Cart = require("../model/cartModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Products = require("../model/productModel");

exports.addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { product, quantity } = req.body;

  if (!product) {
    return next(new AppError("No product found", 404));
  }

  //Converting productID from req.body to an ObjectID so we can compare if the product already exist in cart
  const productId = mongoose.Types.ObjectId(product);

  const foundProduct = await Products.findById(productId);

  if (!foundProduct) {
    return next(new AppError("No product found", 404));
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingProduct = cart.items.find((item) =>
    item.product.equals(productId),
  );

  if (existingProduct) {
    existingProduct.quantity += quantity || 1;
  } else {
    cart.items.push({
      product: productId,
      quantity: quantity || 1,
    });
  }
  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.quantity * foundProduct.price,
    0,
  );
  await cart.save();

  const cartObject = cart.toObject({ virtuals: false });
  res.status(200).json({
    status: "success",
    message: "Item added to cart",
    data: { cart: cartObject },
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(200).json({
      status: "success",
      message: "Your cart is empty",
      cart: {
        totalPrice: 0,
        items: [],
      },
    });
  }
  if (cart.items.length === 0) {
    return res.status(200).json({
      status: "success",
      message: "Your cart is empty",
      cart: {
        _id: cart._id,
        user: cart.user,
        totalPrice: 0,
        items: [],
      },
    });
  }
  const cartObject = cart.toObject({ virtuals: false });
  res.status(200).json({
    status: "success",
    cart: { cartObject },
  });
});

exports.updateCartQuantity = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { product, action } = req.body;

  if (!product) return next(new AppError("product and are required", 400));

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("No cart found", 404));
  }

  const productId = new mongoose.Types.ObjectId(product);

  const cartItem = cart.items.find((item) => item.product.equals(productId));

  if (!cartItem) {
    return next(new AppError("No product found in cart", 404));
  }
  const foundProduct = await Products.findById(productId);

  if (!foundProduct) {
    return next(new AppError("No product found", 404));
  }
  if (action === "increase") {
    if (cartItem.quantity >= foundProduct.stock) {
      return next(new AppError("Can not add more than avaliable stock", 400));
    }
    cartItem.quantity += 1;
  } else if (action === "decrease") {
    cartItem.quantity -= 1;

    if (cartItem.quantity <= 0) {
      cart.items = cart.items.filter((item) => !item.product.equals(productId));
    }
  } else {
    return next(new AppError("Invalid request", 400));
  }
  await cart.save();

  const cartObject = cart.toObject({ virtuals: false });
  res.status(200).json({
    status: "success",
    message: `Product qauntity ${action} successfully`,
    data: { cart: cartObject },
  });
});

exports.deleteUserCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { confirmDelete } = req.body;
  if (!confirmDelete || confirmDelete !== true) {
    return next(
      new AppError(
        "Please confirm cart deletion by setting confirmDelete to true",
        400,
      ),
    );
  }

  const cart = await Cart.findOneAndDelete({ user: userId });

  if (!cart) {
    return next(new AppError("No cart found to delete", 404));
  }
  res.status(204).json({
    status: "success",
    message: "Cart delet successfully",
    data: null,
  });
});
