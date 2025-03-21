const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Products = require("./model/productModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected successfully"));

const products = JSON.parse(fs.readFileSync("./product.json", "utf-8"));

const importData = async () => {
  try {
    await Products.create(products);
    console.log("Data imported successfully");
    process.exit();
  } catch (err) {
    console.log("ERROR importing data");
    process.exit(1);
  }
};

if (process.argv[2] === "--import") importData();
