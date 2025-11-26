import { GeminiService } from "./geminiService"
import { AdaptiveEngine } from "./adaptiveEngine"
import { UserProfile, DailyProgress, Task, XPLog, SleepLog, JournalEntry, AIMode } from "@/lib/types"

interface MentorContext {
    profile: UserProfile | null
    todayProgress: DailyProgress | null
    recentTasks: Task[]
    recentSleep: SleepLog[]
    recentJournal: JournalEntry[]
    xpLogs: XPLog[]
    currentMode?: AIMode
}

export const MentorEngine = {
    generateContext(
        profile: UserProfile | null,
        todayProgress: DailyProgress | null,
        tasks: Task[],
        xpLogs: XPLog[],
        progressHistory: DailyProgress[],
        burnoutState?: any
    ): MentorContext {
        // Filter for recent data (last 7 days)
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

        const recentTasks = tasks.filter(t => t.updatedAt && t.updatedAt > oneWeekAgo)
        const recentSleep = progressHistory
            .filter(p => p.sleep && p.timestamp > oneWeekAgo)
            .map(p => p.sleep!)
        const recentJournal = progressHistory
            .filter(p => p.journalEntry && p.timestamp > oneWeekAgo)
            .map(p => p.journalEntry!)
        const recentXP = xpLogs.filter(l => l.createdAt > oneWeekAgo)

        // Determine AI mode using Adaptive Engine
        const adaptiveContext = AdaptiveEngine.buildContext({
            profile,
            recentProgress: progressHistory.slice(-7),
            burnoutState: burnoutState || { score: 0 },
            sleepLogs: recentSleep
        })

        const currentMode = AdaptiveEngine.determineAIMode(adaptiveContext)

        return {
            profile,
            todayProgress,
            recentTasks,
            recentSleep,
            recentJournal,
            xpLogs: recentXP,
            currentMode
        }
    },

    async mentorReply(context: MentorContext, userMessage: string): Promise<{ response: string; mode: AIMode }> {
        const mode = context.currentMode || "coach"
        const modeConfig = AdaptiveEngine.getModeConfig(mode)

        const systemPrompt = `
${modeConfig.systemPrompt}

You are the AI Mentor for ChronoXP, a gamified productivity OS.
Current AI Mode: ${mode.toUpperCase()}

User Context:
- Level: ${context.profile?.stats.level || 1}
- Current Streak: ${context.profile?.stats.currentStreak || 0} days
- XP This Week: ${context.xpLogs.reduce((sum, log) => sum + log.xp, 0)}
- Recent Sleep Avg: ${context.recentSleep.length > 0
                ? (context.recentSleep.reduce((sum, s) => sum + s.totalHours, 0) / context.recentSleep.length).toFixed(1)
                : "No data"
            } hours
- Recent Moods: ${context.recentJournal.map(j => j.mood).join(", ") || "No data"}

User Message: "${userMessage}"

Provide a helpful response based on the context and message.
Adjust your tone according to the ${mode} mode configuration.
Keep responses under 150 words unless the user specifically requests detailed analysis.
`

        const rawResponse = await GeminiService.askGemini(systemPrompt)
        const adaptedResponse = AdaptiveEngine.adaptResponseStyle(mode, rawResponse)

        return {
            response: adaptedResponse,
            mode
        }
    },

    /**
     * Get mode badge text for UI
     */
    getModeBadge(mode: AIMode): string {
        const config = AdaptiveEngine.getModeConfig(mode)
        return config.prefix
    }
}

