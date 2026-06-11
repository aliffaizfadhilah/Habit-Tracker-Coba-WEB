
export interface HabitLog {
  date: string   // format 'YYYY-MM-DD'
  status: boolean
}

export interface StreakResult {
  currentStreak:    number
  longestStreak:    number
  progressPercent:  number
  totalPeriodDays:  number
  totalCompletedDays: number
}

export class StreakProgressBuilder {
  private logDates:      string[] = []
  private periodDays:    number   = 0
  private completedDays: number   = 0

  private currentStreak:   number = 0
  private longestStreak:   number = 0
  private progressPercent: number = 0

  loadLogs(logs: HabitLog[]): this {
    this.logDates = logs
      .filter(log => log.status)
      .map(log => log.date)
      .filter((date, i, arr) => arr.indexOf(date) === i) // unique
      .sort()

    this.completedDays = this.logDates.length
    return this
  }

  setPeriod(startDate: string, endDate: string): this {
    const start = new Date(startDate)
    const end   = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    this.periodDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return this
  }

calculateCurrentStreak(): this {
  if (this.logDates.length === 0) {
    this.currentStreak = 0
    return this
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  let streak = 0
  const checkDate = new Date()

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${pad(checkDate.getMonth() + 1)}-${pad(checkDate.getDate())}` // ✅

    if (this.logDates.includes(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  this.currentStreak = streak
  return this
}

  calculateLongestStreak(): this {
    if (this.logDates.length === 0) {
      this.longestStreak = 0
      return this
    }

    let longest = 1
    let current = 1

    for (let i = 1; i < this.logDates.length; i++) {
      const prev = new Date(this.logDates[i - 1])
      const curr = new Date(this.logDates[i])
      const diff = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diff === 1) {
        current++
        longest = Math.max(longest, current)
      } else {
        current = 1
      }
    }

    this.longestStreak = Math.max(longest, this.currentStreak)
    return this
  }

  calculateProgress(): this {
    if (this.periodDays <= 0) {
      this.progressPercent = 0
      return this
    }

    const raw = (this.completedDays / this.periodDays) * 100
    this.progressPercent = Math.min(100, Math.round(raw * 100) / 100)
    return this
  }

  build(): StreakResult {
    return {
      currentStreak:     this.currentStreak,
      longestStreak:     this.longestStreak,
      progressPercent:   this.progressPercent,
      totalPeriodDays:   this.periodDays,
      totalCompletedDays: this.completedDays,
    }
  }
}