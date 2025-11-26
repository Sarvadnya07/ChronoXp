"use client"

import { useEffect } from "react"
import { useTimerStore, TimerMode } from "@/store/useTimerStore"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { scheduleTaskNotification, showNotification } from "@/lib/notifications"

export function PomodoroTimer() {
    const {
        timeLeft,
        isActive,
        mode,
        activeTask,
        startTimer,
        pauseTimer,
        resetTimer,
        setMode,
        tick,
        incrementCycles,
    } = useTimerStore()

    const { completeTask } = useAppStore()

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isActive && timeLeft > 0) {
            interval = setInterval(tick, 1000)
        } else if (timeLeft === 0 && isActive) {
            // Timer finished
            handleTimerComplete()
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft])

    const handleTimerComplete = () => {
        pauseTimer()
        incrementCycles()

        // Notification
        showNotification("Timer Complete!", {
            body: `${mode === "pomodoro" || mode === "deepFocus" ? "Focus session" : "Break"} finished.`,
        })

        // If task was active and in focus mode, maybe prompt to complete?
        // For now, just play a sound (stub)
        const audio = new Audio("/sounds/bell.mp3") // Ensure this file exists or remove
        audio.play().catch(e => console.log("Audio play failed", e))
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const modes: { id: TimerMode; label: string }[] = [
        { id: "pomodoro", label: "Pomodoro (25m)" },
        { id: "shortBreak", label: "Short Break (5m)" },
        { id: "longBreak", label: "Long Break (15m)" },
        { id: "deepFocus", label: "Deep Focus (50m)" },
    ]

    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            {/* Mode Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
                {modes.map((m) => (
                    <Button
                        key={m.id}
                        variant={mode === m.id ? "default" : "outline"}
                        onClick={() => setMode(m.id)}
                        className="rounded-full"
                    >
                        {m.label}
                    </Button>
                ))}
            </div>

            {/* Timer Display */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Ring SVG */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted"
                    />
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={
                            2 * Math.PI * 120 * (1 - timeLeft / (mode === "deepFocus" ? 3000 : mode === "longBreak" ? 900 : mode === "shortBreak" ? 300 : 1500))
                        }
                        className="text-primary transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="text-6xl font-bold font-mono">{formatTime(timeLeft)}</div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <Button
                    size="lg"
                    variant={isActive ? "secondary" : "default"}
                    onClick={isActive ? pauseTimer : startTimer}
                    className="w-32 h-12 text-lg"
                >
                    {isActive ? (
                        <>
                            <Pause className="mr-2 w-5 h-5" /> Pause
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 w-5 h-5" /> Start
                        </>
                    )}
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer} className="w-12 h-12 p-0">
                    <RotateCcw className="w-5 h-5" />
                </Button>
            </div>

            {/* Active Task */}
            {activeTask && (
                <Card className="p-4 w-full max-w-md bg-muted/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Working on:</p>
                            <p className="font-medium">{activeTask.title}</p>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                            onClick={() => completeTask(activeTask.id)}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
