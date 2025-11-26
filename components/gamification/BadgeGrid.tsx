"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Badge as BadgeType } from "@/lib/types"

interface BadgeGridProps {
    badges: BadgeType[]
    className?: string
}

export default function BadgeGrid({ badges, className }: BadgeGridProps) {
    return (
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", className)}>
            {badges.map((badge) => (
                <Card
                    key={badge.id}
                    className={cn(
                        "relative overflow-hidden transition-all hover:scale-105",
                        !badge.unlocked && "opacity-60 bg-muted/50"
                    )}
                >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className={cn(
                            "text-4xl mb-1 transition-transform",
                            badge.unlocked ? "scale-110" : "grayscale blur-[1px]"
                        )}>
                            {badge.icon}
                        </div>

                        <div className="space-y-1">
                            <h4 className="font-semibold text-sm leading-tight">{badge.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                        </div>

                        {!badge.unlocked && badge.progress !== undefined && (
                            <div className="w-full mt-2">
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary/50 transition-all"
                                        style={{ width: `${badge.progress}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                                    {Math.round(badge.progress)}%
                                </p>
                            </div>
                        )}

                        {!badge.unlocked && (
                            <div className="absolute top-2 right-2">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
