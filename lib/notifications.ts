// Notification utilities

import { type Task, type Notification as AppNotification, type BurnoutState, type SleepInsights } from "./types"

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return Promise.resolve("denied")
  }
  return Notification.requestPermission()
}

export function scheduleTaskNotification(task: Task): void {
  if (!task.scheduledTime) return

  const [hours, minutes] = task.scheduledTime.split(":").map(Number)
  const now = new Date()
  const scheduledTime = new Date()
  scheduledTime.setHours(hours, minutes - 5, 0, 0) // 5 mins before

  if (scheduledTime > now) {
    const timeout = scheduledTime.getTime() - now.getTime()
    setTimeout(() => {
      showNotification(`${task.title} starts in 5 minutes!`, {
        body: `Get ready to start your ${task.category} session`,
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: task.id,
      })
    }, timeout)
  }
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, options)
  }
}

export function scheduleDailySummary(stats: { xp: number; completed: number }): void {
  const now = new Date()
  const summaryTime = new Date()
  summaryTime.setHours(20, 0, 0, 0) // 8 PM

  if (summaryTime > now) {
    const timeout = summaryTime.getTime() - now.getTime()
    setTimeout(() => {
      showNotification("Daily Summary", {
        body: `You earned ${stats.xp} XP and completed ${stats.completed} tasks today!`,
        icon: "/icon.svg",
      })
    }, timeout)
  }
}

export function sendStreakWarning(streak: number): void {
  showNotification("Streak Warning! 🔥", {
    body: `You're at risk of losing your ${streak} day streak! Complete a task now!`,
    icon: "/icon.svg",
    requireInteraction: true,
  })
}

export function checkBurnoutAndNotify(burnout: BurnoutState): void {
  if (burnout.risk === "critical" || burnout.risk === "high") {
    showNotification("Burnout Alert ⚠️", {
      body: `Your burnout risk is ${burnout.risk}. Take a break!`,
      icon: "/icon.svg",
      requireInteraction: true,
    })
  }
}

export function checkSleepAndNotify(insights: SleepInsights): void {
  if (insights.sleepDebt > 2) {
    showNotification("Sleep Debt Alert 😴", {
      body: `You have ${insights.sleepDebt.toFixed(1)}h sleep debt. Try to sleep early tonight.`,
      icon: "/icon.svg",
    })
  }
}
