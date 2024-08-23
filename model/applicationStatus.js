const mongoose = require("mongoose");

const applicationStatusSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    relevancyScore: {
      type: Number,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("applicationStatus", applicationStatusSchema);
