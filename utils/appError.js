const appError = (message, statusCode) => {
  const err = new Error(message);
  err.status = "failed";
  err.statusCode = statusCode || 500;

  return err;
};

module.exports = appError;
