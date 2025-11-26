"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { JournalEntry } from "@/lib/types"

interface JournalListProps {
    entries: JournalEntry[]
}

export function JournalList({ entries }: JournalListProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                        {entries.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No entries yet.</p>
                        ) : (
                            entries.map((entry) => (
                                <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold">{entry.date}</span>
                                        <span className="text-sm text-muted-foreground">Mood: {entry.mood}/5</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {entry.tags.map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
