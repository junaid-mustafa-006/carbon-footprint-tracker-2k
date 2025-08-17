"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Leaf, TrendingDown, Users, Target, Zap, Car, Utensils, Droplets } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalEmissions: 0,
    monthlyBudget: 1000,
    streakDays: 0,
    ecoActions: 0,
  })

  return (
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
              <Button variant="ghost">Dashboard</Button>
              <Button variant="ghost">Track</Button>
              <Button variant="ghost">Challenges</Button>
              <Button variant="outline">Sign In</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Track Your Carbon Footprint,
            <span className="text-green-600"> Change Your Impact</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Monitor your daily activities, get personalized insights, and join a community committed to reducing carbon
            emissions through smart lifestyle choices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Start Tracking Free
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Go Carbon Neutral
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Core Tracking */}
            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                  <CardTitle>Smart Tracking</CardTitle>
                </div>
                <CardDescription>
                  Monitor travel, electricity, food, water, and waste emissions automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Car className="h-3 w-3" /> Travel
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Energy
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Utensils className="h-3 w-3" /> Food
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" /> Water
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Behavior Change */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <CardTitle>Smart Nudges</CardTitle>
                </div>
                <CardDescription>Get personalized recommendations and real-time suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Contextual activity suggestions</li>
                  <li>• Carbon budget alerts</li>
                  <li>• Streak maintenance tips</li>
                  <li>• Eco-friendly alternatives</li>
                </ul>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  <CardTitle>Community Challenges</CardTitle>
                </div>
                <CardDescription>Join global challenges and compete with friends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Challenges</span>
                    <Badge>12</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Global Participants</span>
                    <Badge variant="secondary">50K+</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Visualization */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">See Your Impact in Human Terms</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">🌳</div>
              <div className="text-2xl font-bold text-gray-900">127</div>
              <div className="text-gray-600">Trees Planted Equivalent</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">✈️</div>
              <div className="text-2xl font-bold text-gray-900">2.3</div>
              <div className="text-gray-600">Flights NYC-LA Saved</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">🚗</div>
              <div className="text-2xl font-bold text-gray-900">1,240</div>
              <div className="text-gray-600">Miles Not Driven</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold">CarbonTracker</span>
              </div>
              <p className="text-gray-400">Making carbon tracking simple and actionable for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Carbon Tracking</li>
                <li>Smart Nudges</li>
                <li>Community Challenges</li>
                <li>Impact Visualization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>API Documentation</li>
                <li>Help Center</li>
                <li>Blog</li>
                <li>Research</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Privacy</li>
                <li>Terms</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CarbonTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
