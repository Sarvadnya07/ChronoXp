"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getXPForNextLevel, getXPProgressInLevel } from "@/lib/gamification"
import { getDailyQuote } from "@/lib/quotes"
import { Flame, Zap, TrendingUp } from "lucide-react"

export default function DashboardView() {
  const { profile, todayProgress, completeTask, uncompleteTask, updateMood, updateJournal } = useAppStore()

  if (!profile || !todayProgress) return null

  const xpProgress = (getXPProgressInLevel(profile.totalXP) / 1000) * 100
  const nextLevelXP = getXPForNextLevel(profile.totalXP)
  const completedCount = todayProgress.tasks.filter((t) => t.completed).length

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glow-border bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Today's XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold glow-text">{todayProgress.totalXP}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} of {todayProgress.tasks.length} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card className="glow-border bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{profile.currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">Longest: {profile.longestStreak} days</p>
          </CardContent>
        </Card>

        <Card className="glow-border bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Level {profile.level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={xpProgress} className="h-3 xp-bar" />
            <p className="text-xs text-muted-foreground mt-2">
              {getXPProgressInLevel(profile.totalXP)} / 1000 XP to Level {profile.level + 1}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Quote */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-lg italic text-center text-pretty">{getDailyQuote()}</p>
        </CardContent>
      </Card>

      {/* Today's Routine Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Routine Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayProgress.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      completeTask(task.id)
                    } else {
                      uncompleteTask(task.id)
                    }
                  }}
                />
                <div className="flex-1">
                  <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {task.duration}m • {task.scheduledTime || "Anytime"}
                  </p>
                </div>
              </div>
              <Badge variant={task.completed ? "default" : "outline"} className="ml-2">
                +{task.xp} XP
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mood & Quick Journal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>😢</span>
              <span>😐</span>
              <span>😊</span>
              <span>😄</span>
              <span>🤩</span>
            </div>
            <Slider
              value={[todayProgress.mood || 3]}
              onValueChange={(value) => updateMood(value[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-center text-muted-foreground">
              Current mood:{" "}
              {todayProgress.mood
                ? ["Very Bad", "Bad", "Okay", "Good", "Excellent"][todayProgress.mood - 1]
                : "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Journal</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="How was your day? Any reflections?"
              value={todayProgress.journalEntry || ""}
              onChange={(e) => updateJournal(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
