"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

interface TaskBlockProps {
    task: Task
    onComplete?: (taskId: string) => void
    onEdit?: (task: Task) => void
    className?: string
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
    DSA: "bg-blue-500/20 border-blue-500/50 text-blue-400",
    "AI/ML": "bg-purple-500/20 border-purple-500/50 text-purple-400",
    GATE: "bg-green-500/20 border-green-500/50 text-green-400",
    Japanese: "bg-pink-500/20 border-pink-500/50 text-pink-400",
    Exercise: "bg-orange-500/20 border-orange-500/50 text-orange-400",
    Projects: "bg-cyan-500/20 border-cyan-500/50 text-cyan-400",
    Study: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400",
    Health: "bg-red-500/20 border-red-500/50 text-red-400",
    Sleep: "bg-violet-500/20 border-violet-500/50 text-violet-400",
    Journal: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
    Break: "bg-gray-500/20 border-gray-500/50 text-gray-400",
    Chill: "bg-teal-500/20 border-teal-500/50 text-teal-400",
    Career: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
    Class: "bg-lime-500/20 border-lime-500/50 text-lime-400",
    Admin: "bg-slate-500/20 border-slate-500/50 text-slate-400",
    Planning: "bg-amber-500/20 border-amber-500/50 text-amber-400",
    Custom: "bg-gray-500/20 border-gray-500/50 text-gray-400",
}

export default function TaskBlock({ task, onComplete, onEdit, className }: TaskBlockProps) {
    const categoryColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Custom

    // Calculate height based on duration (1 hour = 128px, 30 min = 64px)
    const heightInPixels = (task.duration / 60) * 128

    return (
        <Card
            onClick={() => onEdit?.(task)}
            className={cn(
                "p-3 border-l-4 cursor-pointer transition-all hover:shadow-md",
                categoryColor,
                task.completed && "opacity-50 grayscale",
                className
            )}
            style={{ minHeight: `${heightInPixels}px` }}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onComplete?.(task.id)
                            }}
                            className="shrink-0"
                        >
                            {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                                <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                            )}
                        </button>
                        <h4 className={cn(
                            "font-medium text-sm truncate",
                            task.completed && "line-through"
                        )}>
                            {task.title}
                        </h4>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.duration}m</span>
                        </div>
                        {task.repeatRule !== "none" && (
                            <div className="flex items-center gap-1">
                                <Repeat className="w-3 h-3" />
                                <span className="capitalize">{task.repeatRule}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* XP Badge */}
                <Badge variant="secondary" className="shrink-0 text-xs">
                    +{task.xp} XP
                </Badge>
            </div>

            {/* Priority Indicator */}
            {task.priority === "high" && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
        </Card>
    )
}
