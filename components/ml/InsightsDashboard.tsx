"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Calendar, Target, Brain, BarChart3 } from "lucide-react"

interface UserPatterns {
  dominantCategory: string
  averageDaily: number
  trend: string
  peakDays: number[]
  lowDays: number[]
  categoryBreakdown: Record<string, number>
}

interface Prediction {
  prediction: number
  confidence: number
  dailyAverage: number
  trend: string
}

export default function InsightsDashboard() {
  const [patterns, setPatterns] = useState<UserPatterns | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
    fetchPredictions()
  }, [])

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/insights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPatterns(data.patterns)
      }
    } catch (error) {
      console.error("Error fetching insights:", error)
    }
  }

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/predictions?days=30`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPrediction(data)
      }
    } catch (error) {
      console.error("Error fetching predictions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-5 w-5 text-green-500" />
      default:
        return <BarChart3 className="h-5 w-5 text-blue-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-red-600 bg-red-50"
      case "decreasing":
        return "text-green-600 bg-green-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">AI Insights</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Emission Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getTrendIcon(patterns?.trend || "stable")}
              Emission Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${getTrendColor(patterns?.trend || "stable")}`}>
                <div className="text-2xl font-bold">{patterns?.averageDaily.toFixed(1) || "0"} kg CO₂</div>
                <div className="text-sm">Daily Average</div>
              </div>
              <Badge variant="outline" className="capitalize">
                {patterns?.trend || "stable"} trend
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dominant Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-orange-500" />
              Focus Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 capitalize">
                  {patterns?.dominantCategory || "Travel"}
                </div>
                <div className="text-sm text-gray-600">Highest Impact Category</div>
              </div>
              <div className="text-xs text-gray-500 text-center">Focus your efforts here for maximum impact</div>
            </div>
          </CardContent>
        </Card>

        {/* 30-Day Prediction */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              30-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{prediction?.prediction.toFixed(0) || "0"} kg</div>
                <div className="text-sm text-gray-600">Predicted CO₂</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Confidence</span>
                  <span>{prediction?.confidence || 0}%</span>
                </div>
                <Progress value={prediction?.confidence || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Days */}
        {patterns?.peakDays && patterns.peakDays.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Peak Emission Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {patterns.peakDays.map((day) => (
                    <Badge key={day} variant="destructive" className="text-xs">
                      {dayNames[day]}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-600">Your emissions are typically higher on these days</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low Days */}
        {patterns?.lowDays && patterns.lowDays.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Eco-Friendly Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {patterns.lowDays.map((day) => (
                    <Badge key={day} variant="secondary" className="text-xs bg-green-100 text-green-700">
                      {dayNames[day]}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-600">Great job! Your emissions are lowest on these days</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {patterns?.categoryBreakdown && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Category Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(patterns.categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([category, total]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{category}</span>
                      <span className="text-sm font-semibold">{total.toFixed(1)} kg</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
