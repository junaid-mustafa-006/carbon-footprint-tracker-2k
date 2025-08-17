"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, TrendingDown, Clock, Target, Zap, AlertTriangle } from "lucide-react"

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

interface RecommendationCardProps {
  recommendation: Recommendation
  onAccept?: (recommendation: Recommendation) => void
  onDismiss?: (recommendation: Recommendation) => void
}

export default function RecommendationCard({ recommendation, onAccept, onDismiss }: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "hard":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "behavior_change":
        return <TrendingDown className="h-5 w-5 text-blue-600" />
      case "immediate":
        return <Zap className="h-5 w-5 text-yellow-600" />
      case "goal_support":
        return <Target className="h-5 w-5 text-purple-600" />
      case "awareness":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-green-600" />
    }
  }

  const impactPercentage = Math.min(100, (recommendation.impact.co2Saved / 10) * 100) // Assuming 10kg is high impact

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(recommendation.type)}
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          </div>
          <Badge className={`text-xs ${getPriorityColor(recommendation.priority)}`}>
            {recommendation.priority.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">{recommendation.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Potential Impact</span>
            <span className="font-semibold text-green-600">
              {recommendation.impact.co2Saved.toFixed(1)} kg CO₂ saved
            </span>
          </div>
          <Progress value={impactPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Low Impact</span>
            <span>High Impact</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className={getDifficultyColor(recommendation.difficulty)}>
                {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
              </span>
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {recommendation.category}
            </Badge>
          </div>
          <div className="text-sm font-medium text-green-600">-{recommendation.impact.percentage}% emissions</div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onAccept?.(recommendation)}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Try This
          </Button>
          <Button onClick={() => onDismiss?.(recommendation)} variant="outline" size="sm" className="flex-1">
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
