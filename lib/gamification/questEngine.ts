import { Task, DailyQuest, WeeklyChallenge, TaskCategory } from "../types"
import { getLocalDate } from "../utils"

/**
 * Generate Daily Quests for a given date
 */
export function generateDailyQuests(date: string, availableTasks: Task[]): DailyQuest {
    // 1. Identify potential quest tasks
    // Priority: Critical tasks > High priority > Core tasks

    const daysTasks = availableTasks.filter(t => t.scheduledDate === date)

    let candidates = [...daysTasks]

    // Sort by importance
    candidates.sort((a, b) => {
        const scoreA = (a.isCritical ? 10 : 0) + (a.priority === 'high' ? 5 : 0) + (a.isCore ? 2 : 0)
        const scoreB = (b.isCritical ? 10 : 0) + (b.priority === 'high' ? 5 : 0) + (b.isCore ? 2 : 0)
        return scoreB - scoreA
    })

    // Select top 3
    const selectedTasks = candidates.slice(0, 3).map(t => t.id)

    return {
        id: `quest-daily-${date}`,
        date,
        tasks: selectedTasks,
        completed: false
    }
}

/**
 * Generate Weekly Challenge
 */
export function generateWeeklyChallenge(weekId: string): WeeklyChallenge {
    // Rotate challenge types based on week number
    const weekNum = parseInt(weekId.split('-')[1] || "1")
    const typeIndex = weekNum % 3

    if (typeIndex === 0) {
        return {
            weekId,
            type: "xp",
            target: 500,
            current: 0,
            completed: false,
            rewardXp: 200,
            title: "XP Hunter",
            description: "Gain 500 XP this week"
        }
    } else if (typeIndex === 1) {
        return {
            weekId,
            type: "tasks",
            target: 20,
            current: 0,
            completed: false,
            rewardXp: 200,
            title: "Task Master",
            description: "Complete 20 tasks this week"
        }
    } else {
        return {
            weekId,
            type: "hours",
            target: 10, // hours
            current: 0,
            completed: false,
            rewardXp: 200,
            title: "Deep Work",
            description: "Log 10 hours of productivity this week"
        }
    }
}

/**
 * Check if daily quest is completed
 */
export function checkDailyQuestCompletion(
    quest: DailyQuest,
    completedTaskIds: string[]
): boolean {
    if (quest.completed) return true

    const allCompleted = quest.tasks.every(id => completedTaskIds.includes(id))
    return allCompleted
}
