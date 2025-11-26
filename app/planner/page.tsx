"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { WeeklyPlannerEngine } from "@/services/weeklyPlannerEngine"
import { WeeklyPlan, XPLog } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Target, BookOpen, BarChart } from "lucide-react"
import { db } from "@/lib/db"

export default function PlannerPage() {
    const { profile } = useAppStore()
    const [plan, setPlan] = useState<WeeklyPlan | null>(null)
    const [loading, setLoading] = useState(false)

    const handleGeneratePlan = async () => {
        if (!profile) return
        setLoading(true)
        try {
            const xpLogs = await db.getAll("xpLogs")
            const result = await WeeklyPlannerEngine.generateWeeklyPlan(profile, xpLogs)
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
                        <Calendar className="w-6 h-6 text-primary" />
                        Weekly Planner
                    </h2>
                    <p className="text-muted-foreground">AI-powered weekly goals and study targets.</p>
                </div>
                <Button onClick={handleGeneratePlan} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Planning...
                        </>
                    ) : (
                        <>
                            <Target className="w-4 h-4 mr-2" />
                            Generate Weekly Plan
                        </>
                    )}
                </Button>
            </div>

            {plan && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Focus Goals */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-red-500" />
                                Focus Goals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {plan.focusGoals.map((goal, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-primary font-bold">{i + 1}.</span>
                                        <span>{goal}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Study Targets */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Study Targets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {plan.studyTargets.map((target, i) => (
                                    <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                                        <span className="font-medium">{target.category}</span>
                                        <span className="text-muted-foreground">{target.hours} hrs</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Summary & Prediction */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="w-5 h-5 text-purple-500" />
                                AI Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1">Previous Week Summary</h4>
                                <p className="text-sm text-muted-foreground">{plan.aiSummary}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">GATE Mapping</h4>
                                <p className="text-sm text-muted-foreground">{plan.gateMapping}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Predicted Workload:</span>
                                <span className={`capitalize px-2 py-0.5 rounded-full text-xs text-white ${plan.workloadPrediction === "heavy" ? "bg-red-500" :
                                        plan.workloadPrediction === "medium" ? "bg-yellow-500" : "bg-green-500"
                                    }`}>
                                    {plan.workloadPrediction}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
