import { describe, it, expect } from 'vitest'
import { habitCompletionService } from '../BusinessLogic/services/HabitCompletionService'

interface MockHabit {
  total_completed_days: number
  total_period_days:    number
  periode_end:          string
}

function makeHabit(overrides: Partial<MockHabit> = {}): MockHabit {
  return { total_completed_days: 0, total_period_days: 10, periode_end: '2099-12-31', ...overrides }
}

describe('SectionFactory (via HabitCompletionService) — Design Pattern (Factory)', () => {

  it('isComplete = true jika completedDays >= periodDays', () => {
    expect(habitCompletionService.isComplete(makeHabit({ total_completed_days: 10 }))).toBe(true)
  })

  it('isComplete = true jika completedDays melebihi periodDays', () => {
    expect(habitCompletionService.isComplete(makeHabit({ total_completed_days: 15 }))).toBe(true)
  })

  it('isComplete = false jika completedDays < periodDays', () => {
    expect(habitCompletionService.isComplete(makeHabit({ total_completed_days: 5 }))).toBe(false)
  })

  it('isComplete = false jika periodDays = 0', () => {
    expect(habitCompletionService.isComplete(makeHabit({ total_completed_days: 0, total_period_days: 0 }))).toBe(false)
  })

  it('isExpired = true jika periode_end lewat dan belum selesai', () => {
    const habit = makeHabit({ total_completed_days: 3, periode_end: '2020-01-01' })
    const today = new Date().toISOString().slice(0, 10)
    const isExpired = !habitCompletionService.isComplete(habit) && habit.periode_end < today
    expect(isExpired).toBe(true)
  })

  it('isExpired = false jika habit sudah selesai meski periode lewat', () => {
    const habit = makeHabit({ total_completed_days: 10, periode_end: '2020-01-01' })
    const today = new Date().toISOString().slice(0, 10)
    const isExpired = !habitCompletionService.isComplete(habit) && habit.periode_end < today
    expect(isExpired).toBe(false)
  })

  it('isLocked = false untuk habit aktif yang belum selesai', () => {
    const habit = makeHabit({ total_completed_days: 5 })
    const today = new Date().toISOString().slice(0, 10)
    const isComplete = habitCompletionService.isComplete(habit)
    const isExpired  = !isComplete && habit.periode_end < today
    expect(isComplete || isExpired).toBe(false)
  })

  it('habitCompletionService adalah Singleton yang konsisten', async () => {
    const { habitCompletionService: s2 } = await import('../BusinessLogic/services/HabitCompletionService')
    expect(habitCompletionService).toBe(s2)
  })

  it('[Tanpa Factory] logika >= vs > berbeda — Factory mencegah bug ini', () => {
    const habit = makeHabit({ total_completed_days: 10 })
    const buggyCheck  = habit.total_completed_days > habit.total_period_days  // > salah → false
    const correctCheck = habitCompletionService.isComplete(habit)              // >= benar → true
    expect(buggyCheck).toBe(false)
    expect(correctCheck).toBe(true)
  })

})

describe('SectionFactory — Performa', () => {

  it('isComplete 1.000.000 kali < 100ms', () => {
    const habit = makeHabit({ total_completed_days: 7 })
    const start = performance.now()
    for (let i = 0; i < 1_000_000; i++) habitCompletionService.isComplete(habit)
    expect(performance.now() - start).toBeLessThan(100)
  })

})
