const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobCategorie: {
      type: String,
    },
    jobType: {
      type: String,
    },
    title: {
      type: String,
    },
    companyDetails: {
      type: String,
    },
    tags: {
      type: String,
    },
    skills: {
      type: [String],
    },
    experienceRequired: {
      type: String,
    },
    description: {
      type: String,
    },
    salary: {
      type: String,
    },
    additionalField: {
      type: [{ type: mongoose.Schema.Types.Mixed }], // Array of mixed-type objects
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
