const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = { errorHandler };
