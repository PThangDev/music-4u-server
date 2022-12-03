const errorsHandlingMiddleware = (err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({ errors: err.message });
};
module.exports = errorsHandlingMiddleware;
