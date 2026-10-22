const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  return res.status(500).json({
    status: "error",
    message: "something went wrong",
  });
};

//handlers for database errors
const handleDuplicateKeyErrorDB = (err) => {
  const message = `Duplicate field value (${
    err.keyValue[Object.keys(err.keyValue)[0]]
  }) for unique field(${Object.keys(err.keyValue)[0]}) `;
  return new AppError(400, message);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

const handleValidationErrorsDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  return new AppError(400, `Invalid inputs: ${errors.join(". ")}`);
};

// Mongoose buffers queries while it waits for a connection. If the database
// is unreachable it eventually times out — that is a temporary, retryable
// outage, not a crash, so answer with 503 and a readable message.
const handleDBConnectionErrorDB = () => {
  return new AppError(
    503,
    "The database is not reachable right now. Please try again in a moment."
  );
};

//handlers for JWT errors
const handleInvalidTokenErrorJWT = () => {
  return new AppError(401, "invalid token, please login again");
};
const handleTokenExpireErrorJWT = () => {
  return new AppError(401, "token has expired, please login again");
};

const handleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(`Error****************************\n`, err);

  const isDev = process.env.NODE_ENV === "development";
  let error = err;

  if (err.code === 11000) error = handleDuplicateKeyErrorDB(error);
  if (err.name === "CastError") error = handleCastErrorDB(error);
  if (err.name === "ValidationError") error = handleValidationErrorsDB(error);
  if (err.name === "MongooseError" && /buffering timed out/.test(err.message)) {
    error = handleDBConnectionErrorDB();
  }

  if (err.name === "JsonWebTokenError") error = handleInvalidTokenErrorJWT();
  if (err.name === "TokenExpiredError") error = handleTokenExpireErrorJWT();

  // Always answer. If NODE_ENV is neither "development" nor "production"
  // the request would otherwise hang until the host times it out.
  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = handleError;
