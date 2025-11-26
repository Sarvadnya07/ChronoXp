"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { AutoPlannerEngine } from "@/services/autoPlannerEngine"
import { MemoryEngine } from "@/services/memoryEngine"
import { PlanResult } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Sparkles, Clock } from "lucide-react"
import { db } from "@/lib/db"

export default function AutoPlannerPage() {
    const { profile, tasks, todayProgress } = useAppStore()
    const [plan, setPlan] = useState<PlanResult | null>(null)
    const [loading, setLoading] = useState(false)

    const handleGeneratePlan = async () => {
        if (!profile) return
        setLoading(true)
        try {
            const memories = await MemoryEngine.getMemories()
            const result = await AutoPlannerEngine.generateOptimalPlanForDay(
                profile,
                tasks,
                todayProgress,
                memories
            )
            setPlan(result)
        } catch (error) {
            console.error("Failed to generate plan:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        AI Auto-Planner
                    </h2>
                    <p className="text-muted-foreground">Generate an optimized schedule for your day.</p>
                </div>
                <Button onClick={handleGeneratePlan} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Generate Plan
                        </>
                    )}
                </Button>
            </div>

            {plan && (
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-lg font-medium">Your Schedule</h3>
                        <div className="space-y-2">
                            {plan.timeline.map((item, index) => (
                                <Card key={index} className={item.isDeepWork ? "border-primary/50 bg-primary/5" : ""}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="flex flex-col items-center min-w-[80px] text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 mb-1" />
                                            <span>{item.start}</span>
                                            <div className="h-4 w-px bg-border my-1" />
                                            <span>{item.end}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.activity}</h4>
                                            {item.category && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                    {item.category}
                                                </span>
                                            )}
                                            {item.isDeepWork && (
                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                                    Deep Work
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">AI Recommendations</h3>
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                {plan.recommendations.map((rec, i) => (
                                    <div key={i} className="flex gap-2 text-sm">
                                        <span className="text-primary">•</span>
                                        <span>{rec}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
