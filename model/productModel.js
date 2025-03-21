const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is require"],
      min: [0, "Product price must be positive"],
    },

    stock: {
      type: Number,
      required: [true, "Product stock quantity is required"],
      min: [0, "Product stock can not be negative"],
      default: 1,
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
    },
    images: [String],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    ratings: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Vitual populate
productSchema.virtual("review", {
  ref: "Reviews",
  foreignField: "product",
  localField: "_id",
});

productSchema.index({ price: 1, ratings: -1, name: 1 });

productSchema.pre(/^find/, function (next) {
  if (!this.getOptions().populateReviews) {
    this.populate("review");
  }
  next();
});

const Products = mongoose.model("Products", productSchema);
module.exports = Products;
