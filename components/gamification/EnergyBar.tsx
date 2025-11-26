"use client"

import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnergyBarProps {
    current: number // 0-100
    className?: string
}

export default function EnergyBar({ current, className }: EnergyBarProps) {
    // Determine color based on level
    const getColor = (level: number) => {
        if (level <= 30) return "bg-red-500"
        if (level <= 70) return "bg-yellow-500"
        return "bg-green-500"
    }

    const colorClass = getColor(current)

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Zap className={cn("w-4 h-4", current <= 30 ? "text-red-500" : "text-yellow-500")} />
            <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500", colorClass)}
                    style={{ width: `${current}%` }}
                />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{current}%</span>
        </div>
    )
}
