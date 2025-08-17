"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"

export default function CarbonBudgetWidget() {
  const { token } = useAuth()
  const [budgetData, setBudgetData] = useState({
    monthly: 1000,
    current: 245,
    used: 24.5,
    remaining: 755,
    daysLeft: 18,
    dailyAverage: 13.6,
    projectedTotal: 850,
  })
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    fetchBudgetData()
  }, [token])

  const fetchBudgetData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/tracking/summary?period=month`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const summary = await response.json()
        if (summary.budgetStatus) {
          setBudgetData({
            monthly: summary.carbonBudget.monthly,
            current: summary.carbonBudget.current,
            used: summary.budgetStatus.used,
            remaining: summary.budgetStatus.remaining,
            daysLeft: 18, // Calculate based on current date
            dailyAverage: summary.carbonBudget.current / 13, // Assuming 13 days passed
            projectedTotal: (summary.carbonBudget.current / 13) * 31, // Project for full month
          })
        }
      }
    } catch (error) {
      console.error("Error fetching budget data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBudgetStatus = () => {
    if (budgetData.used < 50) return { status: "good", color: "text-green-600", icon: CheckCircle }
    if (budgetData.used < 80) return { status: "warning", color: "text-yellow-600", icon: AlertTriangle }
    return { status: "danger", color: "text-red-600", icon: AlertTriangle }
  }

  const budgetStatus = getBudgetStatus()
  const StatusIcon = budgetStatus.icon

  const isOnTrack = budgetData.projectedTotal <= budgetData.monthly

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Carbon Budget
        </CardTitle>
        <CardDescription>Monthly carbon footprint tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Budget Used</span>
            <span className={`text-sm font-semibold ${budgetStatus.color}`}>{budgetData.used.toFixed(1)}%</span>
          </div>
          <Progress
            value={budgetData.used}
            className="h-3"
            // @ts-ignore
            indicatorClassName={
              budgetData.used < 50 ? "bg-green-500" : budgetData.used < 80 ? "bg-yellow-500" : "bg-red-500"
            }
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{budgetData.current.toFixed(1)} kg CO₂</span>
            <span>{budgetData.monthly} kg CO₂</span>
          </div>
        </div>

        {/* Status Card */}
        <div
          className={`p-4 rounded-lg border-l-4 ${
            budgetStatus.status === "good"
              ? "bg-green-50 border-green-500"
              : budgetStatus.status === "warning"
                ? "bg-yellow-50 border-yellow-500"
                : "bg-red-50 border-red-500"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={`h-5 w-5 ${budgetStatus.color}`} />
            <span className={`font-semibold ${budgetStatus.color}`}>
              {budgetStatus.status === "good"
                ? "On Track"
                : budgetStatus.status === "warning"
                  ? "Watch Usage"
                  : "Over Budget"}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {budgetStatus.status === "good"
              ? "You're doing great! Keep up the eco-friendly habits."
              : budgetStatus.status === "warning"
                ? "You're using your budget faster than expected. Consider eco-friendly alternatives."
                : "You've exceeded your recommended carbon budget. Time for immediate action!"}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{budgetData.remaining.toFixed(0)}</div>
            <div className="text-sm text-gray-600">kg CO₂ Remaining</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{budgetData.daysLeft}</div>
            <div className="text-sm text-gray-600">Days Left</div>
          </div>
        </div>

        {/* Projection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Projection</span>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-4 w-4 ${isOnTrack ? "text-green-600" : "text-red-600"}`} />
              <span className={`text-sm font-semibold ${isOnTrack ? "text-green-600" : "text-red-600"}`}>
                {budgetData.projectedTotal.toFixed(0)} kg CO₂
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Based on your daily average of {budgetData.dailyAverage.toFixed(1)} kg CO₂
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant={budgetStatus.status === "good" ? "outline" : "default"}
          className="w-full"
          onClick={() => (window.location.href = "/track")}
        >
          {budgetStatus.status === "good" ? "Log Activity" : "Take Action"}
        </Button>
      </CardContent>
    </Card>
  )
}
