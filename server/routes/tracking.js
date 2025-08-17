const express = require("express")
const { body, validationResult } = require("express-validator")
const CarbonFootprint = require("../models/CarbonFootprint")
const EcoAction = require("../models/EcoAction")
const User = require("../models/User")
const auth = require("../middleware/auth")
const { calculateCarbonEmission } = require("../utils/carbonCalculator")

const router = express.Router()

// @route   POST /api/tracking/activity
// @desc    Log a carbon footprint activity
// @access  Private
router.post(
  "/activity",
  auth,
  [
    body("category").isIn(["travel", "electricity", "food", "water", "waste"]).withMessage("Invalid category"),
    body("subcategory").notEmpty().withMessage("Subcategory is required"),
    body("activity").notEmpty().withMessage("Activity description is required"),
    body("amount.value").isNumeric().withMessage("Amount value must be a number"),
    body("amount.unit").notEmpty().withMessage("Amount unit is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { category, subcategory, activity, amount, metadata, location, notes } = req.body

      // Calculate carbon emission
      const carbonEmission = await calculateCarbonEmission(category, subcategory, amount, metadata)

      // Create carbon footprint entry
      const footprint = new CarbonFootprint({
        userId: req.user._id,
        category,
        subcategory,
        activity,
        amount,
        carbonEmission,
        metadata,
        location,
        notes,
        isEcoFriendly: metadata?.isEcoFriendly || false,
      })

      await footprint.save()

      // Update user's carbon budget
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "carbonBudget.current": carbonEmission.value },
      })

      // Check if this is an eco-friendly action and create EcoAction
      if (metadata?.isEcoFriendly) {
        const ecoAction = new EcoAction({
          userId: req.user._id,
          action: activity,
          category,
          impact: {
            carbonSaved: Math.abs(carbonEmission.value), // Eco actions save carbon
            description: `Saved ${Math.abs(carbonEmission.value).toFixed(2)} kg CO₂ by ${activity.toLowerCase()}`,
            equivalents: {
              trees: Math.round(Math.abs(carbonEmission.value) / 21.77), // 1 tree absorbs ~21.77 kg CO₂/year
              flights: Math.round(Math.abs(carbonEmission.value) / 90), // ~90 kg CO₂ per hour of flight
              cars: Math.round(Math.abs(carbonEmission.value) / 4.6), // ~4.6 kg CO₂ per gallon
            },
          },
          points: Math.round(Math.abs(carbonEmission.value) * 10), // 10 points per kg CO₂ saved
        })

        await ecoAction.save()
      }

      res.status(201).json({
        message: "Activity logged successfully",
        footprint,
        carbonEmission,
      })
    } catch (error) {
      console.error("Activity logging error:", error)
      res.status(500).json({ message: "Server error during activity logging" })
    }
  },
)

// @route   GET /api/tracking/activities
// @desc    Get user's carbon footprint activities
// @access  Private
router.get("/activities", auth, async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query

    const query = { userId: req.user._id }

    if (category) {
      query.category = category
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const activities = await CarbonFootprint.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await CarbonFootprint.countDocuments(query)

    res.json({
      activities,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get activities error:", error)
    res.status(500).json({ message: "Server error fetching activities" })
  }
})

// @route   GET /api/tracking/summary
// @desc    Get carbon footprint summary
// @access  Private
router.get("/summary", auth, async (req, res) => {
  try {
    const { period = "month" } = req.query

    let startDate
    const endDate = new Date()

    switch (period) {
      case "week":
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
        break
      case "year":
        startDate = new Date(endDate.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Aggregate carbon emissions by category
    const categoryTotals = await CarbonFootprint.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          totalEmissions: { $sum: "$carbonEmission.value" },
          count: { $sum: 1 },
        },
      },
    ])

    // Get total emissions
    const totalEmissions = categoryTotals.reduce((sum, cat) => sum + cat.totalEmissions, 0)

    // Get eco actions summary
    const ecoActions = await EcoAction.find({
      userId: req.user._id,
      createdAt: { $gte: startDate, $lte: endDate },
    })

    const totalCarbonSaved = ecoActions.reduce((sum, action) => sum + action.impact.carbonSaved, 0)
    const totalPoints = ecoActions.reduce((sum, action) => sum + action.points, 0)

    // Get user's carbon budget
    const user = await User.findById(req.user._id)

    res.json({
      period,
      dateRange: { startDate, endDate },
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      categoryBreakdown: categoryTotals,
      ecoActions: {
        count: ecoActions.length,
        totalCarbonSaved: Math.round(totalCarbonSaved * 100) / 100,
        totalPoints,
      },
      carbonBudget: user.carbonBudget,
      budgetStatus: {
        used: Math.round((user.carbonBudget.current / user.carbonBudget.monthly) * 100),
        remaining: Math.max(0, user.carbonBudget.monthly - user.carbonBudget.current),
      },
    })
  } catch (error) {
    console.error("Get summary error:", error)
    res.status(500).json({ message: "Server error fetching summary" })
  }
})

