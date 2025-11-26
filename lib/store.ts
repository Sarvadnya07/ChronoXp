// Zustand store for app state

import { create } from "zustand"
import type { Task, UserProfile, DailyProgress, AppSettings, RoutineTemplate } from "./types"
import { db } from "./db"
import { calculateLevel, calculateTaskXP, updateStreak, evaluateBadges, initializeBadges } from "./gamification"
import { getLocalDate } from "./utils"
import { scheduleTaskNotification, sendStreakWarning, scheduleDailySummary } from "./notifications"
import { MemoryEngine } from "@/services/memoryEngine"
import { generateRecurringTasks } from "./recurring"

import { auth, loginWithGoogle, logout } from "./firebase"
import { parseICS } from "./ics"

interface AppState {
  profile: UserProfile | null
  todayProgress: DailyProgress | null
  settings: AppSettings
  tasks: Task[]
  loading: boolean

  // Actions
  initializeApp: () => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  uncompleteTask: (taskId: string) => Promise<void>
  addTask: (task: Omit<Task, "id" | "completed">) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  updateMood: (mood: number) => Promise<void>
  updateJournal: (entry: string, tags?: string[]) => Promise<void>
  logSleep: (sleepStart: string, sleepEnd: string, quality: number) => Promise<void>
  refreshProfile: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  seedDemoData: () => Promise<void>

  // Sync & Import
  login: () => Promise<void>
  logout: () => Promise<void>
  sync: () => Promise<void>
  importICS: (content: string) => Promise<void>
  mergeLocalData: () => Promise<void>
  routines?: RoutineTemplate[]
  saveRoutine: (name: string, tasks: Task[], templateType?: import("./types").TemplateType) => Promise<void>
  applyRoutine: (templateId: string) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  todayProgress: null,
  settings: {
    id: "main",
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    cloudSyncEnabled: false,
    theme: "cyber",
  },
  tasks: [],
  notifications: [],
  routines: [],
  loading: true,

  initializeApp: async () => {
    try {
      await db.init()

      // Load or create user profile
      let profile = await db.get("userProfile", "main")
      if (!profile) {
        profile = {
          id: "main",
          stats: {
            totalXP: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            successfulDays: [],
            lastActivityDate: new Date().toISOString().split('T')[0]
          },
          badges: initializeBadges(),
          createdAt: Date.now(),
          lastActive: Date.now(),
          energy: {
            current: 100,
            lastUpdated: Date.now(),
            history: []
          }
        }
        await db.put("userProfile", profile)
      } else if (!profile.stats) {
        // Migration for existing profiles
        profile.stats = {
          totalXP: profile.totalXP || 0,
          level: profile.level || 1,
          currentStreak: profile.currentStreak || 0,
          longestStreak: profile.longestStreak || 0,
          successfulDays: [],
          lastActivityDate: new Date().toISOString().split('T')[0]
        }
        await db.put("userProfile", profile)
      }

      // Load settings
      let settings = await db.get("settings", "main")
      if (!settings) {
        settings = {
          id: "main",
          notificationsEnabled: true,
          soundEnabled: true,
          vibrationEnabled: true,
          cloudSyncEnabled: false,
          theme: "cyber",
        }
        await db.put("settings", settings)
      }

      // Load tasks
      const tasks = await db.getAll("tasks")

      // Load routines
      const routines = await db.getAll("routines")

      // Load or create today's progress
      const today = getLocalDate()
      let todayProgress = await db.get("dailyProgress", today)

      if (!todayProgress) {
        // Generate recurring tasks for today
        const recurringTasks = generateRecurringTasks(tasks, today)

        const todaysTasks = [
          ...tasks.filter(t => t.scheduledDate === today),
          ...recurringTasks
        ]

        todayProgress = {
          date: today,
          tasks: todaysTasks.map((t) => ({ ...t, completed: false, completedAt: undefined })),
          totalXP: 0,
          completedTasks: 0,
          timestamp: Date.now(),
          quests: []
        }

        await db.put("dailyProgress", todayProgress)
      }

      // Schedule daily summary
      if (todayProgress) {
        scheduleDailySummary({
          xp: todayProgress.totalXP,
          completed: todayProgress.completedTasks
        })
      }

      set({ profile, todayProgress, settings, tasks, routines, loading: false })
    } catch (error) {
      console.error("Failed to initialize app:", error)
      set({ loading: false })
    }
  },

