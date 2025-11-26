// Task validation utilities

import type { Task } from "./types"

export interface ValidationError {
    field: string
    message: string
}

export interface TaskValidationResult {
    isValid: boolean
    errors: ValidationError[]
}

/**
 * Validate a task for required fields and logical consistency
 */
export function validateTask(task: Partial<Task>): TaskValidationResult {
    const errors: ValidationError[] = []

    // Required fields
    if (!task.title || task.title.trim().length === 0) {
        errors.push({ field: "title", message: "Task title is required" })
    }

    if (!task.category) {
        errors.push({ field: "category", message: "Category is required" })
    }

    if (!task.duration || task.duration <= 0) {
        errors.push({ field: "duration", message: "Duration must be greater than 0" })
    }

    // Time validation
    if (task.startTime && task.endTime) {
        const start = timeToMinutes(task.startTime)
        const end = timeToMinutes(task.endTime)

        if (end <= start) {
            errors.push({ field: "endTime", message: "End time must be after start time" })
        }

        // Check if duration matches time range
        const calculatedDuration = end - start
        if (task.duration && Math.abs(calculatedDuration - task.duration) > 5) {
            errors.push({
                field: "duration",
                message: `Duration (${task.duration}m) doesn't match time range (${calculatedDuration}m)`,
            })
        }
    }

    // XP validation
    if (task.xp !== undefined && task.xp < 0) {
        errors.push({ field: "xp", message: "XP cannot be negative" })
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Check if two tasks overlap in time
 */
export function tasksOverlap(task1: Task, task2: Task): boolean {
    // Skip if either task doesn't have a start time
    if (!task1.startTime || !task2.startTime) return false

    // Skip if tasks are on different dates
    if (task1.scheduledDate !== task2.scheduledDate) return false

    const start1 = timeToMinutes(task1.startTime)
    const end1 = start1 + (task1.duration || 0)

    const start2 = timeToMinutes(task2.startTime)
    const end2 = start2 + (task2.duration || 0)

    // Check for overlap
    return start1 < end2 && start2 < end1
}

/**
 * Find all tasks that overlap with the given task
 */
export function findOverlappingTasks(task: Task, allTasks: Task[]): Task[] {
    return allTasks.filter((t) => {
        // Don't compare task with itself
        if (t.id === task.id) return false
        return tasksOverlap(task, t)
    })
}

/**
 * Calculate end time from start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = startMinutes + durationMinutes

    const hours = Math.floor(endMinutes / 60) % 24
    const minutes = endMinutes % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/**
 * Calculate duration from start and end time
 */
export function calculateDuration(startTime: string, endTime: string): number {
    const start = timeToMinutes(startTime)
    const end = timeToMinutes(endTime)

    if (end < start) {
        // Handle overnight tasks
        return (24 * 60 - start) + end
    }

    return end - start
}

/**
 * Convert time string (HH:mm) to minutes from midnight
 */
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

/**
 * Auto-calculate missing time fields
 */
export function autoCalculateTimeFields(task: Partial<Task>): Partial<Task> {
    const updated = { ...task }

    // If we have start time and duration, calculate end time
    if (updated.startTime && updated.duration && !updated.endTime) {
        updated.endTime = calculateEndTime(updated.startTime, updated.duration)
    }

    // If we have start and end time, calculate duration
    if (updated.startTime && updated.endTime && !updated.duration) {
        updated.duration = calculateDuration(updated.startTime, updated.endTime)
    }

    return updated
}
