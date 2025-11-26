"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { db } from "@/lib/db"
import { XPLog, DailyProgress } from "@/lib/types"
import { XPLineChart } from "@/components/analytics/XPLineChart"
import { CategoryPieChart } from "@/components/analytics/CategoryPieChart"
import { CompletionStatsCards } from "@/components/analytics/CompletionStatsCards"
import { ProductivitySummaryCards } from "@/components/analytics/ProductivitySummaryCards"
import { StreakHeatmap } from "@/components/analytics/StreakHeatmap"
import { InsightsPanel } from "@/components/analytics/InsightsPanel"
import { getWeeklyXP, getXPByCategory, getCompletionStats, getProductivityInsights, getHeatmapData } from "@/lib/analytics"
import { InsightsEngine } from "@/services/insightsEngine"
import { Loader2 } from "lucide-react"

export default function AnalyticsPage() {
    const { profile, todayProgress } = useAppStore()
    const [loading, setLoading] = useState(true)
    const [xpLogs, setXpLogs] = useState<XPLog[]>([])
    const [allProgress, setAllProgress] = useState<DailyProgress[]>([])

    useEffect(() => {
        const loadData = async () => {
            try {
                const logs = await db.getAll("xpLogs")
                const progress = await db.getAll("dailyProgress")
                setXpLogs(logs)
                setAllProgress(progress)
            } catch (error) {
                console.error("Failed to load analytics data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Process data
    const weeklyXPData = getWeeklyXP(xpLogs)
    const categoryData = getXPByCategory(xpLogs)
    const completionStats = getCompletionStats(allProgress)
    const insights = getProductivityInsights(allProgress)
    const heatmapData = getHeatmapData(allProgress)

    // Calculate today's completion
    const todayCompletion = todayProgress && todayProgress.tasks.length > 0
        ? (todayProgress.completedTasks / todayProgress.tasks.length) * 100
        : 0

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            </div>

            <div className="space-y-4">
                <CompletionStatsCards
                    todayCompletion={todayCompletion}
                    weeklyCompletion={completionStats.weeklyCompletion}
                    monthlyCompletion={completionStats.monthlyCompletion}
                    totalTasksCompleted={completionStats.totalTasksCompleted}
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <XPLineChart data={weeklyXPData} />
                    <CategoryPieChart data={categoryData} />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4">
                        <ProductivitySummaryCards
                            mostProductiveDay={insights.mostProductiveDay}
                            leastProductiveDay={insights.leastProductiveDay}
                            mostConsistentBlock={insights.mostConsistentBlock}
                            weakestBlock={insights.weakestBlock}
                        />
                    </div>
                    <div className="col-span-3">
                        <InsightsPanel insights={InsightsEngine.generateInsights(allProgress, xpLogs)} />
                    </div>
                </div>

                <StreakHeatmap data={heatmapData} />
            </div>
        </div>
    )
}
