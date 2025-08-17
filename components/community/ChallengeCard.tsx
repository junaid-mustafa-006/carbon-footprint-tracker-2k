"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, Trophy, Leaf } from "lucide-react"

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

interface ChallengeCardProps {
  challenge: Challenge
  userProgress?: number
  isJoined: boolean
  onJoin: (challengeId: string) => void
}

export default function ChallengeCard({ challenge, userProgress = 0, isJoined, onJoin }: ChallengeCardProps) {
  const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const progressPercentage = (userProgress / challenge.target) * 100

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "carbon_reduction":
        return <Leaf className="h-5 w-5 text-green-600" />
      case "eco_actions":
        return <Trophy className="h-5 w-5 text-yellow-600" />
      default:
        return <Users className="h-5 w-5 text-blue-600" />
    }
  }

  const getChallengeColor = (type: string) => {
    switch (type) {
      case "carbon_reduction":
        return "bg-green-50 border-green-200"
      case "eco_actions":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <Card className={`${getChallengeColor(challenge.type)} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getChallengeIcon(challenge.type)}
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {challenge.type.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">{challenge.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{challenge.participants.length} participants</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{daysLeft} days left</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Target: {challenge.target} {challenge.unit}
            </span>
            {isJoined && (
              <span className="font-medium">
                {userProgress}/{challenge.target} {challenge.unit}
              </span>
            )}
          </div>
          {isJoined && <Progress value={progressPercentage} className="h-2" />}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">
            <span className="font-medium text-green-600">
              Reward: {challenge.reward.value} {challenge.reward.type}
            </span>
          </div>
          {!isJoined ? (
            <Button onClick={() => onJoin(challenge._id)} size="sm" className="bg-green-600 hover:bg-green-700">
              Join Challenge
            </Button>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Joined
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
