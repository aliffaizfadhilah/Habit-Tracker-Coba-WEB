interface CompletableHabit {
  total_completed_days: number
  total_period_days:    number
}

class HabitCompletionService {
  private static instance: HabitCompletionService

  private constructor() {}

  static getInstance(): HabitCompletionService {
    if (!HabitCompletionService.instance) {
      HabitCompletionService.instance = new HabitCompletionService()
    }
    return HabitCompletionService.instance
  }

  isComplete(habit: CompletableHabit): boolean {
    return habit.total_period_days > 0 && habit.total_completed_days >= habit.total_period_days
  }
}

export const habitCompletionService = HabitCompletionService.getInstance()
