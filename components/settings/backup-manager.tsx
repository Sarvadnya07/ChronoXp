"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Upload, Cloud, AlertTriangle, FileJson, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { db } from "@/lib/db"

export default function BackupManager() {
    const { profile, tasks, settings, initializeApp } = useAppStore()
    const [importing, setImporting] = useState(false)

    const handleExportJSON = async () => {
        try {
            // Gather all data
            const exportData = {
                version: 1,
                timestamp: Date.now(),
                profile,
                tasks,
                settings,
                routines: await db.getAll("routines"),
                history: await db.getAll("dailyProgress")
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `chronoxp-backup-${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Backup exported successfully")
        } catch (error) {
            console.error("Export failed:", error)
            toast.error("Failed to export backup")
        }
    }

    const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImporting(true)
        try {
            const text = await file.text()
            const data = JSON.parse(text)

            if (!data.version || !data.profile || !data.tasks) {
                throw new Error("Invalid backup file format")
            }

            // Confirm before overwriting
            if (!confirm("This will overwrite your current data. Are you sure?")) {
                setImporting(false)
                return
            }

            // Clear existing data
            await db.clear("tasks")
            await db.clear("dailyProgress")
            await db.clear("routines")
            await db.clear("userProfile")
            await db.clear("settings")

            // Restore data
            await db.put("userProfile", data.profile)
            await db.put("settings", data.settings)

            for (const task of data.tasks) {
                await db.put("tasks", task)
            }

            if (data.routines) {
                for (const routine of data.routines) {
                    await db.put("routines", routine)
                }
            }

            if (data.history) {
                for (const day of data.history) {
                    await db.put("dailyProgress", day)
                }
            }

            // Reload app state
            await initializeApp()
            toast.success("Data restored successfully")
        } catch (error) {
            console.error("Import failed:", error)
            toast.error("Failed to import backup. Invalid file format.")
        } finally {
            setImporting(false)
            // Reset input
            e.target.value = ""
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Data Backup & Restore</h2>
                <p className="text-muted-foreground">Manage your data locally or sync with the cloud.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Local Backup */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileJson className="w-5 h-5 text-blue-500" />
                            Local Backup
                        </CardTitle>
                        <CardDescription>
                            Export your data to a JSON file or restore from a previous backup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Export Data</h4>
                                    <p className="text-sm text-muted-foreground">Save a local copy of your data</p>
                                </div>
                                <Button variant="outline" onClick={handleExportJSON}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export JSON
                                </Button>
                            </div>

                            <div className="border-t pt-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Import Data</h4>
                                    <p className="text-sm text-muted-foreground">Restore from a backup file</p>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        id="backup-upload"
                                        onChange={handleImportJSON}
                                        disabled={importing}
                                    />
                                    <Button variant="outline" asChild disabled={importing}>
                                        <label htmlFor="backup-upload" className="cursor-pointer">
                                            {importing ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            {importing ? "Restoring..." : "Import JSON"}
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                Importing data will overwrite your current progress. Make sure to export your current data first.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Cloud Sync (Placeholder for now) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-primary" />
                            Cloud Sync
                        </CardTitle>
                        <CardDescription>
                            Sync your data across devices using Google Drive.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <Cloud className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Google Drive Sync</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                    Automatic backup to your personal Google Drive is coming soon.
                                </p>
                            </div>
                            <Button variant="secondary" disabled>
                                Connect Google Drive
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
