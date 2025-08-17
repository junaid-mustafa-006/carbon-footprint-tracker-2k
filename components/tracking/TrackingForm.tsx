"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Zap, Utensils, Droplets, Trash2, Loader2 } from "lucide-react"

interface TrackingFormProps {
  onActivityLogged?: () => void
}

export default function TrackingForm({ onActivityLogged }: TrackingFormProps) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    category: "travel",
    subcategory: "",
    activity: "",
    amount: { value: "", unit: "" },
    metadata: {},
    location: { city: "", country: "" },
    notes: "",
    isEcoFriendly: false,
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const categoryConfig = {
    travel: {
      icon: Car,
      subcategories: {
        car: { label: "Car", units: ["km", "liters"] },
        public_transport: { label: "Public Transport", units: ["km"] },
        air: { label: "Air Travel", units: ["km"] },
        bike: { label: "Bicycle", units: ["km"] },
        walking: { label: "Walking", units: ["km"] },
        rideshare: { label: "Rideshare", units: ["km"] },
      },
    },
    electricity: {
      icon: Zap,
      subcategories: {
        grid_consumption: { label: "Grid Consumption", units: ["kWh"] },
        appliance_usage: { label: "Appliance Usage", units: ["hours"] },
      },
    },
    food: {
      icon: Utensils,
      subcategories: {
        meat: { label: "Meat", units: ["kg", "servings"] },
        dairy: { label: "Dairy", units: ["kg", "liters"] },
        plant: { label: "Plant-based", units: ["kg", "servings"] },
        processed: { label: "Processed Food", units: ["servings"] },
      },
    },
    water: {
      icon: Droplets,
      subcategories: {
        consumption: { label: "Water Consumption", units: ["liters"] },
        shower: { label: "Shower", units: ["minutes"] },
        bath: { label: "Bath", units: ["baths"] },
      },
    },
    waste: {
      icon: Trash2,
      subcategories: {
        landfill: { label: "Landfill Waste", units: ["kg"] },
        recycling: { label: "Recycling", units: ["kg"] },
        composting: { label: "Composting", units: ["kg"] },
        incineration: { label: "Incineration", units: ["kg"] },
      },
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_BASE_URL}/tracking/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: {
            value: Number.parseFloat(formData.amount.value),
            unit: formData.amount.unit,
          },
          metadata: {
            ...formData.metadata,
            isEcoFriendly: formData.isEcoFriendly,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Activity logged! Carbon footprint: ${data.carbonEmission.value} kg CO₂`)
        setFormData({
          category: formData.category,
          subcategory: "",
          activity: "",
          amount: { value: "", unit: "" },
          metadata: {},
          location: { city: "", country: "" },
          notes: "",
          isEcoFriendly: false,
        })
        onActivityLogged?.()
      } else {
        throw new Error(data.message || "Failed to log activity")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to log activity")
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category,
      subcategory: "",
      amount: { value: "", unit: "" },
      metadata: {},
    })
  }

  const handleSubcategoryChange = (subcategory: string) => {
    const units = categoryConfig[formData.category as keyof typeof categoryConfig].subcategories[subcategory].units
    setFormData({
      ...formData,
      subcategory,
      amount: { ...formData.amount, unit: units[0] },
      metadata: {},
    })
  }

  const currentCategory = categoryConfig[formData.category as keyof typeof categoryConfig]
  const IconComponent = currentCategory.icon

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          Track Carbon Footprint
        </CardTitle>
        <CardDescription>Log your daily activities to track your environmental impact</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Category Selection */}
          <Tabs value={formData.category} onValueChange={handleCategoryChange}>
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <TabsTrigger key={key} value={key} className="flex flex-col gap-1 p-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs capitalize">{key}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {Object.entries(categoryConfig).map(([categoryKey, config]) => (
              <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
                {/* Subcategory */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Type</Label>
                  <Select value={formData.subcategory} onValueChange={handleSubcategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(config.subcategories).map(([key, subcat]) => (
                        <SelectItem key={key} value={key}>
                          {subcat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Description */}
                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Description</Label>
                  <Input
                    id="activity"
                    placeholder="e.g., Drive to work, Use air conditioner, Eat beef burger"
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    required
                  />
                </div>

                {/* Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: { ...formData.amount, value: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.amount.unit}
                      onValueChange={(unit) =>
                        setFormData({
                          ...formData,
                          amount: { ...formData.amount, unit },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.subcategory &&
                          config.subcategories[formData.subcategory]?.units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category-specific metadata */}
                {categoryKey === "travel" && formData.subcategory && (
                  <TravelMetadata formData={formData} setFormData={setFormData} />
                )}

                {categoryKey === "electricity" && formData.subcategory && (
                  <ElectricityMetadata formData={formData} setFormData={setFormData} />
                )}

                {categoryKey === "food" && formData.subcategory && (
                  <FoodMetadata formData={formData} setFormData={setFormData} />
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Eco-friendly toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="eco-friendly"
              checked={formData.isEcoFriendly}
              onCheckedChange={(checked) => setFormData({ ...formData, isEcoFriendly: checked })}
            />
            <Label htmlFor="eco-friendly">This is an eco-friendly action (saves carbon)</Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this activity..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging Activity...
              </>
            ) : (
              "Log Activity"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Category-specific metadata components
function TravelMetadata({ formData, setFormData }: any) {
  const updateMetadata = (key: string, value: any) => {
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, [key]: value },
    })
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">Travel Details</h4>

      {formData.subcategory === "car" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <Select
              value={formData.metadata.fuelType || ""}
              onValueChange={(value) => updateMetadata("fuelType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Passengers</Label>
            <Input
              type="number"
              min="1"
              value={formData.metadata.passengers || "1"}
              onChange={(e) => updateMetadata("passengers", Number.parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      {formData.subcategory === "public_transport" && (
        <div className="space-y-2">
          <Label>Transport Mode</Label>
          <Select
            value={formData.metadata.transportMode || ""}
            onValueChange={(value) => updateMetadata("transportMode", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transport mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="train">Train</SelectItem>
              <SelectItem value="subway">Subway</SelectItem>
              <SelectItem value="tram">Tram</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.subcategory === "air" && (
        <div className="space-y-2">
          <Label>Flight Type</Label>
          <Select
            value={formData.metadata.flightType || ""}
            onValueChange={(value) => updateMetadata("flightType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select flight type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domestic">Domestic</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

function ElectricityMetadata({ formData, setFormData }: any) {
  const updateMetadata = (key: string, value: any) => {
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, [key]: value },
    })
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">Electricity Details</h4>

      <div className="space-y-2">
        <Label>Energy Source</Label>
        <Select
          value={formData.metadata.energySource || ""}
          onValueChange={(value) => updateMetadata("energySource", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select energy source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us_average">Grid Average</SelectItem>
            <SelectItem value="renewable">Renewable</SelectItem>
            <SelectItem value="coal">Coal</SelectItem>
            <SelectItem value="natural_gas">Natural Gas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.subcategory === "appliance_usage" && (
        <div className="space-y-2">
          <Label>Appliance</Label>
          <Select
            value={formData.metadata.appliance || ""}
            onValueChange={(value) => updateMetadata("appliance", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select appliance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="air_conditioner">Air Conditioner</SelectItem>
              <SelectItem value="heater">Heater</SelectItem>
              <SelectItem value="refrigerator">Refrigerator</SelectItem>
              <SelectItem value="washing_machine">Washing Machine</SelectItem>
              <SelectItem value="dryer">Dryer</SelectItem>
              <SelectItem value="dishwasher">Dishwasher</SelectItem>
              <SelectItem value="tv">TV</SelectItem>
              <SelectItem value="computer">Computer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

function FoodMetadata({ formData, setFormData }: any) {
  const updateMetadata = (key: string, value: any) => {
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, [key]: value },
    })
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">Food Details</h4>

      {formData.subcategory === "meat" && (
        <div className="space-y-2">
          <Label>Meat Type</Label>
          <Select value={formData.metadata.meatType || ""} onValueChange={(value) => updateMetadata("meatType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select meat type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beef">Beef</SelectItem>
              <SelectItem value="lamb">Lamb</SelectItem>
              <SelectItem value="pork">Pork</SelectItem>
              <SelectItem value="chicken">Chicken</SelectItem>
              <SelectItem value="fish">Fish</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.subcategory === "dairy" && (
        <div className="space-y-2">
          <Label>Dairy Type</Label>
          <Select
            value={formData.metadata.dairyType || ""}
            onValueChange={(value) => updateMetadata("dairyType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dairy type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="milk">Milk</SelectItem>
              <SelectItem value="cheese">Cheese</SelectItem>
              <SelectItem value="yogurt">Yogurt</SelectItem>
              <SelectItem value="butter">Butter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isLocal"
            checked={formData.metadata.isLocal || false}
            onCheckedChange={(checked) => updateMetadata("isLocal", checked)}
          />
          <Label htmlFor="isLocal">Local</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isOrganic"
            checked={formData.metadata.isOrganic || false}
            onCheckedChange={(checked) => updateMetadata("isOrganic", checked)}
          />
          <Label htmlFor="isOrganic">Organic</Label>
        </div>
      </div>
    </div>
  )
}
