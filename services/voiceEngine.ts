/**
 * Voice AI Engine
 * Handles voice input/output using Web Speech API
 * Provides speech recognition and text-to-speech capabilities
 */

import { VoiceSettings, VoiceSession } from "@/lib/types"

declare global {
    interface Window {
        SpeechRecognition: any
        webkitSpeechRecognition: any
    }
}

export const VoiceEngine = {
    /**
     * Check if speech recognition is supported
     */
    isSupported(): boolean {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    },

    /**
     * Start voice recognition
     */
    startVoiceRecognition(
        onTranscript: (text: string, isFinal: boolean) => void,
        onError?: (error: string) => void
    ): VoiceSession | null {
        if (!this.isSupported()) {
            onError?.("Speech recognition not supported in this browser")
            return null
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        // Configuration
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognition.maxAlternatives = 1

        let finalTranscript = ''
        let interimTranscript = ''
        let silenceTimer: NodeJS.Timeout | null = null
        const SILENCE_THRESHOLD = 2000 // 2 seconds

        recognition.onresult = (event: any) => {
            // Clear silence timer
            if (silenceTimer) {
                clearTimeout(silenceTimer)
            }

            interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript

                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' '
                    onTranscript(finalTranscript.trim(), true)
                } else {
                    interimTranscript += transcript
                    onTranscript(interimTranscript, false)
                }
            }

            // Auto-stop after silence
            silenceTimer = setTimeout(() => {
                if (finalTranscript.trim().length > 0) {
                    recognition.stop()
                }
            }, SILENCE_THRESHOLD)
        }

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            onError?.(event.error)
        }

        recognition.onend = () => {
            if (silenceTimer) {
                clearTimeout(silenceTimer)
            }
        }

        try {
            recognition.start()
            return {
                id: `voice-${Date.now()}`,
                active: true,
                recognition
            }
        } catch (error) {
            console.error('Failed to start recognition:', error)
            onError?.(error instanceof Error ? error.message : 'Unknown error')
            return null
        }
    },

    /**
     * Stop voice recognition
     */
    stopVoiceRecognition(session: VoiceSession): void {
        if (session && session.recognition) {
            try {
                session.recognition.stop()
                session.active = false
            } catch (error) {
                console.error('Error stopping recognition:', error)
            }
        }
    },

    /**
     * Speak text using text-to-speech
     */
    speakResponse(text: string, settings: VoiceSettings): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!window.speechSynthesis) {
                reject(new Error('Speech synthesis not supported'))
                return
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            const voices = window.speechSynthesis.getVoices()

            // Select voice
            if (voices.length > 0 && settings.voiceIndex < voices.length) {
                utterance.voice = voices[settings.voiceIndex]
            }

            // Apply settings
            utterance.rate = settings.rate
            utterance.pitch = settings.pitch
            utterance.volume = settings.volume

            utterance.onend = () => resolve()
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event)
                reject(event)
            }

            window.speechSynthesis.speak(utterance)
        })
    },

    /**
     * Get available voices
     */
    getAvailableVoices(): SpeechSynthesisVoice[] {
        if (!window.speechSynthesis) {
            return []
        }

        return window.speechSynthesis.getVoices()
    },

    /**
     * Stop speaking
     */
    stopSpeaking(): void {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
        }
    },

    /**
     * Get default voice settings
     */
    getDefaultSettings(): VoiceSettings {
        return {
            enabled: false,
            voiceIndex: 0,
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8
        }
    }
}
