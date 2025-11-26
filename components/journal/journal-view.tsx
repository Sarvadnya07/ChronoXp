"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Smile, Meh, Frown, BookOpen, Save } from "lucide-react"
import { cn } from "@/lib/utils"

export default function JournalView() {
  const { todayProgress, updateJournal, updateMood } = useAppStore()
  const [entry, setEntry] = useState(todayProgress?.journalEntry || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await updateJournal(entry)
    setTimeout(() => setIsSaving(false), 500)
  }

  const moods = [
    { value: 1, icon: Frown, label: "Bad", color: "text-red-500" },
    { value: 2, icon: Meh, label: "Okay", color: "text-yellow-500" },
    { value: 3, icon: Smile, label: "Good", color: "text-green-500" },
    { value: 4, icon: Smile, label: "Great", color: "text-blue-500" },
    { value: 5, icon: Smile, label: "Amazing", color: "text-purple-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Journal</h2>
        <p className="text-sm text-muted-foreground">Reflect on your day</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Today's Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What went well today? What did you learn?..."
              className="min-h-[300px] resize-none text-lg leading-relaxed"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mood Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => updateMood(m.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-lg transition-all hover:bg-muted",
                      todayProgress?.mood === m.value ? "bg-primary/10 ring-2 ring-primary" : ""
                    )}
                  >
                    <m.icon className={cn("w-8 h-8", m.color)} />
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reflection Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>What was your biggest win today?</li>
                <li>What challenged you the most?</li>
                <li>What are you grateful for?</li>
                <li>One thing to improve tomorrow?</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
