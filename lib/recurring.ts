import { Task, RepeatRule } from "./types"
import { getLocalDate } from "./utils"

export function shouldGenerateTask(task: Task, date: string): boolean {
    if (task.repeatRule === "none") return false

    const taskDate = new Date(task.scheduledDate || date)
    const checkDate = new Date(date)
    const dayOfWeek = checkDate.getDay() // 0 = Sunday, 6 = Saturday

    // Don't generate if task is already scheduled for this date
    if (task.scheduledDate === date) return false

    switch (task.repeatRule) {
        case "daily":
            return true
        case "weekdays":
            return dayOfWeek >= 1 && dayOfWeek <= 5
        case "weekends":
            return dayOfWeek === 0 || dayOfWeek === 6
        case "weekly":
            return taskDate.getDay() === dayOfWeek
        case "custom":
            return task.repeatDays?.includes(dayOfWeek) || false
        default:
            return false
    }
}

export function generateRecurringTasks(tasks: Task[], date: string): Task[] {
    const generatedTasks: Task[] = []
    const existingTaskIds = new Set(tasks.map((t) => t.parentId || t.id))

    // Filter for parent tasks that have recurrence
    const parentTasks = tasks.filter((t) => t.repeatRule !== "none" && !t.parentId)

    for (const parent of parentTasks) {
        // Check if we should generate a task for this date
        if (shouldGenerateTask(parent, date)) {
            // Check if we already have a generated task for this date (optimization to avoid duplicates if run multiple times)
            // In a real app, we'd query the DB for tasks on this date with this parentId
            // For now, we'll rely on the caller to filter duplicates or handle idempotency

            const newTask: Task = {
                ...parent,
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                parentId: parent.id,
                scheduledDate: date,
                completed: false,
                completedAt: undefined,
            }

            generatedTasks.push(newTask)
        }
    }

    return generatedTasks
}

export function getNextOccurrence(task: Task, fromDate: string = getLocalDate()): string | null {
    if (task.repeatRule === "none") return null

    const start = new Date(fromDate)
    // Look ahead up to 365 days
    for (let i = 1; i <= 365; i++) {
        const nextDate = new Date(start)
        nextDate.setDate(start.getDate() + i)
        const dateStr = nextDate.toISOString().split("T")[0]

        if (shouldGenerateTask(task, dateStr)) {
            return dateStr
        }
    }

    return null
}
