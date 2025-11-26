import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: number
}

interface MentorState {
    messages: ChatMessage[]
    isLoading: boolean
    addMessage: (role: "user" | "assistant", content: string) => void
    setLoading: (loading: boolean) => void
    clearHistory: () => void
}

export const useMentorStore = create<MentorState>()(
    persist(
        (set) => ({
            messages: [
                {
                    id: "welcome",
                    role: "assistant",
                    content: "Hello! I'm your ChronoXP Mentor. How can I help you optimize your day?",
                    timestamp: Date.now(),
                },
            ],
            isLoading: false,
            addMessage: (role, content) =>
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: `msg-${Date.now()}`,
                            role,
                            content,
                            timestamp: Date.now(),
                        },
                    ],
                })),
            setLoading: (loading) => set({ isLoading: loading }),
            clearHistory: () =>
                set({
                    messages: [
                        {
                            id: "welcome",
                            role: "assistant",
                            content: "Hello! I'm your ChronoXP Mentor. How can I help you optimize your day?",
                            timestamp: Date.now(),
                        },
                    ],
                }),
        }),
        {
            name: "mentor-storage",
        }
    )
)
