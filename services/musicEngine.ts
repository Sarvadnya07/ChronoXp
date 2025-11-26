/**
 * Music Engine
 * Provides ambient focus music integrated with Pomodoro timer
 * Uses YouTube embeds for various music genres
 */

import { MusicPlaylist, MusicState } from "@/lib/types"

export const MusicEngine = {
    /**
     * Get all available music playlists
     */
    getMusicPlaylists(): MusicPlaylist[] {
        return [
            {
                id: "lofi-study",
                name: "LoFi Study Beats",
                type: "lofi",
                youtubeUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                embedId: "jfKfPfyJRdk",
                thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg"
            },
            {
                id: "lofi-chill",
                name: "Chill LoFi Mix",
                type: "lofi",
                youtubeUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
                embedId: "5qap5aO4i9A",
                thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/maxresdefault.jpg"
            },
            {
                id: "synthwave-focus",
                name: "CyberFocus Synthwave",
                type: "synthwave",
                youtubeUrl: "https://www.youtube.com/watch?v=MVPTGNGiI-4",
                embedId: "MVPTGNGiI-4",
                thumbnail: "https://i.ytimg.com/vi/MVPTGNGiI-4/maxresdefault.jpg"
            },
            {
                id: "synthwave-dark",
                name: "Dark Synthwave",
                type: "synthwave",
                youtubeUrl: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
                embedId: "4xDzrJKXOOY",
                thumbnail: "https://i.ytimg.com/vi/4xDzrJKXOOY/maxresdefault.jpg"
            },
            {
                id: "ambient-space",
                name: "Space Ambient",
                type: "ambient",
                youtubeUrl: "https://www.youtube.com/watch?v=1-RW82zNbQw",
                embedId: "1-RW82zNbQw",
                thumbnail: "https://i.ytimg.com/vi/1-RW82zNbQw/maxresdefault.jpg"
            },
            {
                id: "ambient-deep",
                name: "Deep Focus Ambient",
                type: "ambient",
                youtubeUrl: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
                embedId: "DWcJFNfaw9c",
                thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/maxresdefault.jpg"
            },
            {
                id: "brown-noise",
                name: "Brown Noise",
                type: "noise",
                youtubeUrl: "https://www.youtube.com/watch?v=RqzGzwTY-6w",
                embedId: "RqzGzwTY-6w",
                thumbnail: "https://i.ytimg.com/vi/RqzGzwTY-6w/maxresdefault.jpg"
            },
            {
                id: "white-noise",
                name: "White Noise",
                type: "noise",
                youtubeUrl: "https://www.youtube.com/watch?v=nMfPqeZjc2c",
                embedId: "nMfPqeZjc2c",
                thumbnail: "https://i.ytimg.com/vi/nMfPqeZjc2c/maxresdefault.jpg"
            },
            {
                id: "rain-sounds",
                name: "Rain Sounds",
                type: "nature",
                youtubeUrl: "https://www.youtube.com/watch?v=q76bMs-NwRk",
                embedId: "q76bMs-NwRk",
                thumbnail: "https://i.ytimg.com/vi/q76bMs-NwRk/maxresdefault.jpg"
            },
            {
                id: "ocean-waves",
                name: "Ocean Waves",
                type: "nature",
                youtubeUrl: "https://www.youtube.com/watch?v=WHPEKLQID4U",
                embedId: "WHPEKLQID4U",
                thumbnail: "https://i.ytimg.com/vi/WHPEKLQID4U/maxresdefault.jpg"
            },
            {
                id: "forest-ambience",
                name: "Forest Ambience",
                type: "nature",
                youtubeUrl: "https://www.youtube.com/watch?v=xNN7iTA57jM",
                embedId: "xNN7iTA57jM",
                thumbnail: "https://i.ytimg.com/vi/xNN7iTA57jM/maxresdefault.jpg"
            }
        ]
    },

    /**
     * Get playlists by type
     */
    getPlaylistsByType(type: MusicPlaylist['type']): MusicPlaylist[] {
        return this.getMusicPlaylists().filter(p => p.type === type)
    },

    /**
     * Get a playlist by ID
     */
    getPlaylistById(id: string): MusicPlaylist | undefined {
        return this.getMusicPlaylists().find(p => p.id === id)
    },

    /**
     * Sync music volume with timer state
     * Lower volume during breaks, normal during work sessions
     */
    syncMusicWithTimer(
        timerState: { isActive: boolean; isBreak: boolean },
        currentVolume: number
    ): number {
        if (!timerState.isActive) {
            return currentVolume
        }

        // During break: reduce to 40% of normal volume
        // During work: restore to normal volume
        if (timerState.isBreak) {
            return currentVolume * 0.4
        }

        return currentVolume
    },

    /**
     * Get default music state
     */
    getDefaultState(): MusicState {
        return {
            currentPlaylist: null,
            volume: 0.5,
            syncWithTimer: true,
            isPlaying: false
        }
    },

    /**
     * Get recommended playlist based on time of day and user context
     */
    getRecommendedPlaylist(context?: {
        hour: number
        burnoutScore: number
        focusLevel: number
    }): MusicPlaylist {
        const playlists = this.getMusicPlaylists()

        if (!context) {
            return playlists[0] // Default to LoFi
        }

        // Late night (10 PM - 2 AM): Ambient or LoFi
        if (context.hour >= 22 || context.hour <= 2) {
            const ambient = this.getPlaylistsByType('ambient')
            return ambient[0] || playlists[0]
        }

        // High burnout: Nature sounds for relaxation
        if (context.burnoutScore > 70) {
            const nature = this.getPlaylistsByType('nature')
            return nature[0] || playlists[0]
        }

        // High focus needed: Synthwave or Brown Noise
        if (context.focusLevel > 80) {
            const synthwave = this.getPlaylistsByType('synthwave')
            return synthwave[0] || playlists[0]
        }

        // Default: LoFi
        return playlists[0]
    }
}
