// models/user.models.js
const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  college: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Password reset fields
  resetToken: {
    type: String,
    default: undefined,
  },
  resetTokenExpiry: {
    type: Date,
    default: undefined,
  },
});

module.exports = model("User", userSchema, "users");