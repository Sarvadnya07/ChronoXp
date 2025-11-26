// Core types for ChronoXP

export type TaskCategory =
  | "Study"
  | "Health"
  | "Break"
  | "Chill"
  | "Career"
  | "Sleep"
  | "Class"
  | "Admin"
  | "Planning"
  | "DSA"
  | "Aptitude"
  | "AI/ML"
  | "GATE"
  | "Japanese"
  | "Projects"
  | "Certifications"
  | "Intellipaat"
  | "Exercise"
  | "Journal"
  | "Custom"

export type TaskPriority = "high" | "medium" | "low"
export type RepeatRule = "none" | "daily" | "weekdays" | "weekends" | "weekly" | "custom"

export interface Task {
  id: string
  title: string
  description?: string
  category: TaskCategory
  xp: number
  duration: number // in minutes
  completed: boolean
  completedAt?: number // timestamp

  // Scheduling
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  scheduledDate?: string // YYYY-MM-DD

  // Meta
  priority: TaskPriority
  isCritical: boolean
  notes?: string

  // Timestamps
  createdAt?: number
  updatedAt?: number

  // Recurrence
  repeatRule: RepeatRule
  repeatDays?: number[] // 0-6 for custom recurrence
  parentId?: string // ID of the original task if this is a generated instance

  // Legacy support (optional)
  scheduledTime?: string
  difficulty: "easy" | "medium" | "hard"
  isCore: boolean
  daysOfWeek?: number[]
}

export type TemplateType = "weekday" | "saturday" | "sunday" | "cheatday" | "custom"

export interface RoutineTemplate {
  id: string
  name: string
  templateType: TemplateType
  tasks: Omit<Task, "id" | "completed" | "completedAt" | "scheduledDate">[]
  createdAt?: number
  updatedAt?: number
}

// Legacy Quest interface for backward compatibility
export interface Quest {
  id: string
  title: string
  description: string
  xpReward: number
  isCompleted: boolean
  type: "daily" | "weekly"
  targetCategory?: TaskCategory
  targetCount?: number
  progress: number
}

export interface DailyProgress {
  date: string // YYYY-MM-DD
  tasks: Task[]
  totalXP: number
  completedTasks: number
  mood?: number // 1-5
  sleep?: SleepLog
  journalEntry?: JournalEntry
  journalTags?: string[]
  quests?: Quest[]
  timestamp: number
  updatedAt?: number
}

export interface UserStats {
  totalXP: number
  level: number
  currentStreak: number
  longestStreak: number
  successfulDays: string[] // YYYY-MM-DD
  lastSuccessDate?: string
  lastActivityDate?: string
}

export interface XPLog {
  id: string
  date: string // YYYY-MM-DD
  taskId?: string
  category: string
  xp: number
  reason: "task_completed" | "daily_quest_bonus" | "weekly_challenge_bonus" | "manual_adjustment"
  createdAt: number
  updatedAt?: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
  progress?: number // 0-100
  target?: number
  category?: string
}

export interface DailyQuest {
  id: string
  date: string // YYYY-MM-DD
  tasks: string[] // Task IDs
  completed: boolean
  completedAt?: number
  bonusXpAwarded?: number
}

export interface WeeklyChallenge {
  weekId: string // YYYY-WW
  type: "xp" | "hours" | "tasks"
  target: number
  current: number
  completed: boolean
  completedAt?: number
  rewardXp: number
  title: string
  description: string
}

export interface EnergyState {
  current: number // 0-100
  lastUpdated: number
  history: { date: string; level: number }[]
}

export interface UserProfile {
  id: string
  stats: UserStats
  badges: Badge[]
  createdAt: number
  lastActive: number
  energy: EnergyState
  updatedAt?: number
  // Legacy fields to be migrated to stats
  totalXP?: number
  level?: number
  currentStreak?: number
  longestStreak?: number
}

export interface Notification {
  id: string
  title: string
  body: string
  type: "task" | "streak" | "level" | "badge" | "summary"
  scheduledTime?: number
  sent: boolean
  taskId?: string
}

export interface StreakRequirement {
  category: TaskCategory
  required: boolean
  daysOfWeek?: number[] // empty means all days
}

export interface Analytics {
  weeklyXP: number[]
  monthlyXP: number[]
  xpByCategory: Record<string, number>
  completionRate: number
  streakHistory: { date: string; streak: number }[]
  productivityIndex: number
}

