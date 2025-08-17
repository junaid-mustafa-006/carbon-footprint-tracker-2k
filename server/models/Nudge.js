const mongoose = require("mongoose")

const nudgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["contextual", "budget_warning", "streak_reminder", "challenge_update", "eco_tip"],
      required: true,
    },
    trigger: {
      event: String, // 'high_emission_activity', 'budget_threshold', 'streak_break'
      threshold: Number,
      conditions: mongoose.Schema.Types.Mixed,
    },
    content: {
      title: { type: String, required: true },
      message: { type: String, required: true },
      actionText: String,
      actionUrl: String,
      icon: String,
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },
    delivery: {
      channel: {
        type: String,
        enum: ["push", "in_app", "email"],
        default: "in_app",
      },
      scheduledFor: Date,
      sentAt: Date,
      status: {
        type: String,
        enum: ["pending", "sent", "delivered", "read", "acted"],
        default: "pending",
      },
    },
    engagement: {
      viewed: { type: Boolean, default: false },
      viewedAt: Date,
      clicked: { type: Boolean, default: false },
      clickedAt: Date,
      dismissed: { type: Boolean, default: false },
      dismissedAt: Date,
    },
  },
  {
    timestamps: true,
  },
)

nudgeSchema.index({ userId: 1, "delivery.status": 1, createdAt: -1 })

module.exports = mongoose.model("Nudge", nudgeSchema)
