const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    expiration: {
      type: Date,
    },
    attempt: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
