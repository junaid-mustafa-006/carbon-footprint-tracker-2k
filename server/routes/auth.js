const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, email, password, firstName, lastName, location } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? "Email already registered" : "Username already taken",
        })
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        profile: {
          firstName,
          lastName,
          location,
        },
      })

      await user.save()

      // Generate JWT token
      const payload = {
        userId: user._id,
        username: user.username,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      })

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Generate JWT token
      const payload = {
        userId: user._id,
        username: user.username,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      })

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          carbonBudget: user.carbonBudget,
          streaks: user.streaks,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  [
    body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
    body("location.city").optional().trim().isLength({ min: 1, max: 100 }),
    body("location.country").optional().trim().isLength({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { firstName, lastName, location, preferences } = req.body

      const updateData = {}
      if (firstName !== undefined) updateData["profile.firstName"] = firstName
      if (lastName !== undefined) updateData["profile.lastName"] = lastName
      if (location) updateData["profile.location"] = location
      if (preferences) updateData["profile.preferences"] = preferences

      const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password")

      res.json({
        message: "Profile updated successfully",
        user,
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({ message: "Server error during profile update" })
    }
  },
)

// @route   PUT /api/auth/carbon-budget
// @desc    Update carbon budget
// @access  Private
router.put(
  "/carbon-budget",
  auth,
  [body("monthly").isNumeric().withMessage("Monthly budget must be a number")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { monthly } = req.body

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          "carbonBudget.monthly": monthly,
          "carbonBudget.lastReset": new Date(),
        },
        { new: true, runValidators: true },
      ).select("-password")

      res.json({
        message: "Carbon budget updated successfully",
        carbonBudget: user.carbonBudget,
      })
    } catch (error) {
      console.error("Carbon budget update error:", error)
      res.status(500).json({ message: "Server error during budget update" })
    }
  },
)

module.exports = router
