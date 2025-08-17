// Carbon emission factors (kg CO₂ per unit)
const EMISSION_FACTORS = {
  travel: {
    car: {
      gasoline: 2.31, // kg CO₂ per liter
      diesel: 2.68,
      electric: 0.5, // varies by grid
      hybrid: 1.8,
    },
    public_transport: {
      bus: 0.089, // kg CO₂ per km per passenger
      train: 0.041,
      subway: 0.028,
      tram: 0.029,
    },
    air: {
      domestic: 0.255, // kg CO₂ per km
      international: 0.195,
    },
    bike: 0, // Zero emissions
    walking: 0,
    rideshare: 0.2, // kg CO₂ per km (shared)
  },
  electricity: {
    grid: {
      us_average: 0.4, // kg CO₂ per kWh
      renewable: 0.02,
      coal: 0.82,
      natural_gas: 0.35,
    },
    appliances: {
      // kWh per hour of use
      air_conditioner: 3.5,
      heater: 4.0,
      refrigerator: 0.15,
      washing_machine: 0.5,
      dryer: 2.5,
      dishwasher: 1.5,
      tv: 0.1,
      computer: 0.3,
      lights_led: 0.01,
      lights_incandescent: 0.06,
    },
  },
  food: {
    meat: {
      beef: 27.0, // kg CO₂ per kg
      lamb: 39.2,
      pork: 12.1,
      chicken: 6.9,
      fish: 6.1,
    },
    dairy: {
      milk: 3.2, // kg CO₂ per liter
      cheese: 13.5, // kg CO₂ per kg
      yogurt: 2.2,
      butter: 23.8,
    },
    plant: {
      vegetables: 2.0, // kg CO₂ per kg
      fruits: 1.1,
      grains: 1.4,
      legumes: 0.9,
      nuts: 2.3,
    },
    processed: {
      fast_food: 8.5, // kg CO₂ per meal
      packaged_meal: 4.2,
      snacks: 3.1,
    },
  },
  water: {
    tap: 0.0004, // kg CO₂ per liter
    bottled: 0.25,
    filtered: 0.001,
    shower: 0.5, // kg CO₂ per minute (heating)
    bath: 2.5, // kg CO₂ per bath
  },
  waste: {
    landfill: 1.0, // kg CO₂ per kg waste
    recycling: -0.5, // negative = carbon saved
    composting: -0.3,
    incineration: 0.7,
  },
}

/**
 * Calculate carbon emission for an activity
 * @param {string} category - Main category (travel, electricity, etc.)
 * @param {string} subcategory - Subcategory within the main category
 * @param {object} amount - Amount object with value and unit
 * @param {object} metadata - Additional metadata for calculation
 * @returns {object} Carbon emission data
 */
async function calculateCarbonEmission(category, subcategory, amount, metadata = {}) {
  let emissionFactor = 0
  let calculationMethod = "standard"
  let carbonValue = 0

  try {
    switch (category) {
      case "travel":
        carbonValue = calculateTravelEmission(subcategory, amount, metadata)
        emissionFactor = getTravelEmissionFactor(subcategory, metadata)
        break

      case "electricity":
        carbonValue = calculateElectricityEmission(subcategory, amount, metadata)
        emissionFactor = getElectricityEmissionFactor(subcategory, metadata)
        break

      case "food":
        carbonValue = calculateFoodEmission(subcategory, amount, metadata)
        emissionFactor = getFoodEmissionFactor(subcategory, metadata)
        break

      case "water":
        carbonValue = calculateWaterEmission(subcategory, amount, metadata)
        emissionFactor = getWaterEmissionFactor(subcategory, metadata)
        break

      case "waste":
        carbonValue = calculateWasteEmission(subcategory, amount, metadata)
        emissionFactor = getWasteEmissionFactor(subcategory, metadata)
        break

      default:
        throw new Error(`Unknown category: ${category}`)
    }

    // Apply eco-friendly multiplier
    if (metadata.isEcoFriendly) {
      carbonValue *= -0.5 // Eco actions save carbon
      calculationMethod = "eco_friendly"
    }

    return {
      value: Math.round(carbonValue * 100) / 100, // Round to 2 decimal places
      calculationMethod,
      emissionFactor,
    }
  } catch (error) {
    console.error("Carbon calculation error:", error)
    return {
      value: 0,
      calculationMethod: "error",
      emissionFactor: 0,
    }
  }
}

