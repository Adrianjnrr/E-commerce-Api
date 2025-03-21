const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category must have a name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
    },
    image: String,
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
