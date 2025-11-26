"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface WeeklyReflectionProps {
    weekId: string
    onSave: (wins: string, struggles: string, improvements: string) => void
}

export function WeeklyReflection({ weekId, onSave }: WeeklyReflectionProps) {
    const [wins, setWins] = useState("")
    const [struggles, setStruggles] = useState("")
    const [improvements, setImprovements] = useState("")

    const handleSave = () => {
        onSave(wins, struggles, improvements)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Reflection</CardTitle>
                <CardDescription>Reflect on week {weekId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>What went well?</Label>
                    <Textarea
                        value={wins}
                        onChange={(e) => setWins(e.target.value)}
                        placeholder="Achievements, good habits..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>What didn't go well?</Label>
                    <Textarea
                        value={struggles}
                        onChange={(e) => setStruggles(e.target.value)}
                        placeholder="Distractions, missed tasks..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>What will you change next week?</Label>
                    <Textarea
                        value={improvements}
                        onChange={(e) => setImprovements(e.target.value)}
                        placeholder="Actionable steps..."
                    />
                </div>
                <Button onClick={handleSave} className="w-full">
                    Save Reflection
                </Button>
            </CardContent>
        </Card>
    )
}
