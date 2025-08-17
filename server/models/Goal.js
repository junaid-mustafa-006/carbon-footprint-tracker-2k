const mongoose = require("mongoose")

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      required: true,
    },
    category: {
      type: String,
      enum: ["travel", "electricity", "food", "water", "waste", "general"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    target: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
      metric: { type: String, required: true }, // 'reduction', 'actions', 'streak'
    },
    progress: {
      current: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    duration: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      daysTotal: Number,
      daysRemaining: Number,
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed", "paused"],
      default: "active",
    },
    rewards: {
      points: { type: Number, default: 0 },
      badges: [String],
      achievements: [String],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    isPersonalized: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
)

goalSchema.index({ userId: 1, status: 1, "duration.endDate": 1 })

// Update progress percentage when current progress changes
goalSchema.pre("save", function (next) {
  if (this.isModified("progress.current")) {
    this.progress.percentage = Math.min(100, (this.progress.current / this.target.value) * 100)
    this.progress.lastUpdated = new Date()

    // Check if goal is completed
    if (this.progress.percentage >= 100 && this.status === "active") {
      this.status = "completed"
      this.completedAt = new Date()
    }
  }

  // Calculate days remaining
  const now = new Date()
  const endDate = new Date(this.duration.endDate)
  this.duration.daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))

  next()
})

module.exports = mongoose.model("Goal", goalSchema)
