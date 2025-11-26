"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import type { DailyProgress } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Loader2, TrendingUp, PieChart as PieChartIcon, Calendar } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { analyzeProductivity } from "@/lib/prediction"
import { Lightbulb, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AnalyticsView() {
  const { tasks } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<DailyProgress[]>([])
  const [timeRange, setTimeRange] = useState("7")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const allProgress = await db.getAll("dailyProgress")
        setHistory(allProgress.sort((a, b) => a.date.localeCompare(b.date)))
      } catch (error) {
        console.error("Failed to load analytics data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Process data for charts
  const daysToShow = parseInt(timeRange)
  const recentHistory = history.slice(-daysToShow)

  // Prediction Analysis
  const prediction = analyzeProductivity(tasks, history)

  // XP History Data
  const xpData = recentHistory.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    xp: day.totalXP
  }))

  // Category Distribution Data
  const categoryMap = new Map<string, number>()
  recentHistory.forEach(day => {
    day.tasks.forEach(task => {
      if (task.completed) {
        const current = categoryMap.get(task.category) || 0
        categoryMap.set(task.category, current + task.duration)
      }
    })
  })

  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Productivity Trend (Completion Rate)
  const completionData = recentHistory.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    rate: day.tasks.length > 0 ? Math.round((day.completedTasks / day.tasks.length) * 100) : 0
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {prediction.insights.length > 0 ? (
                prediction.insights.map((insight, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex gap-2 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {insight}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Keep using the app to generate personalized insights!
                </p>
              )}
            </div>

            {prediction.weakAreas.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium mb-2">Focus Areas:</p>
                <div className="flex gap-2 flex-wrap">
                  {prediction.weakAreas.map(area => (
                    <Badge key={area} variant="secondary">{area}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRight className="w-5 h-5 text-primary" />
              Suggested Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.suggestedTasks.length > 0 ? (
                prediction.suggestedTasks.map((task, i) => (
                  <div key={i} className="p-3 border rounded-lg bg-card/50">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant="outline" className="text-[10px]">{task.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No suggestions available right now.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* XP Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              XP Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="xp" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <PieChartIcon className="w-4 h-4" />
              Time by Category (Minutes)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Rate Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--secondary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
