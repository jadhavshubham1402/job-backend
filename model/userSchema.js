const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    otpVerify: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["admin", "candidate"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
