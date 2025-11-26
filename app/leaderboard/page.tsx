"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/db"
import { XPLog } from "@/lib/types"
import { WeeklyLeaderboard } from "@/components/leaderboard/WeeklyLeaderboard"
import { Loader2 } from "lucide-react"

export default function LeaderboardPage() {
    const [xpLogs, setXpLogs] = useState<XPLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const logs = await db.getAll("xpLogs")
                setXpLogs(logs)
            } catch (error) {
                console.error("Failed to load leaderboard data:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
                <p className="text-muted-foreground">Compete against your past self</p>
            </div>

            <div className="max-w-3xl mx-auto">
                <WeeklyLeaderboard xpLogs={xpLogs} />
            </div>
        </div>
    )
}
