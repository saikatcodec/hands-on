const globalErrHandle = (err, req, res, next) => {
  const status = (err.status = err.status || "failed");
  const statusCode = (err.statusCode = err.statusCode || 500);

  res.status(statusCode).json({
    status,
    statusCode,
    msg: err.message,
    stack: err.stack,
  });
};

module.exports = globalErrHandle;
