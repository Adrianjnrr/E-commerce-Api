const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: "true",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  deliveredAt: Date,
});

orderSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "delivered") {
    this.deliveredAt = Date.now();
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
