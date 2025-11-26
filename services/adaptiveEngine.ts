import { AIMode, AdaptiveContext, ModeConfig } from "@/lib/types"

/**
 * Adaptive AI Engine
 * Dynamically switches AI personality modes based on user context
 * to provide personalized, context-aware interactions
 */

export const AdaptiveEngine = {
    /**
     * Determine the optimal AI mode based on user context
     */
    determineAIMode(context: AdaptiveContext): AIMode {
        const {
            streakHistory,
            burnoutScore,
            recentMoods,
            sleepQuality,
            weeklyPerformance,
            lateNightUsage,
            currentStreak
        } = context

        // Calculate aggregate metrics
        const avgMood = recentMoods.length > 0
            ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
            : 3

        const avgSleep = sleepQuality.length > 0
            ? sleepQuality.reduce((a, b) => a + b, 0) / sleepQuality.length
            : 3

        const streakDecline = streakHistory.length >= 2
            ? streakHistory[streakHistory.length - 1] < streakHistory[streakHistory.length - 2]
            : false

        // 🔥 DISCIPLINE MODE - when user needs tough love
        // Conditions: High streak, good performance, but showing signs of complacency
        if (currentStreak > 14 && weeklyPerformance > 80 && avgMood > 3.5 && streakDecline) {
            return "discipline"
        }

        // 🤗 SUPPORT MODE - when user is struggling
        // Conditions: Low mood, burnout risk, poor sleep, or streak broken
        if (
            burnoutScore > 60 ||
            avgMood < 2.5 ||
            avgSleep < 2 ||
            (currentStreak < 3 && streakHistory.some(s => s > 5))
        ) {
            return "support"
        }

        // 🎯 FOCUS MODE - for late-night sessions or high concentration needed
        // Conditions: Late night usage or user is in focus window
        if (lateNightUsage || weeklyPerformance > 90) {
            return "focus"
        }

        // 📊 INSIGHT MODE - for analytical users or data-driven decisions
        // Conditions: High performance, good stats, ready for deep analysis
        if (weeklyPerformance > 70 && currentStreak > 7 && avgMood >= 3) {
            return "insight"
        }

        // 💪 COACH MODE - default motivational mode
        // Conditions: Normal operation, building momentum
        return "coach"
    },

    /**
     * Get configuration for an AI mode
     */
    getModeConfig(mode: AIMode): ModeConfig {
        const configs: Record<AIMode, ModeConfig> = {
            coach: {
                strictness: 70,
                verbosity: 60,
                encouragementLevel: 80,
                prefix: "💪 Coach Mode Active",
                suffix: "Let's push forward!",
                systemPrompt: `You are a motivational coach. Be encouraging but firm. 
                    Push the user to achieve their goals. Use metaphors from sports and personal development.
                    Keep responses focused on action and progress. Celebrate wins, address setbacks constructively.`
            },
            support: {
                strictness: 30,
                verbosity: 70,
                encouragementLevel: 95,
                prefix: "🤗 Support Mode Active",
                suffix: "I'm here for you.",
                systemPrompt: `You are a gentle, empathetic supporter. The user is struggling.
                    Be understanding and kind. Validate their feelings. Suggest small, achievable steps.
                    Focus on mental health and self-care. Avoid pressure. Use warm, comforting language.`
            },
            focus: {
                strictness: 50,
                verbosity: 30,
                encouragementLevel: 50,
                prefix: "🎯 Focus Mode Active",
                suffix: "",
                systemPrompt: `You are concise and direct. The user needs minimal distraction.
                    Keep responses under 50 words. Get straight to the point. No fluff.
                    Provide actionable insights only. Use bullet points when possible.`
            },
            insight: {
                strictness: 60,
                verbosity: 80,
                encouragementLevel: 60,
                prefix: "📊 Insight Mode Active",
                suffix: "Data-driven decisions ahead.",
                systemPrompt: `You are an analytical advisor. Provide deep, data-driven insights.
                    Reference patterns, trends, and statistics. Use precise language.
                    Offer strategic recommendations based on evidence. Think long-term.`
            },
            discipline: {
                strictness: 95,
                verbosity: 50,
                encouragementLevel: 40,
                prefix: "🔥 Discipline Mode Active",
                suffix: "No excuses.",
                systemPrompt: `You are a strict disciplinarian. The user is capable but showing complacency.
                    Call out laziness. Challenge them directly. Be brutally honest.
                    Set high expectations. Use tough love. Push them beyond comfort zones.`
            }
        }

        return configs[mode]
    },

    /**
     * Adapt AI response based on mode
     */
    adaptResponseStyle(mode: AIMode, rawResponse: string): string {
        const config = this.getModeConfig(mode)

        // Apply mode-specific transformations
        let adapted = rawResponse

        switch (mode) {
            case "focus":
                // Make it more concise
                adapted = adapted.split('.').slice(0, 3).join('.') + '.'
                break

            case "support":
                // Add empathetic language
                if (!adapted.toLowerCase().includes("understand")) {
                    adapted = "I understand this is challenging. " + adapted
                }
                break

            case "discipline":
                // Make it more direct and challenging
                adapted = adapted.replace(/maybe|perhaps/gi, "you must")
                adapted = adapted.replace(/try to/gi, "will")
                break

            case "coach":
                // Add motivational energy
                if (!adapted.includes("!")) {
                    adapted = adapted.replace(/\.$/, "!")
                }
                break

            case "insight":
                // Keep analytical tone (no major changes needed)
                break
        }

        return adapted
    },

    /**
     * Build adaptive context from user data
     */
    buildContext(data: {
        profile: any
        recentProgress: any[]
        burnoutState: any
        sleepLogs: any[]
    }): AdaptiveContext {
        const now = new Date()
        const hour = now.getHours()

        // Calculate streak history (last 7 days)
        const streakHistory = data.recentProgress
            .slice(-7)
            .map(p => p.completedTasks || 0)

        // Extract recent moods
        const recentMoods = data.recentProgress
            .slice(-7)
            .map(p => p.mood || 3)
            .filter(m => m > 0)

        // Calculate sleep quality
        const sleepQuality = data.sleepLogs
            .slice(-7)
            .map(s => s.sleepQuality || 3)

        // Weekly performance (% of tasks completed)
        const weeklyTasks = data.recentProgress.slice(-7).reduce((sum, p) => sum + (p.tasks?.length || 0), 0)
        const weeklyCompleted = data.recentProgress.slice(-7).reduce((sum, p) => sum + (p.completedTasks || 0), 0)
        const weeklyPerformance = weeklyTasks > 0 ? (weeklyCompleted / weeklyTasks) * 100 : 0

        return {
            streakHistory,
            burnoutScore: data.burnoutState?.score || 0,
            recentMoods,
            sleepQuality,
            weeklyPerformance,
            lateNightUsage: hour >= 22 || hour <= 4,
            currentStreak: data.profile?.stats?.currentStreak || 0
        }
    }
}
