import { DailyProgress, Task, XPLog } from "./types"

export function getWeeklyXP(xpLogs: XPLog[], days = 7) {
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Filter logs for this day
    const dayXP = xpLogs
      .filter(log => log.date === dateStr)
      .reduce((sum, log) => sum + log.xp, 0)

    result.push({ date: dateStr, xp: dayXP })
  }

  return result
}

export function getXPByCategory(xpLogs: XPLog[]) {
  const categoryMap: Record<string, number> = {}

  xpLogs.forEach(log => {
    categoryMap[log.category] = (categoryMap[log.category] || 0) + log.xp
  })

  return Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getCompletionStats(allProgress: DailyProgress[]) {
  // Today's completion is handled in the component via store

  // Weekly
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const last7Days = allProgress.filter(p => new Date(p.date) >= weekAgo)
  const weeklyCompletion = last7Days.length > 0
    ? last7Days.reduce((sum, p) => {
      const total = p.tasks.length
      if (total === 0) return sum
      return sum + (p.completedTasks / total)
    }, 0) / last7Days.length * 100
    : 0

  // Monthly
  const monthAgo = new Date(now)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const last30Days = allProgress.filter(p => new Date(p.date) >= monthAgo)
  const monthlyCompletion = last30Days.length > 0
    ? last30Days.reduce((sum, p) => {
      const total = p.tasks.length
      if (total === 0) return sum
      return sum + (p.completedTasks / total)
    }, 0) / last30Days.length * 100
    : 0

  const totalTasksCompleted = allProgress.reduce((sum, p) => sum + p.completedTasks, 0)

  return { weeklyCompletion, monthlyCompletion, totalTasksCompleted }
}

export function getProductivityInsights(allProgress: DailyProgress[]) {
  // Most productive day of week
  const dayCounts: Record<number, { total: number, completed: number }> = {}

  allProgress.forEach(p => {
    const day = new Date(p.date).getDay()
    if (!dayCounts[day]) dayCounts[day] = { total: 0, completed: 0 }

    dayCounts[day].total += p.tasks.length
    dayCounts[day].completed += p.completedTasks
  })

  let bestDay = 0
  let bestRate = -1
  let worstDay = 0
  let worstRate = 101

  Object.entries(dayCounts).forEach(([day, stats]) => {
    if (stats.total === 0) return
    const rate = stats.completed / stats.total
    if (rate > bestRate) {
      bestRate = rate
      bestDay = parseInt(day)
    }
    if (rate < worstRate) {
      worstRate = rate
      worstDay = parseInt(day)
    }
  })

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Most consistent block (category)
  const categoryStats: Record<string, { total: number, completed: number }> = {}

  allProgress.forEach(p => {
    p.tasks.forEach(t => {
      if (!categoryStats[t.category]) categoryStats[t.category] = { total: 0, completed: 0 }
      categoryStats[t.category].total++
      if (t.completed) categoryStats[t.category].completed++
    })
  })

  let bestCat = "None"
  let bestCatRate = -1
  let worstCat = "None"
  let worstCatRate = 101

  Object.entries(categoryStats).forEach(([cat, stats]) => {
    if (stats.total < 5) return // Ignore low sample size
    const rate = stats.completed / stats.total
    if (rate > bestCatRate) {
      bestCatRate = rate
      bestCat = cat
    }
    if (rate < worstCatRate) {
      worstCatRate = rate
      worstCat = cat
    }
  })

  return {
    mostProductiveDay: days[bestDay],
    leastProductiveDay: days[worstDay],
    mostConsistentBlock: bestCat,
    weakestBlock: worstCat
  }
}

export function getHeatmapData(allProgress: DailyProgress[], days = 90) {
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    const progress = allProgress.find(p => p.date === dateStr)
    let count = 0

    if (progress) {
      const rate = progress.tasks.length > 0 ? progress.completedTasks / progress.tasks.length : 0
      if (rate >= 0.8) count = 4
      else if (rate >= 0.6) count = 3
      else if (rate >= 0.4) count = 2
      else if (rate > 0) count = 1
    }

    result.push({ date: dateStr, count })
  }

  return result
}
