"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react"
import TimeGrid from "./time-grid"
import TaskBlock from "./task-block"
import { getLocalDate } from "@/lib/utils"
import type { Task } from "@/lib/types"

export default function EnhancedTimelineView() {
    const { todayProgress, completeTask, uncompleteTask } = useAppStore()
    const [selectedDate, setSelectedDate] = useState(getLocalDate())
    const [showTaskDialog, setShowTaskDialog] = useState(false)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    if (!todayProgress) return null

    // Filter tasks with scheduled times
    const scheduledTasks = todayProgress.tasks.filter(t => t.startTime || t.scheduledTime)

    // Convert time string to minutes from midnight
    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number)
        return hours * 60 + minutes
    }

    // Calculate task position and height
    const getTaskStyle = (task: Task) => {
        const startTime = task.startTime || task.scheduledTime
        if (!startTime) return {}

        const startMinutes = timeToMinutes(startTime)
        const topPercent = (startMinutes / (24 * 60)) * 100
        const heightPercent = (task.duration / (24 * 60)) * 100

        return {
            position: "absolute" as const,
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
            left: "6rem",
            right: "1rem",
            zIndex: 10,
        }
    }

    const handleSlotClick = (time: string) => {
        setSelectedTime(time)
        setShowTaskDialog(true)
    }

    const handlePrevDay = () => {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() - 1)
        setSelectedDate(date.toISOString().split("T")[0])
    }

    const handleNextDay = () => {
        const date = new Date(selectedDate)
        date.setDate(date.setDate(date.getDate() + 1))
        setSelectedDate(date.toISOString().split("T")[0])
    }

    const handleToday = () => {
        setSelectedDate(getLocalDate())
    }

    return (
        <div className="space-y-4">
            {/* Date Navigation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline View
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevDay}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleNextDay}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium ml-2">
                                {new Date(selectedDate).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {/* Time Grid Background */}
                        <TimeGrid onSlotClick={handleSlotClick} />

                        {/* Task Blocks Overlay */}
                        {scheduledTasks.map((task) => (
                            <div key={task.id} style={getTaskStyle(task)}>
                                <TaskBlock
                                    task={task}
                                    onComplete={(id) => {
                                        if (task.completed) {
                                            uncompleteTask(id)
                                        } else {
                                            completeTask(id)
                                        }
                                    }}
                                    onEdit={(task) => {
                                        // TODO: Open edit dialog
                                        console.log("Edit task:", task)
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Unscheduled Tasks */}
                    {todayProgress.tasks.filter(t => !t.startTime && !t.scheduledTime).length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Unscheduled Tasks
                            </h3>
                            <div className="space-y-2">
                                {todayProgress.tasks
                                    .filter(t => !t.startTime && !t.scheduledTime)
                                    .map((task) => (
                                        <TaskBlock
                                            key={task.id}
                                            task={task}
                                            onComplete={(id) => {
                                                if (task.completed) {
                                                    uncompleteTask(id)
                                                } else {
                                                    completeTask(id)
                                                }
                                            }}
                                            onEdit={(task) => {
                                                console.log("Edit task:", task)
                                            }}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
