"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XPLog } from "@/lib/types"
import { getWeeklyXP } from "@/lib/analytics"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"

interface WeeklyLeaderboardProps {
    xpLogs: XPLog[]
}

export function WeeklyLeaderboard({ xpLogs }: WeeklyLeaderboardProps) {
    // Group XP by week
    const xpByWeek = xpLogs.reduce((acc, log) => {
        const date = new Date(log.date)
        const year = date.getFullYear()
        const week = getWeekNumber(date)
        const key = `${year}-W${week}`

        if (!acc[key]) acc[key] = 0
        acc[key] += log.xp
        return acc
    }, {} as Record<string, number>)

    const sortedWeeks = Object.entries(xpByWeek)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5 weeks

    const currentWeekKey = `${new Date().getFullYear()}-W${getWeekNumber(new Date())}`
    const currentWeekXP = xpByWeek[currentWeekKey] || 0

    // Calculate growth
    const lastWeekKey = `${new Date().getFullYear()}-W${getWeekNumber(new Date()) - 1}`
    const lastWeekXP = xpByWeek[lastWeekKey] || 0
    const growth = lastWeekXP > 0 ? ((currentWeekXP - lastWeekXP) / lastWeekXP) * 100 : 0

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Week</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentWeekXP} XP</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            {growth > 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                            )}
                            <span className={growth > 0 ? "text-green-500" : "text-red-500"}>
                                {Math.abs(growth).toFixed(1)}%
                            </span>
                            {" from last week"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Week Ever</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sortedWeeks[0]?.[1] || 0} XP</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Week {sortedWeeks[0]?.[0] || "N/A"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sortedWeeks.map(([week, xp], index) => (
                            <div key={week} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                                            index === 1 ? "bg-gray-500/20 text-gray-600" :
                                                index === 2 ? "bg-orange-500/20 text-orange-600" : "bg-muted text-muted-foreground"}
                  `}>
                                        {index + 1}
                                    </div>
                                    <span className="font-medium">{week}</span>
                                </div>
                                <span className="font-mono font-bold">{xp} XP</span>
                            </div>
                        ))}
                        {sortedWeeks.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No data yet. Start completing tasks!</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return weekNo
}
