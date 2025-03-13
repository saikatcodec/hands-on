const User = require("../models").users;
const { hashPassword, matchPassword } = require("../utils/hashedPassword");
const appError = require("../utils/appError");

const login = async (req, res) => {};
const register = async (req, res, next) => {
  try {
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

module.exports = {
  login,
  register,
};
