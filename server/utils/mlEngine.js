class MLRecommendationEngine {
  constructor() {
    this.emissionFactors = {
      travel: {
        car: 0.21, // kg CO2 per km
        bus: 0.089,
        train: 0.041,
        plane: 0.255,
        bike: 0,
        walk: 0,
      },
      electricity: {
        standard: 0.5, // kg CO2 per kWh
        renewable: 0.1,
      },
      food: {
        meat: 6.61, // kg CO2 per kg
        dairy: 3.15,
        vegetables: 0.43,
        grains: 1.57,
      },
    }
  }

  // Analyze user behavior patterns
  analyzeUserPatterns(carbonFootprints) {
    if (!carbonFootprints || carbonFootprints.length === 0) {
      return {
        dominantCategory: "travel",
        averageDaily: 0,
        trend: "stable",
        peakDays: [],
        lowDays: [],
      }
    }

    const categoryTotals = {}
    const dailyTotals = []
    const dayOfWeekPatterns = new Array(7).fill(0)

    carbonFootprints.forEach((footprint) => {
      // Category analysis
      if (!categoryTotals[footprint.category]) {
        categoryTotals[footprint.category] = 0
      }
      categoryTotals[footprint.category] += footprint.totalEmissions

      // Daily patterns
      dailyTotals.push(footprint.totalEmissions)

      // Day of week patterns
      const dayOfWeek = new Date(footprint.date).getDay()
      dayOfWeekPatterns[dayOfWeek] += footprint.totalEmissions
    })

    // Find dominant category
    const dominantCategory = Object.keys(categoryTotals).reduce((a, b) =>
      categoryTotals[a] > categoryTotals[b] ? a : b,
    )

    // Calculate trend
    const recentData = dailyTotals.slice(-7)
    const olderData = dailyTotals.slice(-14, -7)
    const recentAvg = recentData.reduce((a, b) => a + b, 0) / recentData.length
    const olderAvg = olderData.reduce((a, b) => a + b, 0) / olderData.length

    let trend = "stable"
    if (recentAvg > olderAvg * 1.1) trend = "increasing"
    else if (recentAvg < olderAvg * 0.9) trend = "decreasing"

    // Find peak and low days
    const avgDaily = dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length
    const peakDays = dayOfWeekPatterns
      .map((total, index) => ({ day: index, total }))
      .filter((day) => day.total > avgDaily * 1.2)
      .map((day) => day.day)

    const lowDays = dayOfWeekPatterns
      .map((total, index) => ({ day: index, total }))
      .filter((day) => day.total < avgDaily * 0.8)
      .map((day) => day.day)

    return {
      dominantCategory,
      averageDaily: avgDaily,
      trend,
      peakDays,
      lowDays,
      categoryBreakdown: categoryTotals,
    }
  }

  // Generate personalized recommendations
  generateRecommendations(userPatterns, recentActivities, userGoals = []) {
    const recommendations = []

    // Category-specific recommendations
    if (userPatterns.dominantCategory === "travel") {
      recommendations.push({
        type: "behavior_change",
        category: "travel",
        title: "Switch to Public Transport",
        description: "Replace 2 car trips per week with public transport to reduce emissions by 40%",
        impact: this.calculateImpact("travel", "car_to_bus", 2),
        difficulty: "easy",
        priority: "high",
      })

      recommendations.push({
        type: "alternative",
        category: "travel",
        title: "Try Cycling for Short Trips",
        description: "Use bike for trips under 5km to eliminate emissions completely",
        impact: this.calculateImpact("travel", "car_to_bike", 3),
        difficulty: "medium",
        priority: "high",
      })
    }

    if (userPatterns.dominantCategory === "electricity") {
      recommendations.push({
        type: "efficiency",
        category: "electricity",
        title: "Optimize Home Energy Usage",
        description: "Adjust thermostat by 2°C and use LED bulbs to save 15% energy",
        impact: this.calculateImpact("electricity", "efficiency", 0.15),
        difficulty: "easy",
        priority: "medium",
      })
    }

    if (userPatterns.dominantCategory === "food") {
      recommendations.push({
        type: "diet_change",
        category: "food",
        title: "Reduce Meat Consumption",
        description: "Replace meat with plant-based alternatives 2 days per week",
        impact: this.calculateImpact("food", "meat_reduction", 2),
        difficulty: "medium",
        priority: "high",
      })
    }

    // Trend-based recommendations
    if (userPatterns.trend === "increasing") {
      recommendations.push({
        type: "awareness",
        category: "general",
        title: "Set Daily Carbon Budget",
        description: "Your emissions are trending up. Set a daily limit to stay on track",
        impact: { co2Saved: userPatterns.averageDaily * 0.2, percentage: 20 },
        difficulty: "easy",
        priority: "urgent",
      })
    }

    // Peak day recommendations
    if (userPatterns.peakDays.length > 0) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const peakDayNames = userPatterns.peakDays.map((day) => dayNames[day])

      recommendations.push({
        type: "timing",
        category: "general",
        title: `Optimize ${peakDayNames.join(", ")} Activities`,
        description: `Your emissions are highest on ${peakDayNames.join(", ")}. Plan eco-friendly alternatives`,
        impact: { co2Saved: userPatterns.averageDaily * 0.3, percentage: 30 },
        difficulty: "medium",
        priority: "medium",
      })
    }

    // Goal-based recommendations
    userGoals.forEach((goal) => {
      if (goal.status === "active" && goal.progress < goal.target * 0.8) {
        recommendations.push({
          type: "goal_support",
          category: goal.category,
          title: `Boost Your ${goal.title} Progress`,
          description: `You're ${Math.round(((goal.target - goal.progress) / goal.target) * 100)}% away from your goal`,
          impact: { co2Saved: goal.target - goal.progress, percentage: 25 },
          difficulty: "medium",
          priority: "high",
        })
      }
    })

    // Smart contextual recommendations
    const contextualRecs = this.generateContextualRecommendations(recentActivities)
    recommendations.push(...contextualRecs)

    // Sort by priority and impact
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff

        const impactA = a.impact?.co2Saved || 0
        const impactB = b.impact?.co2Saved || 0
        return impactB - impactA
      })
      .slice(0, 8) // Return top 8 recommendations
  }

  // Generate contextual recommendations based on recent activities
  generateContextualRecommendations(recentActivities) {
    const recommendations = []

    if (!recentActivities || recentActivities.length === 0) return recommendations

    // Analyze recent patterns
    const recentCategories = {}
    recentActivities.forEach((activity) => {
      recentCategories[activity.category] = (recentCategories[activity.category] || 0) + 1
    })

    // If user has been driving a lot recently
    if (recentCategories.travel >= 3) {
      recommendations.push({
        type: "immediate",
        category: "travel",
        title: "Plan a Car-Free Day",
        description: "You've been driving frequently. Try a day without your car this week",
        impact: this.calculateImpact("travel", "car_free_day", 1),
        difficulty: "medium",
        priority: "medium",
      })
    }

    // If user has high electricity usage
    if (recentCategories.electricity >= 2) {
      recommendations.push({
        type: "immediate",
        category: "electricity",
        title: "Unplug Devices Tonight",
        description: "Unplug electronics when not in use to reduce phantom energy consumption",
        impact: this.calculateImpact("electricity", "phantom_reduction", 0.1),
        difficulty: "easy",
        priority: "low",
      })
    }

    return recommendations
  }

  // Calculate impact of specific actions
  calculateImpact(category, action, amount) {
    let co2Saved = 0

    switch (action) {
      case "car_to_bus":
        co2Saved = amount * 10 * (this.emissionFactors.travel.car - this.emissionFactors.travel.bus) // 10km average trip
        break
      case "car_to_bike":
        co2Saved = amount * 5 * this.emissionFactors.travel.car // 5km average short trip
        break
      case "efficiency":
        co2Saved = amount * 100 * this.emissionFactors.electricity.standard // amount is percentage, 100 is average monthly kWh
        break
      case "meat_reduction":
        co2Saved = amount * 0.5 * this.emissionFactors.food.meat // amount is days, 0.5kg average meat per day
        break
      case "car_free_day":
        co2Saved = amount * 30 * this.emissionFactors.travel.car // 30km average daily driving
        break
      case "phantom_reduction":
        co2Saved = amount * 50 * this.emissionFactors.electricity.standard // amount is percentage, 50 is phantom consumption
        break
      default:
        co2Saved = 1
    }

    return {
      co2Saved: Math.round(co2Saved * 100) / 100,
      percentage: Math.round((co2Saved / 10) * 100), // Assuming 10kg daily average
    }
  }

  // Predict future emissions based on current patterns
  predictFutureEmissions(carbonFootprints, days = 30) {
    if (!carbonFootprints || carbonFootprints.length === 0) {
      return { prediction: 0, confidence: 0 }
    }

    const recentData = carbonFootprints.slice(-14) // Last 2 weeks
    const dailyAverage = recentData.reduce((sum, fp) => sum + fp.totalEmissions, 0) / recentData.length

    // Simple trend analysis
    const firstWeek = recentData.slice(0, 7)
    const secondWeek = recentData.slice(7, 14)

    const firstWeekAvg = firstWeek.reduce((sum, fp) => sum + fp.totalEmissions, 0) / firstWeek.length
    const secondWeekAvg = secondWeek.reduce((sum, fp) => sum + fp.totalEmissions, 0) / secondWeek.length

    const trendFactor = secondWeekAvg / firstWeekAvg || 1
    const prediction = dailyAverage * trendFactor * days

    // Calculate confidence based on data consistency
    const variance =
      recentData.reduce((sum, fp) => sum + Math.pow(fp.totalEmissions - dailyAverage, 2), 0) / recentData.length
    const confidence = Math.max(0, Math.min(100, 100 - (variance / dailyAverage) * 50))

    return {
      prediction: Math.round(prediction * 100) / 100,
      confidence: Math.round(confidence),
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      trend: trendFactor > 1.1 ? "increasing" : trendFactor < 0.9 ? "decreasing" : "stable",
    }
  }
}

module.exports = new MLRecommendationEngine()
