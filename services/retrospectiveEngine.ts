/**
 * Retrospective Engine
 * Generates comprehensive AI-powered monthly and quarterly retrospectives
 * Provides deep insights, patterns, and actionable recommendations
 */

import { MonthlyRetrospective, QuarterlyRetrospective, HabitSuggestion } from "@/lib/types"
import { GeminiService } from "./geminiService"
import { db } from "@/lib/db"

export const RetrospectiveEngine = {
    /**
     * Generate monthly retrospective with AI insights
     */
    async generateMonthlyRetro(
        userId: string,
        year: number,
        month: number
    ): Promise<MonthlyRetrospective> {
        // Fetch month's data
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]

        const monthProgress = await db.getDailyProgressRange(startDate, endDate)
        const xpLogs = await db.getAll("xpLogs")
        const monthXP = xpLogs.filter(log => log.date.startsWith(`${year}-${month.toString().padStart(2, '0')}`))

        // Calculate metrics
        const metrics = {
            totalXP: monthXP.reduce((sum, log) => sum + log.xp, 0),
            tasksCompleted: monthProgress.reduce((sum, p) => sum + p.completedTasks, 0),
            avgSleepHours: this.calculateAvgSleep(monthProgress),
            avgMood: this.calculateAvgMood(monthProgress),
            streakMaintained: this.checkStreakMaintained(monthProgress),
            burnoutPeaks: this.countBurnoutPeaks(monthProgress)
        }

        // Build AI prompt
        const prompt = `
You are an AI life coach analyzing a user's entire month of productivity data.

**Month**: ${this.getMonthName(month)} ${year}

**Key Metrics**:
- Total XP Earned: ${metrics.totalXP}
- Tasks Completed: ${metrics.tasksCompleted}
- Average Sleep: ${metrics.avgSleepHours.toFixed(1)} hours
- Average Mood: ${metrics.avgMood.toFixed(1)}/5
- Streak Maintained: ${metrics.streakMaintained ? "Yes" : "No"}
- Burnout Risk Peaks: ${metrics.burnoutPeaks}

**Daily Breakdown**:
${monthProgress.map(p => `${p.date}: ${p.completedTasks}/${p.tasks.length} tasks, Mood: ${p.mood || "N/A"}, XP: ${p.totalXP}`).join('\n')}

**Tasks Completed**: Provide a comprehensive retrospective with:

1. **Summary** (3-4 sentences): Overall month performance
2. **Wins** (array of 3-5 strings): Major accomplishments and positive patterns
3. **Failures** (array of 2-4 strings): Missed goals, negative patterns
4. **Stagnations** (array of 1-3 strings): Areas with no progress
5. **Suggestions** (array of 4-6 strings): Actionable improvements
6. **Next 30-Day Plan** (paragraph): Strategic roadmap for next month
7. **Habit Restructuring** (array of 2-3 objects): Specific habit changes needed

**IMPORTANT**: Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": "string",
  "wins": ["string", "string", ...],
  "failures": ["string", "string", ...],
  "stagnations": ["string", ...],
  "suggestions": ["string", ...],
  "next30DayPlan": "string",
  "habitRestructuring": [
    {
      "type": "increase_difficulty" | "decrease_difficulty" | "new_habit",
      "message": "string",
      "reason": "string"
    }
  ]
}
`

        try {
            const response = await GeminiService.askGemini(prompt)
            const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim()
            const aiData = JSON.parse(cleaned)

            const retrospective: MonthlyRetrospective = {
                id: `retro-${year}-${month}-${Date.now()}`,
                userId,
                year,
                month,
                summary: aiData.summary,
                wins: aiData.wins,
                failures: aiData.failures,
                stagnations: aiData.stagnations,
                suggestions: aiData.suggestions,
                next30DayPlan: aiData.next30DayPlan,
                habitRestructuring: aiData.habitRestructuring.map((h: any, i: number) => ({
                    ...h,
                    id: `habit-${Date.now()}-${i}`,
                    createdAt: Date.now()
                })),
                metrics,
                createdAt: Date.now()
            }

            return retrospective
        } catch (error) {
            console.error("Failed to generate monthly retrospective:", error)
            // Return fallback retrospective
            return this.createFallbackMonthly(userId, year, month, metrics)
        }
    },

    /**
     * Generate quarterly retrospective with deep psychological insights
     */
    async generateQuarterlyRetro(
        userId: string,
        year: number,
        quarter: number
    ): Promise<QuarterlyRetrospective> {
        // Get all 3 months in the quarter
        const startMonth = (quarter - 1) * 3 + 1
        const months = [startMonth, startMonth + 1, startMonth + 2]

        // Generate monthly retros for comparison
        const monthlyRetros = await Promise.all(
            months.map(m => this.generateMonthlyRetro(userId, year, m))
        )

        // Build comprehensive quarterly prompt
        const prompt = `
You are a deep psychological AI analyst examining a user's entire QUARTER of life and productivity data.

**Quarter**: Q${quarter} ${year} (Months: ${months.join(', ')})

**Monthly Summaries**:
${monthlyRetros.map((r, i) => `
Month ${months[i]}:
- Summary: ${r.summary}
- XP: ${r.metrics.totalXP}
- Tasks: ${r.metrics.tasksCompleted}
- Wins: ${r.wins.join(', ')}
- Failures: ${r.failures.join(', ')}
`).join('\n')}

**Quarter Totals**:
- Total XP: ${monthlyRetros.reduce((sum, r) => sum + r.metrics.totalXP, 0)}
- Total Tasks: ${monthlyRetros.reduce((sum, r) => sum + r.metrics.tasksCompleted, 0)}

Provide a DEEP, quarter-long analysis with:

1. **Psychological Insights** (2 paragraphs): Deep patterns, motivations, underlying issues
2. **Strengths** (array of 4-6): Core strengths demonstrated
3. **Weaknesses** (array of 3-5): Areas needing significant work
4. **Long-Term Trajectory** (paragraph): Where is the user headed? Extrapolate 1-2 years
5. **Paradigm Shifts** (array of 2-4): Major mindset/approach changes needed
6. **Life Direction Analysis** (paragraph): Philosophical advice on purpose, priorities, and growth

**IMPORTANT**: Return ONLY valid JSON (no markdown):
{
  "psychologicalInsights": "string",
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "longTermTrajectory": "string",
  "paradigmShifts": ["string", ...],
  "lifeDirectionAnalysis": "string"
}
`

        try {
            const response = await GeminiService.askGemini(prompt)
            const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim()
            const aiData = JSON.parse(cleaned)

            // Combine first month's data with quarterly specific data
            const baseRetro = monthlyRetros[0]

            const retrospective: QuarterlyRetrospective = {
                ...baseRetro,
                id: `retro-Q${quarter}-${year}-${Date.now()}`,
                quarter,
                metrics: {
                    totalXP: monthlyRetros.reduce((sum, r) => sum + r.metrics.totalXP, 0),
                    tasksCompleted: monthlyRetros.reduce((sum, r) => sum + r.metrics.tasksCompleted, 0),
                    avgSleepHours: monthlyRetros.reduce((sum, r) => sum + r.metrics.avgSleepHours, 0) / 3,
                    avgMood: monthlyRetros.reduce((sum, r) => sum + r.metrics.avgMood, 0) / 3,
                    streakMaintained: monthlyRetros.every(r => r.metrics.streakMaintained),
                    burnoutPeaks: monthlyRetros.reduce((sum, r) => sum + r.metrics.burnoutPeaks, 0)
                },
                psychologicalInsights: aiData.psychologicalInsights,
                strengthsWeaknesses: {
                    strengths: aiData.strengths,
                    weaknesses: aiData.weaknesses
                },
                longTermTrajectory: aiData.longTermTrajectory,
                paradigmShifts: aiData.paradigmShifts,
                lifeDirectionAnalysis: aiData.lifeDirectionAnalysis
            }

            return retrospective
        } catch (error) {
            console.error("Failed to generate quarterly retrospective:", error)
            throw error
        }
    },

    // Helper methods
    calculateAvgSleep(progress: any[]): number {
        const sleepData = progress.filter(p => p.sleep?.totalHours).map(p => p.sleep.totalHours)
        return sleepData.length > 0 ? sleepData.reduce((a, b) => a + b, 0) / sleepData.length : 0
    },

    calculateAvgMood(progress: any[]): number {
        const moods = progress.filter(p => p.mood).map(p => p.mood)
        return moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 3
    },

    checkStreakMaintained(progress: any[]): boolean {
        return progress.every(p => p.completedTasks >= p.tasks.length * 0.7)
    },

    countBurnoutPeaks(progress: any[]): number {
        // Count days where mood < 2 or completed tasks < 50%
        return progress.filter(p =>
            (p.mood && p.mood < 2) ||
            (p.completedTasks < p.tasks.length * 0.5)
        ).length
    },

    getMonthName(month: number): string {
        const names = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"]
        return names[month - 1]
    },

    createFallbackMonthly(userId: string, year: number, month: number, metrics: any): MonthlyRetrospective {
        return {
            id: `retro-${year}-${month}-${Date.now()}`,
            userId,
            year,
            month,
            summary: `Completed ${metrics.tasksCompleted} tasks with ${metrics.totalXP} XP earned.`,
            wins: ["Maintained consistency"],
            failures: [],
            stagnations: [],
            suggestions: ["Continue current momentum"],
            next30DayPlan: "Focus on maintaining current performance levels.",
            habitRestructuring: [],
            metrics,
            createdAt: Date.now()
        }
    }
}
