"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Moon, Brain } from "lucide-react"
import { Profile, XPLog, DailyProgress } from "@/lib/types"

interface MentorSidebarSummaryProps {
    profile: Profile | null
    xpLogs: XPLog[]
    recentSleep: DailyProgress[]
    recentJournal: DailyProgress[]
    isLoading: boolean
}

export function MentorSidebarSummary({
    profile,
    xpLogs,
    recentSleep,
    recentJournal,
    isLoading,
}: MentorSidebarSummaryProps) {
    if (isLoading) {
        return <div className="text-muted-foreground">Loading summary...</div>
    }

    const xpThisWeek = xpLogs.reduce((sum, log) => sum + log.xp, 0)
    const avgSleep = recentSleep.length
        ? (
            recentSleep.reduce((sum, log) => sum + (log.totalHours ?? 0), 0) /
            recentSleep.length
        ).toFixed(1)
        : "0"
    const lastMood = recentJournal.length ? recentJournal[0].mood : 0

    return (
        <div className="space-y-4">
            {/* Streak */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Streak
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-center">
                        {profile?.stats.currentStreak || 0} Days
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                        Keep it burning!
                    </p>
                </CardContent>
            </Card>

            {/* Wellness */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        Wellness
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Sleep</span>
                        <span className="font-bold">{avgSleep} hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Mood</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((m) => (
                                <div
                                    key={m}
                                    className={`w-2 h-2 rounded-full ${lastMood === m ? "bg-primary" : "bg-muted"}`}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Focus */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        Focus
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">XP This Week</span>
                        <span className="font-bold text-primary">{xpThisWeek}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
