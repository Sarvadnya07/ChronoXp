// Improved recurring task generation engine

import type { Task, RepeatRule } from "./types"
import { getLocalDate } from "./utils"

/**
 * Generate recurring tasks for a specific date
 * Only generates tasks that should occur on that date based on repeat rules
 */
export function generateRecurringTasksForDate(
    allTasks: Task[],
    targetDate: string
): Task[] {
    const generated: Task[] = []
    const targetDay = new Date(targetDate).getDay() // 0 = Sunday, 6 = Saturday

    for (const task of allTasks) {
        // Skip if not a recurring task
        if (task.repeatRule === "none") continue

        // Skip if task already has this specific date
        if (task.scheduledDate === targetDate) continue

        // Check if task should occur on this date
        if (shouldTaskOccurOnDate(task, targetDay)) {
            const generatedTask: Task = {
                ...task,
                id: `${task.id}-${targetDate}`,
                scheduledDate: targetDate,
                completed: false,
                completedAt: undefined,
                parentId: task.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            generated.push(generatedTask)
        }
    }

    return generated
}

/**
 * Check if a task should occur on a specific day of week
 */
function shouldTaskOccurOnDate(task: Task, dayOfWeek: number): boolean {
    switch (task.repeatRule) {
        case "daily":
            return true

        case "weekdays":
            return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday

        case "weekends":
            return dayOfWeek === 0 || dayOfWeek === 6 // Saturday or Sunday

        case "weekly":
            // Occurs on the same day of week as the original task
            if (task.scheduledDate) {
                const originalDay = new Date(task.scheduledDate).getDay()
                return dayOfWeek === originalDay
            }
            return false

        case "custom":
            // Check custom repeat days
            if (task.repeatDays && task.repeatDays.length > 0) {
                return task.repeatDays.includes(dayOfWeek)
            }
            // Fallback to daysOfWeek for backward compatibility
            if (task.daysOfWeek && task.daysOfWeek.length > 0) {
                return task.daysOfWeek.includes(dayOfWeek)
            }
            return false

        default:
            return false
    }
}

/**
 * Generate recurring tasks for the next N days
 * Useful for preloading upcoming tasks
 */
export function generateRecurringTasksForRange(
    allTasks: Task[],
    startDate: string,
    days: number = 7
): Task[] {
    const generated: Task[] = []
    const start = new Date(startDate)

    for (let i = 0; i < days; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split("T")[0]

        const tasksForDate = generateRecurringTasksForDate(allTasks, dateStr)
        generated.push(...tasksForDate)
    }

    return generated
}

/**
 * Clean up old generated recurring tasks
 * Removes generated tasks older than N days
 */
export function cleanupOldRecurringTasks(tasks: Task[], daysToKeep: number = 30): Task[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffStr = cutoffDate.toISOString().split("T")[0]

    return tasks.filter((task) => {
        // Keep non-recurring tasks
        if (!task.parentId) return true

        // Keep recent recurring tasks
        if (task.scheduledDate && task.scheduledDate >= cutoffStr) return true

        // Remove old recurring tasks
        return false
    })
}

/**
 * Update recurring pattern without regenerating all instances
 */
export function updateRecurringPattern(
    task: Task,
    newRepeatRule: RepeatRule,
    newRepeatDays?: number[]
): Task {
    return {
        ...task,
        repeatRule: newRepeatRule,
        repeatDays: newRepeatDays,
        updatedAt: Date.now(),
    }
}
