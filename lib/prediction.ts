import { Task, DailyProgress, TaskCategory } from "./types"
import { getLocalDate } from "./utils"

interface PredictionResult {
    suggestedTasks: Partial<Task>[]
    weakAreas: TaskCategory[]
    productivityScore: number
    insights: string[]
}

export const analyzeProductivity = (
    tasks: Task[],
    history: DailyProgress[]
): PredictionResult => {
    const today = getLocalDate()
    const recentHistory = history
        .filter(h => h.date < today)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7) // Last 7 days

    // Calculate completion rates by category
    const categoryStats = new Map<TaskCategory, { total: number; completed: number }>()

    // Analyze history
    recentHistory.forEach(day => {
        // We would need task history for this, but for now we can use the aggregate stats if available
        // or infer from current tasks if we had a way to link them to history.
        // Since DailyProgress only stores aggregate counts, we'll use current tasks for category analysis
    })

    // Analyze current tasks for patterns
    const completedTasks = tasks.filter(t => t.completed)
    completedTasks.forEach(task => {
        const stats = categoryStats.get(task.category) || { total: 0, completed: 0 }
        stats.total++
        stats.completed++
        categoryStats.set(task.category, stats)
    })

    const activeTasks = tasks.filter(t => !t.completed)
    activeTasks.forEach(task => {
        const stats = categoryStats.get(task.category) || { total: 0, completed: 0 }
        stats.total++
        categoryStats.set(task.category, stats)
    })

    // Identify weak areas (completion rate < 50%)
    const weakAreas: TaskCategory[] = []
    categoryStats.forEach((stats, category) => {
        if (stats.total > 0 && (stats.completed / stats.total) < 0.5) {
            weakAreas.push(category)
        }
    })

    // Generate insights
    const insights: string[] = []
    if (weakAreas.length > 0) {
        insights.push(`You're struggling with ${weakAreas.join(", ")} tasks. Try scheduling them during your peak energy hours.`)
    }

    const completionRate = tasks.length > 0
        ? (tasks.filter(t => t.completed).length / tasks.length) * 100
        : 0

    if (completionRate > 80) {
        insights.push("Great job! Your completion rate is high. Consider increasing your task load.")
    } else if (completionRate < 30 && tasks.length > 0) {
        insights.push("Your completion rate is low. Try breaking down tasks into smaller steps.")
    }

    // Suggest tasks based on weak areas or missing categories
    const suggestedTasks: Partial<Task>[] = []

    if (weakAreas.includes("Health")) {
        suggestedTasks.push({
            title: "Quick Workout",
            category: "Health",
            priority: "medium",
            description: "15-minute HIIT session to boost energy."
        })
    }

    if (weakAreas.includes("Study")) {
        suggestedTasks.push({
            title: "Review Notes",
            category: "Study",
            priority: "high",
            description: "Review notes from the last lecture for 20 minutes."
        })
    }

    return {
        suggestedTasks,
        weakAreas,
        productivityScore: Math.round(completionRate),
        insights
    }
}
