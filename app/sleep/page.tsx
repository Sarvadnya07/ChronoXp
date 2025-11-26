"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { db } from "@/lib/db"
import { SleepForm } from "@/components/sleep/SleepForm"
import { SleepHistoryChart } from "@/components/sleep/SleepHistoryChart"
import { Loader2, Battery, BatteryCharging, BatteryWarning, BatteryFull } from "lucide-react"
import { calculateEnergy } from "@/lib/gamification"

export default function SleepPage() {
    const { todayProgress, logSleep, profile } = useAppStore()
    const [history, setHistory] = useState<{ date: string; hours: number; quality: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const allProgress = await db.getAll("dailyProgress")
                const sleepHistory = allProgress
                    .filter(p => p.sleep)
                    .map(p => ({
                        date: p.date,
                        hours: p.sleep!.totalHours,
                        quality: p.sleep!.sleepQuality
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(-7) // Last 7 entries

                setHistory(sleepHistory)
            } catch (error) {
                console.error("Failed to load sleep history:", error)
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [todayProgress])

    const handleSaveSleep = async (start: string, end: string, quality: number) => {
        await logSleep(start, end, quality)
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const currentEnergy = profile?.energy.current || 100

    const getEnergyIcon = () => {
        if (currentEnergy > 80) return <BatteryFull className="w-8 h-8 text-green-500" />
        if (currentEnergy > 50) return <BatteryCharging className="w-8 h-8 text-yellow-500" />
        if (currentEnergy > 20) return <Battery className="w-8 h-8 text-orange-500" />
        return <BatteryWarning className="w-8 h-8 text-red-500" />
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sleep & Energy</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <SleepForm
                    initialStart={todayProgress?.sleep?.sleepStart}
                    initialEnd={todayProgress?.sleep?.sleepEnd}
                    initialQuality={todayProgress?.sleep?.sleepQuality}
                    onSave={handleSaveSleep}
                />

                <div className="space-y-4">
                    <div className="border rounded-lg p-6 flex flex-col items-center justify-center bg-card text-card-foreground shadow-sm h-[200px]">
                        <div className="mb-4">{getEnergyIcon()}</div>
                        <div className="text-4xl font-bold mb-2">{currentEnergy}%</div>
                        <p className="text-muted-foreground text-center">
                            Current Energy Level
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Based on sleep, tasks, and mood
                        </p>
                    </div>

                    <SleepHistoryChart data={history} />
                </div>
            </div>
        </div>
    )
}
