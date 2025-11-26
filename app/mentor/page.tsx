"use client"

import { useEffect, useRef, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useMentorStore } from "@/store/useMentorStore"
import { MentorEngine } from "@/services/mentorEngine"
import { MentorSidebarSummary } from "@/components/mentor/MentorSidebarSummary"
import { VoiceControls } from "@/components/mentor/VoiceControls"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react"
import { XPLog, DailyProgress, AIMode } from "@/lib/types"

export default function MentorPage() {
    const { profile, todayProgress, tasks } = useAppStore()
    const { messages, addMessage, isLoading, setLoading, clearHistory } = useMentorStore()
    const [input, setInput] = useState("")
    const [currentMode, setCurrentMode] = useState<AIMode>("coach")
    const scrollRef = useRef<HTMLDivElement>(null)

    const [xpLogs, setXpLogs] = useState<XPLog[]>([])
    const [progressHistory, setProgressHistory] = useState<DailyProgress[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setIsDataLoading(true)
            try {
                const logs = await db.getAll("xpLogs")
                const history = await db.getAll("dailyProgress")
                setXpLogs(logs)
                setProgressHistory(history)
            } finally {
                setIsDataLoading(false)
            }
        }
        loadData()
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input
        setInput("")
        addMessage("user", userMsg)
        setLoading(true)

        try {
            const context = MentorEngine.generateContext(
                profile,
                todayProgress,
                tasks,
                xpLogs,
                progressHistory
            )

            const { response, mode } = await MentorEngine.mentorReply(context, userMsg)
            setCurrentMode(mode)
            addMessage("assistant", response)
        } catch (error) {
            console.error("Mentor Error:", error)
            addMessage("assistant", "Sorry, I encountered an error while thinking. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleVoiceTranscript = async (text: string, isFinal: boolean) => {
        if (isFinal) {
            setInput(text)
            // Auto-send after voice input  
            setTimeout(async () => {
                if (text.trim()) {
                    const userMsg = text
                    setInput("")
                    addMessage("user", userMsg)
                    setLoading(true)

                    try {
                        const context = MentorEngine.generateContext(
                            profile,
                            todayProgress,
                            tasks,
                            xpLogs,
                            progressHistory
                        )
                        const { response, mode } = await MentorEngine.mentorReply(context, userMsg)
                        setCurrentMode(mode)
                        addMessage("assistant", response)
                    } catch (error) {
                        console.error("Mentor Error:", error)
                        addMessage("assistant", "Sorry, I encountered an error. Please try again.")
                    } finally {
                        setLoading(false)
                    }
                }
            }, 100)
        } else {
            // Show interim results
            setInput(text)
        }
    }

    // Derived data for sidebar
    const context = MentorEngine.generateContext(
        profile,
        todayProgress,
        tasks,
        xpLogs,
        progressHistory
    )

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-4 p-4 md:p-8 pt-6">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col rounded-xl border bg-card text-card-foreground shadow">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold">AI Mentor</h2>
                        <Badge variant="outline" className="text-xs">
                            {MentorEngine.getModeBadge(currentMode)}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <VoiceControls
                            onTranscript={handleVoiceTranscript}
                            disabled={isLoading}
                        />
                        <Button variant="ghost" size="icon" onClick={clearHistory} title="Clear Chat">
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        }`}
                                >
                                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                </div>
                                <div
                                    className={`rounded-lg p-3 max-w-[80%] text-sm ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-muted rounded-lg p-3 flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ask for advice, study plans, or motivation..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-80 shrink-0">
                <MentorSidebarSummary
                    profile={profile}
                    xpLogs={context.xpLogs}
                    recentSleep={context.recentSleep}
                    recentJournal={context.recentJournal}
                    isLoading={isDataLoading}
                />
            </div>
        </div>
    )
}
