"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Car, Zap, Utensils, Droplets, Trash2, PieChartIcon } from "lucide-react"

const CATEGORY_COLORS = {
  travel: "hsl(var(--chart-1))",
  electricity: "hsl(var(--chart-2))",
  food: "hsl(var(--chart-3))",
  water: "hsl(var(--chart-4))",
  waste: "hsl(var(--chart-5))",
}

const CATEGORY_ICONS = {
  travel: Car,
  electricity: Zap,
  food: Utensils,
  water: Droplets,
  waste: Trash2,
}

export default function CategoryBreakdown() {
  const { token } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState<"pie" | "bar">("pie")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    fetchCategoryData()
  }, [token])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/tracking/summary?period=month`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const summary = await response.json()
        const categoryData = summary.categoryBreakdown || []
        setData(
          categoryData.map((item: any) => ({
            category: item._id,
            emissions: item.totalEmissions,
            count: item.count,
            percentage: 0, // Will be calculated
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching category data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const mockData = [
    { category: "travel", emissions: 45.2, count: 12, percentage: 35 },
    { category: "electricity", emissions: 28.7, count: 8, percentage: 22 },
    { category: "food", emissions: 32.1, count: 15, percentage: 25 },
    { category: "water", emissions: 12.3, count: 6, percentage: 10 },
    { category: "waste", emissions: 10.7, count: 4, percentage: 8 },
  ]

  const chartData = data.length > 0 ? data : mockData

  // Calculate percentages
  const totalEmissions = chartData.reduce((sum, item) => sum + item.emissions, 0)
  const dataWithPercentages = chartData.map((item) => ({
    ...item,
    percentage: Math.round((item.emissions / totalEmissions) * 100),
  }))

  const chartConfig = Object.fromEntries(
    Object.entries(CATEGORY_COLORS).map(([key, color]) => [
      key,
      { label: key.charAt(0).toUpperCase() + key.slice(1), color },
    ]),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Emissions by Category
          </CardTitle>
          <CardDescription>Breakdown of your carbon footprint this month</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType("pie")}
            className={`px-3 py-1 rounded text-sm ${
              viewType === "pie" ? "bg-blue-100 text-blue-700" : "text-gray-600"
            }`}
          >
            Pie
          </button>
          <button
            onClick={() => setViewType("bar")}
            className={`px-3 py-1 rounded text-sm ${
              viewType === "bar" ? "bg-blue-100 text-blue-700" : "text-gray-600"
            }`}
          >
            Bar
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === "pie" ? (
                  <PieChart>
                    <Pie
                      data={dataWithPercentages}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="emissions"
                    >
                      {dataWithPercentages.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium capitalize">{data.category}</p>
                              <p className="text-sm text-gray-600">
                                {data.emissions.toFixed(1)} kg CO₂ ({data.percentage}%)
                              </p>
                              <p className="text-sm text-gray-600">{data.count} activities</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                ) : (
                  <BarChart data={dataWithPercentages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="emissions" fill="hsl(var(--chart-1))" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Legend & Details */}
          <div className="space-y-4">
            {dataWithPercentages.map((item) => {
              const Icon = CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]
              return (
                <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] }}
                    />
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium capitalize">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.emissions.toFixed(1)} kg</div>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
