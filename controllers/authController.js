const models = require("../models");
const { hashPassword, matchPassword } = require("../utils/hashedPassword");
const appError = require("../utils/appError");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/genToken");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  try {
    const User = models.users;
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(appError("Invalid email or password", 400));
    }

    const isMatch = await matchPassword(password, user.password);
    if (!isMatch) {
      return next(appError("Invalid email or password", 400));
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    if (!accessToken || !refreshToken) {
      return next(appError("Error generating tokens", 500));
    }

    // Store refresh token in database
    await user.update({ refreshToken });

    return res.status(200).json({
      status: "success",
      data: {
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

/**
 * Registers a new user.
 *
 * @async
 * @function register
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.fullname - The full name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Array} req.body.skills - The skills of the user.
 * @param {Array} req.body.supportedCauses - The causes supported by the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const register = async (req, res, next) => {
  try {
    const User = models.users;
    const { fullname, email, password, skills, supportedCauses } = req.body;
    const hashedPassword = await hashPassword(password);

    const userEmail = await User.findOne({ where: { email } });
    if (userEmail) {
      return next(appError("User already exists", 400));
    }

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      skills,
      supportedCauses,
    });

    return res.status(201).json({
      status: "success",
      data: {
        name: newUser.fullname,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

/**
 * Refreshes the access token using a valid refresh token.
 *
 * @async
 * @function refreshToken
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.refreshToken - The refresh token.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const refreshToken = async (req, res, next) => {
  try {
    const User = models.users;
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(appError("Refresh token is required", 400));
    }

    // Verify refresh token
    let userId;
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      userId = decoded.id;
    } catch (error) {
      return next(appError("Invalid refresh token", 401));
    }

    // Check if user exists and has the same refresh token
    const user = await User.findOne({ where: { id: userId, refreshToken } });

    if (!user) {
      return next(appError("Invalid refresh token", 401));
    }

    // Generate new tokens (token rotation for better security)
    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update refresh token in database
    await user.update({ refreshToken: newRefreshToken });

    return res.status(200).json({
      status: "success",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

const logout = async (req, res, next) => {
  try {
    const User = models.users;
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(appError("Refresh token is required", 400));
    }

    // Find user with this refresh token
    const user = await User.findOne({ where: { refreshToken } });

    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    }

    // Clear refresh token from database
    await user.update({ refreshToken: null });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

module.exports = {
  login,
  register,
  refreshToken,
  logout,
};