function calculateTravelEmission(subcategory, amount, metadata) {
  const { distance, transportMode, fuelType, passengers = 1 } = metadata

  if (subcategory === "car") {
    const factor = EMISSION_FACTORS.travel.car[fuelType] || EMISSION_FACTORS.travel.car.gasoline
    // Convert fuel consumption to CO₂ (amount.value is liters of fuel)
    return (amount.value * factor) / passengers
  }

  if (subcategory === "public_transport") {
    const factor = EMISSION_FACTORS.travel.public_transport[transportMode] || 0.089
    // amount.value is distance in km
    return amount.value * factor
  }

  if (subcategory === "air") {
    const factor = EMISSION_FACTORS.travel.air[metadata.flightType] || EMISSION_FACTORS.travel.air.domestic
    return amount.value * factor
  }

  if (subcategory === "bike" || subcategory === "walking") {
    return 0 // Zero emissions
  }

  if (subcategory === "rideshare") {
    return (amount.value * EMISSION_FACTORS.travel.rideshare) / passengers
  }

  return 0
}

function calculateElectricityEmission(subcategory, amount, metadata) {
  const { energySource, appliance, duration } = metadata

  if (subcategory === "grid_consumption") {
    const factor = EMISSION_FACTORS.electricity.grid[energySource] || EMISSION_FACTORS.electricity.grid.us_average
    // amount.value is kWh
    return amount.value * factor
  }

  if (subcategory === "appliance_usage") {
    const applianceConsumption = EMISSION_FACTORS.electricity.appliances[appliance] || 1.0
    const gridFactor = EMISSION_FACTORS.electricity.grid[energySource] || EMISSION_FACTORS.electricity.grid.us_average
    // amount.value is hours of usage
    return amount.value * applianceConsumption * gridFactor
  }

  return 0
}

function calculateFoodEmission(subcategory, amount, metadata) {
  const { mealType, ingredients, isLocal, isOrganic } = metadata

  let factor = 0

  if (subcategory === "meat") {
    factor = EMISSION_FACTORS.food.meat[metadata.meatType] || EMISSION_FACTORS.food.meat.chicken
  } else if (subcategory === "dairy") {
    factor = EMISSION_FACTORS.food.dairy[metadata.dairyType] || EMISSION_FACTORS.food.dairy.milk
  } else if (subcategory === "plant") {
    factor = EMISSION_FACTORS.food.plant[metadata.plantType] || EMISSION_FACTORS.food.plant.vegetables
  } else if (subcategory === "processed") {
    factor = EMISSION_FACTORS.food.processed[metadata.processedType] || EMISSION_FACTORS.food.processed.packaged_meal
  }

  let emission = amount.value * factor

  // Apply modifiers
  if (isLocal) emission *= 0.8 // 20% reduction for local food
  if (isOrganic) emission *= 0.9 // 10% reduction for organic

  return emission
}

function calculateWaterEmission(subcategory, amount, metadata) {
  const { waterType, treatment } = metadata

  let factor = EMISSION_FACTORS.water[waterType] || EMISSION_FACTORS.water.tap

  if (subcategory === "shower" || subcategory === "bath") {
    factor = EMISSION_FACTORS.water[subcategory]
  }

  return amount.value * factor
}

function calculateWasteEmission(subcategory, amount, metadata) {
  const { wasteType, recycled, composted } = metadata

  let factor = EMISSION_FACTORS.waste.landfill

  if (recycled) {
    factor = EMISSION_FACTORS.waste.recycling
  } else if (composted) {
    factor = EMISSION_FACTORS.waste.composting
  } else if (subcategory === "incineration") {
    factor = EMISSION_FACTORS.waste.incineration
  }

  return amount.value * factor
}

// Helper functions to get emission factors
function getTravelEmissionFactor(subcategory, metadata) {
  if (subcategory === "car") {
    return EMISSION_FACTORS.travel.car[metadata.fuelType] || EMISSION_FACTORS.travel.car.gasoline
  }
  return EMISSION_FACTORS.travel[subcategory] || 0
}

function getElectricityEmissionFactor(subcategory, metadata) {
  return EMISSION_FACTORS.electricity.grid[metadata.energySource] || EMISSION_FACTORS.electricity.grid.us_average
}

function getFoodEmissionFactor(subcategory, metadata) {
  const categoryFactors = EMISSION_FACTORS.food[subcategory]
  if (!categoryFactors) return 0

  const typeKey = metadata.meatType || metadata.dairyType || metadata.plantType || metadata.processedType
  return categoryFactors[typeKey] || Object.values(categoryFactors)[0]
}

function getWaterEmissionFactor(subcategory, metadata) {
  return EMISSION_FACTORS.water[metadata.waterType] || EMISSION_FACTORS.water.tap
}

function getWasteEmissionFactor(subcategory, metadata) {
  if (metadata.recycled) return EMISSION_FACTORS.waste.recycling
  if (metadata.composted) return EMISSION_FACTORS.waste.composting
  return EMISSION_FACTORS.waste[subcategory] || EMISSION_FACTORS.waste.landfill
}

module.exports = {
  calculateCarbonEmission,
  EMISSION_FACTORS,
}
