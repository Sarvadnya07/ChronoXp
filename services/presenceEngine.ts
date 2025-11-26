/**
 * Presence Engine
 * Tracks user presence across devices and provides device-specific recommendations
 */

import { PresenceState, PresenceLog, DeviceType } from "@/lib/types"
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { db as firestore } from "@/lib/firebase"

export const PresenceEngine = {
    activeSession: null as string | null,
    heartbeatInterval: null as NodeJS.Timeout | null,

    /**
     * Initialize presence tracking
     */
    initPresence(userId: string, device: DeviceType): string {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        this.activeSession = sessionId

        // Set initial presence
        this.updatePresence(userId, device, true, sessionId)

        // Start heartbeat (every 30 seconds)
        this.heartbeatInterval = setInterval(() => {
            this.updatePresence(userId, device, true, sessionId)
        }, 30000)

        // Update presence on visibility change
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                const active = !document.hidden
                this.updatePresence(userId, device, active, sessionId)
            })
        }

        // Update presence on window focus/blur
        if (typeof window !== 'undefined') {
            window.addEventListener('focus', () => {
                this.updatePresence(userId, device, true, sessionId)
            })
            window.addEventListener('blur', () => {
                this.updatePresence(userId, device, false, sessionId)
            })
        }

        // Cleanup on unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.cleanup(userId, device, sessionId)
            })
        }

        return sessionId
    },

    /**
     * Update presence state in Firestore
     */
    async updatePresence(
        userId: string,
        device: DeviceType,
        active: boolean,
        sessionId: string
    ): Promise<void> {
        if (!firestore) return

        try {
            const presenceRef = doc(firestore, `users/${userId}/presence/${sessionId}`)

            const presenceData: PresenceState = {
                userId,
                active,
                lastSeen: Date.now(),
                device,
                sessionId
            }

            await setDoc(presenceRef, presenceData, { merge: true })
        } catch (error) {
            console.error('Failed to update presence:', error)
        }
    },

    /**
     * Cleanup presence on exit
     */
    cleanup(userId: string, device: DeviceType, sessionId: string): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }

        // Mark as inactive
        this.updatePresence(userId, device, false, sessionId)
    },

    /**
     * Get device type from user agent
     */
    detectDeviceType(): DeviceType {
        if (typeof window === 'undefined') {
            return 'desktop'
        }

        const ua = window.navigator.userAgent.toLowerCase()

        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet'
        }
        if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
            return 'mobile'
        }
        return 'desktop'
    },

    /**
     * Get presence history for analytics
     */
    async getPresenceHistory(userId: string, days: number = 7): Promise<PresenceLog[]> {
        // This would fetch from Firestore
        // For now, return empty array (to be implemented with Firebase queries)
        return []
    },

    /**
     * Analyze device usage patterns and provide recommendations
     */
    getDeviceRecommendations(logs: PresenceLog[]): string[] {
        if (logs.length === 0) {
            return []
        }

        const recommendations: string[] = []

        // Calculate device usage
        const deviceStats = logs.reduce((acc, log) => {
            if (!acc[log.device]) {
                acc[log.device] = { totalTime: 0, count: 0 }
            }
            acc[log.device].totalTime += log.activeTime
            acc[log.device].count++
            return acc
        }, {} as Record<DeviceType, { totalTime: number; count: number }>)

        // Find most productive device
        let maxProductivity = 0
        let bestDevice: DeviceType = 'desktop'

        Object.entries(deviceStats).forEach(([device, stats]) => {
            const avgProductivity = stats.totalTime / stats.count
            if (avgProductivity > maxProductivity) {
                maxProductivity = avgProductivity
                bestDevice = device as DeviceType
            }
        })

        if (bestDevice !== 'desktop') {
            recommendations.push(`You tend to be more productive on ${bestDevice}. Consider using it for deep work sessions.`)
        }

        // Check for mobile usage during late hours
        const lateMobileUse = logs.filter(log => {
            const hour = new Date(log.date).getHours()
            return log.device === 'mobile' && (hour >= 22 || hour <= 5)
        })

        if (lateMobileUse.length > 3) {
            recommendations.push("Detected frequent late-night mobile usage. This may affect sleep quality.")
        }

        // Check for device switching patterns
        const desktopLogs = logs.filter(l => l.device === 'desktop')
        const mobileLogs = logs.filter(l => l.device === 'mobile')

        if (desktopLogs.length > 0 && mobileLogs.length > 0) {
            const desktopAvg = desktopLogs.reduce((sum, l) => sum + l.activeTime, 0) / desktopLogs.length
            const mobileAvg = mobileLogs.reduce((sum, l) => sum + l.activeTime, 0) / mobileLogs.length

            if (desktopAvg > mobileAvg * 2) {
                recommendations.push("Desktop sessions are significantly longer. Use mobile for quick check-ins only.")
            }
        }

        return recommendations
    },

    /**
     * Subscribe to presence updates (realtime)
     */
    subscribeToPresence(
        userId: string,
        callback: (presence: PresenceState) => void
    ): () => void {
        if (!this.activeSession || !firestore) {
            return () => { }
        }

        const presenceRef = doc(firestore, `users/${userId}/presence/${this.activeSession}`)

        const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data() as PresenceState)
            }
        })

        return unsubscribe
    }
}