  completeTask: async (taskId: string) => {
    const { todayProgress, profile } = get()
    if (!todayProgress || !profile) return

    const taskIndex = todayProgress.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return

    const task = todayProgress.tasks[taskIndex]
    if (task.completed) return

    const xpEarned = calculateTaskXP(task)

    const updatedTasks = [...todayProgress.tasks]
    updatedTasks[taskIndex] = {
      ...task,
      completed: true,
      completedAt: Date.now(),
    }

    // Update stats
    const currentStats = profile.stats
    const newTotalXP = currentStats.totalXP + xpEarned
    const newLevel = calculateLevel(newTotalXP)

    // Check badges
    const oldBadges = profile.badges
    const updatedBadges = await evaluateBadges({
      ...profile,
      stats: { ...currentStats, totalXP: newTotalXP, level: newLevel }
    })

    const newlyUnlocked = updatedBadges.filter(b => b.unlocked && !oldBadges.find(ob => ob.id === b.id)?.unlocked)
    const badges = updatedBadges

    const updatedProfile: UserProfile = {
      ...profile,
      stats: {
        ...currentStats,
        totalXP: newTotalXP,
        level: newLevel,
        lastActivityDate: new Date().toISOString().split('T')[0]
      },
      badges,
      lastActive: Date.now()
    }

    if (newlyUnlocked.length > 0) {
      console.log("Unlocked badges:", newlyUnlocked)
    }

    const updatedProgress: DailyProgress = {
      ...todayProgress,
      tasks: updatedTasks,
      totalXP: todayProgress.totalXP + xpEarned,
      completedTasks: todayProgress.completedTasks + 1,
      updatedAt: Date.now(),
    }

    // Update Memory
    if (task.category) {
      MemoryEngine.addMemory("pattern", `completed_task_${task.category}`, { taskId: task.id, timestamp: Date.now() }, 0.1)
    }

    await db.put("dailyProgress", updatedProgress)
    await db.put("userProfile", updatedProfile)

    set({ todayProgress: updatedProgress, profile: updatedProfile })
  },

  uncompleteTask: async (taskId: string) => {
    const { todayProgress, profile } = get()
    if (!todayProgress || !profile) return

    const taskIndex = todayProgress.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return

    const task = todayProgress.tasks[taskIndex]
    if (!task.completed) return

    const xpLost = calculateTaskXP(task)

    const updatedTasks = [...todayProgress.tasks]
    updatedTasks[taskIndex] = {
      ...task,
      completed: false,
      completedAt: undefined,
    }

    const updatedProgress: DailyProgress = {
      ...todayProgress,
      tasks: updatedTasks,
      totalXP: Math.max(0, todayProgress.totalXP - xpLost),
      completedTasks: Math.max(0, todayProgress.completedTasks - 1),
      updatedAt: Date.now(),
    }

    const updatedProfile: UserProfile = {
      ...profile,
      stats: {
        ...profile.stats,
        totalXP: Math.max(0, profile.stats.totalXP - xpLost),
        level: calculateLevel(Math.max(0, profile.stats.totalXP - xpLost))
      },
      lastActive: Date.now(),
    }

    await db.put("dailyProgress", updatedProgress)
    await db.put("userProfile", updatedProfile)

    set({ todayProgress: updatedProgress, profile: updatedProfile })
  },

