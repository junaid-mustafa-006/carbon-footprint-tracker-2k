const express = require("express")
const router = express.Router()
const CarbonFootprint = require("../models/CarbonFootprint")
const Goal = require("../models/Goal")
const auth = require("../middleware/auth")
const mlEngine = require("../utils/mlEngine")

// Get personalized recommendations
router.get("/", auth, async (req, res) => {
  try {
    // Get user's carbon footprint data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const carbonFootprints = await CarbonFootprint.find({
      user: req.user.id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 })

    // Get user's active goals
    const userGoals = await Goal.find({
      user: req.user.id,
      status: "active",
    })

    // Analyze patterns
    const userPatterns = mlEngine.analyzeUserPatterns(carbonFootprints)

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentActivities = carbonFootprints.filter((fp) => fp.date >= sevenDaysAgo)

    // Generate recommendations
    const recommendations = mlEngine.generateRecommendations(userPatterns, recentActivities, userGoals)

    res.json({
      recommendations,
      patterns: userPatterns,
      insights: {
        totalDataPoints: carbonFootprints.length,
        analysisDate: new Date(),
      },
    })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get emission predictions
router.get("/predictions", auth, async (req, res) => {
  try {
    const { days = 30 } = req.query

    // Get user's carbon footprint data (last 60 days for better prediction)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const carbonFootprints = await CarbonFootprint.find({
      user: req.user.id,
      date: { $gte: sixtyDaysAgo },
    }).sort({ date: -1 })

    const prediction = mlEngine.predictFutureEmissions(carbonFootprints, Number.parseInt(days))

    res.json(prediction)
  } catch (error) {
    console.error("Error generating predictions:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get behavioral insights
router.get("/insights", auth, async (req, res) => {
  try {
    // Get comprehensive user data
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const carbonFootprints = await CarbonFootprint.find({
      user: req.user.id,
      date: { $gte: ninetyDaysAgo },
    }).sort({ date: -1 })

    const patterns = mlEngine.analyzeUserPatterns(carbonFootprints)

    // Calculate additional insights
    const monthlyData = {}
    const weeklyData = {}

    carbonFootprints.forEach((fp) => {
      const month = fp.date.toISOString().slice(0, 7) // YYYY-MM
      const week = Math.floor((Date.now() - fp.date.getTime()) / (7 * 24 * 60 * 60 * 1000))

      if (!monthlyData[month]) monthlyData[month] = 0
      if (!weeklyData[week]) weeklyData[week] = 0

      monthlyData[month] += fp.totalEmissions
      weeklyData[week] += fp.totalEmissions
    })

    // Find best and worst performing periods
    const monthlyEntries = Object.entries(monthlyData).sort(([, a], [, b]) => a - b)
    const bestMonth = monthlyEntries[0]
    const worstMonth = monthlyEntries[monthlyEntries.length - 1]

    const insights = {
      patterns,
      performance: {
        bestMonth: bestMonth ? { month: bestMonth[0], emissions: bestMonth[1] } : null,
        worstMonth: worstMonth ? { month: worstMonth[0], emissions: worstMonth[1] } : null,
        improvement: bestMonth && worstMonth ? ((worstMonth[1] - bestMonth[1]) / worstMonth[1]) * 100 : 0,
      },
      streaks: {
        current: 0, // Would need more complex logic to calculate streaks
        longest: 0,
      },
    }

    res.json(insights)
  } catch (error) {
    console.error("Error generating insights:", error)
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
