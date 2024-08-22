const mongoose = require("mongoose");

const jobFieldSchema = new mongoose.Schema(
  {
    jobCategories: {
      type: [String],
    },
    jobTypes: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobField", jobFieldSchema);
