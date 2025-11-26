import { GeminiService } from "./geminiService"
import { UserProfile, WeeklyPlan, XPLog } from "@/lib/types"

export const WeeklyPlannerEngine = {
    async generateWeeklyPlan(
        profile: UserProfile,
        xpLogs: XPLog[]
    ): Promise<WeeklyPlan> {
        const prompt = `
    You are an AI Productivity Coach for ChronoXP.
    Generate a weekly plan for the upcoming week based on the user's recent performance.

    User Context:
    - Level: ${profile.stats.level}
    - Total XP: ${profile.stats.totalXP}
    - Recent Activity: ${xpLogs.slice(0, 10).map(l => `${l.category}: ${l.xp}XP`).join(", ")}

    Requirements:
    - Identify 3 key focus goals.
    - Set study targets (hours per category) for DSA, GATE, AI/ML.
    - Map targets to GATE syllabus if applicable.
    - Provide a brief summary of last week's performance.
    - Predict workload (light/medium/heavy).
    - Output JSON format ONLY:
    {
      "focusGoals": ["Goal 1", "Goal 2", "Goal 3"],
      "studyTargets": [
        { "category": "DSA", "hours": 10 },
        { "category": "GATE", "hours": 15 }
      ],
      "gateMapping": "Focus on Topic X and Y",
      "aiSummary": "Last week was...",
      "workloadPrediction": "medium"
    }
    `

        try {
            const response = await GeminiService.askGemini(prompt)
            const jsonStr = response.replace(/```json/g, "").replace(/```/g, "").trim()
            const result = JSON.parse(jsonStr)

            return {
                id: `plan-${Date.now()}`,
                weekStartDate: new Date().toISOString().split('T')[0], // Approximating start date
                ...result,
                createdAt: Date.now()
            }
        } catch (error) {
            console.error("WeeklyPlanner Error:", error)
            return {
                id: `plan-error-${Date.now()}`,
                weekStartDate: new Date().toISOString().split('T')[0],
                focusGoals: ["Error generating plan"],
                studyTargets: [],
                gateMapping: "N/A",
                aiSummary: "Could not generate summary.",
                workloadPrediction: "medium",
                createdAt: Date.now()
            }
        }
    }
}
