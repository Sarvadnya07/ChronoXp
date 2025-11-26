// Gamification logic: XP, Levels, Streaks, Badges

import { type Task, type UserProfile, type Badge, type DailyProgress, STREAK_REQUIREMENTS, XP_PER_LEVEL, XP_REWARDS, type EnergyState, type Quest } from "./types"
import { db } from "./db"
import { getLocalDate } from "./utils"

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1
}

export function getXPForNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP)
  return currentLevel * XP_PER_LEVEL
}

export function getXPProgressInLevel(totalXP: number): number {
  const currentLevelXP = (calculateLevel(totalXP) - 1) * XP_PER_LEVEL
  return totalXP - currentLevelXP
}

export function calculateTaskXP(task: Task): number {
  const baseXP = XP_REWARDS[task.category] || 10
  return Math.round(baseXP * (task.difficulty === "easy" ? 1 : task.difficulty === "medium" ? 1.5 : 2))
}

function isStreakComplete(progress: DailyProgress): boolean {
  const dateObj = new Date(progress.date)
  const dayOfWeek = dateObj.getDay()

  for (const req of STREAK_REQUIREMENTS) {
    // Check if requirement applies to this day
    if (req.daysOfWeek && !req.daysOfWeek.includes(dayOfWeek)) {
      continue // Skip this requirement for this day
    }

    // Check if task was completed
    const completed = progress.tasks.some((t) => t.category === req.category && t.completed)

    if (!completed) return false
  }

  return true
}

export async function checkStreakCompletion(date: string): Promise<boolean> {
  const progress = await db.get("dailyProgress", date)
  if (!progress) return false
  return isStreakComplete(progress)
}

export async function calculateStreak(profile: UserProfile): Promise<{ currentStreak: number; longestStreak: number }> {
  const today = new Date()
  const endDate = getLocalDate()

  const startDateObj = new Date(today)
  startDateObj.setDate(startDateObj.getDate() - 365)
  const offset = startDateObj.getTimezoneOffset()
  const localStartDate = new Date(startDateObj.getTime() - offset * 60 * 1000)
  const startDate = localStartDate.toISOString().split("T")[0]

  const allProgress = await db.getDailyProgressRange(startDate, endDate)
  const progressMap = new Map(allProgress.map((p) => [p.date, p]))

  let currentStreak = 0
  let longestStreak = profile.longestStreak || 0
  let tempStreak = 0

  // Check backwards from today
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)

    // Adjust for timezone to match getLocalDate format
    const offset = checkDate.getTimezoneOffset()
    const localCheckDate = new Date(checkDate.getTime() - offset * 60 * 1000)
    const dateStr = localCheckDate.toISOString().split("T")[0]

    const progress = progressMap.get(dateStr)
    const completed = progress ? isStreakComplete(progress) : false

    if (completed) {
      tempStreak++
      if (i === 0 || currentStreak > 0) {
        currentStreak = tempStreak
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      if (i === 0) {
        currentStreak = 0
      }
      tempStreak = 0
    }
  }

  return { currentStreak, longestStreak }
}

export function calculateEnergy(progress: DailyProgress): number {
  let energy = 100

  // Sleep penalty (if sleep data exists)
  if (progress.sleep) {
    if (progress.sleep.totalHours < 7) { // Less than 7 hours
      energy -= 20
    }
    if (progress.sleep.sleepQuality < 3) {
      energy -= 10
    }
  }

  // Task fatigue
  const completedTasks = progress.tasks.filter(t => t.completed)
  energy -= completedTasks.length * 5

  // Mood boost/drain
  if (progress.mood) {
    if (progress.mood >= 4) energy += 10
    if (progress.mood <= 2) energy -= 10
  }

  return Math.max(0, Math.min(100, energy))
}

export function generateDailyQuests(): Quest[] {
  const quests: Quest[] = [
    {
      id: `quest-${Date.now()}-1`,
      title: "Focus Master",
      description: "Complete 3 Study or Work sessions",
      xpReward: 50,
      isCompleted: false,
      type: "daily",
      targetCategory: "Study", // Simplified for demo
      targetCount: 3,
      progress: 0
    },
    {
      id: `quest-${Date.now()}-2`,
      title: "Health Nut",
      description: "Complete Exercise and Sleep on time",
      xpReward: 40,
      isCompleted: false,
      type: "daily",
      targetCategory: "Health",
      targetCount: 2,
      progress: 0
    },
    {
      id: `quest-${Date.now()}-3`,
      title: "Quick Wins",
      description: "Complete 5 tasks of any type",
      xpReward: 30,
      isCompleted: false,
      type: "daily",
      targetCount: 5,
      progress: 0
    }
  ]
  return quests
}

export function checkQuestCompletion(quests: Quest[], task: Task): { updatedQuests: Quest[], xpGained: number } {
  let xpGained = 0
  const updatedQuests = quests.map(quest => {
    if (quest.isCompleted) return quest

    let newProgress = quest.progress

    // Logic to update progress based on task
    // This is a simplified implementation
    if (quest.targetCategory) {
      if (task.category === quest.targetCategory ||
        (quest.targetCategory === "Study" && ["DSA", "AI/ML", "GATE", "Japanese"].includes(task.category)) ||
        (quest.targetCategory === "Health" && ["Exercise", "Sleep"].includes(task.category))) {
        newProgress += 1
      }
    } else {
      newProgress += 1
    }

    if (newProgress >= (quest.targetCount || 1)) {
      xpGained += quest.xpReward
      return { ...quest, progress: newProgress, isCompleted: true }
    }

    return { ...quest, progress: newProgress }
  })

  return { updatedQuests, xpGained }
}

