//An annonymous function that return an async func
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
