"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TrendingUp, Award, AlertTriangle, Target, Sparkles } from "lucide-react"
import { RetrospectiveEngine } from "@/services/retrospectiveEngine"
import { MonthlyRetrospective, QuarterlyRetrospective } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

export default function RetrospectivePage() {
    const { user } = useAuth()
    const [isGenerating, setIsGenerating] = useState(false)
    const [monthlyRetro, setMonthlyRetro] = useState<MonthlyRetrospective | null>(null)
    const [quarterlyRetro, setQuarterlyRetro] = useState<QuarterlyRetrospective | null>(null)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3))

    const generateMonthly = async () => {
        if (!user) return
        setIsGenerating(true)
        try {
            const retro = await RetrospectiveEngine.generateMonthlyRetro(
                user.uid,
                selectedYear,
                selectedMonth
            )
            setMonthlyRetro(retro)
        } catch (error) {
            console.error("Failed to generate monthly retrospective:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const generateQuarterly = async () => {
        if (!user) return
        setIsGenerating(true)
        try {
            const retro = await RetrospectiveEngine.generateQuarterlyRetro(
                user.uid,
                selectedYear,
                selectedQuarter
            )
            setQuarterlyRetro(retro)
        } catch (error) {
            console.error("Failed to generate quarterly retrospective:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">📊 AI Retrospectives</h1>
                    <p className="text-muted-foreground">
                        Deep AI-powered analysis of your productivity journey
                    </p>
                </div>
            </div>

            <Tabs defaultValue="monthly" className="w-full">
                <TabsList>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                </TabsList>

                {/* Monthly Retrospective */}
                <TabsContent value="monthly" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate Monthly Retrospective</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="p-2 border rounded"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i + 1}>
                                            {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="p-2 border rounded"
                                >
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <option key={i} value={new Date().getFullYear() - i}>
                                            {new Date().getFullYear() - i}
                                        </option>
                                    ))}
                                </select>
                                <Button onClick={generateMonthly} disabled={isGenerating}>
                                    {isGenerating ? "Generating..." : "Generate Analysis"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {monthlyRetro && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Monthly Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg">{monthlyRetro.summary}</p>
                                </CardContent>
                            </Card>

                            {/* Metrics */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-primary">
                                                {monthlyRetro.metrics.totalXP}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Total XP</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-green-500">
                                                {monthlyRetro.metrics.tasksCompleted}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Tasks Completed</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-blue-500">
                                                {monthlyRetro.metrics.avgSleepHours.toFixed(1)}h
                                            </p>
                                            <p className="text-sm text-muted-foreground">Avg Sleep</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Wins */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-500" />
                                        Wins
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {monthlyRetro.wins.map((win, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-green-500">✓</span>
                                                <span>{win}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Failures & Stagnations */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                            Areas to Improve
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {monthlyRetro.failures.map((failure, i) => (
                                                <li key={i} className="text-sm text-muted-foreground">
                                                    • {failure}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-orange-500" />
                                            Stagnations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {monthlyRetro.stagnations.map((stag, i) => (
                                                <li key={i} className="text-sm text-muted-foreground">
                                                    • {stag}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Suggestions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-500" />
                                        AI Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {monthlyRetro.suggestions.map((suggestion, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-purple-500">→</span>
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* 30-Day Plan */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-500" />
                                        Next 30-Day Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-line">{monthlyRetro.next30DayPlan}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* Quarterly Retrospective */}
                <TabsContent value="quarterly" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate Quarterly Retrospective</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <select
                                    value={selectedQuarter}
                                    onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                                    className="p-2 border rounded"
                                >
                                    {[1, 2, 3, 4].map((q) => (
                                        <option key={q} value={q}>
                                            Q{q}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="p-2 border rounded"
                                >
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <option key={i} value={new Date().getFullYear() - i}>
                                            {new Date().getFullYear() - i}
                                        </option>
                                    ))}
                                </select>
                                <Button onClick={generateQuarterly} disabled={isGenerating}>
                                    {isGenerating ? "Generating..." : "Generate Deep Analysis"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {quarterlyRetro && (
                        <div className="space-y-4">
                            {/* Psychological Insights */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>🧠 Psychological Insights</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-line text-lg leading-relaxed">
                                        {quarterlyRetro.psychologicalInsights}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Strengths & Weaknesses */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-green-500">💪 Strengths</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {quarterlyRetro.strengthsWeaknesses.strengths.map((s, i) => (
                                                <li key={i}>✓ {s}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-orange-500">⚠️ Weaknesses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {quarterlyRetro.strengthsWeaknesses.weaknesses.map((w, i) => (
                                                <li key={i}>• {w}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Long-Term Trajectory */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>🎯 Long-Term Trajectory</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-line">{quarterlyRetro.longTermTrajectory}</p>
                                </CardContent>
                            </Card>

                            {/* Paradigm Shifts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>🔄 Paradigm Shifts Needed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {quarterlyRetro.paradigmShifts.map((shift, i) => (
                                            <li key={i} className="p-3 bg-primary/5 rounded border-l-4 border-primary">
                                                {shift}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Life Direction */}
                            <Card className="border-2 border-primary">
                                <CardHeader>
                                    <CardTitle>🌟 Life Direction Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-line text-lg leading-relaxed">
                                        {quarterlyRetro.lifeDirectionAnalysis}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
