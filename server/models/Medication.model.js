const mongoose = require("mongoose");

const adherenceLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    timeslot: String,
    taken: { type: Boolean, default: false },
    takenAt: Date,
    skipped: Boolean,
    skipReason: String,
  },
  { _id: true },
);

const medicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: {
      type: String,
      enum: [
        "once_daily",
        "twice_daily",
        "three_times_daily",
        "as_needed",
        "weekly",
      ],
      required: true,
    },
    times: [String],
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: String,
    isActive: { type: Boolean, default: true },
    adherenceLog: [adherenceLogSchema],
  },
  { timestamps: true },
);

medicationSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("Medication", medicationSchema);
