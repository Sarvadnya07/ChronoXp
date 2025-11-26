"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, Clock } from "lucide-react"
import { MusicEngine } from "@/services/musicEngine"
import { MusicPlaylist, MusicState } from "@/lib/types"

export default function MusicPage() {
    const [musicState, setMusicState] = useState<MusicState>(MusicEngine.getDefaultState())
    const [playlists] = useState<MusicPlaylist[]>(MusicEngine.getMusicPlaylists())
    const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist | null>(null)
    const [currentPlayer, setCurrentPlayer] = useState<any>(null)

    const playPlaylist = (playlist: MusicPlaylist) => {
        setSelectedPlaylist(playlist)
        setMusicState({
            ...musicState,
            currentPlaylist: playlist.id,
            isPlaying: true
        })
    }

    const togglePlayPause = () => {
        setMusicState({
            ...musicState,
            isPlaying: !musicState.isPlaying
        })
    }

    const toggleTimerSync = () => {
        setMusicState({
            ...musicState,
            syncWithTimer: !musicState.syncWithTimer
        })
    }

    // Group playlists by type
    const groupedPlaylists = playlists.reduce((acc, playlist) => {
        if (!acc[playlist.type]) {
            acc[playlist.type] = []
        }
        acc[playlist.type].push(playlist)
        return acc
    }, {} as Record<string, MusicPlaylist[]>)

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">🎧 Focus Music</h1>
                    <p className="text-muted-foreground">
                        Ambient music to enhance your productivity and flow state
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Player Card */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>
                                {selectedPlaylist ? selectedPlaylist.name : "Select a Playlist"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedPlaylist ? (
                                <div className="space-y-4">
                                    {/* YouTube Embed */}
                                    <div className="aspect-video rounded-lg overflow-hidden bg-black/5">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${selectedPlaylist.embedId}?autoplay=${musicState.isPlaying ? 1 : 0}&loop=1&playlist=${selectedPlaylist.embedId}`}
                                            title={selectedPlaylist.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={togglePlayPause}
                                        >
                                            {musicState.isPlaying ? (
                                                <Pause className="h-4 w-4" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </Button>

                                        <div className="flex-1 flex items-center gap-2">
                                            <Volume2 className="h-4 w-4" />
                                            <Slider
                                                value={[musicState.volume]}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                onValueChange={(vals) =>
                                                    setMusicState({ ...musicState, volume: vals[0] })
                                                }
                                                className="flex-1"
                                            />
                                            <span className="text-sm text-muted-foreground w-12">
                                                {Math.round(musicState.volume * 100)}%
                                            </span>
                                        </div>

                                        <Button
                                            variant={musicState.syncWithTimer ? "default" : "outline"}
                                            size="sm"
                                            onClick={toggleTimerSync}
                                            className="gap-2"
                                        >
                                            <Clock className="h-4 w-4" />
                                            Timer Sync
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-96 flex items-center justify-center text-muted-foreground">
                                    <p>Select a playlist to start playing</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Playlist Library */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Playlists</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="lofi" className="w-full">
                                <TabsList className="w-full">
                                    <TabsTrigger value="lofi" className="flex-1">LoFi</TabsTrigger>
                                    <TabsTrigger value="synthwave" className="flex-1">Synth</TabsTrigger>
                                    <TabsTrigger value="ambient" className="flex-1">Ambient</TabsTrigger>
                                    <TabsTrigger value="noise" className="flex-1">Noise</TabsTrigger>
                                    <TabsTrigger value="nature" className="flex-1">Nature</TabsTrigger>
                                </TabsList>

                                {Object.entries(groupedPlaylists).map(([type, typePlaylist]) => (
                                    <TabsContent key={type} value={type} className="space-y-2 mt-4">
                                        {typePlaylist.map((playlist) => (
                                            <Button
                                                key={playlist.id}
                                                variant={
                                                    selectedPlaylist?.id === playlist.id
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="w-full justify-start"
                                                onClick={() => playPlaylist(playlist)}
                                            >
                                                {selectedPlaylist?.id === playlist.id && musicState.isPlaying ? (
                                                    <span className="mr-2 animate-pulse">🎵</span>
                                                ) : (
                                                    <span className="mr-2">🎼</span>
                                                )}
                                                {playlist.name}
                                            </Button>
                                        ))}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Timer Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Music volume automatically adjusts during Pomodoro breaks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Focus Enhancement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            AI recommends playlists based on your burnout level and time of day
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Science</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Studies show music at 60-70 BPM improves concentration
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
