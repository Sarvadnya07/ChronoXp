"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface HeatmapDay {
    date: string
    count: number // 0-4 intensity
    label?: string
}

interface StreakHeatmapProps {
    data: HeatmapDay[]
    title?: string
    description?: string
}

export function StreakHeatmap({ data, title = "Consistency Heatmap", description = "Your daily activity over the last 3 months" }: StreakHeatmapProps) {
    // Group by weeks for grid layout
    // This is a simplified implementation. A real calendar heatmap is more complex.
    // We'll just show a grid of squares for now.

    const getIntensityClass = (count: number) => {
        if (count === 0) return "bg-muted/20"
        if (count === 1) return "bg-green-900/40"
        if (count === 2) return "bg-green-700/60"
        if (count === 3) return "bg-green-500/80"
        return "bg-green-400"
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                    <TooltipProvider>
                        {data.map((day, index) => (
                            <Tooltip key={day.date}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "w-3 h-3 rounded-sm cursor-pointer transition-colors",
                                            getIntensityClass(day.count)
                                        )}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-bold">{day.date}</p>
                                    <p className="text-xs text-muted-foreground">{day.label || `${day.count} tasks`}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-muted/20" />
                        <div className="w-3 h-3 rounded-sm bg-green-900/40" />
                        <div className="w-3 h-3 rounded-sm bg-green-700/60" />
                        <div className="w-3 h-3 rounded-sm bg-green-500/80" />
                        <div className="w-3 h-3 rounded-sm bg-green-400" />
                    </div>
                    <span>More</span>
                </div>
            </CardContent>
        </Card>
    )
}
