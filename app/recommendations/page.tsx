"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import RecommendationCard from "@/components/ml/RecommendationCard"
import InsightsDashboard from "@/components/ml/InsightsDashboard"
import { Brain, Lightbulb, BarChart3, RefreshCw } from "lucide-react"

interface Recommendation {
  type: string
  category: string
  title: string
  description: string
  impact: {
    co2Saved: number
    percentage: number
  }
  difficulty: string
  priority: string
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRecommendations()
    setRefreshing(false)
  }

  const handleAcceptRecommendation = (recommendation: Recommendation) => {
    // In a real app, this would track the user's acceptance and potentially create a goal
    console.log("Accepted recommendation:", recommendation)
    // Remove from current recommendations
    setRecommendations(recommendations.filter((r) => r.title !== recommendation.title))
  }

  const handleDismissRecommendation = (recommendation: Recommendation) => {
    // Remove from current recommendations
    setRecommendations(recommendations.filter((r) => r.title !== recommendation.title))
  }

  const priorityRecommendations = recommendations.filter((r) => r.priority === "urgent" || r.priority === "high")
  const otherRecommendations = recommendations.filter((r) => r.priority === "medium" || r.priority === "low")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Brain className="h-8 w-8 text-purple-600" />
                AI Recommendations
              </h1>
              <p className="text-gray-600">Personalized suggestions to reduce your carbon footprint</p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
            ) : (
              <>
                {priorityRecommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Priority Actions
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {priorityRecommendations.map((recommendation, index) => (
                        <RecommendationCard
                          key={index}
                          recommendation={recommendation}
                          onAccept={handleAcceptRecommendation}
                          onDismiss={handleDismissRecommendation}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {otherRecommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Additional Suggestions</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {otherRecommendations.map((recommendation, index) => (
                        <RecommendationCard
                          key={index}
                          recommendation={recommendation}
                          onAccept={handleAcceptRecommendation}
                          onDismiss={handleDismissRecommendation}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Start tracking your carbon footprint to get personalized AI recommendations
                      </p>
                      <Button onClick={() => (window.location.href = "/track")}>Start Tracking</Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="insights">
            <InsightsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
