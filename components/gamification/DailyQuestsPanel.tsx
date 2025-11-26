"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Swords, Trophy } from "lucide-react"
import type { DailyQuest, Task } from "@/lib/types"

interface DailyQuestsPanelProps {
    quest: DailyQuest
    tasks: Task[]
    onComplete?: (taskId: string) => void
}

export default function DailyQuestsPanel({ quest, tasks, onComplete }: DailyQuestsPanelProps) {
    // Find the actual task objects for the quest
    const questTasks = quest.tasks
        .map(id => tasks.find(t => t.id === id))
        .filter(Boolean) as Task[]

    const completedCount = questTasks.filter(t => t.completed).length
    const isAllCompleted = completedCount === questTasks.length && questTasks.length > 0

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Swords className="w-4 h-4 text-primary" />
                        Daily Quests
                    </CardTitle>
                    <Badge variant={isAllCompleted ? "default" : "outline"} className="text-xs">
                        {completedCount}/{questTasks.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {questTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 text-sm">
                            <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => onComplete?.(task.id)}
                                disabled={task.completed}
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                        {task.category}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">+{task.xp} XP</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {questTasks.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            No quests available for today.
                        </p>
                    )}

                    {isAllCompleted && (
                        <div className="mt-4 p-2 bg-background/50 rounded-lg flex items-center gap-2 text-sm text-primary animate-in fade-in slide-in-from-bottom-2">
                            <Trophy className="w-4 h-4" />
                            <span>Quest Complete! +50 XP Bonus</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
