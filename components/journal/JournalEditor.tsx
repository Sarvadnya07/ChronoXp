"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalEditorProps {
    initialText?: string
    initialMood?: number
    initialTags?: string[]
    onSave: (text: string, mood: number, tags: string[]) => void
}

export function JournalEditor({ initialText = "", initialMood = 3, initialTags = [], onSave }: JournalEditorProps) {
    const [text, setText] = useState(initialText)
    const [mood, setMood] = useState(initialMood)
    const [tags, setTags] = useState(initialTags.join(", "))

    const handleSave = () => {
        const tagArray = tags.split(",").map(t => t.trim()).filter(t => t.length > 0)
        onSave(text, mood, tagArray)
    }

    const MoodIcon = ({ value, icon: Icon }: { value: number, icon: any }) => (
        <button
            onClick={() => setMood(value)}
            className={cn(
                "p-2 rounded-full transition-colors",
                mood === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
        >
            <Icon className="w-6 h-6" />
        </button>
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>How are you feeling today?</Label>
                    <div className="flex gap-2">
                        <MoodIcon value={1} icon={Frown} />
                        <MoodIcon value={2} icon={ThumbsDown} />
                        <MoodIcon value={3} icon={Meh} />
                        <MoodIcon value={4} icon={ThumbsUp} />
                        <MoodIcon value={5} icon={Smile} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Reflection</Label>
                    <Textarea
                        placeholder="Write about your day..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[150px]"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input
                        placeholder="study, stress, wins..."
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                <Button onClick={handleSave} className="w-full">
                    Save Entry
                </Button>
            </CardContent>
        </Card>
    )
}
