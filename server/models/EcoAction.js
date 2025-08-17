const mongoose = require("mongoose")

const ecoActionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["travel", "electricity", "food", "water", "waste", "lifestyle"],
      required: true,
    },
    impact: {
      carbonSaved: { type: Number, required: true }, // kg CO2 saved
      description: String,
      equivalents: {
        trees: Number,
        flights: Number,
        cars: Number,
      },
    },
    verification: {
      method: String, // 'self_reported', 'photo', 'gps', 'receipt'
      data: mongoose.Schema.Types.Mixed,
      verified: { type: Boolean, default: false },
    },
    points: {
      type: Number,
      default: 0,
    },
    streakContribution: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

ecoActionSchema.index({ userId: 1, createdAt: -1 })
ecoActionSchema.index({ userId: 1, category: 1, createdAt: -1 })

module.exports = mongoose.model("EcoAction", ecoActionSchema)
