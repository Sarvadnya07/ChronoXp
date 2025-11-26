// IndexedDB wrapper for ChronoXP

import type { Task, DailyProgress, UserProfile, Notification, AppSettings, RoutineTemplate, XPLog } from "./types"

const DB_NAME = "ChronoXP"
const DB_VERSION = 4

interface DB {
  userProfile: UserProfile
  dailyProgress: DailyProgress
  tasks: Task
  notifications: Notification
  settings: AppSettings
  routines: RoutineTemplate
  xpLogs: XPLog
  memory: import("./types").Memory
}

class Database {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.db) return Promise.resolve()
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        this.initPromise = null
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // User Profile store
        if (!db.objectStoreNames.contains("userProfile")) {
          db.createObjectStore("userProfile", { keyPath: "id" })
        }

        // Daily Progress store
        if (!db.objectStoreNames.contains("dailyProgress")) {
          const progressStore = db.createObjectStore("dailyProgress", { keyPath: "date" })
          progressStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        // Tasks store
        if (!db.objectStoreNames.contains("tasks")) {
          const taskStore = db.createObjectStore("tasks", { keyPath: "id" })
          taskStore.createIndex("scheduledDate", "scheduledDate", { unique: false })
          taskStore.createIndex("category", "category", { unique: false })
        }

        // Notifications store
        if (!db.objectStoreNames.contains("notifications")) {
          db.createObjectStore("notifications", { keyPath: "id" })
        }

        // Settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" })
        }

        // Routines store
        if (!db.objectStoreNames.contains("routines")) {
          db.createObjectStore("routines", { keyPath: "id" })
        }

        // XP Logs store
        if (!db.objectStoreNames.contains("xpLogs")) {
          const xpStore = db.createObjectStore("xpLogs", { keyPath: "id" })
          xpStore.createIndex("date", "date", { unique: false })
          xpStore.createIndex("category", "category", { unique: false })
        }

        // Memory store
        if (!db.objectStoreNames.contains("memory")) {
          const memoryStore = db.createObjectStore("memory", { keyPath: "id" })
          memoryStore.createIndex("type", "type", { unique: false })
        }
      }
    })

    return this.initPromise
  }

  async get<K extends keyof DB>(storeName: K, key: string): Promise<DB[K] | undefined> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<K extends keyof DB>(storeName: K): Promise<DB[K][]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async put<K extends keyof DB>(storeName: K, data: DB[K]): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete<K extends keyof DB>(storeName: K, key: string): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear<K extends keyof DB>(storeName: K): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getDailyProgressRange(startDate: string, endDate: string): Promise<DailyProgress[]> {
    const allProgress = await this.getAll("dailyProgress")
    return allProgress.filter((p) => p.date >= startDate && p.date <= endDate)
  }
}

export const db = new Database()
