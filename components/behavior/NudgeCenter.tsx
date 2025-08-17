"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, X, CheckCircle, AlertTriangle, Lightbulb, Target } from "lucide-react"

interface Nudge {
  _id: string
  type: string
  content: {
    title: string
    message: string
    actionText?: string
    actionUrl?: string
    priority: "low" | "medium" | "high"
  }
  engagement: {
    viewed: boolean
    clicked: boolean
    dismissed: boolean
  }
  createdAt: string
}

export default function NudgeCenter() {
  const { token } = useAuth()
  const [nudges, setNudges] = useState<Nudge[]>([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    fetchNudges()
    generateNudges()
  }, [token])

  const fetchNudges = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/nudges?status=pending&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNudges(data.nudges || [])
      }
    } catch (error) {
      console.error("Error fetching nudges:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateNudges = async () => {
    try {
      await fetch(`${API_BASE_URL}/nudges/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // Refresh nudges after generation
      setTimeout(fetchNudges, 1000)
    } catch (error) {
      console.error("Error generating nudges:", error)
    }
  }

  const handleNudgeAction = async (nudgeId: string, action: "viewed" | "clicked" | "dismissed") => {
    try {
      await fetch(`${API_BASE_URL}/nudges/${nudgeId}/engage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      // Update local state
      setNudges(
        nudges.map((nudge) =>
          nudge._id === nudgeId ? { ...nudge, engagement: { ...nudge.engagement, [action]: true } } : nudge,
        ),
      )

      // Remove nudge if dismissed
      if (action === "dismissed") {
        setNudges(nudges.filter((nudge) => nudge._id !== nudgeId))
      }
    } catch (error) {
      console.error("Error engaging with nudge:", error)
    }
  }

  const getNudgeIcon = (type: string) => {
    switch (type) {
      case "budget_warning":
        return AlertTriangle
      case "contextual":
        return Lightbulb
      case "streak_reminder":
        return Target
      case "eco_tip":
        return CheckCircle
      default:
        return Bell
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Nudges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading personalized recommendations...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Smart Nudges
        </CardTitle>
        <CardDescription>Personalized recommendations to reduce your carbon footprint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {nudges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium">You're all caught up!</p>
            <p className="text-sm">No new recommendations at the moment.</p>
          </div>
        ) : (
          nudges.map((nudge) => {
            const Icon = getNudgeIcon(nudge.type)
            return (
              <Alert key={nudge._id} className={`${getPriorityColor(nudge.content.priority)} border-l-4`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{nudge.content.title}</h4>
                        <Badge className={`text-xs ${getPriorityBadgeColor(nudge.content.priority)}`}>
                          {nudge.content.priority}
                        </Badge>
                      </div>
                      <AlertDescription className="text-gray-700 mb-3">{nudge.content.message}</AlertDescription>
                      <div className="flex items-center gap-2">
                        {nudge.content.actionText && nudge.content.actionUrl && (
                          <Button
                            size="sm"
                            onClick={() => {
                              handleNudgeAction(nudge._id, "clicked")
                              window.location.href = nudge.content.actionUrl!
                            }}
                          >
                            {nudge.content.actionText}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleNudgeAction(nudge._id, "viewed")}>
                          Got it
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleNudgeAction(nudge._id, "dismissed")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            )
          })
        )}

        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" onClick={generateNudges} className="w-full bg-transparent">
            Get New Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
