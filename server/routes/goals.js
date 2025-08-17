const express = require("express")
const { body, validationResult } = require("express-validator")
const Goal = require("../models/Goal")
const User = require("../models/User")
const CarbonFootprint = require("../models/CarbonFootprint")
const EcoAction = require("../models/EcoAction")
const auth = require("../middleware/auth")
const mongoose = require("mongoose") // Import mongoose

const router = express.Router()

// @route   GET /api/goals
// @desc    Get user's goals
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { status = "active", type } = req.query

    const query = { userId: req.user._id }
    if (status !== "all") query.status = status
    if (type) query.type = type

    const goals = await Goal.find(query).sort({ createdAt: -1 })

    res.json({ goals })
  } catch (error) {
    console.error("Get goals error:", error)
    res.status(500).json({ message: "Server error fetching goals" })
  }
})

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post(
  "/",
  auth,
  [
    body("type").isIn(["daily", "weekly", "monthly", "custom"]).withMessage("Invalid goal type"),
    body("category")
      .isIn(["travel", "electricity", "food", "water", "waste", "general"])
      .withMessage("Invalid category"),
    body("title").trim().isLength({ min: 1, max: 100 }).withMessage("Title must be 1-100 characters"),
    body("description").trim().isLength({ min: 1, max: 500 }).withMessage("Description must be 1-500 characters"),
    body("target.value").isNumeric().withMessage("Target value must be a number"),
    body("target.unit").notEmpty().withMessage("Target unit is required"),
    body("target.metric").isIn(["reduction", "actions", "streak"]).withMessage("Invalid target metric"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { type, category, title, description, target, difficulty, duration } = req.body

      // Calculate duration if not provided
      let goalDuration = duration
      if (!goalDuration) {
        const now = new Date()
        let endDate

        switch (type) {
          case "daily":
            endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            break
          case "weekly":
            endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            break
          case "monthly":
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
            break
          default:
            endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        }

        goalDuration = {
          startDate: now,
          endDate,
          daysTotal: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)),
        }
      }

      const goal = new Goal({
        userId: req.user._id,
        type,
        category,
        title,
        description,
        target,
        difficulty: difficulty || "medium",
        duration: goalDuration,
        rewards: {
          points: calculateGoalPoints(target, difficulty || "medium"),
          badges: [],
          achievements: [],
        },
      })

      await goal.save()

      res.status(201).json({
        message: "Goal created successfully",
        goal,
      })
    } catch (error) {
      console.error("Create goal error:", error)
      res.status(500).json({ message: "Server error creating goal" })
    }
  },
)

// @route   PUT /api/goals/:id/progress
// @desc    Update goal progress
// @access  Private
router.put("/:id/progress", auth, async (req, res) => {
  try {
    const { progress } = req.body

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" })
    }

    goal.progress.current = progress
    await goal.save()

    // Update user streaks if goal completed
    if (goal.status === "completed") {
      await updateUserStreaks(req.user._id, goal)
    }

    res.json({
      message: "Goal progress updated",
      goal,
    })
  } catch (error) {
    console.error("Update goal progress error:", error)
    res.status(500).json({ message: "Server error updating progress" })
  }
})

// @route   POST /api/goals/suggestions
// @desc    Get personalized goal suggestions
// @access  Private
router.post("/suggestions", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const suggestions = await generateGoalSuggestions(user)

    res.json({ suggestions })
  } catch (error) {
    console.error("Get goal suggestions error:", error)
    res.status(500).json({ message: "Server error generating suggestions" })
  }
})

// @route   POST /api/goals/simulate
// @desc    Simulate impact of lifestyle changes
// @access  Private
router.post("/simulate", auth, async (req, res) => {
  try {
    const { changes } = req.body // Array of lifestyle changes to simulate

    const simulation = await simulateLifestyleChanges(req.user._id, changes)

    res.json({ simulation })
  } catch (error) {
    console.error("Simulate changes error:", error)
    res.status(500).json({ message: "Server error running simulation" })
  }
})

// Helper functions
function calculateGoalPoints(target, difficulty) {
  const basePoints = target.value * 10
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  }
  return Math.round(basePoints * difficultyMultiplier[difficulty])
}

async function updateUserStreaks(userId, completedGoal) {
  const user = await User.findById(userId)

  if (completedGoal.type === "daily") {
    user.streaks.current += 1
    user.streaks.longest = Math.max(user.streaks.longest, user.streaks.current)
    user.streaks.lastActivity = new Date()

    await user.save()
  }
}

