const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
  ],

  productaddedAt: {
    type: Date,
    default: Date.now,
  },
});

const WishList = mongoose.model("WishList", wishlistSchema);
module.exports = WishList;
