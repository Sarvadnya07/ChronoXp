"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Moon, Sun, Star } from "lucide-react"

interface SleepFormProps {
    initialStart?: string
    initialEnd?: string
    initialQuality?: number
    onSave: (start: string, end: string, quality: number) => void
}

export function SleepForm({ initialStart = "23:00", initialEnd = "07:00", initialQuality = 3, onSave }: SleepFormProps) {
    const [start, setStart] = useState(initialStart)
    const [end, setEnd] = useState(initialEnd)
    const [quality, setQuality] = useState(initialQuality)

    const calculateDuration = () => {
        const s = new Date(`2000-01-01T${start}`)
        const e = new Date(`2000-01-01T${end}`)
        let diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60)
        if (diff < 0) diff += 24
        return diff.toFixed(1)
    }

    const handleSave = () => {
        onSave(start, end, quality)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Log Sleep</CardTitle>
                <CardDescription>Track your rest to optimize energy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Moon className="w-4 h-4" /> Bedtime
                        </Label>
                        <Input
                            type="time"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Sun className="w-4 h-4" /> Wake Up
                        </Label>
                        <Input
                            type="time"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>
                </div>

                <div className="text-center py-2">
                    <span className="text-2xl font-bold">{calculateDuration()}</span>
                    <span className="text-muted-foreground ml-2">hours</span>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>Sleep Quality</Label>
                        <span className="font-bold text-primary">{quality}/5</span>
                    </div>
                    <Slider
                        value={[quality]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(vals) => setQuality(vals[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Poor</span>
                        <span>Excellent</span>
                    </div>
                </div>

                <Button onClick={handleSave} className="w-full">
                    Save Sleep Log
                </Button>
            </CardContent>
        </Card>
    )
}
