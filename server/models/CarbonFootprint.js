const mongoose = require("mongoose")

const carbonFootprintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["travel", "electricity", "food", "water", "waste"],
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    amount: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    carbonEmission: {
      value: { type: Number, required: true }, // kg CO2
      calculationMethod: String,
      emissionFactor: Number,
    },
    metadata: {
      // Travel specific
      distance: Number,
      transportMode: String,
      passengers: Number,
      fuelType: String,

      // Electricity specific
      energySource: String,
      appliance: String,
      duration: Number,

      // Food specific
      mealType: String,
      ingredients: [String],
      isLocal: Boolean,
      isOrganic: Boolean,

      // Water specific
      waterType: String,
      treatment: String,

      // Waste specific
      wasteType: String,
      recycled: Boolean,
      composted: Boolean,
    },
    location: {
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    isEcoFriendly: {
      type: Boolean,
      default: false,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
carbonFootprintSchema.index({ userId: 1, createdAt: -1 })
carbonFootprintSchema.index({ userId: 1, category: 1, createdAt: -1 })

module.exports = mongoose.model("CarbonFootprint", carbonFootprintSchema)
