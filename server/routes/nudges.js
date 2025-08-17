const express = require("express")
const { body, validationResult } = require("express-validator")
const Nudge = require("../models/Nudge")
const User = require("../models/User")
const CarbonFootprint = require("../models/CarbonFootprint")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/nudges
// @desc    Get user's nudges
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { status = "pending", limit = 10 } = req.query

    const query = {
      userId: req.user._id,
      "delivery.status": status,
    }

    const nudges = await Nudge.find(query).sort({ createdAt: -1 }).limit(Number.parseInt(limit))

    res.json({ nudges })
  } catch (error) {
    console.error("Get nudges error:", error)
    res.status(500).json({ message: "Server error fetching nudges" })
  }
})

// @route   POST /api/nudges/generate
// @desc    Generate contextual nudges for user
// @access  Private
router.post("/generate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const generatedNudges = await generateContextualNudges(user)

    // Save generated nudges
    const savedNudges = await Promise.all(
      generatedNudges.map((nudgeData) => {
        const nudge = new Nudge({
          userId: req.user._id,
          ...nudgeData,
        })
        return nudge.save()
      }),
    )

    res.json({
      message: "Nudges generated successfully",
      nudges: savedNudges,
    })
  } catch (error) {
    console.error("Generate nudges error:", error)
    res.status(500).json({ message: "Server error generating nudges" })
  }
})

// @route   PUT /api/nudges/:id/engage
// @desc    Mark nudge as engaged (viewed, clicked, dismissed)
// @access  Private
router.put("/:id/engage", auth, async (req, res) => {
  try {
    const { action } = req.body // 'viewed', 'clicked', 'dismissed'

    const updateData = {
      [`engagement.${action}`]: true,
      [`engagement.${action}At`]: new Date(),
    }

    if (action === "clicked") {
      updateData["delivery.status"] = "acted"
    } else if (action === "viewed") {
      updateData["delivery.status"] = "read"
    }

    const nudge = await Nudge.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updateData, { new: true })

    if (!nudge) {
      return res.status(404).json({ message: "Nudge not found" })
    }

    res.json({ message: "Nudge engagement recorded", nudge })
  } catch (error) {
    console.error("Nudge engagement error:", error)
    res.status(500).json({ message: "Server error recording engagement" })
  }
})

// Helper function to generate contextual nudges
async function generateContextualNudges(user) {
  const nudges = []
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get user's recent activities
  const recentActivities = await CarbonFootprint.find({
    userId: user._id,
    createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
  }).sort({ createdAt: -1 })

  // Budget warning nudge
  const budgetUsed = (user.carbonBudget.current / user.carbonBudget.monthly) * 100
  if (budgetUsed > 75) {
    nudges.push({
      type: "budget_warning",
      trigger: {
        event: "budget_threshold",
        threshold: 75,
        conditions: { budgetUsed },
      },
      content: {
        title: "Carbon Budget Alert",
        message: `You've used ${budgetUsed.toFixed(1)}% of your monthly carbon budget. Consider eco-friendly alternatives for the rest of the month.`,
        actionText: "View Eco Tips",
        actionUrl: "/tips",
        priority: "high",
      },
    })
  }

  // High emission activity nudge
  const highEmissionActivities = recentActivities.filter((activity) => activity.carbonEmission.value > 10)

  if (highEmissionActivities.length > 0) {
    const activity = highEmissionActivities[0]
    nudges.push({
      type: "contextual",
      trigger: {
        event: "high_emission_activity",
        threshold: 10,
        conditions: { activityId: activity._id },
      },
      content: {
        title: "High Impact Activity Detected",
        message: `Your recent ${activity.activity.toLowerCase()} generated ${activity.carbonEmission.value.toFixed(1)} kg CO₂. Here are some alternatives to consider next time.`,
        actionText: "See Alternatives",
        actionUrl: `/alternatives/${activity.category}`,
        priority: "medium",
      },
    })
  }

  // Streak reminder nudge
  const daysSinceLastActivity = user.streaks.lastActivity
    ? Math.floor((now - new Date(user.streaks.lastActivity)) / (1000 * 60 * 60 * 24))
    : 0

  if (daysSinceLastActivity > 1) {
    nudges.push({
      type: "streak_reminder",
      trigger: {
        event: "streak_break",
        threshold: 1,
        conditions: { daysSinceLastActivity },
      },
      content: {
        title: "Keep Your Streak Alive!",
        message: `You haven't logged any eco-friendly actions in ${daysSinceLastActivity} days. Log an activity to maintain your ${user.streaks.current}-day streak.`,
        actionText: "Log Activity",
        actionUrl: "/track",
        priority: "medium",
      },
    })
  }

  // Eco tip nudge
  nudges.push({
    type: "eco_tip",
    trigger: {
      event: "daily_tip",
      conditions: {},
    },
    content: {
      title: "Daily Eco Tip",
      message: getRandomEcoTip(),
      actionText: "Learn More",
      actionUrl: "/tips",
      priority: "low",
    },
  })

  return nudges
}

function getRandomEcoTip() {
  const tips = [
    "Taking public transport instead of driving can reduce your carbon footprint by up to 45%.",
    "Eating one less meat meal per week can save 1,900 lbs of CO₂ equivalent per year.",
    "Switching to LED bulbs uses 75% less energy than incandescent bulbs.",
    "Air-drying clothes instead of using a dryer can save 1,600 lbs of CO₂ per year.",
    "Working from home 2-3 days per week can reduce your transport emissions by 40%.",
    "Using a reusable water bottle can prevent 1,460 plastic bottles from entering landfills annually.",
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

module.exports = router
