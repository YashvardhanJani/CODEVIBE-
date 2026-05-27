// controller/Auth/register.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/user.models");

const register = async (req, res, next) => {
  try {
    const username = (req.body.username || "").trim();
    // Normalise: accept both `email` and `Email`
    const email = (req.body.email || req.body.Email || "").trim().toLowerCase();
    const college = (req.body.college || "").trim();
    const year = (req.body.year || "").trim();
    const { password } = req.body;

    if (!username || !email || !college || !year || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Check for duplicate email
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const userCreate = new UserModel({
      username,
      email,
      password: hashedPassword,
      college,
      year,
    });

    await userCreate.save();

    // Return a JWT so the user is logged in immediately after registering
    const token = jwt.sign(
      { userId: userCreate._id, email, username },
      process.env.JWT_SECRET || "codevibe_default_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      token,
      user: { username, email, college, year },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError?.message || "Invalid signup data",
      });
    }

    next(error);
  }
};

module.exports = register;