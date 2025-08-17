const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profile: {
      firstName: String,
      lastName: String,
      location: {
        city: String,
        country: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      preferences: {
        units: {
          type: String,
          enum: ["metric", "imperial"],
          default: "metric",
        },
        notifications: {
          nudges: { type: Boolean, default: true },
          challenges: { type: Boolean, default: true },
          weekly_reports: { type: Boolean, default: true },
        },
      },
    },
    carbonBudget: {
      monthly: { type: Number, default: 1000 }, // kg CO2
      current: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },
    streaks: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActivity: Date,
    },
    achievements: [
      {
        type: String,
        dateEarned: { type: Date, default: Date.now },
      },
    ],
    joinedChallenges: [
      {
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
        joinedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
