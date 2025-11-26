import { GeminiService } from "./geminiService"
import { Task, UserProfile, DailyProgress, PlanResult, Memory } from "@/lib/types"
import { MemoryEngine } from "./memoryEngine"

export const AutoPlannerEngine = {
    async generateOptimalPlanForDay(
        profile: UserProfile,
        tasks: Task[],
        todayProgress: DailyProgress | null,
        memories: Memory[]
    ): Promise<PlanResult> {
        const incompleteTasks = tasks.filter(t => !t.completed)
        const preferences = memories.filter(m => m.type === "preference")
        const patterns = memories.filter(m => m.type === "pattern")

        const prompt = `
    You are an AI Productivity Planner for ChronoXP.
    Generate an optimal daily schedule for the user based on their tasks, preferences, and patterns.

    User Context:
    - Level: ${profile.stats.level}
    - Energy: ${profile.energy.current}%
    - Preferences: ${preferences.map(m => `${m.key}: ${JSON.stringify(m.value)}`).join(", ")}
    - Patterns: ${patterns.map(m => `${m.key}: ${JSON.stringify(m.value)}`).join(", ")}

    Tasks to Schedule (Incomplete):
    ${incompleteTasks.map(t => `- [${t.id}] ${t.title} (${t.duration}m) [${t.priority}]`).join("\n")}

    Requirements:
    - Create a timeline from now until end of day (assume wake time 7am, sleep time 11pm if not specified).
    - Include breaks.
    - Prioritize critical and high priority tasks.
    - Suggest Deep Work blocks for hard tasks.
    - Output JSON format ONLY:
    {
      "timeline": [
        { "start": "HH:mm", "end": "HH:mm", "taskId": "optional_id", "activity": "Task Name or Break", "category": "Category", "isDeepWork": boolean }
      ],
      "recommendations": ["Tip 1", "Tip 2"]
    }
    `

        try {
            const response = await GeminiService.askGemini(prompt)
            // Clean up response to ensure valid JSON
            const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim()
            return JSON.parse(jsonStr) as PlanResult
        } catch (error) {
            console.error("AutoPlanner Error:", error)
            return {
                timeline: [],
                recommendations: ["Failed to generate plan. Please try again."]
            }
        }
    }
}
