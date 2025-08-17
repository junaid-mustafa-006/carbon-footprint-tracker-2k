"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingDown, TrendingUp, Calendar } from "lucide-react"

interface CarbonChartProps {
  period?: "week" | "month" | "year"
}

export default function CarbonChart({ period = "month" }: CarbonChartProps) {
  const { token } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    fetchChartData()
  }, [selectedPeriod, token])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/tracking/chart-data?period=${selectedPeriod}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const chartData = await response.json()
        setData(chartData.data || [])
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const mockData = [
    { date: "2024-01-01", emissions: 12.5, budget: 33.3 },
    { date: "2024-01-02", emissions: 8.2, budget: 33.3 },
    { date: "2024-01-03", emissions: 15.7, budget: 33.3 },
    { date: "2024-01-04", emissions: 6.9, budget: 33.3 },
    { date: "2024-01-05", emissions: 11.3, budget: 33.3 },
    { date: "2024-01-06", emissions: 9.8, budget: 33.3 },
    { date: "2024-01-07", emissions: 14.2, budget: 33.3 },
  ]

  const chartData = data.length > 0 ? data : mockData

  const totalEmissions = chartData.reduce((sum, item) => sum + item.emissions, 0)
  const avgEmissions = totalEmissions / chartData.length
  const trend = chartData.length > 1 ? chartData[chartData.length - 1].emissions - chartData[0].emissions : 0

  const chartConfig = {
    emissions: {
      label: "Emissions",
      color: "hsl(var(--chart-1))",
    },
    budget: {
      label: "Daily Budget",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Carbon Emissions Trend
          </CardTitle>
          <CardDescription>Daily carbon footprint over time</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={chartType} onValueChange={(value: "line" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalEmissions.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Total kg CO₂</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{avgEmissions.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Daily Average</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                trend > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {trend > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {Math.abs(trend).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Trend</div>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="emissions"
                  stroke="var(--color-emissions)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-emissions)" }}
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="var(--color-budget)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="emissions" fill="var(--color-emissions)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
