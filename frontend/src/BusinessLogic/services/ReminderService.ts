import { notificationService } from './NotificationService'

export interface ReminderHabit {
  id_habit:         number
  title:            string
  reminder_time:    string | null
  reminder_enabled: boolean
  periode_end:      string
  progress_percent: number
}

class ReminderService {
  private static instance: ReminderService
  private habits: ReminderHabit[] = []
  private intervalId: ReturnType<typeof setInterval> | null = null
  private firedKeys = new Set<string>()

  private constructor() {}

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService()
    }
    return ReminderService.instance
  }

  update(habits: ReminderHabit[]): void {
    this.habits = habits
  }

  start(): void {
    if (this.intervalId !== null) return
    this.intervalId = setInterval(() => this.checkReminders(), 60_000)
  }

  stop(): void {
    if (this.intervalId === null) return
    clearInterval(this.intervalId)
    this.intervalId = null
  }

  private checkReminders(): void {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const today = now.toISOString().slice(0, 10)

    for (const habit of this.habits) {
      if (!habit.reminder_enabled || !habit.reminder_time) continue
      if (habit.periode_end < today) continue
      if (Number(habit.progress_percent) >= 100) continue
      if (habit.reminder_time !== currentTime) continue

      const key = `${habit.id_habit}:${currentTime}:${today}`
      if (this.firedKeys.has(key)) continue

      this.firedKeys.add(key)
      notificationService.show(
        `Pengingat: ${habit.title}`,
        `Saatnya melakukan habit "${habit.title}"!`
      )
    }
  }
}

export const reminderService = ReminderService.getInstance()
