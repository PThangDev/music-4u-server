const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');
const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.header('Authorization');
    if (!accessToken) {
      throw createError(401, 'Invalid Authorization. Please Login or Register');
    }
    const token = accessToken.replace('Bearer ', '');
    const userVerify = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!userVerify) {
      throw createError(401, 'Invalid Authorization. Please Login or Register');
    }
    const user = await authModel.findById(userVerify._id).select('-password');
    if (!user) {
      throw createError(401, 'Invalid Authorization. Please Login or Register');
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
