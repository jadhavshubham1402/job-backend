const mongoose = require("mongoose");

const userResumeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    mobileNo: {
      type: String,
    },
    experience: {
      type: String,
    },
    skills: {
      type: [{ type: mongoose.Schema.Types.Mixed }],
    },
    currentSalary: {
      type: String,
    },
    expectedSalary: {
      type: String,
    },
    resumeLink: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsersResume", userResumeSchema);
