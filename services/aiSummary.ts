import { JournalEntry } from "@/lib/types"

export interface AISummary {
    themes: string[]
    wins: string[]
    struggles: string[]
    suggestions: string[]
}

export const AISummaryService = {
    async generateWeeklySummary(entries: JournalEntry[]): Promise<AISummary> {
        // Simulate AI delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        if (entries.length === 0) {
            return {
                themes: ["No entries"],
                wins: [],
                struggles: [],
                suggestions: ["Start journaling to get AI insights!"]
            }
        }

        // Rule-based stub
        const text = entries.map(e => e.text.toLowerCase()).join(" ")
        const themes = []
        if (text.includes("stress") || text.includes("tired")) themes.push("Fatigue Management")
        if (text.includes("happy") || text.includes("good")) themes.push("Positive Momentum")
        if (text.includes("study") || text.includes("code")) themes.push("Learning Focus")

        if (themes.length === 0) themes.push("General Reflection")

        return {
            themes,
            wins: ["Consistent journaling", "Maintained focus on core tasks"],
            struggles: ["Sleep schedule seems irregular", "High stress on Tuesday"],
            suggestions: [
                "Try to sleep 30 mins earlier",
                "Schedule a break after deep work sessions",
                "Review your goals for next week"
            ]
        }
    }
}
