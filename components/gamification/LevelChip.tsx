"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LevelChipProps {
    level: number
    className?: string
}

export default function LevelChip({ level, className }: LevelChipProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "bg-background/50 backdrop-blur border-primary/20 text-primary font-bold px-3 py-1",
                className
            )}
        >
            Lvl {level}
        </Badge>
    )
}