  addTask: async (taskData) => {
    const { tasks } = get()
    const now = Date.now()
    const newTask: Task = {
      ...taskData,
      id: `task-${now}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      priority: taskData.priority || "medium",
      isCritical: taskData.isCritical || false,
      repeatRule: taskData.repeatRule || "none",
      difficulty: taskData.difficulty || "medium",
      isCore: taskData.isCore || false,
      createdAt: now,
      updatedAt: now,
    }

    await db.put("tasks", newTask)
    set({ tasks: [...tasks, newTask] })

    // Schedule notification
    scheduleTaskNotification(newTask)

    // Add to today's progress
    await get().refreshProfile()
  },

  updateTask: async (taskId, updates) => {
    const { tasks } = get()
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t
    )

    const task = updatedTasks.find((t) => t.id === taskId)
    if (task) {
      await db.put("tasks", task)
      set({ tasks: updatedTasks })

      // Reschedule notification if time changed
      if (updates.scheduledTime) {
        scheduleTaskNotification(task)
      }
    }
  },

  deleteTask: async (taskId) => {
    const { tasks } = get()
    await db.delete("tasks", taskId)
    set({ tasks: tasks.filter((t) => t.id !== taskId) })
  },

  updateMood: async (mood) => {
    const { todayProgress } = get()
    if (!todayProgress) return

    const updated = { ...todayProgress, mood, updatedAt: Date.now() }
    await db.put("dailyProgress", updated)
    set({ todayProgress: updated })
  },

  updateJournal: async (entry, tags) => {
    const { todayProgress } = get()
    if (!todayProgress) return

    const journalEntry: import("./types").JournalEntry = {
      id: `journal-${Date.now()}`,
      date: todayProgress.date,
      mood: todayProgress.mood || 3,
      text: entry,
      tags: tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const updated = { ...todayProgress, journalEntry, journalTags: tags, updatedAt: Date.now() }
    await db.put("dailyProgress", updated)
    set({ todayProgress: updated })
  },

  logSleep: async (sleepStart, sleepEnd, quality) => {
    const { todayProgress } = get()
    if (!todayProgress) return

    const start = new Date(`2000-01-01T${sleepStart}`)
    const end = new Date(`2000-01-01T${sleepEnd}`)
    let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    if (diff < 0) diff += 24 // Handle crossing midnight

    const sleepLog: import("./types").SleepLog = {
      id: `sleep-${Date.now()}`,
      date: todayProgress.date,
      sleepStart,
      sleepEnd,
      totalHours: diff,
      sleepQuality: quality,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const updated = { ...todayProgress, sleep: sleepLog, updatedAt: Date.now() }
    await db.put("dailyProgress", updated)
    set({ todayProgress: updated })
  },

  refreshProfile: async () => {
    const profile = await db.get("userProfile", "main")
    const today = getLocalDate()
    const todayProgress = await db.get("dailyProgress", today)

    if (profile) {
      await db.put("userProfile", profile)
    }

    set({ profile, todayProgress })
  },

  updateSettings: async (updates) => {
    const { settings } = get()
    const updated = { ...settings, ...updates, id: "main" }
    await db.put("settings", updated)
    set({ settings: updated })
  },

  seedDemoData: async () => {
    // Seed demo tasks
    const demoTasks: Task[] = [
      {
        id: "task-1",
        title: "DSA Practice",
        category: "DSA",
        xp: 25,
        duration: 60,
        completed: false,
        scheduledTime: "06:00",
        difficulty: "medium",
        isCore: true,
        priority: "high",
        isCritical: true,
        repeatRule: "daily",
      },
      {
        id: "task-2",
        title: "Aptitude",
        category: "Aptitude",
        xp: 10,
        duration: 30,
        completed: false,
        scheduledTime: "07:00",
        difficulty: "easy",
        isCore: false,
        priority: "medium",
        isCritical: false,
        repeatRule: "none",
      },
      {
        id: "task-3",
        title: "AI/ML Study",
        category: "AI/ML",
        xp: 30,
        duration: 90,
        completed: false,
        scheduledTime: "08:00",
        difficulty: "hard",
        isCore: true,
        priority: "high",
        isCritical: true,
        repeatRule: "weekdays",
      },
      {
        id: "task-4",
        title: "GATE Prep",
        category: "GATE",
        xp: 20,
        duration: 60,
        completed: false,
        scheduledTime: "10:00",
        difficulty: "medium",
        isCore: true,
        priority: "high",
        isCritical: true,
        repeatRule: "weekdays",
      },
      {
        id: "task-5",
        title: "Japanese Learning",
        category: "Japanese",
        xp: 20,
        duration: 45,
        completed: false,
        scheduledTime: "14:00",
        difficulty: "medium",
        isCore: true,
        priority: "medium",
        isCritical: true,
        repeatRule: "daily",
      },
      {
        id: "task-6",
        title: "Project Work",
        category: "Projects",
        xp: 25,
        duration: 120,
        completed: false,
        scheduledTime: "15:30",
        difficulty: "hard",
        isCore: false,
        priority: "medium",
        isCritical: false,
        repeatRule: "weekends",
      },
      {
        id: "task-7",
        title: "Certifications",
        category: "Certifications",
        xp: 20,
        duration: 60,
        completed: false,
        scheduledTime: "18:00",
        difficulty: "medium",
        isCore: false,
        priority: "low",
        isCritical: false,
        repeatRule: "none",
      },
      {
        id: "task-8",
        title: "Intellipaat Class",
        category: "Intellipaat",
        xp: 30,
        duration: 90,
        completed: false,
        scheduledTime: "19:30",
        difficulty: "hard",
        isCore: true,
        daysOfWeek: [1, 2, 3, 4, 5],
        priority: "high",
        isCritical: true,
        repeatRule: "weekdays",
      },
      {
        id: "task-9",
        title: "Exercise",
        category: "Exercise",
        xp: 20,
        duration: 30,
        completed: false,
        scheduledTime: "21:00",
        difficulty: "medium",
        isCore: true,
        priority: "high",
        isCritical: true,
        repeatRule: "daily",
      },
      {
        id: "task-10",
        title: "Sleep",
        category: "Sleep",
        xp: 15,
        duration: 480,
        completed: false,
        scheduledTime: "23:30",
        difficulty: "easy",
        isCore: true,
        priority: "high",
        isCritical: true,
        repeatRule: "daily",
      },
      {
        id: "task-11",
        title: "Daily Journal",
        category: "Journal",
        xp: 15,
        duration: 15,
        completed: false,
        scheduledTime: "23:00",
        difficulty: "easy",
        isCore: true,
        priority: "medium",
        isCritical: true,
        repeatRule: "daily",
      },
    ]

    for (const task of demoTasks) {
      await db.put("tasks", task)
    }

    set({ tasks: demoTasks })
    await get().refreshProfile()
  },

  login: async () => {
    try {
      const user = await loginWithGoogle()
      if (user) {
        await get().sync()
      }
    } catch (error) {
      console.error("Login failed:", error)
    }
  },

  logout: async () => {
    await logout()
    set({ profile: null, tasks: [], todayProgress: null })
    window.location.reload()
  },

  sync: async () => {
    const { settings } = get()
    if (!settings.cloudSyncEnabled) return
    console.log("Syncing data...")
  },

  importICS: async (content: string) => {
    const parsedTasks = parseICS(content)
    const { tasks } = get()

    const newTasks: Task[] = []

    for (const pt of parsedTasks) {
      if (pt.title && pt.scheduledDate) {
        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: pt.title,
          category: pt.category || "Custom",
          xp: pt.xp || 10,
          duration: pt.duration || 60,
          completed: false,
          scheduledDate: pt.scheduledDate,
          startTime: pt.startTime,
          endTime: pt.endTime,
          priority: pt.priority || "medium",
          isCritical: pt.isCritical || false,
          repeatRule: pt.repeatRule || "none",
          difficulty: pt.difficulty || "medium",
          isCore: pt.isCore || false,
        }
        newTasks.push(newTask)
        await db.put("tasks", newTask)
      }
    }

    set({ tasks: [...tasks, ...newTasks] })
    await get().refreshProfile()
  },

  mergeLocalData: async () => {
    // This function would be called after login to sync local guest data to Firestore
    // For now, we'll just trigger a sync
    await get().sync()
  },

  saveRoutine: async (name: string, tasks: Task[], templateType: import("./types").TemplateType = "custom") => {
    const template: RoutineTemplate = {
      id: `routine-${Date.now()}`,
      name,
      templateType,
      tasks: tasks.map(({ id, completed, completedAt, scheduledDate, ...rest }) => rest),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const { routines } = get()
    const newRoutines = [...(routines || []), template]

    set({ routines: newRoutines })
    await db.put("routines", template)

    // If using Firestore, sync there too
    if (auth?.currentUser) {
      // Sync logic would go here
    }
  },

  applyRoutine: async (templateId: string) => {
    const { routines, tasks } = get()
    const template = routines?.find(r => r.id === templateId)
    if (!template) return

    const today = getLocalDate()
    const newTasks = template.tasks.map(t => ({
      ...t,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      scheduledDate: today,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })) as Task[]

    set({ tasks: [...tasks, ...newTasks] })

    // Save to DB
    for (const task of newTasks) {
      await db.put("tasks", task)
    }
  },

  deleteRoutine: async (id: string) => {
    const { routines } = get()
    const newRoutines = routines?.filter(r => r.id !== id) || []
    set({ routines: newRoutines })
    await db.delete("routines", id)
  }
}))
