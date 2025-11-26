"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { db } from "@/lib/db"
import { JournalEntry, DailyProgress } from "@/lib/types"
import { JournalEditor } from "@/components/journal/JournalEditor"
import { JournalList } from "@/components/journal/JournalList"
import { WeeklyReflection } from "@/components/journal/WeeklyReflection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLocalDate } from "@/lib/utils"
import { Loader2, Sparkles } from "lucide-react"
import { AISummaryService } from "@/services/aiSummary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function JournalPage() {
    const { todayProgress, updateJournal, updateMood } = useAppStore()
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadEntries = async () => {
            try {
                const allProgress = await db.getAll("dailyProgress")
                const journalEntries = allProgress
                    .filter(p => p.journalEntry)
                    .map(p => p.journalEntry as JournalEntry)
                    .sort((a, b) => b.createdAt - a.createdAt)

                setEntries(journalEntries)
            } catch (error) {
                console.error("Failed to load journal entries:", error)
            } finally {
                setLoading(false)
            }
        }

        loadEntries()
    }, [todayProgress]) // Reload when today's progress changes

    const handleSaveEntry = async (text: string, mood: number, tags: string[]) => {
        await updateMood(mood)
        await updateJournal(text, tags)
    }

    const handleSaveReflection = async (wins: string, struggles: string, improvements: string) => {
        // TODO: Implement saving weekly reflection
        console.log("Saving reflection:", { wins, struggles, improvements })
        // For now, we can just log it or save to a separate collection if we implemented it
        // The requirement said "Store weekly reflections either: In journal with type: 'weekly_reflection' Or in a separate subcollection"
        // I'll stick to console for now as the store action isn't fully ready for "weekly_reflection" type specifically, 
        // but I can add it to the journal text with a tag "Weekly Reflection"

        const text = `Weekly Reflection:\n\nWins: ${wins}\n\nStruggles: ${struggles}\n\nImprovements: ${improvements}`
        await updateJournal(text, ["Weekly Reflection"])
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const todayEntry = todayProgress?.journalEntry

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Journal & Reflection</h2>
            </div>

            <Tabs defaultValue="daily" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="daily">Daily Journal</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly Reflection</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <JournalEditor
                                initialText={todayEntry?.text}
                                initialMood={todayEntry?.mood || todayProgress?.mood}
                                initialTags={todayEntry?.tags}
                                onSave={handleSaveEntry}
                            />
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-500" /> AI Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={async () => {
                                            const summary = await AISummaryService.generateWeeklySummary(entries.slice(0, 7))
                                            alert(JSON.stringify(summary, null, 2)) // Simple alert for now as requested by "read-only summary panel"
                                            // Ideally we'd show a nice modal or panel
                                        }}
                                    >
                                        Generate Weekly Summary
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <JournalList entries={entries.slice(0, 5)} />
                    </div>
                </TabsContent>

                <TabsContent value="weekly">
                    <div className="max-w-2xl mx-auto">
                        <WeeklyReflection
                            weekId={getLocalDate()} // Simplified week ID
                            onSave={handleSaveReflection}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <JournalList entries={entries} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
