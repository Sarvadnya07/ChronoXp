"use client"

import { Progress } from "@/components/ui/progress"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnergyBarProps {
    current: number
    className?: string
}

export function EnergyBar({ current, className }: EnergyBarProps) {
    // Determine color based on energy level
    let colorClass = "bg-green-500"
    if (current < 30) colorClass = "bg-red-500"
    else if (current < 70) colorClass = "bg-yellow-500"

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                    <Zap className={cn("w-4 h-4", current < 30 ? "text-red-500" : "text-yellow-500")} fill="currentColor" />
                    <span>Energy Level</span>
                </div>
                <span className="font-bold">{Math.round(current)}%</span>
            </div>
            <Progress value={current} className="h-3" indicatorClassName={colorClass} />
            <p className="text-xs text-muted-foreground text-right">
                {current > 80 ? "Peak Performance" : current > 50 ? "Good State" : "Take a Break"}
            </p>
        </div>
    )
}
