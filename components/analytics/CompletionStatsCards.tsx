"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Target, TrendingUp, AlertCircle } from "lucide-react"

interface CompletionStatsProps {
    todayCompletion: number
    weeklyCompletion: number
    monthlyCompletion: number
    totalTasksCompleted: number
}

export function CompletionStatsCards({ todayCompletion, weeklyCompletion, monthlyCompletion, totalTasksCompleted }: CompletionStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Completion</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(todayCompletion)}%</div>
                    <p className="text-xs text-muted-foreground">
                        {todayCompletion >= 80 ? "Great job!" : "Keep pushing!"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(weeklyCompletion)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Last 7 days
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(monthlyCompletion)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Last 30 days
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTasksCompleted}</div>
                    <p className="text-xs text-muted-foreground">
                        Lifetime completed
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
