const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const sendToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = sendToken(user._id);
  const cookiesOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookiesOptions.secure = true;
  res.cookie("jwt", token, cookiesOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    changedAt: req.body.changedAt,
    photo: req.body.photo,
    passwordResetToken: req.body.passwordResetToken,
    passwordTokenExpires: req.body.passwordTokenExpires,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide your email and password", 401));
  }
  const user = await User.findOne({ email }).select("+password -orders");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Invalid email and password", 401));

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not log in! Please log in", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("You are not login yet! please login", 401));
  }
  if (freshUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError("User recently change password! please log in again", 401),
    );
  req.user = freshUser;
  next();
});

/* eslint-disable arrow-body-style */

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          "You do not have permission to preform this operation",
          403,
        ),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  //2) sending it back as an email

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Use this link to reset it. ${resetUrl} if not ignore this message`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset your password (valid for 10min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending this email Please try again later",
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //2) search for the user with the token
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordTokenExpires: { $gt: Date.now() },
  });

  //3)check if there is no user or if the token has expired
  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  //4) set the current password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordTokenExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //1) get user from the collection and select password
  const user = await User.findById(req.user.id).select("+password");

  //2) check if the posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError("Your current password is wrong", 401));

  //3) update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) log user in and send jwt
  createSendToken(user, 200, res);
});
