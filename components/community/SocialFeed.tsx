"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Leaf, Car, Zap, Droplets, Trash2 } from "lucide-react"

interface Activity {
  _id: string
  user: {
    _id: string
    name: string
    profilePicture?: string
  }
  date: string
  category: string
  totalEmissions: number
  ecoActions: string[]
  activities: Array<{
    type: string
    amount: number
    unit: string
  }>
}

export default function SocialFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/community/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error("Error fetching feed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "travel":
        return <Car className="h-4 w-4" />
      case "electricity":
        return <Zap className="h-4 w-4" />
      case "water":
        return <Droplets className="h-4 w-4" />
      case "waste":
        return <Trash2 className="h-4 w-4" />
      default:
        return <Leaf className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "travel":
        return "bg-blue-100 text-blue-700"
      case "electricity":
        return "bg-yellow-100 text-yellow-700"
      case "water":
        return "bg-cyan-100 text-cyan-700"
      case "waste":
        return "bg-red-100 text-red-700"
      default:
        return "bg-green-100 text-green-700"
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return activityDate.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.profilePicture || "/placeholder.svg"} />
                <AvatarFallback className="bg-green-100 text-green-700">
                  {activity.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{activity.user.name}</span>
                  <Badge variant="secondary" className={`text-xs ${getCategoryColor(activity.category)}`}>
                    {getCategoryIcon(activity.category)}
                    <span className="ml-1 capitalize">{activity.category}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{formatTimeAgo(activity.date)}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-600">Carbon footprint: </span>
                <span className="font-semibold text-red-600">{activity.totalEmissions.toFixed(2)} kg CO₂</span>
              </div>
              {activity.ecoActions.length > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Leaf className="h-3 w-3 mr-1" />
                  {activity.ecoActions.length} eco actions
                </Badge>
              )}
            </div>

            {activity.activities.length > 0 && (
              <div className="text-sm text-gray-600">
                <span>Activities: </span>
                {activity.activities.map((act, index) => (
                  <span key={index}>
                    {act.amount} {act.unit} {act.type}
                    {index < activity.activities.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}

            {activity.ecoActions.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">Eco Actions Taken:</p>
                <div className="flex flex-wrap gap-1">
                  {activity.ecoActions.map((action, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 border-t">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                <Heart className="h-4 w-4 mr-1" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                <MessageCircle className="h-4 w-4 mr-1" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {activities.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activities from your network</p>
              <p className="text-sm mt-2">Follow other users to see their eco-friendly activities!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
