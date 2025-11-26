"use client"

import { Progress } from "@/components/ui/progress"
import { calculateLevelProgress, calculateXPForNextLevel } from "@/lib/gamification/xpEngine"
import { cn } from "@/lib/utils"

interface XPBarProps {
    totalXP: number
    level: number
    className?: string
}

export default function XPBar({ totalXP, level, className }: XPBarProps) {
    const progress = calculateLevelProgress(totalXP)
    const nextLevelXP = calculateXPForNextLevel(level)
    const currentLevelXP = calculateXPForNextLevel(level - 1)
    const xpInLevel = totalXP - currentLevelXP
    const xpNeeded = nextLevelXP - currentLevelXP

    return (
        <div className={cn("w-full space-y-1", className)}>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level {level}</span>
                <span>{xpInLevel} / {xpNeeded} XP</span>
            </div>
            <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>
    )
}