export function initializeBadges(): Badge[] {
  return [
    {
      id: "consistency-king",
      name: "Consistency King",
      description: "Maintain a 7-day streak",
      icon: "👑",
      unlocked: false,
      progress: 0,
      target: 7,
    },
    {
      id: "streak-god",
      name: "Streak God",
      description: "Maintain a 30-day streak",
      icon: "⚡",
      unlocked: false,
      progress: 0,
      target: 30,
    },
    {
      id: "dsa-samurai",
      name: "DSA Samurai",
      description: "Complete 20 DSA sessions",
      icon: "⚔️",
      unlocked: false,
      progress: 0,
      target: 20,
    },
    {
      id: "ai-warrior",
      name: "AI Warrior",
      description: "Complete 15 AI/ML blocks",
      icon: "🤖",
      unlocked: false,
      progress: 0,
      target: 15,
    },
    {
      id: "gatekeeper",
      name: "Gatekeeper",
      description: "Complete 20 GATE sessions",
      icon: "🚪",
      unlocked: false,
      progress: 0,
      target: 20,
    },
    {
      id: "nihongo-warrior",
      name: "Nihongo Warrior",
      description: "Complete 20 Japanese sessions",
      icon: "🎌",
      unlocked: false,
      progress: 0,
      target: 20,
    },
    {
      id: "beast-mode",
      name: "90-Day Beast Mode",
      description: "Maintain a 90-day streak",
      icon: "🔥",
      unlocked: false,
      progress: 0,
      target: 90,
    },
    {
      id: "hours-50",
      name: "50 Hours Champion",
      description: "Log 50 total hours",
      icon: "⏰",
      unlocked: false,
      progress: 0,
      target: 3000, // in minutes
    },
    {
      id: "hours-100",
      name: "100 Hours Legend",
      description: "Log 100 total hours",
      icon: "⭐",
      unlocked: false,
      progress: 0,
      target: 6000,
    },
    {
      id: "hours-500",
      name: "500 Hours Master",
      description: "Log 500 total hours",
      icon: "💎",
      unlocked: false,
      progress: 0,
      target: 30000,
    },
  ]
}

export async function updateBadgeProgress(profile: UserProfile): Promise<Badge[]> {
  const badges = profile.badges.map((b) => ({ ...b }))
  const allProgress = await db.getAll("dailyProgress")

  // Count task completions by category
  const categoryCounts: Record<string, number> = {}
  let totalMinutes = 0

  allProgress.forEach((progress) => {
    progress.tasks.forEach((task) => {
      if (task.completed) {
        categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1
        totalMinutes += task.duration
      }
    })
  })

  // Update badge progress
  badges.forEach((badge) => {
    switch (badge.id) {
      case "consistency-king":
      case "streak-god":
      case "beast-mode":
        badge.progress = profile.currentStreak || 0
        if (badge.progress >= (badge.target || 0) && !badge.unlocked) {
          badge.unlocked = true
          badge.unlockedAt = Date.now()
        }
        break
      case "dsa-samurai":
        badge.progress = categoryCounts["DSA"] || 0
        if (badge.progress >= (badge.target || 0) && !badge.unlocked) {
          badge.unlocked = true
          badge.unlockedAt = Date.now()
        }
        break
      case "ai-warrior":
        badge.progress = categoryCounts["AI/ML"] || 0
        if (badge.progress >= (badge.target || 0) && !badge.unlocked) {
          badge.unlocked = true
          badge.unlockedAt = Date.now()
        }
        break
      case "gatekeeper":
        badge.progress = categoryCounts["GATE"] || 0
        if (badge.progress >= (badge.target || 0) && !badge.unlocked) {
          badge.unlocked = true
          badge.unlockedAt = Date.now()
        }
        break
      case "nihongo-warrior":
        badge.progress = categoryCounts["Japanese"] || 0
        if (badge.progress >= (badge.target || 0) && !badge.unlocked) {
          badge.unlocked = true
          badge.unlockedAt = Date.now()
        }
        break
      case "hours-50":
      case "hours-100":
      case "hours-500":
        badge.progress = totalMinutes
        if (badge.progress >= (badge.target || 0) && !badge.unlocked) {
          badge.unlocked = true
          badge.unlockedAt = Date.now()
        }
        break
    }
  })

  return badges
}

// --- Compatibility wrappers for store.ts imports ---

// store.ts expects: updateStreak(profile)
// We already have calculateStreak(profile)
export async function updateStreak(
  profile: UserProfile
): Promise<{ currentStreak: number; longestStreak: number }> {
  return calculateStreak(profile)
}

// store.ts expects: evaluateBadges(profile)
// We already have updateBadgeProgress(profile)
export async function evaluateBadges(profile: UserProfile): Promise<Badge[]> {
  return updateBadgeProgress(profile)
}

// store.ts expects: checkDailyQuestCompletion(quests, task)
// We already have checkQuestCompletion(quests, task)
export function checkDailyQuestCompletion(
  quests: Quest[],
  task: Task
): { updatedQuests: Quest[]; xpGained: number } {
  return checkQuestCompletion(quests, task)
}