export interface AppSettings {
  id: string
  notificationsEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  cloudSyncEnabled: boolean
  theme: "dark" | "light" | "cyber"
  lastSyncTime?: number
}

// XP rewards by category
export const XP_REWARDS: Record<TaskCategory, number> = {
  DSA: 25,
  Aptitude: 10,
  "AI/ML": 30,
  GATE: 20,
  Japanese: 20,
  Projects: 25,
  Certifications: 20,
  Intellipaat: 30,
  Exercise: 20,
  Sleep: 15,
  Journal: 15,
  Break: 0,
  Custom: 10,
  Study: 20,
  Health: 20,
  Chill: 5,
  Career: 25,
  Class: 20,
  Admin: 10,
  Planning: 10,
}

// Streak requirements
export const STREAK_REQUIREMENTS: StreakRequirement[] = [
  { category: "Exercise", required: true },
  { category: "DSA", required: true },
  { category: "AI/ML", required: true },
  { category: "GATE", required: true },
  { category: "Japanese", required: true },
  { category: "Journal", required: true },
  { category: "Sleep", required: true },
  { category: "Intellipaat", required: true, daysOfWeek: [1, 2, 3, 4, 5] }, // Mon-Fri only
]

export const XP_PER_LEVEL = 1000

// Difficulty multipliers
export const DIFFICULTY_MULTIPLIERS = {
  easy: 1,
  medium: 1.5,
  hard: 2,
}

export interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD
  mood: number // 1-5
  text: string
  tags: string[]
  createdAt: number
  updatedAt?: number
}

export interface WeeklyReflection {
  id: string
  weekId: string // YYYY-WW
  wins: string
  struggles: string
  improvements: string
  createdAt: number
  updatedAt?: number
}

export interface SleepLog {
  id: string
  date: string // YYYY-MM-DD (night start date)
  sleepStart: string // ISO datetime or HH:mm
  sleepEnd: string // ISO datetime or HH:mm
  totalHours: number
  sleepQuality: number // 1-5
  createdAt: number
  updatedAt?: number
}

export type MemoryType = "preference" | "pattern" | "goal" | "risk"

export interface Memory {
  id: string
  type: MemoryType
  key: string
  value: any
  strength: number // 0-1
  createdAt: number
  updatedAt: number
}

export type BurnoutRisk = "low" | "medium" | "high" | "critical"

export interface BurnoutState {
  score: number // 0-100
  risk: BurnoutRisk
  factors: string[]
  lastCalculated: number
}

export interface PlanItem {
  start: string // HH:mm
  end: string // HH:mm
  taskId?: string
  activity: string
  category?: string
  isDeepWork?: boolean
}

export interface PlanResult {
  timeline: PlanItem[]
  recommendations: string[]
}

export interface WeeklyPlan {
  id: string
  weekStartDate: string // YYYY-MM-DD
  focusGoals: string[]
  studyTargets: { category: string; hours: number }[]
  gateMapping: string
  aiSummary: string
  workloadPrediction: "light" | "medium" | "heavy"
  createdAt: number
}

export interface HabitSuggestion {
  id: string
  habitId?: string // if modifying existing task/habit
  type: "increase_difficulty" | "decrease_difficulty" | "new_habit" | "consistency_tip"
  message: string
  reason: string
  action?: {
    type: "update_task" | "create_task"
    data: any
  }
  createdAt: number
}

export interface SleepInsights {
  averageDuration: number
  sleepDebt: number // hours
  consistencyScore: number // 0-100
  chronotype: "morning_lark" | "night_owl" | "hummingbird" | "unknown"
  recommendation: string
  lastCalculated: number
}

// ============================================================================
// PHASE 6: ADAPTIVE INTELLIGENCE + MULTIMODAL OS TYPES
// ============================================================================

// 1. Adaptive AI Engine
export type AIMode = "coach" | "support" | "focus" | "insight" | "discipline"

export interface AdaptiveContext {
  streakHistory: number[]
  burnoutScore: number
  recentMoods: number[]
  sleepQuality: number[]
  weeklyPerformance: number
  lateNightUsage: boolean
  currentStreak: number
}

export interface ModeConfig {
  strictness: number // 0-100
  verbosity: number // 0-100
  encouragementLevel: number // 0-100
  prefix: string
  suffix: string
  systemPrompt: string
}

