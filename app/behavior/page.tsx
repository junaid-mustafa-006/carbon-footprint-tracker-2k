"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"
import NudgeCenter from "@/components/behavior/NudgeCenter"
import GoalTracker from "@/components/behavior/GoalTracker"
import LifestyleSimulator from "@/components/behavior/LifestyleSimulator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Brain, Target, Calculator } from "lucide-react"

export default function BehaviorPage() {
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
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </a>
                <a href="/track" className="text-gray-600 hover:text-gray-900">
                  Track
                </a>
                <a href="/behavior" className="text-green-600 font-medium">
                  Behavior
                </a>
                <a href="/challenges" className="text-gray-600 hover:text-gray-900">
                  Challenges
                </a>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Behavior Change Hub</h2>
            <p className="text-gray-600">
              Get personalized recommendations, set goals, and simulate the impact of lifestyle changes.
            </p>
          </div>

          {/* Feature Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Smart Nudges</h3>
                <p className="text-sm text-gray-600">Get contextual recommendations based on your activity patterns</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Goal Tracking</h3>
                <p className="text-sm text-gray-600">Set and track personalized sustainability goals with rewards</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Impact Simulator</h3>
                <p className="text-sm text-gray-600">See how lifestyle changes would affect your carbon footprint</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <NudgeCenter />
              <LifestyleSimulator />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <GoalTracker />

              {/* Streak & Achievement Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>Track your sustainability journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600 mb-1">5</div>
                      <div className="text-sm text-orange-700">Day Streak</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-1">12</div>
                      <div className="text-sm text-purple-700">Eco Actions</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Achievements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                        <span className="text-2xl">🌱</span>
                        <div>
                          <div className="font-medium text-sm">Eco Warrior</div>
                          <div className="text-xs text-gray-600">Completed 10 eco-friendly actions</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <div className="font-medium text-sm">Goal Getter</div>
                          <div className="text-xs text-gray-600">Completed your first sustainability goal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
