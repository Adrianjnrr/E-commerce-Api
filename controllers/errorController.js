const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const validationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const duplicateErrField = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field name:${value}`;
  return new AppError(message, 400);
};

const handleInvalidJsonToken = () =>
  new AppError("Invalid token or expired", 401);

const handleExpiresJwtToken = () =>
  new AppError("Token has expired! Please log in ", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("Error", err);
    res.status(500).json({
      status: "error",
      message: "Somthing went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.name === "ValidationError") error = validationError(error);
    if (error.code === 11000) error = duplicateErrField(error);
    if (error.name === "JsonWebTokenError")
      error = handleInvalidJsonToken(error);
    if (error.name === "TokenExpiredError")
      error = handleExpiresJwtToken(error);

    sendErrorProd(error, res);
  }
};
