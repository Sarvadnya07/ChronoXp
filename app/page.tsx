"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Brain } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { loginWithGoogle, continueAsGuest, user, isGuest, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (user || isGuest)) {
      router.push("/app")
    }
  }, [user, isGuest, isLoading, router])

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          ChronoXP
        </div>
        <Button variant="ghost" onClick={loginWithGoogle}>Sign In</Button>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-primary">Time + XP</span> Productivity OS
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master Your Routine. Level Up Daily.
            Track habits, earn XP, maintain streaks, and unlock achievements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" onClick={loginWithGoogle} className="gap-2 text-lg h-12 px-8">
              <Zap className="w-5 h-5" />
              Continue with Google
            </Button>
            <Button size="lg" variant="outline" onClick={continueAsGuest} className="gap-2 text-lg h-12 px-8">
              Continue as Guest
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/50 transition-colors">
            <Brain className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Task Management</h3>
            <p className="text-muted-foreground">
              Advanced task scheduling with priority levels, recurrence rules, and core task flagging.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/50 transition-colors">
            <Shield className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Gamification Engine</h3>
            <p className="text-muted-foreground">
              Earn XP, maintain streaks, unlock badges, and level up as you complete your daily goals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/50 transition-colors">
            <BarChart3 className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
            <p className="text-muted-foreground">
              Visualize your productivity trends, category distribution, and sleep quality over time.
            </p>
          </div>
        </section>

        {/* Routine Section */}
        <section className="container mx-auto px-4 py-20 border-t">
          <h2 className="text-3xl font-bold text-center mb-12">Built for High Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-lg">DSA & GATE Preparation Tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-lg">AI/ML Project Milestones</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-lg">Japanese Language Learning</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-lg">Sleep & Energy Management</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-lg">Daily Journaling & Reflection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="text-lg">Cloud Sync & Offline Support</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-muted-foreground">
        <p>© 2025 ChronoXP. All rights reserved.</p>
      </footer>
    </div>
  )
}
