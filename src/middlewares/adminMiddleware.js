const createError = require('http-errors');
const adminMiddleware = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') next();
    else {
      throw createError(401, 'Admin access Denied');
    }
  } catch (error) {
    next(error);
  }
};
module.exports = adminMiddleware;
