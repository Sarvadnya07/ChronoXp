"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, Repeat, AlertCircle } from "lucide-react"

export default function TimelineView() {
  const { todayProgress, completeTask, uncompleteTask } = useAppStore()

  if (!todayProgress) return null

  const sortedTasks = [...todayProgress.tasks].sort((a, b) => {
    if (!a.scheduledTime) return 1
    if (!b.scheduledTime) return -1
    return a.scheduledTime.localeCompare(b.scheduledTime)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">Check off your tasks as you complete them throughout the day</p>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 pl-8">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

          {sortedTasks.map((task) => (
            <div key={task.id} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute left-[-23px] w-6 h-6 rounded-full border-4 border-background ${task.completed ? "bg-primary glow-dot" : "bg-muted"
                  }`}
              />

              <div
                className={`p-4 rounded-lg border transition-all ${task.completed
                    ? "bg-primary/5 border-primary/20"
                    : task.isCritical
                      ? "bg-destructive/5 border-destructive/30 hover:border-destructive/50"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          completeTask(task.id)
                        } else {
                          uncompleteTask(task.id)
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                        {task.priority === 'high' && (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1">High</Badge>
                        )}
                        {task.repeatRule !== 'none' && (
                          <Repeat className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.scheduledTime || "Anytime"}
                        </span>
                        <span>{task.duration} minutes</span>
                        <span className="capitalize">{task.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={task.completed ? "default" : "secondary"} className="shrink-0">
                    +{task.xp} XP
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
