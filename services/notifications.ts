import { AppSettings } from "@/lib/types"

export type NotificationType = "reminder" | "achievement" | "system"

export interface Notification {
    id: string
    type: NotificationType
    title: string
    message: string
    timestamp: number
    read: boolean
}

export const NotificationService = {
    requestPermission: async (): Promise<boolean> => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification")
            return false
        }

        if (Notification.permission === "granted") {
            return true
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission()
            return permission === "granted"
        }

        return false
    },

    sendNotification: (title: string, options?: NotificationOptions) => {
        if (Notification.permission === "granted") {
            new Notification(title, options)
        }
    },

    // Stub for scheduling notifications (would need a service worker or polling in real app)
    scheduleNotification: (title: string, options: NotificationOptions, delayMs: number) => {
        setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification(title, options)
            }
        }, delayMs)
    }
}
