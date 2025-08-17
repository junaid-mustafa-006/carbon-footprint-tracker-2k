"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Leaf, TrendingDown, DollarSign } from "lucide-react"

interface LifestyleChange {
  id: string
  type: string
  category: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  timeframe: string
}

const LIFESTYLE_CHANGES: LifestyleChange[] = [
  {
    id: "1",
    type: "switch_to_public_transport",
    category: "travel",
    description: "Use public transport instead of driving 3 days per week",
    difficulty: "medium",
    timeframe: "1 month",
  },
  {
    id: "2",
    type: "work_from_home_2_days",
    category: "travel",
    description: "Work from home 2 days per week",
    difficulty: "easy",
    timeframe: "1 month",
  },
  {
    id: "3",
    type: "eat_vegetarian_3_days",
    category: "food",
    description: "Eat vegetarian meals 3 days per week",
    difficulty: "medium",
    timeframe: "1 month",
  },
  {
    id: "4",
    type: "use_led_bulbs",
    category: "electricity",
    description: "Replace all incandescent bulbs with LED bulbs",
    difficulty: "easy",
    timeframe: "1 week",
  },
  {
    id: "5",
    type: "reduce_heating_2_degrees",
    category: "electricity",
    description: "Lower thermostat by 2°C in winter",
    difficulty: "easy",
    timeframe: "1 month",
  },
  {
    id: "6",
    type: "bike_short_trips",
    category: "travel",
    description: "Bike or walk for trips under 3km",
    difficulty: "medium",
    timeframe: "1 month",
  },
  {
    id: "7",
    type: "meal_prep_reduce_waste",
    category: "food",
    description: "Meal prep to reduce food waste by 50%",
    difficulty: "medium",
    timeframe: "1 month",
  },
]

export default function LifestyleSimulator() {
  const { token } = useAuth()
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])
  const [simulation, setSimulation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const handleChangeSelection = (changeId: string, checked: boolean) => {
    if (checked) {
      setSelectedChanges([...selectedChanges, changeId])
    } else {
      setSelectedChanges(selectedChanges.filter((id) => id !== changeId))
    }
  }

  const runSimulation = async () => {
    if (selectedChanges.length === 0) return

    setLoading(true)
    try {
      const changes = LIFESTYLE_CHANGES.filter((change) => selectedChanges.includes(change.id))

      const response = await fetch(`${API_BASE_URL}/goals/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ changes }),
      })

      if (response.ok) {
        const data = await response.json()
        setSimulation(data.simulation)
      }
    } catch (error) {
      console.error("Error running simulation:", error)
    } finally {
      setLoading(false)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Lifestyle Impact Simulator
        </CardTitle>
        <CardDescription>See how lifestyle changes would affect your carbon footprint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Selection */}
        <div className="space-y-4">
          <h4 className="font-medium">Select lifestyle changes to simulate:</h4>
          <div className="grid gap-3">
            {LIFESTYLE_CHANGES.map((change) => (
              <div key={change.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={change.id}
                  checked={selectedChanges.includes(change.id)}
                  onCheckedChange={(checked) => handleChangeSelection(change.id, !!checked)}
                />
                <div className="flex-1">
                  <label htmlFor={change.id} className="text-sm font-medium cursor-pointer">
                    {change.description}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getDifficultyColor(change.difficulty)} variant="secondary">
                      {change.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {change.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{change.timeframe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulate Button */}
        <Button onClick={runSimulation} disabled={selectedChanges.length === 0 || loading} className="w-full">
          {loading ? "Running Simulation..." : `Simulate ${selectedChanges.length} Changes`}
        </Button>

        {/* Simulation Results */}
        {simulation && (
          <div className="space-y-6">
            <Separator />

            <div>
              <h4 className="font-medium mb-4">Simulation Results</h4>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {simulation.summary.totalCarbonSaved.toFixed(1)} kg
                  </div>
                  <div className="text-sm text-green-700">CO₂ Saved Monthly</div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <Leaf className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{simulation.summary.percentageReduction}%</div>
                  <div className="text-sm text-blue-700">Reduction</div>
                </div>
              </div>

              {/* Equivalents */}
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <h5 className="font-medium mb-3">Environmental Impact</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span>🌳</span>
                    <span>{simulation.summary.equivalents.trees} trees planted equivalent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✈️</span>
                    <span>{simulation.summary.equivalents.flights} flights NYC-LA avoided</span>
                  </div>
                </div>
              </div>

              {/* Individual Changes */}
              <div className="space-y-3">
                <h5 className="font-medium">Impact by Change</h5>
                {simulation.changes.map((change: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{change.change}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {change.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          -{change.carbonSaved.toFixed(1)} kg CO₂
                        </div>
                        {change.costSavings > 0 && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />${change.costSavings.toFixed(0)} saved
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {change.currentEmissions.toFixed(1)} → {change.projectedEmissions.toFixed(1)} kg CO₂/month
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button className="w-full bg-transparent" variant="outline">
                  Create Goals from These Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
