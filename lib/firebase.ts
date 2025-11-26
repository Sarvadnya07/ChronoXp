import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, getDoc, Timestamp } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type User } from "firebase/auth"
import { type AppSettings, type UserProfile, type DailyProgress, type Task } from "./types"
import { db as localDb } from "./db"

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase only if config is present
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null
export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
export const googleProvider = new GoogleAuthProvider()

export async function syncData(user: User) {
    if (!db) return

    const userId = user.uid
    const userRef = doc(db, "users", userId)

    // 1. Upload local data to Firestore
    const localProfile = await localDb.get("userProfile", "main")
    const localSettings = await localDb.get("settings", "main")
    const localTasks = await localDb.getAll("tasks")
    const localProgress = await localDb.getAll("dailyProgress")

    const dataToSync = {
        profile: localProfile,
        settings: localSettings,
        tasks: localTasks,
        progress: localProgress,
        lastSynced: Timestamp.now(),
    }

    await setDoc(userRef, dataToSync, { merge: true })

    // 2. Download data from Firestore (optional: merge strategy)
    // For now, we'll assume local is source of truth for upload, 
    // but in a real app you'd handle conflict resolution.
}

export async function loginWithGoogle() {
    if (!auth) throw new Error("Firebase not configured")
    try {
        const result = await signInWithPopup(auth, googleProvider)
        return result.user
    } catch (error) {
        console.error("Login failed:", error)
        throw error
    }
}

export async function logout() {
    if (!auth) return
    await signOut(auth)
}
