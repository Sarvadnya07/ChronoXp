/**
 * SmartFocus Engine (Flow State Detection)
 * Analyzes user behavior to detect and predict flow states
 * Provides real-time focus scoring and productivity window predictions
 */

import { FocusMetrics, FlowState, TimeWindow, FocusAlert, FocusLog } from "@/lib/types"

export const FocusEngine = {
    /**
     * Calculate flow score (0-100) based on focus metrics
     */
    calculateFlowScore(metrics: FocusMetrics): number {
        const {
            typingSpeed,
            taskSwitches,
            idleTime,
            deepWorkStreak,
            sleepQuality
        } = metrics

        // Normalize metrics to 0-100 scale
        // Higher typing speed = better focus (normalized to 0-100)
        const typingScore = Math.min(100, (typingSpeed / 60) * 100) // 60+ WPM = 100

        // Lower task switches = better focus
        const switchPenalty = Math.min(50, taskSwitches * 10) // Each switch reduces score by 10
        const switchScore = Math.max(0, 100 - switchPenalty)

        // Lower idle time = better focus
        const idlePenalty = Math.min(30, (idleTime / 60) * 30) // 1 min idle = 30 penalty
        const idleScore = Math.max(0, 100 - idlePenalty)

        // Deep work streak bonus
        const streakBonus = Math.min(30, deepWorkStreak * 5) // +5 per minute in streak

        // Sleep quality impact (poor sleep = reduced max score)
        const sleepMultiplier = sleepQuality / 5 // 0-1 multiplier

        // Weighted calculation
        const baseScore = (
            typingScore * 0.3 +
            switchScore * 0.3 +
            idleScore * 0.2 +
            streakBonus * 0.2
        )

        const finalScore = Math.round(baseScore * (0.7 + sleepMultiplier * 0.3))

        return Math.min(100, Math.max(0, finalScore))
    },

    /**
     * Determine flow state level based on score
     */
    getFlowLevel(score: number): FlowState['level'] {
        if (score >= 80) return "deep"
        if (score >= 60) return "moderate"
        if (score >= 40) return "shallow"
        return "distracted"
    },

    /**
     * Create a flow state from metrics
     */
    createFlowState(metrics: FocusMetrics, duration: number): FlowState {
        const score = this.calculateFlowScore(metrics)
        const level = this.getFlowLevel(score)

        return {
            score,
            level,
            timestamp: metrics.timestamp,
            duration
        }
    },

    /**
     * Predict optimal deep work windows based on historical data
     * Returns predicted time windows with confidence scores
     */
    predictDeepWorkWindows(historicalLogs: FocusLog[]): TimeWindow[] {
        if (historicalLogs.length === 0) {
            // Default windows if no data
            return [
                { start: "09:00", end: "11:00", predictedScore: 70, confidence: 50 },
                { start: "14:00", end: "16:00", predictedScore: 65, confidence: 50 },
                { start: "20:00", end: "22:00", predictedScore: 60, confidence: 50 }
            ]
        }

        // Analyze historical patterns by hour
        const hourlyScores: Map<number, number[]> = new Map()

        historicalLogs.forEach(log => {
            log.flowStates.forEach(state => {
                const hour = parseInt(log.peakTime.split(':')[0])
                if (!hourlyScores.has(hour)) {
                    hourlyScores.set(hour, [])
                }
                hourlyScores.get(hour)!.push(state.score)
            })
        })

        // Calculate average score per hour
        const hourlyAvg: { hour: number; avgScore: number; confidence: number }[] = []

        for (let hour = 0; hour < 24; hour++) {
            const scores = hourlyScores.get(hour) || []
            if (scores.length > 0) {
                const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
                const confidence = Math.min(100, scores.length * 10) // More data = higher confidence
                hourlyAvg.push({ hour, avgScore, confidence })
            }
        }

        // Sort by average score and take top windows
        const topHours = hourlyAvg
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 3)

        // Convert to time windows (2-hour blocks)
        return topHours.map(h => ({
            start: `${h.hour.toString().padStart(2, '0')}:00`,
            end: `${((h.hour + 2) % 24).toString().padStart(2, '0')}:00`,
            predictedScore: Math.round(h.avgScore),
            confidence: Math.round(h.confidence)
        }))
    },

    /**
     * Detect focus drops in real-time
     */
    detectFocusDrops(
        currentScore: number,
        recentScores: number[],
        threshold: number = 20
    ): FocusAlert | null {
        if (recentScores.length < 3) {
            return null
        }

        const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
        const drop = avgRecent - currentScore

        // Significant drop detected
        if (drop >= threshold) {
            return {
                type: "drop",
                message: `Focus dropped by ${Math.round(drop)} points. Consider taking a break.`,
                timestamp: Date.now(),
                action: "Take a 5-minute break to recharge"
            }
        }

        // Peak detected
        if (currentScore >= 85 && avgRecent < 70) {
            return {
                type: "peak",
                message: `You're in peak focus! Current score: ${currentScore}`,
                timestamp: Date.now(),
                action: "This is a great time for deep work"
            }
        }

        return null
    },

    /**
     * Generate focus recommendations based on current state
     */
    generateRecommendations(flowState: FlowState, timeOfDay: number): FocusAlert[] {
        const recommendations: FocusAlert[] = []

        // Low focus recommendations
        if (flowState.level === "distracted") {
            recommendations.push({
                type: "recommendation",
                message: "Focus is low. Try a 5-minute breathing exercise or short walk.",
                timestamp: Date.now(),
                action: "Start Pomodoro session"
            })
        }

        // Late night focus warning
        if (timeOfDay >= 22 && flowState.score < 50) {
            recommendations.push({
                type: "recommendation",
                message: "Late night + low focus = time to rest. Sleep will improve tomorrow's performance.",
                timestamp: Date.now(),
                action: "Wind down for sleep"
            })
        }

        // Good focus, suggest deep work
        if (flowState.level === "deep" || flowState.level === "moderate") {
            recommendations.push({
                type: "recommendation",
                message: "Good focus detected. Start your most challenging task now.",
                timestamp: Date.now(),
                action: "Begin deep work session"
            })
        }

        return recommendations
    },

    /**
     * Create a focus log from session data
     */
    createFocusLog(
        sessionId: string,
        flowStates: FlowState[]
    ): FocusLog {
        const date = new Date().toISOString().split('T')[0]
        const avgScore = flowStates.length > 0
            ? flowStates.reduce((sum, s) => sum + s.score, 0) / flowStates.length
            : 0

        // Find peak time (time with highest score)
        const peak = flowStates.reduce((max, s) =>
            s.score > max.score ? s : max,
            flowStates[0] || { score: 0, timestamp: Date.now() }
        )

        const peakTime = new Date(peak.timestamp).toTimeString().slice(0, 5)

        // Calculate total focus time (moderate or better)
        const totalFocusTime = flowStates
            .filter(s => s.level === "moderate" || s.level === "deep")
            .reduce((sum, s) => sum + s.duration, 0) / 60 // Convert to minutes

        return {
            id: `log-${sessionId}`,
            date,
            sessionId,
            flowStates,
            avgScore: Math.round(avgScore),
            peakTime,
            totalFocusTime: Math.round(totalFocusTime)
        }
    }
}
