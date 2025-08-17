"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import CarbonChart from "@/components/dashboard/CarbonChart"
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown"
import CarbonBudgetWidget from "@/components/dashboard/CarbonBudgetWidget"
import ImpactVisualization from "@/components/dashboard/ImpactVisualization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Leaf, Plus, TrendingDown, Award, Target, Users } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [quickStats, setQuickStats] = useState({
    todayEmissions: 3.2,
    weeklyAverage: 8.7,
    streakDays: 5,
    ecoActions: 12,
    rank: 847,
    totalUsers: 15420,
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">CarbonTracker</h1>
              </div>
              <nav className="flex items-center space-x-4">
                <a href="/dashboard" className="text-green-600 font-medium">
                  Dashboard
                </a>
                <a href="/track" className="text-gray-600 hover:text-gray-900">
                  Track
                </a>
                <a href="/challenges" className="text-gray-600 hover:text-gray-900">
                  Challenges
                </a>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Log Activity
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.profile?.firstName || user?.username}!
            </h2>
            <p className="text-gray-600">
              Here's your environmental impact overview and progress toward your sustainability goals.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today</p>
                    <p className="text-2xl font-bold text-blue-600">{quickStats.todayEmissions} kg</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Weekly Avg</p>
                    <p className="text-2xl font-bold text-green-600">{quickStats.weeklyAverage} kg</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{quickStats.streakDays} days</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rank</p>
                    <p className="text-2xl font-bold text-purple-600">#{quickStats.rank}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-8">
              <CarbonChart />
              <CategoryBreakdown />
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-8">
              <CarbonBudgetWidget />
              <ImpactVisualization />

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Your latest carbon footprint entries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { activity: "Drive to work", category: "travel", emissions: 4.2, time: "2 hours ago" },
                    { activity: "Lunch (chicken)", category: "food", emissions: 1.8, time: "4 hours ago" },
                    { activity: "Air conditioning", category: "electricity", emissions: 2.1, time: "6 hours ago" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{item.activity}</div>
                        <div className="text-xs text-gray-600">{item.time}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <div className="text-sm font-semibold text-gray-900">{item.emissions} kg CO₂</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    View All Activities
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
