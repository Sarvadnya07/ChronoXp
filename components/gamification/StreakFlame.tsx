"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakFlameProps {
    streak: number
    active?: boolean
    className?: string
}

export default function StreakFlame({ streak, active = true, className }: StreakFlameProps) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500",
                active && streak > 0 ? "bg-orange-500/20" : "bg-muted/20"
            )}>
                <Flame
                    className={cn(
                        "w-5 h-5 transition-all duration-500",
                        active && streak > 0
                            ? "text-orange-500 fill-orange-500 animate-pulse"
                            : "text-muted-foreground"
                    )}
                />
                {active && streak > 0 && (
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping opacity-20" />
                )}
            </div>
            <div className="flex flex-col">
                <span className={cn(
                    "text-sm font-bold leading-none",
                    active && streak > 0 ? "text-orange-500" : "text-muted-foreground"
                )}>
                    {streak}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Day Streak
                </span>
            </div>
        </div>
    )
}
