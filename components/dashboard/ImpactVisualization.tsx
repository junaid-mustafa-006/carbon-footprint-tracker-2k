"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Leaf, Plane, Car, Home } from "lucide-react"

export default function ImpactVisualization() {
  const { token } = useAuth()
  const [impactData, setImpactData] = useState({
    totalEmissions: 245.7,
    carbonSaved: 67.3,
    equivalents: {
      trees: 11,
      flights: 2.7,
      cars: 53,
      homes: 0.8,
    },
    comparisons: {
      avgPerson: -15, // 15% below average
      lastMonth: -8, // 8% reduction from last month
      target: 24, // 24% of annual target used
    },
  })
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    fetchImpactData()
  }, [token])

  const fetchImpactData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/tracking/impact`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const impact = await response.json()
        setImpactData(impact)
      }
    } catch (error) {
      console.error("Error fetching impact data:", error)
    } finally {
      setLoading(false)
    }
  }

  const equivalentCards = [
    {
      icon: Leaf,
      value: impactData.equivalents.trees,
      unit: "trees planted",
      description: "CO₂ absorption equivalent",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Plane,
      value: impactData.equivalents.flights,
      unit: "NYC-LA flights",
      description: "Aviation emissions equivalent",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Car,
      value: impactData.equivalents.cars,
      unit: "miles driven",
      description: "Vehicle emissions equivalent",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Home,
      value: impactData.equivalents.homes,
      unit: "homes powered",
      description: "Energy consumption equivalent",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Environmental Impact
        </CardTitle>
        <CardDescription>Your carbon footprint in relatable terms</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="equivalents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equivalents">Equivalents</TabsTrigger>
            <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          </TabsList>

          <TabsContent value="equivalents" className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">{impactData.totalEmissions.toFixed(1)} kg CO₂</div>
              <div className="text-sm text-gray-600">Your carbon footprint this month</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {equivalentCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div key={index} className={`p-4 rounded-lg ${card.bgColor} border`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${card.color}`} />
                      <span className="text-sm font-medium text-gray-700">{card.description}</span>
                    </div>
                    <div className={`text-2xl font-bold ${card.color} mb-1`}>
                      {typeof card.value === "number" && card.value < 1
                        ? card.value.toFixed(1)
                        : Math.round(card.value)}
                    </div>
                    <div className="text-sm text-gray-600">{card.unit}</div>
                  </div>
                )
              })}
            </div>

            {impactData.carbonSaved > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Carbon Saved</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">{impactData.carbonSaved.toFixed(1)} kg CO₂</div>
                <div className="text-sm text-green-700">Through eco-friendly actions this month</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparisons" className="space-y-4">
            <div className="space-y-4">
              {/* Comparison with Average Person */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">vs. Average Person</div>
                  <div className="text-sm text-gray-600">Monthly comparison</div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={impactData.comparisons.avgPerson < 0 ? "default" : "destructive"}
                    className={impactData.comparisons.avgPerson < 0 ? "bg-green-100 text-green-800" : ""}
                  >
                    {impactData.comparisons.avgPerson > 0 ? "+" : ""}
                    {impactData.comparisons.avgPerson}%
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    {impactData.comparisons.avgPerson < 0 ? "Below average" : "Above average"}
                  </div>
                </div>
              </div>

              {/* Comparison with Last Month */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">vs. Last Month</div>
                  <div className="text-sm text-gray-600">Month-over-month change</div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={impactData.comparisons.lastMonth < 0 ? "default" : "destructive"}
                    className={impactData.comparisons.lastMonth < 0 ? "bg-green-100 text-green-800" : ""}
                  >
                    {impactData.comparisons.lastMonth > 0 ? "+" : ""}
                    {impactData.comparisons.lastMonth}%
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    {impactData.comparisons.lastMonth < 0 ? "Improvement" : "Increase"}
                  </div>
                </div>
              </div>

              {/* Annual Target Progress */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Annual Target</div>
                  <div className="text-sm text-gray-600">Progress toward yearly goal</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{impactData.comparisons.target}%</Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    {impactData.comparisons.target < 25
                      ? "On track"
                      : impactData.comparisons.target < 35
                        ? "Slightly behind"
                        : "Behind target"}
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-blue-800 mb-2">Keep Up the Great Work!</div>
              <div className="text-sm text-blue-700">
                {impactData.comparisons.avgPerson < 0
                  ? "You're doing better than the average person. Every small action counts toward a sustainable future."
                  : "There's room for improvement. Consider using public transport, eating less meat, or switching to renewable energy."}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
