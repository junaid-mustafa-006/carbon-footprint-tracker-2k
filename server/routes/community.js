const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Challenge = require("../models/Challenge")
const CarbonFootprint = require("../models/CarbonFootprint")
const auth = require("../middleware/auth")

// Get active challenges
router.get("/challenges", auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      status: "active",
      endDate: { $gte: new Date() },
    }).populate("participants.user", "name profilePicture")

    res.json(challenges)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Join a challenge
router.post("/challenges/:id/join", auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" })
    }

    const alreadyJoined = challenge.participants.some((p) => p.user.toString() === req.user.id)

    if (alreadyJoined) {
      return res.status(400).json({ message: "Already joined this challenge" })
    }

    challenge.participants.push({
      user: req.user.id,
      joinedAt: new Date(),
      progress: 0,
    })

    await challenge.save()
    res.json({ message: "Successfully joined challenge" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get leaderboard
router.get("/leaderboard", auth, async (req, res) => {
  try {
    const { period = "month", category = "total" } = req.query

    const startDate = new Date()
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1)
    }

    const pipeline = [
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$user",
          totalEmissions: { $sum: "$totalEmissions" },
          ecoActionsCount: { $sum: { $size: "$ecoActions" } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          name: "$user.name",
          profilePicture: "$user.profilePicture",
          totalEmissions: 1,
          ecoActionsCount: 1,
          carbonSaved: { $multiply: ["$ecoActionsCount", 2.5] },
        },
      },
      {
        $sort: { totalEmissions: 1 },
      },
      {
        $limit: 50,
      },
    ]

    const leaderboard = await CarbonFootprint.aggregate(pipeline)
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Follow/unfollow user
router.post("/users/:id/follow", auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user.id)

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" })
    }

    const isFollowing = currentUser.following.includes(req.params.id)

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== req.params.id)
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== req.user.id)
    } else {
      currentUser.following.push(req.params.id)
      targetUser.followers.push(req.user.id)
    }

    await currentUser.save()
    await targetUser.save()

    res.json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      isFollowing: !isFollowing,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user's social feed
router.get("/feed", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const followingIds = [...user.following, req.user.id]

    const activities = await CarbonFootprint.find({
      user: { $in: followingIds },
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .populate("user", "name profilePicture")
      .sort({ date: -1 })
      .limit(20)

    res.json(activities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
