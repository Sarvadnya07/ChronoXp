import { DailyProgress, Task, XPLog } from "@/lib/types"

export interface Insight {
    type: "warning" | "success" | "neutral"
    message: string
    metric?: string
}

export const InsightsEngine = {
    getWeakestCategory(xpLogs: XPLog[]): string {
        const categoryMap: Record<string, number> = {}
        xpLogs.forEach(log => {
            categoryMap[log.category] = (categoryMap[log.category] || 0) + log.xp
        })

        const sorted = Object.entries(categoryMap).sort((a, b) => a[1] - b[1])
        return sorted.length > 0 ? sorted[0][0] : "None"
    },

    getBestFocusTime(tasks: Task[]): string {
        // Placeholder logic
        // In a real app, we'd analyze completion times
        return "09:00 - 11:00"
    },

    getConsistencyScore(progress: DailyProgress[]): number {
        if (progress.length === 0) return 0
        const completed = progress.filter(p => p.completedTasks > 0).length
        return Math.round((completed / progress.length) * 100)
    },

    generateInsights(progress: DailyProgress[], xpLogs: XPLog[]): Insight[] {
        const insights: Insight[] = []

        // Consistency
        const consistency = this.getConsistencyScore(progress.slice(-7))
        if (consistency < 50) {
            insights.push({
                type: "warning",
                message: "Your consistency is dropping. Try to do at least one task daily.",
                metric: `${consistency}%`
            })
        } else if (consistency > 80) {
            insights.push({
                type: "success",
                message: "Great consistency this week!",
                metric: `${consistency}%`
            })
        }

        // Weakest Category
        const weakest = this.getWeakestCategory(xpLogs)
        if (weakest !== "None") {
            insights.push({
                type: "neutral",
                message: `You've been neglecting ${weakest}. Schedule a session soon?`,
            })
        }

        return insights
    }
}
