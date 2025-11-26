// Sync engine for ChronoXP
// Handles conflict resolution and background sync with Firestore

import { auth, db as firestore } from "./firebase";
import { db as localDb } from "./db";
import type { Task, RoutineTemplate, UserProfile, DailyProgress, AppSettings, Memory, XPLog } from "./types";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { SyncConflictResolver } from "@/services/syncConflictResolver";

export interface SyncStatus {
    isSyncing: boolean;
    lastSyncTime: number | null;
    error: string | null;
}

/**
 * Sync local data to Firestore with conflict resolution
 */
export async function syncToFirestore(): Promise<SyncStatus> {
    if (!auth?.currentUser || !firestore) {
        return {
            isSyncing: false,
            lastSyncTime: null,
            error: "Not authenticated or Firestore not configured",
        };
    }

    try {
        const userId = auth.currentUser.uid;
        const userRef = doc(firestore, "users", userId);

        // Get local data
        const localProfile = await localDb.get("userProfile", "main");
        const localSettings = await localDb.get("settings", "main");
        const localTasks = await localDb.getAll("tasks");
        const localRoutines = await localDb.getAll("routines");
        const localProgress = await localDb.getAll("dailyProgress");
        const localXPLogs = await localDb.getAll("xpLogs");
        const localMemories = await localDb.getAll("memory");

        // Get remote data
        const remoteDoc = await getDoc(userRef);
        const remoteData = remoteDoc.exists() ? remoteDoc.data() : null;

        // Merge with conflict resolution
        const mergedData = {
            profile: SyncConflictResolver.resolve(localProfile || {} as any, remoteData?.profile || {} as any),
            settings: SyncConflictResolver.resolve(localSettings || {} as any, remoteData?.settings || {} as any),
            tasks: SyncConflictResolver.resolveList(localTasks as any[], remoteData?.tasks || []),
            routines: SyncConflictResolver.resolveList(localRoutines as any[], remoteData?.routines || []),
            progress: SyncConflictResolver.resolveList(localProgress as any[], remoteData?.progress || []),
            xpLogs: SyncConflictResolver.resolveList(localXPLogs as any[], remoteData?.xpLogs || []),
            memories: SyncConflictResolver.resolveList(localMemories as any[], remoteData?.memories || []),
            lastSynced: Date.now(),
        };

        // Upload merged data
        await setDoc(userRef, mergedData, { merge: true });

        // Update local with merged data
        if (mergedData.profile && (mergedData.profile as any).id) await localDb.put("userProfile", mergedData.profile);
        if (mergedData.settings && (mergedData.settings as any).id) await localDb.put("settings", mergedData.settings);

        for (const task of mergedData.tasks) {
            await localDb.put("tasks", task);
        }
        for (const routine of mergedData.routines) {
            await localDb.put("routines", routine);
        }
        for (const progress of mergedData.progress) {
            await localDb.put("dailyProgress", progress);
        }
        for (const log of mergedData.xpLogs) {
            await localDb.put("xpLogs", log);
        }
        for (const memory of mergedData.memories) {
            await localDb.put("memory", memory);
        }

        // Return successful sync status
        return { isSyncing: false, lastSyncTime: Date.now(), error: null };
    } catch (e) {
        return { isSyncing: false, lastSyncTime: null, error: (e as Error).message };
    }
}

/**
 * Start background sync (every 5 minutes)
 */
export function startBackgroundSync(onStatusChange?: (status: SyncStatus) => void): () => void {
    const interval = setInterval(async () => {
        if (onStatusChange) {
            onStatusChange({ isSyncing: true, lastSyncTime: null, error: null });
        }
        const status = await syncToFirestore();
        if (onStatusChange) {
            onStatusChange(status);
        }
    }, 5 * 60 * 1000); // 5 minutes

    // Return cleanup function
    return () => clearInterval(interval);
}

/**
 * Download data from Firestore to local
 */
export async function downloadFromFirestore(): Promise<void> {
    if (!auth?.currentUser || !firestore) {
        throw new Error("Not authenticated or Firestore not configured");
    }

    const userId = auth.currentUser.uid;
    const userRef = doc(firestore, "users", userId);
    const remoteDoc = await getDoc(userRef);

    if (!remoteDoc.exists()) {
        console.log("No remote data found");
        return;
    }

    const data = remoteDoc.data();

    // Update local database
    if (data.profile) await localDb.put("userProfile", data.profile);
    if (data.settings) await localDb.put("settings", data.settings);
    if (data.tasks) {
        for (const task of data.tasks) {
            await localDb.put("tasks", task);
        }
    }
    if (data.routines) {
        for (const routine of data.routines) {
            await localDb.put("routines", routine);
        }
    }
    if (data.progress) {
        for (const progress of data.progress) {
            await localDb.put("dailyProgress", progress);
        }
    }
    if (data.xpLogs) {
        for (const log of data.xpLogs) {
            await localDb.put("xpLogs", log);
        }
    }
    if (data.memories) {
        for (const memory of data.memories) {
            await localDb.put("memory", memory);
        }
    }
}
