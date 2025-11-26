"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { HabitEvolutionEngine } from "@/services/habitEvolutionEngine"
import { HabitSuggestion } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowUpRight, ArrowDownRight, Plus, Lightbulb } from "lucide-react"
import { db } from "@/lib/db"

export default function HabitSuggestions() {
    const { profile, tasks, todayProgress } = useAppStore()
    const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadSuggestions = async () => {
            if (!profile || !todayProgress) return
            setLoading(true)
            try {
                // In a real app, we might cache this or run it periodically
                // For now, we'll run it on mount if we have data
                const recentProgress = await db.getDailyProgressRange(
                    new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                )
                const result = await HabitEvolutionEngine.analyzeHabits(profile, tasks, recentProgress)
                setSuggestions(result)
            } catch (error) {
                console.error("Failed to load habit suggestions:", error)
            } finally {
                setLoading(false)
            }
        }
        loadSuggestions()
    }, [profile, tasks, todayProgress])

    if (loading || suggestions.length === 0) return null

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Habit Evolution
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {suggestions.map((s) => (
                    <div key={s.id} className="bg-background/50 p-3 rounded-lg border text-sm space-y-2">
                        <div className="flex items-start gap-2">
                            {s.type === "increase_difficulty" && <ArrowUpRight className="w-4 h-4 text-green-500 mt-0.5" />}
                            {s.type === "decrease_difficulty" && <ArrowDownRight className="w-4 h-4 text-orange-500 mt-0.5" />}
                            {s.type === "new_habit" && <Plus className="w-4 h-4 text-blue-500 mt-0.5" />}
                            {s.type === "consistency_tip" && <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />}
                            <div>
                                <p className="font-medium">{s.message}</p>
                                <p className="text-xs text-muted-foreground">{s.reason}</p>
                            </div>
                        </div>
                        {s.action && (
                            <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                                Apply Change
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
