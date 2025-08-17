const mongoose = require("mongoose")

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["individual", "community", "city", "global"],
      required: true,
    },
    category: {
      type: String,
      enum: ["travel", "electricity", "food", "water", "waste", "general"],
      required: true,
    },
    goal: {
      target: { type: Number, required: true },
      unit: { type: String, required: true },
      metric: { type: String, required: true }, // 'reduction', 'actions', 'days'
    },
    duration: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      durationDays: Number,
    },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
    ],
    leaderboard: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: Number,
        rank: Number,
      },
    ],
    rewards: {
      points: Number,
      badges: [String],
      achievements: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

challengeSchema.index({ type: 1, isActive: 1, "duration.endDate": 1 })

module.exports = mongoose.model("Challenge", challengeSchema)
