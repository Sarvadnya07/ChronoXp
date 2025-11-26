"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useTimerStore } from "@/store/useTimerStore"
import { PomodoroTimer } from "@/components/deepwork/PomodoroTimer"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Maximize2, Minimize2 } from "lucide-react"

export default function DeepWorkPage() {
    const { tasks } = useAppStore()
    const { setActiveTask, activeTask } = useTimerStore()
    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }

    // Filter incomplete tasks
    const incompleteTasks = tasks.filter((t) => !t.completed)

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-8 items-center justify-center relative">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={toggleFullscreen}
            >
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
            </Button>

            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Deep Work</h1>
                    <p className="text-muted-foreground">Eliminate distractions and focus on what matters.</p>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-xs">
                        <Select
                            value={activeTask?.id || "none"}
                            onValueChange={(val) => {
                                if (val === "none") setActiveTask(null)
                                else setActiveTask(tasks.find((t) => t.id === val) || null)
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a task to focus on..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No specific task</SelectItem>
                                {incompleteTasks.map((task) => (
                                    <SelectItem key={task.id} value={task.id}>
                                        {task.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <PomodoroTimer />
            </div>
        </div>
    )
}
