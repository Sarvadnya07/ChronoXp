import { Badge, UserStats, Task, XPLog } from "../types"

// Badge Definitions
export const BADGES: Badge[] = [
    {
        id: "consistency_king",
        name: "Consistency King",
        description: "Reach a 7-day streak",
        icon: "👑",
        unlocked: false,
        target: 7,
        category: "streak"
    },
    {
        id: "streak_god",
        name: "Streak God",
        description: "Reach a 30-day streak",
        icon: "⚡",
        unlocked: false,
        target: 30,
        category: "streak"
    },
    {
        id: "beast_mode_90",
        name: "Beast Mode",
        description: "Reach a 90-day streak",
        icon: "🦍",
        unlocked: false,
        target: 90,
        category: "streak"
    },
    {
        id: "dsa_samurai",
        name: "DSA Samurai",
        description: "Complete 20 DSA tasks",
        icon: "⚔️",
        unlocked: false,
        target: 20,
        category: "DSA"
    },
    {
        id: "ai_warrior",
        name: "AI Warrior",
        description: "Complete 15 AI/ML tasks",
        icon: "🤖",
        unlocked: false,
        target: 15,
        category: "AI/ML"
    },
    {
        id: "gatekeeper",
        name: "Gatekeeper",
        description: "Complete 20 GATE tasks",
        icon: "🚪",
        unlocked: false,
        target: 20,
        category: "GATE"
    },
    {
        id: "nihongo_warrior",
        name: "Nihongo Warrior",
        description: "Complete 20 Japanese tasks",
        icon: "🗾",
        unlocked: false,
        target: 20,
        category: "Japanese"
    },
    {
        id: "habit_marathon_50h",
        name: "Habit Marathon",
        description: "50 hours total in Study categories",
        icon: "🏃",
        unlocked: false,
        target: 50 * 60, // minutes
        category: "Study"
    }
]

export interface BadgeUpdateResult {
    badges: Badge[]
    newlyUnlocked: Badge[]
}

/**
 * Evaluate badges based on current stats and history
 */
export function evaluateBadges(
    currentBadges: Badge[],
    stats: UserStats,
    xpLogs: XPLog[],
    tasks: Task[]
): BadgeUpdateResult {
    const updatedBadges = [...currentBadges]
    const newlyUnlocked: Badge[] = []

    // Helper to find badge
    const findBadge = (id: string) => updatedBadges.find(b => b.id === id)

    // 1. Streak Badges
    const streakBadges = ["consistency_king", "streak_god", "beast_mode_90"]
    streakBadges.forEach(id => {
        const badge = findBadge(id)
        if (badge && !badge.unlocked && badge.target) {
            badge.progress = Math.min(100, (stats.currentStreak / badge.target) * 100)
            if (stats.currentStreak >= badge.target) {
                badge.unlocked = true
                badge.unlockedAt = Date.now()
                newlyUnlocked.push(badge)
            }
        }
    })

    // 2. Task Count Badges
    const taskCountBadges = [
        { id: "dsa_samurai", category: "DSA" },
        { id: "ai_warrior", category: "AI/ML" },
        { id: "gatekeeper", category: "GATE" },
        { id: "nihongo_warrior", category: "Japanese" }
    ]

    taskCountBadges.forEach(({ id, category }) => {
        const badge = findBadge(id)
        if (badge && !badge.unlocked && badge.target) {
            // Count completed tasks in this category
            // We need the full task history or count from stats. 
            // Since we might not have full history in memory, we rely on what's passed.
            // Ideally stats should track counts per category.
            // For now, let's assume 'tasks' contains enough history or we count from xpLogs if available.
            // Using xpLogs is safer for history if tasks are archived.

            const count = xpLogs.filter(log => log.category === category && log.reason === "task_completed").length

            badge.progress = Math.min(100, (count / badge.target) * 100)
            if (count >= badge.target) {
                badge.unlocked = true
                badge.unlockedAt = Date.now()
                newlyUnlocked.push(badge)
            }
        }
    })

    // 3. Duration Badges
    const marathonBadge = findBadge("habit_marathon_50h")
    if (marathonBadge && !marathonBadge.unlocked && marathonBadge.target) {
        // Sum duration of study tasks
        // This is hard without full task history. 
        // Let's approximate or skip if we don't have data.
        // Assuming 'tasks' has recent tasks.
        // For Phase 2, maybe we just track this in stats later.
        // Let's try to count from tasks array for now.
        const studyCategories = ["Study", "DSA", "AI/ML", "GATE", "Japanese", "Projects", "Certifications", "Intellipaat"]
        const totalMinutes = tasks
            .filter(t => t.completed && studyCategories.includes(t.category))
            .reduce((sum, t) => sum + t.duration, 0)

        marathonBadge.progress = Math.min(100, (totalMinutes / marathonBadge.target) * 100)
        if (totalMinutes >= marathonBadge.target) {
            marathonBadge.unlocked = true
            marathonBadge.unlockedAt = Date.now()
            newlyUnlocked.push(marathonBadge)
        }
    }

    return {
        badges: updatedBadges,
        newlyUnlocked
    }
}

export function initializeBadges(): Badge[] {
    return JSON.parse(JSON.stringify(BADGES))
}
