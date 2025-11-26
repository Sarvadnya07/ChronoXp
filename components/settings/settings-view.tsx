"use client"

import { useAppStore } from "@/lib/store"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Bell, Cloud, Trash2, Download, Calendar } from "lucide-react"
import { db } from "@/lib/db"
import { requestNotificationPermission } from "@/lib/notifications"
import { CalendarService } from "@/services/calendarService"
import BackupManager from "./backup-manager"

export default function SettingsView() {
  const { settings, updateSettings, seedDemoData, profile } = useAppStore()

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestNotificationPermission()
      if (permission === "granted") {
        updateSettings({ notificationsEnabled: true })
      }
    } else {
      updateSettings({ notificationsEnabled: false })
    }
  }

  const handleResetData = async () => {
    await db.clear("userProfile")
    await db.clear("dailyProgress")
    await db.clear("tasks")
    await db.clear("notifications")
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your app preferences and data</p>
      </div>

      {/* Notifications & Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "cyber", label: "Cyber" },
                  { id: "midnight", label: "Midnight" },
                  { id: "ocean", label: "Ocean" },
                  { id: "ember", label: "Ember" },
                  { id: "minimal", label: "Minimal" },
                ].map((t) => (
                  <Button
                    key={t.id}
                    variant={settings.theme === t.id ? "default" : "outline"}
                    onClick={() => updateSettings({ theme: t.id as any })}
                    className="capitalize"
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex-1">
                Enable Notifications
              </Label>
              <Switch
                id="notifications"
                checked={settings.notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="flex-1">
                Sound Effects
              </Label>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration" className="flex-1">
                Vibration
              </Label>
              <Switch
                id="vibration"
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Cloud Sync (Coming Soon)
          </CardTitle>
          <CardDescription>Backup and sync your data across devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="cloud-sync" className="flex-1">
              Enable Cloud Sync
            </Label>
            <Switch
              id="cloud-sync"
              checked={settings.cloudSyncEnabled}
              onCheckedChange={(checked) => updateSettings({ cloudSyncEnabled: checked })}
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Cloud sync will allow you to backup your data and access it from multiple devices. This feature requires
            Firebase configuration.
          </p>
        </CardContent>
      </Card>

      {/* Data Backup & Restore */}
      <BackupManager />

      {/* Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Integration
          </CardTitle>
          <CardDescription>Export your tasks to your favorite calendar app</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={async () => {
              const { tasks } = useAppStore.getState()
              const ics = CalendarService.generateICS(tasks)
              CalendarService.downloadICS(ics)
            }}
          >
            <Download className="w-4 h-4" />
            Export Tasks to .ics
          </Button>
        </CardContent>
      </Card>

      {/* Reset Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start gap-2 bg-transparent" onClick={seedDemoData}>
              <Download className="w-4 h-4" />
              Load Demo Tasks
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="justify-start gap-2">
                  <Trash2 className="w-4 h-4" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your tasks, progress, journal
                    entries, and profile data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData} className="bg-destructive">
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">ChronoXP</strong> v1.0.0
          </p>
          <p>A gamified productivity application with XP, levels, streaks, and badges.</p>
          <p className="pt-2 text-xs">
            Built with React, TypeScript, TailwindCSS, and IndexedDB for local-first storage.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
