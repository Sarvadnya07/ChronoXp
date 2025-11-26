import { DailyProgress, UserProfile, BurnoutState, BurnoutRisk } from "@/lib/types"

export const BurnoutEngine = {
    calculateBurnoutScore(
        profile: UserProfile,
        recentProgress: DailyProgress[],
        recentSleep: number[] // hours
    ): BurnoutState {
        let score = 0
        const factors: string[] = []

        // 1. Sleep Deficit (High Impact)
        const avgSleep = recentSleep.length > 0
            ? recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length
            : 7 // assume 7 if no data

        if (avgSleep < 5) {
            score += 40
            factors.push("Severe sleep deficit")
        } else if (avgSleep < 6) {
            score += 20
            factors.push("Moderate sleep deficit")
        }

        // 2. Productivity Drop (Medium Impact)
        // Compare last 3 days XP vs previous 3 days
        if (recentProgress.length >= 6) {
            const last3DaysXP = recentProgress.slice(0, 3).reduce((sum, p) => sum + p.totalXP, 0)
            const prev3DaysXP = recentProgress.slice(3, 6).reduce((sum, p) => sum + p.totalXP, 0)

            if (prev3DaysXP > 0 && last3DaysXP < prev3DaysXP * 0.5) {
                score += 20
                factors.push("Significant productivity drop")
            }
        }

        // 3. Streak Breaks (Low Impact)
        // If streak was lost recently
        if (profile.stats.currentStreak === 0 && profile.stats.longestStreak > 5) {
            score += 10
            factors.push("Recent streak break")
        }

        // 4. Completion Rate (Medium Impact)
        const recentCompletionRates = recentProgress.slice(0, 3).map(p => {
            return p.tasks.length > 0 ? p.completedTasks / p.tasks.length : 1
        })
        const avgCompletion = recentCompletionRates.reduce((a, b) => a + b, 0) / (recentCompletionRates.length || 1)

        if (avgCompletion < 0.5) {
            score += 15
            factors.push("Low task completion rate")
        }

        // Cap score at 100
        score = Math.min(100, score)

        // Determine Risk
        let risk: BurnoutRisk = "low"
        if (score >= 80) risk = "critical"
        else if (score >= 60) risk = "high"
        else if (score >= 40) risk = "medium"

        return {
            score,
            risk,
            factors,
            lastCalculated: Date.now()
        }
    }
}