// @route   DELETE /api/tracking/activity/:id
// @desc    Delete a carbon footprint activity
// @access  Private
router.delete("/activity/:id", auth, async (req, res) => {
  try {
    const activity = await CarbonFootprint.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    // Update user's carbon budget (subtract the emission)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "carbonBudget.current": -activity.carbonEmission.value },
    })

    await CarbonFootprint.findByIdAndDelete(req.params.id)

    res.json({ message: "Activity deleted successfully" })
  } catch (error) {
    console.error("Delete activity error:", error)
    res.status(500).json({ message: "Server error deleting activity" })
  }
})

// @route   GET /api/tracking/chart-data
// @desc    Get chart data for visualizations
// @access  Private
router.get("/chart-data", auth, async (req, res) => {
  try {
    const { period = "month" } = req.query

    let startDate
    const endDate = new Date()

    switch (period) {
      case "week":
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
        break
      case "year":
        startDate = new Date(endDate.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Aggregate emissions by date
    const dailyEmissions = await CarbonFootprint.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          emissions: { $sum: "$carbonEmission.value" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Get user's daily budget
    const user = await User.findById(req.user._id)
    const dailyBudget = user.carbonBudget.monthly / 30 // Approximate daily budget

    // Format data for charts
    const chartData = dailyEmissions.map((item) => ({
      date: item._id,
      emissions: Math.round(item.emissions * 100) / 100,
      budget: dailyBudget,
      count: item.count,
    }))

    res.json({
      data: chartData,
      period,
      dateRange: { startDate, endDate },
    })
  } catch (error) {
    console.error("Get chart data error:", error)
    res.status(500).json({ message: "Server error fetching chart data" })
  }
})

// @route   GET /api/tracking/impact
// @desc    Get environmental impact data
// @access  Private
router.get("/impact", auth, async (req, res) => {
  try {
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = new Date()

    // Get total emissions for the month
    const totalEmissions = await CarbonFootprint.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$carbonEmission.value" },
        },
      },
    ])

    const emissions = totalEmissions[0]?.total || 0

    // Get carbon saved from eco actions
    const carbonSaved = await EcoAction.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$impact.carbonSaved" },
        },
      },
    ])

    const saved = carbonSaved[0]?.total || 0

    // Calculate equivalents
    const equivalents = {
      trees: Math.round(emissions / 21.77), // 1 tree absorbs ~21.77 kg CO₂/year
      flights: Math.round((emissions / 90) * 10) / 10, // ~90 kg CO₂ per hour of flight
      cars: Math.round(emissions / 4.6), // ~4.6 kg CO₂ per gallon
      homes: Math.round((emissions / 6000) * 10) / 10, // ~6000 kg CO₂ per home per month
    }

    // Mock comparison data (in a real app, calculate from database)
    const comparisons = {
      avgPerson: -15, // 15% below average
      lastMonth: -8, // 8% reduction from last month
      target: 24, // 24% of annual target used
    }

    res.json({
      totalEmissions: Math.round(emissions * 100) / 100,
      carbonSaved: Math.round(saved * 100) / 100,
      equivalents,
      comparisons,
    })
  } catch (error) {
    console.error("Get impact data error:", error)
    res.status(500).json({ message: "Server error fetching impact data" })
  }
})

module.exports = router
