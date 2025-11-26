import { GeminiService } from "./geminiService"
import { UserProfile, Task, DailyProgress, HabitSuggestion } from "@/lib/types"

export const HabitEvolutionEngine = {
    async analyzeHabits(
        profile: UserProfile,
        tasks: Task[],
        recentProgress: DailyProgress[]
    ): Promise<HabitSuggestion[]> {
        // Filter for recurring tasks (habits)
        const habits = tasks.filter(t => t.repeatRule !== "none")

        // Calculate consistency for each habit over last 14 days
        const habitStats = habits.map(habit => {
            const completions = recentProgress.filter(p =>
                p.tasks.find(t => t.id === habit.id && t.completed)
            ).length
            return { ...habit, completions }
        })

        const prompt = `
    You are an AI Habit Coach for ChronoXP.
    Analyze the user's habit performance and suggest evolutions.

    User Context:
    - Level: ${profile.stats.level}
    - Streak: ${profile.stats.currentStreak}
    
    Habit Performance (Last 14 days):
    ${habitStats.map(h => `- ${h.title} (${h.duration}m): Completed ${h.completions} times`).join("\n")}

    Requirements:
    - Suggest increasing difficulty for consistent habits (e.g., >10 completions).
    - Suggest decreasing difficulty for inconsistent habits (e.g., <5 completions).
    - Suggest 1 new habit based on gaps (e.g., if no exercise, suggest walking).
    - Output JSON format ONLY:
    [
      {
        "type": "increase_difficulty",
        "habitId": "task-id",
        "message": "Increase Reading to 45m",
        "reason": "You've been very consistent!",
        "action": { "type": "update_task", "data": { "duration": 45 } }
      }
    ]
    `

        try {
            const response = await GeminiService.askGemini(prompt)
            const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim()
            const suggestions = JSON.parse(jsonStr)

            return suggestions.map((s: any) => ({
                ...s,
                id: `sugg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: Date.now()
            }))
        } catch (error) {
            console.error("HabitEvolution Error:", error)
            return []
        }
    }
}
