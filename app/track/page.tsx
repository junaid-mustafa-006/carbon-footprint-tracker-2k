"use client"

import { useState } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import TrackingForm from "@/components/tracking/TrackingForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, TrendingUp, Target, Award } from "lucide-react"

export default function TrackPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleActivityLogged = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

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
                <a href="/track" className="text-green-600 font-medium">
                  Track
                </a>
                <a href="/challenges" className="text-gray-600 hover:text-gray-900">
                  Challenges
                </a>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Tracking Form */}
            <div className="lg:col-span-2">
              <TrackingForm onActivityLogged={handleActivityLogged} />
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Quick Stats
                  </CardTitle>
                  <CardDescription>Your impact at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold">245 kg CO₂</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget Used</span>
                    <span className="font-semibold text-orange-600">24.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Eco Actions</span>
                    <span className="font-semibold text-green-600">12</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Today's Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">8.5 kg</div>
                    <div className="text-sm text-gray-600 mb-4">Daily carbon budget</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">3.0 kg used today</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Recent Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌱</div>
                    <div className="font-semibold">Eco Warrior</div>
                    <div className="text-sm text-gray-600">Logged 10 eco-friendly actions</div>
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
