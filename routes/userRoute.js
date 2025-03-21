const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);
userRouter.post("/forgotPassword", authController.forgotPassword);
userRouter.patch("/resetPassword/:token", authController.resetPassword);

//Protect all route after this middleware
userRouter.use(authController.protect);

userRouter.patch("/updateMe", userController.updateMe);
userRouter.delete("/deleteMe", userController.deleteMe);
userRouter.patch("/updateMyPassword", authController.updateMyPassword);
userRouter.get("/me", userController.getMe, userController.getOneUser);

//Restrict all route to admin only after this middleware
userRouter.use(authController.restrictTo("admin"));

userRouter.route("/").get(userController.getUsers);

userRouter
  .route("/:id")
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
