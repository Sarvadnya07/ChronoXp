import { SleepLog, SleepInsights } from "@/lib/types"

export const SleepEngine = {
    analyzeSleep(recentSleep: SleepLog[]): SleepInsights {
        if (recentSleep.length === 0) {
            return {
                averageDuration: 0,
                sleepDebt: 0,
                consistencyScore: 0,
                chronotype: "unknown",
                recommendation: "Log more sleep data to get insights.",
                lastCalculated: Date.now()
            }
        }

        // 1. Average Duration
        const totalDuration = recentSleep.reduce((sum, log) => sum + log.totalHours, 0)
        const averageDuration = totalDuration / recentSleep.length

        // 2. Sleep Debt (assuming 8 hours need)
        const idealSleep = 8
        const sleepDebt = Math.max(0, (idealSleep * recentSleep.length) - totalDuration)

        // 3. Consistency Score (based on variance of sleep start time)
        // Convert sleep start times to minutes from midnight (handling crossing midnight)
        const startTimes = recentSleep.map(log => {
            const [h, m] = log.sleepStart.split(':').map(Number)
            let minutes = h * 60 + m
            if (h < 12) minutes += 24 * 60 // Treat early morning as next day relative to evening
            return minutes
        })

        const avgStart = startTimes.reduce((a, b) => a + b, 0) / startTimes.length
        const variance = startTimes.reduce((sum, t) => sum + Math.pow(t - avgStart, 2), 0) / startTimes.length
        const stdDev = Math.sqrt(variance)

        // Lower stdDev is better. Map 0-60 mins to 100-50 score roughly
        const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev / 2)))

        // 4. Chronotype Estimation
        let chronotype: "morning_lark" | "night_owl" | "hummingbird" = "hummingbird"
        // Normalize avgStart back to 24h format
        let avgStartHour = (avgStart / 60) % 24
        if (avgStartHour >= 21 || avgStartHour <= 1) chronotype = "morning_lark" // Sleeps 9pm-1am? Wait, Larks sleep early.
        // Larks: Sleep 9pm-11pm. Owls: Sleep 1am-3am.
        // Let's adjust logic:
        // avgStart is in minutes from midnight (offset by 24h for early morning).
        // If avgStart is 22:00 (1320) -> Lark
        // If avgStart is 02:00 (1560) -> Owl

        if (avgStartHour >= 21 && avgStartHour < 23) chronotype = "morning_lark"
        else if (avgStartHour >= 1 || avgStartHour < 5) chronotype = "night_owl"

        // 5. Recommendation
        let recommendation = "Maintain a consistent sleep schedule."
        if (sleepDebt > 5) recommendation = "You have high sleep debt. Prioritize extra rest this weekend."
        else if (consistencyScore < 70) recommendation = "Try to go to bed at the same time every night."
        else if (averageDuration < 7) recommendation = "Aim for at least 7-8 hours of sleep."

        return {
            averageDuration,
            sleepDebt,
            consistencyScore,
            chronotype,
            recommendation,
            lastCalculated: Date.now()
        }
    }
}
