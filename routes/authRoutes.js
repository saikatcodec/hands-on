const express = require("express");

const { register } = require("../controllers/authController");

const authRoutes = express.Router();

authRoutes.post("/register", register);

module.exports = authRoutes;
