"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TimeGridProps {
    onSlotClick?: (time: string) => void
    className?: string
}

export default function TimeGrid({ onSlotClick, className }: TimeGridProps) {
    // Generate time slots (00:00 to 23:30 in 30-min intervals)
    const timeSlots = useMemo(() => {
        const slots: string[] = []
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, "0")}:00`)
            slots.push(`${hour.toString().padStart(2, "0")}:30`)
        }
        return slots
    }, [])

    // Get current time for indicator
    const currentTime = useMemo(() => {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        return hours * 60 + minutes // Total minutes from midnight
    }, [])

    // Calculate position percentage for current time indicator
    const currentTimePosition = (currentTime / (24 * 60)) * 100

    return (
        <div className={cn("relative", className)}>
            {/* Time Grid */}
            <div className="space-y-0 border rounded-lg overflow-hidden bg-card">
                {timeSlots.map((time, index) => {
                    const isHourMark = time.endsWith(":00")

                    return (
                        <div
                            key={time}
                            onClick={() => onSlotClick?.(time)}
                            className={cn(
                                "relative border-b last:border-b-0 transition-colors cursor-pointer group",
                                isHourMark ? "h-16 border-border" : "h-16 border-border/50",
                                "hover:bg-accent/50"
                            )}
                        >
                            {/* Time Label */}
                            <div className={cn(
                                "absolute left-0 top-0 px-3 py-1 text-xs font-medium",
                                isHourMark ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {time}
                            </div>

                            {/* Slot Content Area */}
                            <div className="ml-16 h-full flex items-center px-2">
                                <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-muted-foreground">+ Add task</span>
                                </div>
                            </div>

                            {/* Hour Divider */}
                            {isHourMark && index > 0 && (
                                <div className="absolute top-0 left-16 right-0 border-t-2 border-border" />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Current Time Indicator */}
            <div
                className="absolute left-16 right-0 h-0.5 bg-primary z-10 pointer-events-none"
                style={{ top: `${currentTimePosition}%` }}
            >
                <div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-primary" />
                <div className="absolute left-0 -top-3 text-xs font-medium text-primary whitespace-nowrap">
                    Now
                </div>
            </div>
        </div>
    )
}
