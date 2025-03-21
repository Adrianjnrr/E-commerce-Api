const Reviews = require("../model/reviewModel");
const factory = require("./factoryHandler");

exports.setProductUserId = (req, res, next) => {
  //Allowing nested routes
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Reviews);
exports.createReviews = factory.createOne(Reviews);
exports.updateReviews = factory.updateOne(Reviews);
exports.deleteReview = factory.deleteOne(Reviews);
