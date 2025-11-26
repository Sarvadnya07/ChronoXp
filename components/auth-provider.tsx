"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
    type User,
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut
} from "firebase/auth"
import { auth, googleProvider, db as firestore } from "@/lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface AuthContextType {
    user: User | null
    isGuest: boolean
    isLoading: boolean
    loginWithGoogle: () => Promise<void>
    continueAsGuest: () => void
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isGuest, setIsGuest] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { initializeApp, settings } = useAppStore()

    useEffect(() => {
        // Check for guest mode preference
        const guestPref = localStorage.getItem("guestMode")
        if (guestPref === "true") {
            setIsGuest(true)
            setIsLoading(false)
            return
        }

        if (!auth) {
            setIsLoading(false)
            return
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)
                setIsGuest(false)

                // Sync user profile to Firestore
                if (firestore) {
                    const userRef = doc(firestore, "users", firebaseUser.uid)
                    const userSnap = await getDoc(userRef)

                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            profile: {
                                name: firebaseUser.displayName,
                                email: firebaseUser.email,
                                photoURL: firebaseUser.photoURL,
                                createdAt: serverTimestamp(),
                            },
                            settings: {
                                ...settings,
                                id: "main"
                            }
                        }, { merge: true })
                    } else {
                        await setDoc(userRef, {
                            profile: {
                                lastLoginAt: serverTimestamp()
                            }
                        }, { merge: true })
                    }
                }
            } else {
                setUser(null)
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const loginWithGoogle = async () => {
        if (!auth) {
            // Show user-friendly message instead of console error
            alert("Firebase is not configured yet.\n\nPlease add your Firebase credentials to .env.local file.\nSee .env.local.example for template.\n\nYou can use Guest mode in the meantime!")
            return
        }
        try {
            setIsLoading(true)
            await signInWithPopup(auth, googleProvider)
            localStorage.removeItem("guestMode")
            router.push("/app")
        } catch (error) {
            console.error("Login failed:", error)
            alert("Login failed. Please try again or use Guest mode.")
        } finally {
            setIsLoading(false)
        }
    }

    const continueAsGuest = () => {
        setIsGuest(true)
        localStorage.setItem("guestMode", "true")
        router.push("/app")
    }

    const logout = async () => {
        try {
            if (auth) await firebaseSignOut(auth)
            setIsGuest(false)
            localStorage.removeItem("guestMode")
            router.push("/")
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isGuest, isLoading, loginWithGoogle, continueAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
