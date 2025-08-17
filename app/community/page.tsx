"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ChallengeCard from "@/components/community/ChallengeCard"
import Leaderboard from "@/components/community/Leaderboard"
import SocialFeed from "@/components/community/SocialFeed"
import { Users, Trophy, MessageSquare, Search, Plus } from "lucide-react"

interface Challenge {
  _id: string
  title: string
  description: string
  type: string
  target: number
  unit: string
  startDate: string
  endDate: string
  participants: Array<{
    user: {
      _id: string
      name: string
      profilePicture?: string
    }
    progress: number
  }>
  reward: {
    type: string
    value: number
  }
}

export default function CommunityPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/community/challenges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChallenges(data)

        // Check which challenges user has joined
        const currentUserId = localStorage.getItem("userId")
        const joined = data
          .filter((challenge: Challenge) => challenge.participants.some((p) => p.user._id === currentUserId))
          .map((challenge: Challenge) => challenge._id)
        setJoinedChallenges(joined)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/community/challenges/${challengeId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setJoinedChallenges([...joinedChallenges, challengeId])
        fetchChallenges() // Refresh to update participant count
      }
    } catch (error) {
      console.error("Error joining challenge:", error)
    }
  }

  const filteredChallenges = challenges.filter(
    (challenge) =>
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeChallenges = filteredChallenges.filter((challenge) => !joinedChallenges.includes(challenge._id))

  const myChallenges = filteredChallenges.filter((challenge) => joinedChallenges.includes(challenge._id))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
          <p className="text-gray-600">Connect with eco-warriors, join challenges, and make a difference together</p>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Social Feed
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Eco Challenges</CardTitle>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Challenge
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search challenges..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{myChallenges.length} Joined</Badge>
                    <Badge variant="outline">{activeChallenges.length} Available</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {myChallenges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  My Challenges
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                      isJoined={true}
                      onJoin={handleJoinChallenge}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">Available Challenges</h3>
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
              ) : activeChallenges.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                      isJoined={false}
                      onJoin={handleJoinChallenge}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No challenges found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {searchTerm ? "Try adjusting your search terms" : "Check back later for new challenges!"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="feed">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SocialFeed />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Following</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Followers</span>
                      <span className="font-semibold">18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Challenges Joined</span>
                      <span className="font-semibold">{myChallenges.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Groups Coming Soon</h3>
                <p className="text-gray-500 mb-4">Create and join eco-focused groups with like-minded individuals</p>
                <Button variant="outline">Get Notified</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
