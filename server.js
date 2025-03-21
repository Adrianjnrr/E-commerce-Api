const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

//handle sync rejection that we are not handling on our global error
process.on("uncaughtExecptions", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXECPTIONS SHUTTING DOWN......");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

console.log("NODE_ENV is set:", process.env.NODE_ENV);

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

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`App is running in port: ${port}`);
});

// handling async rejections
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLE REJECTION SHUTTING DOWN......");
  server.close(() => {
    process.exit(1);
  });
});
