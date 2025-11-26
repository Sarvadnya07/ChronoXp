"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SyncStatus } from "@/lib/syncEngine"

interface SyncIndicatorProps {
    status: SyncStatus
    className?: string
}

export default function SyncIndicator({ status, className }: SyncIndicatorProps) {
    const [show, setShow] = useState(false)

    // Show indicator when syncing or error
    useEffect(() => {
        if (status.isSyncing || status.error) {
            setShow(true)
        } else {
            // Hide after 2 seconds of successful sync
            const timer = setTimeout(() => setShow(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [status])

    if (!show) return null

    return (
        <Badge
            variant={status.error ? "destructive" : "secondary"}
            className={cn("flex items-center gap-2 transition-all", className)}
        >
            {status.isSyncing ? (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Syncing...</span>
                </>
            ) : status.error ? (
                <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Sync failed</span>
                </>
            ) : (
                <>
                    <Check className="w-3 h-3" />
                    <span>Synced</span>
                </>
            )}
        </Badge>
    )
}
