"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateSwitcherProps {
    currentDate: string
    onDateChange: (date: string) => void
    onToday: () => void
    className?: string
}

export default function DateSwitcher({
    currentDate,
    onDateChange,
    onToday,
    className,
}: DateSwitcherProps) {
    const handlePrevDay = () => {
        const date = new Date(currentDate)
        date.setDate(date.getDate() - 1)
        onDateChange(date.toISOString().split("T")[0])
    }

    const handleNextDay = () => {
        const date = new Date(currentDate)
        date.setDate(date.getDate() + 1)
        onDateChange(date.toISOString().split("T")[0])
    }

    const isToday = currentDate === new Date().toISOString().split("T")[0]

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={handlePrevDay}
                className="h-8 w-8"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
                variant={isToday ? "default" : "outline"}
                size="sm"
                onClick={onToday}
                className="min-w-[80px]"
            >
                <Calendar className="w-4 h-4 mr-2" />
                Today
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
                className="h-8 w-8"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="text-sm font-medium ml-2">
                {new Date(currentDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                })}
            </div>
        </div>
    )
}
