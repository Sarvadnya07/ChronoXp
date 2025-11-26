import { TaskCategory, XP_REWARDS, XP_PER_LEVEL, DIFFICULTY_MULTIPLIERS } from "../types"

/**
 * Calculate XP for a completed task
 */
export function calculateTaskXP(
    category: TaskCategory,
    difficulty: "easy" | "medium" | "hard" = "medium"
): number {
    const baseXP = XP_REWARDS[category] || 10
    const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1
    return Math.round(baseXP * multiplier)
}

/**
 * Calculate level based on total XP
 * Level up every 1000 XP
 */
export function calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / XP_PER_LEVEL) + 1
}

/**
 * Calculate XP required for next level
 */
export function calculateXPForNextLevel(currentLevel: number): number {
    return currentLevel * XP_PER_LEVEL
}

/**
 * Calculate progress to next level (0-100)
 */
export function calculateLevelProgress(totalXP: number): number {
    const currentLevel = calculateLevel(totalXP)
    const currentLevelXP = (currentLevel - 1) * XP_PER_LEVEL
    const xpInCurrentLevel = totalXP - currentLevelXP
    return Math.min(100, Math.floor((xpInCurrentLevel / XP_PER_LEVEL) * 100))
}