async function generateGoalSuggestions(user) {
  const suggestions = []
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get user's activity patterns
  const recentActivities = await CarbonFootprint.find({
    userId: user._id,
    createdAt: { $gte: startOfMonth },
  })

  // Analyze highest emission categories
  const categoryTotals = {}
  recentActivities.forEach((activity) => {
    categoryTotals[activity.category] = (categoryTotals[activity.category] || 0) + activity.carbonEmission.value
  })

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  // Generate suggestions based on highest impact categories
  sortedCategories.forEach(([category, emissions]) => {
    const categoryGoals = getCategoryGoalSuggestions(category, emissions)
    suggestions.push(...categoryGoals)
  })

  // Add general sustainability goals
  suggestions.push(
    {
      type: "weekly",
      category: "general",
      title: "Eco Action Streak",
      description: "Log at least one eco-friendly action every day this week",
      target: { value: 7, unit: "days", metric: "streak" },
      difficulty: "easy",
      estimatedImpact: "5-10 kg CO₂ saved",
    },
    {
      type: "monthly",
      category: "general",
      title: "Carbon Budget Champion",
      description: "Stay within your monthly carbon budget",
      target: { value: user.carbonBudget.monthly, unit: "kg CO₂", metric: "reduction" },
      difficulty: "medium",
      estimatedImpact: "Maintain sustainable lifestyle",
    },
  )

  return suggestions.slice(0, 6) // Return top 6 suggestions
}

function getCategoryGoalSuggestions(category, currentEmissions) {
  const suggestions = []

  switch (category) {
    case "travel":
      suggestions.push(
        {
          type: "weekly",
          category: "travel",
          title: "Public Transport Week",
          description: "Use public transport or bike for all trips under 10km",
          target: { value: 5, unit: "trips", metric: "actions" },
          difficulty: "medium",
          estimatedImpact: `${(currentEmissions * 0.3).toFixed(1)} kg CO₂ saved`,
        },
        {
          type: "daily",
          category: "travel",
          title: "Car-Free Day",
          description: "Complete one day without using a personal vehicle",
          target: { value: 1, unit: "day", metric: "actions" },
          difficulty: "easy",
          estimatedImpact: `${(currentEmissions * 0.1).toFixed(1)} kg CO₂ saved`,
        },
      )
      break

    case "food":
      suggestions.push({
        type: "weekly",
        category: "food",
        title: "Plant-Based Meals",
        description: "Eat 5 plant-based meals this week",
        target: { value: 5, unit: "meals", metric: "actions" },
        difficulty: "medium",
        estimatedImpact: `${(currentEmissions * 0.25).toFixed(1)} kg CO₂ saved`,
      })
      break

    case "electricity":
      suggestions.push({
        type: "daily",
        category: "electricity",
        title: "Energy Saver",
        description: "Reduce electricity usage by 20% today",
        target: { value: 20, unit: "percent", metric: "reduction" },
        difficulty: "medium",
        estimatedImpact: `${(currentEmissions * 0.2).toFixed(1)} kg CO₂ saved`,
      })
      break
  }

  return suggestions
}

async function simulateLifestyleChanges(userId, changes) {
  // Get user's current monthly emissions
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const currentEmissions = await CarbonFootprint.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$carbonEmission.value" },
      },
    },
  ])

  const baseline = {}
  currentEmissions.forEach((item) => {
    baseline[item._id] = item.total
  })

  // Calculate impact of each change
  const simulations = changes.map((change) => {
    const impact = calculateChangeImpact(change, baseline)
    return {
      change: change.description,
      category: change.category,
      currentEmissions: baseline[change.category] || 0,
      projectedEmissions: Math.max(0, (baseline[change.category] || 0) - impact.reduction),
      carbonSaved: impact.reduction,
      costSavings: impact.costSavings || 0,
      difficulty: change.difficulty || "medium",
      timeframe: change.timeframe || "1 month",
    }
  })

  const totalCurrentEmissions = Object.values(baseline).reduce((sum, val) => sum + val, 0)
  const totalCarbonSaved = simulations.reduce((sum, sim) => sum + sim.carbonSaved, 0)
  const totalProjectedEmissions = totalCurrentEmissions - totalCarbonSaved

  return {
    baseline: {
      totalEmissions: totalCurrentEmissions,
      byCategory: baseline,
    },
    changes: simulations,
    summary: {
      totalCarbonSaved,
      totalProjectedEmissions,
      percentageReduction: ((totalCarbonSaved / totalCurrentEmissions) * 100).toFixed(1),
      equivalents: {
        trees: Math.round(totalCarbonSaved / 21.77),
        flights: Math.round((totalCarbonSaved / 90) * 10) / 10,
      },
    },
  }
}

function calculateChangeImpact(change, baseline) {
  // Simplified impact calculation - in a real app, this would be more sophisticated
  const categoryEmissions = baseline[change.category] || 0

  const impactFactors = {
    switch_to_public_transport: 0.4,
    work_from_home_2_days: 0.3,
    eat_vegetarian_3_days: 0.25,
    use_led_bulbs: 0.15,
    reduce_heating_2_degrees: 0.2,
    bike_short_trips: 0.35,
    meal_prep_reduce_waste: 0.1,
  }

  const reductionFactor = impactFactors[change.type] || 0.1
  const reduction = categoryEmissions * reductionFactor

  return {
    reduction,
    costSavings: reduction * 0.5, // Rough estimate: $0.50 saved per kg CO₂ reduced
  }
}

module.exports = router
