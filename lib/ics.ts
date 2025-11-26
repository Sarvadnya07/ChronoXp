import { Task } from "./types"

export function parseICS(icsContent: string): Partial<Task>[] {
    const events: Partial<Task>[] = []
    const lines = icsContent.split(/\r\n|\n|\r/)

    let currentEvent: any = {}
    let inEvent = false

    for (const line of lines) {
        if (line.startsWith("BEGIN:VEVENT")) {
            inEvent = true
            currentEvent = {}
        } else if (line.startsWith("END:VEVENT")) {
            inEvent = false
            if (currentEvent.SUMMARY && currentEvent.DTSTART) {
                const task = mapEventToTask(currentEvent)
                if (task) events.push(task)
            }
        } else if (inEvent) {
            const [key, ...valueParts] = line.split(":")
            const value = valueParts.join(":")
            if (key && value) {
                currentEvent[key.split(";")[0]] = value
            }
        }
    }

    return events
}

function mapEventToTask(event: any): Partial<Task> | null {
    const title = event.SUMMARY
    const startDateStr = event.DTSTART
    const endDateStr = event.DTEND

    if (!title || !startDateStr) return null

    // Parse date (YYYYMMDDTHHMMSSZ or YYYYMMDD)
    const year = startDateStr.substring(0, 4)
    const month = startDateStr.substring(4, 6)
    const day = startDateStr.substring(6, 8)
    const date = `${year}-${month}-${day}`

    let startTime = undefined
    let endTime = undefined
    let duration = 60

    if (startDateStr.includes("T")) {
        const hour = startDateStr.substring(9, 11)
        const minute = startDateStr.substring(11, 13)
        startTime = `${hour}:${minute}`

        if (endDateStr && endDateStr.includes("T")) {
            const endHour = endDateStr.substring(9, 11)
            const endMinute = endDateStr.substring(11, 13)
            endTime = `${endHour}:${endMinute}`

            // Calculate duration
            const start = new Date(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
            const end = new Date(year, parseInt(month) - 1, parseInt(day), parseInt(endHour), parseInt(endMinute))
            duration = (end.getTime() - start.getTime()) / (1000 * 60)
        }
    }

    // Guess category
    let category: Task["category"] = "Custom"
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes("study")) category = "Study"
    else if (lowerTitle.includes("gym") || lowerTitle.includes("workout")) category = "Exercise"
    else if (lowerTitle.includes("sleep")) category = "Sleep"
    else if (lowerTitle.includes("dsa")) category = "DSA"
    else if (lowerTitle.includes("project")) category = "Projects"
    else if (lowerTitle.includes("class")) category = "Class"

    return {
        title,
        category,
        scheduledDate: date,
        startTime,
        endTime,
        duration,
        completed: false,
        priority: "medium",
        isCritical: false,
        repeatRule: "none",
        xp: 10,
        difficulty: "medium",
        isCore: false,
    }
}
