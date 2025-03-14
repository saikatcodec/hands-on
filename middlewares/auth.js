const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const User = require("../models").users;

const authenticateUser = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        appError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Verification of token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(
          appError("Your token has expired! Please log in again.", 401)
        );
      }
      return next(appError("Invalid token! Please log in again.", 401));
    }

    // 3) Check if user still exists
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(
        appError("The user belonging to this token no longer exists.", 401)
      );
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(appError(error.message, 500));
  }
};

module.exports = { authenticateUser };
