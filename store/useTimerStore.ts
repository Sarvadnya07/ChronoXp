import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Task } from "@/lib/types"

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak" | "deepFocus"

interface TimerState {
    timeLeft: number
    isActive: boolean
    mode: TimerMode
    activeTask: Task | null
    cyclesCompleted: number

    // Actions
    setTime: (seconds: number) => void
    startTimer: () => void
    pauseTimer: () => void
    resetTimer: () => void
    setMode: (mode: TimerMode) => void
    setActiveTask: (task: Task | null) => void
    tick: () => void
    incrementCycles: () => void
}

const DEFAULT_TIMES = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    deepFocus: 50 * 60,
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            timeLeft: DEFAULT_TIMES.pomodoro,
            isActive: false,
            mode: "pomodoro",
            activeTask: null,
            cyclesCompleted: 0,

            setTime: (seconds) => set({ timeLeft: seconds }),
            startTimer: () => set({ isActive: true }),
            pauseTimer: () => set({ isActive: false }),
            resetTimer: () => {
                const { mode } = get()
                set({ timeLeft: DEFAULT_TIMES[mode], isActive: false })
            },
            setMode: (mode) => set({ mode, timeLeft: DEFAULT_TIMES[mode], isActive: false }),
            setActiveTask: (task) => set({ activeTask: task }),
            tick: () => {
                const { timeLeft, isActive } = get()
                if (isActive && timeLeft > 0) {
                    set({ timeLeft: timeLeft - 1 })
                } else if (isActive && timeLeft === 0) {
                    set({ isActive: false })
                }
            },
            incrementCycles: () => set((state) => ({ cyclesCompleted: state.cyclesCompleted + 1 })),
        }),
        {
            name: "timer-storage",
        }
    )
)
