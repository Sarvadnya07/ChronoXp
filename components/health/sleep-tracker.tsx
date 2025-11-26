"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useAppStore } from "@/store/useAppStore"
import { checkSleepAndNotify } from "@/lib/notifications"
import { Skeleton } from "@/components/ui/skeleton"
import { Moon, Sun, BedDouble } from "lucide-react"

export function SleepTracker() {
    const { todayProgress, updateSleep } = useAppStore()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        startTime: "23:00",
        wakeTime: "07:00",
        quality: 3,
    })

    useEffect(() => {
        if (todayProgress) {
            setFormData({
                startTime: todayProgress.sleep?.startTime || "23:00",
                wakeTime: todayProgress.sleep?.wakeTime || "07:00",
                quality: todayProgress.sleep?.quality || 3,
            })
            setIsLoading(false)
        } else {
            // If todayProgress is not yet available, we keep loading or default
            // For now, we'll assume it loads eventually or is null initially
            const timer = setTimeout(() => setIsLoading(false), 1000)
            return () => clearTimeout(timer)
        }
    }, [todayProgress])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const start = new Date(`2000-01-01T${formData.startTime}`)
            const end = new Date(`2000-01-01T${formData.wakeTime}`)
            let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            if (diff < 0) diff += 24 // Handle crossing midnight

            await updateSleep({
                startTime: formData.startTime,
                wakeTime: formData.wakeTime,
                duration: Math.round(diff * 10) / 10,
                quality: formData.quality,
            })

            checkSleepAndNotify(Math.round(diff * 10) / 10)
        } catch (error) {
            console.error("Failed to save sleep data", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sleep Tracker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BedDouble className="h-5 w-5" />
                    Sleep Tracker
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startTime" className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Bedtime
                        </Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wakeTime" className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Wake Up
                        </Label>
                        <Input
                            id="wakeTime"
                            type="time"
                            value={formData.wakeTime}
                            onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>Sleep Quality (1-5)</Label>
                        <span className="font-bold text-primary">{formData.quality}/5</span>
                    </div>
                    <Slider
                        value={[formData.quality]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(vals) => setFormData({ ...formData, quality: vals[0] })}
                    />
                </div>

                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Sleep Log"}
                </Button>
            </CardContent>
        </Card>
    )
}
