import { useEffect, useCallback } from "react"

export interface KeyboardShortcut {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    action: () => void
    description: string
}

/**
 * Hook to register keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcuts([
 *   { key: 'n', action: () => openNewTask(), description: 'New task' },
 *   { key: '/', action: () => focusSearch(), description: 'Search' },
 *   { key: 's', ctrl: true, action: () => save(), description: 'Save' },
 * ])
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
                const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
                const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
                const altMatches = shortcut.alt ? event.altKey : !event.altKey

                if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
                    event.preventDefault()
                    shortcut.action()
                    break
                }
            }
        },
        [shortcuts]
    )

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])
}

/**
 * Hook to show keyboard shortcuts help
 */
export function useShortcutHelp() {
    const shortcuts: KeyboardShortcut[] = [
        { key: "n", action: () => { }, description: "Create new task" },
        { key: "/", action: () => { }, description: "Focus search" },
        { key: "t", action: () => { }, description: "Go to timeline" },
        { key: "d", action: () => { }, description: "Go to dashboard" },
        { key: "s", ctrl: true, action: () => { }, description: "Save/Sync" },
        { key: "?", action: () => { }, description: "Show shortcuts" },
    ]

    return shortcuts
}
