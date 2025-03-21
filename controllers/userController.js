const User = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./factoryHandler");

const filterObj = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//Get the current login user
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(" -passwordResetToken");
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password update, Please use /updateMyPassword route",
        401,
      ),
    );
  }
  const filterField = filterObj(req.body, "name", "email");
  const updateUserData = await User.findByIdAndUpdate(
    req.user.id,
    filterField,
    { new: true, runValidators: true },
  );
  res.status(200).json({
    status: "success",
    data: {
      updateUserData,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    isActive: false,
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

//Do not update password with this route
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getOneUser = factory.getOne(User);
exports.getUsers = factory.getAll(User);
