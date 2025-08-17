"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Plus, Award, TrendingUp } from "lucide-react"

interface Goal {
  _id: string
  type: string
  category: string
  title: string
  description: string
  target: {
    value: number
    unit: string
    metric: string
  }
  progress: {
    current: number
    percentage: number
  }
  duration: {
    daysRemaining: number
  }
  status: string
  difficulty: string
  rewards: {
    points: number
  }
}

export default function GoalTracker() {
  const { token } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    fetchGoals()
    fetchSuggestions()
  }, [token, activeTab])

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals?status=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/suggestions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  const createGoal = async (goalData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalData),
      })

      if (response.ok) {
        fetchGoals() // Refresh goals
      }
    } catch (error) {
      console.error("Error creating goal:", error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Tracker
        </CardTitle>
        <CardDescription>Set and track your sustainability goals</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No active goals yet</p>
                <Button onClick={() => setActiveTab("suggestions")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Suggestions
                </Button>
              </div>
            ) : (
              goals.map((goal) => (
                <div key={goal._id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <Badge className={getDifficultyColor(goal.difficulty)}>{goal.difficulty}</Badge>
                        <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{goal.duration.daysRemaining} days left</div>
                      <div className="text-xs text-gray-400">{goal.rewards.points} points</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {goal.progress.current} / {goal.target.value} {goal.target.unit}
                      </span>
                    </div>
                    <Progress value={goal.progress.percentage} className="h-2" />
                    <div className="text-xs text-gray-500">{goal.progress.percentage.toFixed(1)}% complete</div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {goals.filter((g) => g.status === "completed").length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No completed goals yet</p>
                <p className="text-sm text-gray-500">Complete your first goal to see it here!</p>
              </div>
            ) : (
              goals
                .filter((g) => g.status === "completed")
                .map((goal) => (
                  <div key={goal._id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">{goal.title}</h4>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-2">{goal.description}</p>
                    <div className="text-sm text-green-600">Earned {goal.rewards.points} points</div>
                  </div>
                ))
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading personalized suggestions...</p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge className={getDifficultyColor(suggestion.difficulty)}>{suggestion.difficulty}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      <div className="text-xs text-green-600 font-medium">
                        Estimated impact: {suggestion.estimatedImpact}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => createGoal(suggestion)}>
                      Start Goal
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
