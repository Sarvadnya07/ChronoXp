"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Volume2, VolumeX, Settings } from "lucide-react"
import { VoiceEngine } from "@/services/voiceEngine"
import { VoiceSession, VoiceSettings } from "@/lib/types"
import { Slider } from "@/components/ui/slider"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface VoiceControlsProps {
    onTranscript: (text: string, isFinal: boolean) => void
    onVoiceResponse?: (text: string) => void
    disabled?: boolean
}

export function VoiceControls({ onTranscript, onVoiceResponse, disabled }: VoiceControlsProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [session, setSession] = useState<VoiceSession | null>(null)
    const [settings, setSettings] = useState<VoiceSettings>(VoiceEngine.getDefaultSettings())
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Load voices
        const loadVoices = () => {
            const voices = VoiceEngine.getAvailableVoices()
            setAvailableVoices(voices)
        }

        loadVoices()

        // Voices might load asynchronously
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

    const startRecording = () => {
        if (!VoiceEngine.isSupported()) {
            setError("Speech recognition not supported in your browser")
            return
        }

        const newSession = VoiceEngine.startVoiceRecognition(
            (text, isFinal) => {
                setError(null)
                onTranscript(text, isFinal)

                // Auto-stop after final transcript
                if (isFinal) {
                    setTimeout(stopRecording, 500)
                }
            },
            (err) => {
                setError(err)
                setIsRecording(false)
            }
        )

        if (newSession) {
            setSession(newSession)
            setIsRecording(true)
        }
    }

    const stopRecording = () => {
        if (session) {
            VoiceEngine.stopVoiceRecognition(session)
            setSession(null)
            setIsRecording(false)
        }
    }

    const toggleVoiceOutput = async (text: string) => {
        if (isSpeaking) {
            VoiceEngine.stopSpeaking()
            setIsSpeaking(false)
        } else if (settings.enabled && text) {
            setIsSpeaking(true)
            try {
                await VoiceEngine.speakResponse(text, settings)
                setIsSpeaking(false)
            } catch (error) {
                console.error("Voice output error:", error)
                setIsSpeaking(false)
            }
        }
    }

    useEffect(() => {
        // Auto-speak responses if enabled
        if (settings.enabled && onVoiceResponse && !isSpeaking) {
            // This would be called externally when AI responds
        }
    }, [settings.enabled])

    return (
        <div className="flex items-center gap-2">
            {/* Microphone Button */}
            <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={isRecording ? "animate-pulse" : ""}
            >
                {isRecording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>

            {/* Voice Output Toggle */}
            <Button
                variant={settings.enabled ? "default" : "outline"}
                size="icon"
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                disabled={disabled}
            >
                {settings.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            {/* Voice Settings */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={disabled}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm">Voice Settings</h4>

                        {/* Voice Selection */}
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Voice</label>
                            <select
                                className="w-full p-2 rounded border"
                                value={settings.voiceIndex}
                                onChange={(e) => setSettings({ ...settings, voiceIndex: parseInt(e.target.value) })}
                            >
                                {availableVoices.map((voice, i) => (
                                    <option key={i} value={i}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Rate */}
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Speed: {settings.rate.toFixed(1)}x</label>
                            <Slider
                                value={[settings.rate]}
                                min={0.5}
                                max={2}
                                step={0.1}
                                onValueChange={(vals) => setSettings({ ...settings, rate: vals[0] })}
                            />
                        </div>

                        {/* Pitch */}
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Pitch: {settings.pitch.toFixed(1)}</label>
                            <Slider
                                value={[settings.pitch]}
                                min={0}
                                max={2}
                                step={0.1}
                                onValueChange={(vals) => setSettings({ ...settings, pitch: vals[0] })}
                            />
                        </div>

                        {/* Volume */}
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Volume: {Math.round(settings.volume * 100)}%</label>
                            <Slider
                                value={[settings.volume]}
                                min={0}
                                max={1}
                                step={0.1}
                                onValueChange={(vals) => setSettings({ ...settings, volume: vals[0] })}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Status Indicators */}
            {isRecording && (
                <span className="text-xs text-red-500 animate-pulse">
                    Recording...
                </span>
            )}
            {isSpeaking && (
                <span className="text-xs text-blue-500 animate-pulse">
                    Speaking...
                </span>
            )}
            {error && (
                <span className="text-xs text-destructive">
                    {error}
                </span>
            )}
        </div>
    )
}