// 2. Voice AI
export interface VoiceSettings {
  enabled: boolean
  voiceIndex: number
  rate: number // 0.5-2
  pitch: number // 0-2
  volume: number // 0-1
}

export interface VoiceSession {
  id: string
  active: boolean
  recognition: any // SpeechRecognition instance
}

// 3. Music Engine
export interface MusicPlaylist {
  id: string
  name: string
  type: "lofi" | "synthwave" | "ambient" | "noise" | "nature"
  youtubeUrl: string
  embedId: string
  duration?: number
  thumbnail?: string
}

export interface MusicState {
  currentPlaylist: string | null
  volume: number
  syncWithTimer: boolean
  isPlaying: boolean
}

// 4. Retrospectives
export interface MonthlyRetrospective {
  id: string
  userId: string
  year: number
  month: number
  summary: string
  wins: string[]
  failures: string[]
  stagnations: string[]
  suggestions: string[]
  next30DayPlan: string
  habitRestructuring: HabitSuggestion[]
  metrics: {
    totalXP: number
    tasksCompleted: number
    avgSleepHours: number
    avgMood: number
    streakMaintained: boolean
    burnoutPeaks: number
  }
  createdAt: number
}

export interface QuarterlyRetrospective extends MonthlyRetrospective {
  quarter: number
  psychologicalInsights: string
  strengthsWeaknesses: { strengths: string[]; weaknesses: string[] }
  longTermTrajectory: string
  paradigmShifts: string[]
  lifeDirectionAnalysis: string
}

export type Retrospective = MonthlyRetrospective | QuarterlyRetrospective

// 5. Knowledge Graph
export type GraphNodeType = "habit" | "goal" | "task" | "project" | "skill" | "interest" | "topic"
export type GraphEdgeType = "dependency" | "related" | "prerequisite" | "enables"

export interface GraphNode {
  id: string
  type: GraphNodeType
  label: string
  strength: number // 0-100
  category?: string
  metadata: Record<string, any>
  createdAt: number
  lastUpdated: number
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  type: GraphEdgeType
  weight: number // 0-100
  createdAt: number
}

export interface KnowledgeGraph {
  userId: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  lastUpdated: number
  version: number
}

export interface GraphCluster {
  id: string
  nodes: string[] // node IDs
  label: string
  intensity: number // 0-100
}

export interface LearningPath {
  id: string
  name: string
  description: string
  nodes: string[] // ordered node IDs
  estimatedDuration: number // hours
  difficulty: "beginner" | "intermediate" | "advanced"
}

// 6. Multi-Device Presence
export type DeviceType = "mobile" | "desktop" | "tablet"

export interface PresenceState {
  userId: string
  active: boolean
  lastSeen: number
  device: DeviceType
  sessionId: string
}

export interface PresenceLog {
  date: string
  device: DeviceType
  totalTime: number // minutes
  activeTime: number // minutes
}

// 7. SmartFocus Engine (Flow State)
export interface FocusMetrics {
  typingSpeed: number
  taskSwitches: number
  idleTime: number
  deepWorkStreak: number
  sleepQuality: number
  timestamp: number
}

export interface FlowState {
  score: number // 0-100
  level: "deep" | "moderate" | "shallow" | "distracted"
  timestamp: number
  duration: number // seconds
}

export interface FocusLog {
  id: string
  date: string
  sessionId: string
  flowStates: FlowState[]
  avgScore: number
  peakTime: string // HH:mm
  totalFocusTime: number // minutes
}

export interface TimeWindow {
  start: string // HH:mm
  end: string // HH:mm
  predictedScore: number // 0-100
  confidence: number // 0-100
}

export interface FocusAlert {
  type: "drop" | "peak" | "recommendation"
  message: string
  timestamp: number
  action?: string
}

// 8. Enhanced Notifications
export type PredictiveNotificationType =
  | "productivity_window"
  | "burnout_risk"
  | "schedule_optimization"
  | "pattern_detected"
  | "knowledge_update"
  | "flow_alert"

export interface PredictiveNotification {
  id: string
  type: PredictiveNotificationType
  title: string
  message: string
  context: any
  priority: "low" | "medium" | "high"
  actionable: boolean
  action?: {
    label: string
    route: string
  }
  createdAt: number
  dismissed: boolean
}

