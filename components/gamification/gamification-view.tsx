"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Flame, Star, Target, Zap } from "lucide-react"
import XPBar from "@/components/gamification/XPBar"
import LevelChip from "@/components/gamification/LevelChip"
import StreakFlame from "@/components/gamification/StreakFlame"
import BadgeGrid from "@/components/gamification/BadgeGrid"
import DailyQuestsPanel from "@/components/gamification/DailyQuestsPanel"
import WeeklyChallengeCard from "@/components/gamification/WeeklyChallengeCard"
import EnergyBar from "@/components/gamification/EnergyBar"
import { generateDailyQuests, generateWeeklyChallenge } from "@/lib/gamification/questEngine"
import { getLocalDate } from "@/lib/utils"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface GamificationViewProps {
  compact?: boolean
}

export default function GamificationView({ compact = false }: GamificationViewProps) {
  const { profile, todayProgress, tasks, completeTask } = useAppStore()

  const dailyQuest = useMemo(() => {
    if (!todayProgress) return null
    return generateDailyQuests(getLocalDate(), tasks)
  }, [todayProgress, tasks])

  const weeklyChallenge = useMemo(() => {
    const today = new Date()
    const weekId = `${today.getFullYear()}-${Math.ceil((today.getDate() + 6) / 7)}`
    return generateWeeklyChallenge(weekId)
  }, [])

  if (!profile) return null

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-background to-secondary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LevelChip level={profile.stats.level} />
              <StreakFlame streak={profile.stats.currentStreak} />
            </div>
            <EnergyBar current={profile.energy.current} />
          </div>
          <XPBar totalXP={profile.stats.totalXP} level={profile.stats.level} />
          {dailyQuest && (
            <div className="mt-4">
              <DailyQuestsPanel
                quest={dailyQuest}
                tasks={tasks}
                onComplete={completeTask}
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress & Achievements</h2>
          <p className="text-muted-foreground">Track your journey and level up</p>
        </div>
        <div className="flex items-center gap-4">
          <StreakFlame streak={profile.stats.currentStreak} />
          <LevelChip level={profile.stats.level} />
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Total XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.stats.totalXP.toLocaleString()}</div>
            <XPBar totalXP={profile.stats.totalXP} level={profile.stats.level} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.stats.currentStreak} Days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {profile.stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              Energy Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.energy.current}%</div>
            <EnergyBar current={profile.energy.current} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quests & Challenges */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="quests" className="w-full">
            <TabsList>
              <TabsTrigger value="quests">Quests & Challenges</TabsTrigger>
              <TabsTrigger value="badges">Badges Collection</TabsTrigger>
            </TabsList>

            <TabsContent value="quests" className="space-y-4 mt-4">
              {dailyQuest && (
                <DailyQuestsPanel
                  quest={dailyQuest}
                  tasks={tasks}
                  onComplete={completeTask}
                />
              )}
              <WeeklyChallengeCard challenge={weeklyChallenge} />
            </TabsContent>

            <TabsContent value="badges" className="mt-4">
              <BadgeGrid badges={profile.badges} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Recent Activity / Leaderboard (Future) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Next Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show next locked badges close to completion */}
              {profile.badges
                .filter(b => !b.unlocked && (b.progress || 0) > 0)
                .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                .slice(0, 3)
                .map(badge => (
                  <div key={badge.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{badge.name}</span>
                      <span className="text-muted-foreground">{Math.round(badge.progress || 0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/50"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                ))}

              {profile.badges.filter(b => !b.unlocked && (b.progress || 0) > 0).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Complete tasks to unlock badges!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
