import { Task } from "@/lib/types"

export const CalendarService = {
    generateICS(tasks: Task[]): string {
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ChronoXP//Productivity OS//EN\n"

        tasks.forEach((task) => {
            if (!task.scheduledDate) return

            const dateStr = task.scheduledDate.replace(/-/g, "")
            const startTime = task.startTime ? task.startTime.replace(":", "") + "00" : "090000"
            const endTime = task.endTime ? task.endTime.replace(":", "") + "00" : "100000"

            icsContent += "BEGIN:VEVENT\n"
            icsContent += `UID:${task.id}\n`
            icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`
            icsContent += `DTSTART:${dateStr}T${startTime}\n`
            icsContent += `DTEND:${dateStr}T${endTime}\n`
            icsContent += `SUMMARY:${task.title}\n`
            icsContent += `DESCRIPTION:${task.category} - ${task.difficulty}\n`
            icsContent += "END:VEVENT\n"
        })

        icsContent += "END:VCALENDAR"
        return icsContent
    },

    downloadICS(content: string, filename: string = "chronoxp-tasks.ics") {
        const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    },

    // Stubs for future Google Calendar API integration
    async importFromGoogleCalendar(oauthToken: string): Promise<void> {
        console.log("Importing from Google Calendar with token:", oauthToken)
        // TODO: Implement Google Calendar API fetch
    },

    async exportToGoogleCalendar(oauthToken: string, tasks: Task[]): Promise<void> {
        console.log("Exporting to Google Calendar with token:", oauthToken)
        // TODO: Implement Google Calendar API push
    }
}
