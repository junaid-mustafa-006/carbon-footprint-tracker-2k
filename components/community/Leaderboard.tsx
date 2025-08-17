"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Leaf } from "lucide-react"

interface LeaderboardEntry {
  _id: string
  name: string
  profilePicture?: string
  totalEmissions: number
  ecoActionsCount: number
  carbonSaved: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/community/leaderboard?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: "bg-yellow-100 text-yellow-800 border-yellow-300",
        2: "bg-gray-100 text-gray-800 border-gray-300",
        3: "bg-amber-100 text-amber-800 border-amber-300",
      }
      return colors[rank as keyof typeof colors]
    }
    return "bg-blue-50 text-blue-700 border-blue-200"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Eco Champions
          </CardTitle>
          <div className="flex gap-2">
            {["week", "month", "year"].map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
                className="capitalize"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1
            return (
              <div
                key={entry._id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${getRankBadge(rank)}`}
              >
                <div className="flex items-center justify-center w-10">{getRankIcon(rank)}</div>

                <Avatar className="h-12 w-12">
                  <AvatarImage src={entry.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {entry.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{entry.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {entry.carbonSaved.toFixed(1)} kg CO₂ saved
                    </span>
                    <span>{entry.ecoActionsCount} eco actions</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{entry.totalEmissions.toFixed(1)} kg</div>
                  <div className="text-xs text-gray-500">CO₂ emissions</div>
                </div>
              </div>
            )
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No data available for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
