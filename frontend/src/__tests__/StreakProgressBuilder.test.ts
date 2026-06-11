import { describe, it, expect } from 'vitest'
import { StreakProgressBuilder, HabitLog } from '../BusinessLogic/builders/StreakProgressBuilder'

function makeLogs(dates: string[]): HabitLog[] {
  return dates.map(date => ({ date, status: true }))
}

describe('StreakProgressBuilder — Design Pattern (Builder)', () => {

  it('build() mengembalikan StreakResult dengan semua field', () => {
    const result = new StreakProgressBuilder()
      .loadLogs([])
      .setPeriod('2025-01-01', '2025-01-30')
      .calculateCurrentStreak()
      .calculateLongestStreak()
      .calculateProgress()
      .build()
    expect(result).toHaveProperty('currentStreak')
    expect(result).toHaveProperty('longestStreak')
    expect(result).toHaveProperty('progressPercent')
    expect(result).toHaveProperty('totalPeriodDays')
    expect(result).toHaveProperty('totalCompletedDays')
  })

  it('currentStreak = 0 jika tidak ada log', () => {
    const result = new StreakProgressBuilder()
      .loadLogs([]).setPeriod('2025-01-01', '2025-01-30')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(0)
  })

  it('longestStreak = 3 untuk log 3 hari berturutan lalu putus', () => {
    const logs = makeLogs(['2025-01-01','2025-01-02','2025-01-03','2025-01-05'])
    const result = new StreakProgressBuilder()
      .loadLogs(logs).setPeriod('2025-01-01','2025-01-10')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(result.longestStreak).toBe(3)
  })

  it('progressPercent tidak melebihi 100', () => {
    const logs = makeLogs(['2025-01-01','2025-01-02','2025-01-03','2025-01-04','2025-01-05','2025-01-06','2025-01-07'])
    const result = new StreakProgressBuilder()
      .loadLogs(logs).setPeriod('2025-01-01','2025-01-05')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(result.progressPercent).toBeLessThanOrEqual(100)
  })

  it('setPeriod menghitung totalPeriodDays = 10 untuk 10 hari', () => {
    const result = new StreakProgressBuilder()
      .loadLogs([]).setPeriod('2025-01-01','2025-01-10')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(result.totalPeriodDays).toBe(10)
  })

  it('log duplikat tidak dihitung dua kali', () => {
    const logs: HabitLog[] = [
      { date: '2025-01-01', status: true },
      { date: '2025-01-01', status: true },
      { date: '2025-01-02', status: true },
    ]
    const result = new StreakProgressBuilder()
      .loadLogs(logs).setPeriod('2025-01-01','2025-01-10')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(result.totalCompletedDays).toBe(2)
  })

  it('log dengan status false tidak dihitung', () => {
    const logs: HabitLog[] = [
      { date: '2025-01-01', status: false },
      { date: '2025-01-02', status: true },
    ]
    const result = new StreakProgressBuilder()
      .loadLogs(logs).setPeriod('2025-01-01','2025-01-10')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(result.totalCompletedDays).toBe(1)
  })

  it('method chaining mengembalikan instance yang sama (this)', () => {
    const b = new StreakProgressBuilder()
    expect(b.loadLogs([])).toBe(b)
    expect(b.setPeriod('2025-01-01','2025-01-10')).toBe(b)
    expect(b.calculateCurrentStreak()).toBe(b)
    expect(b.calculateLongestStreak()).toBe(b)
    expect(b.calculateProgress()).toBe(b)
  })

  it('progressPercent = 0 jika periodDays belum di-set', () => {
    const result = new StreakProgressBuilder()
      .loadLogs(makeLogs(['2025-01-01']))
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(result.progressPercent).toBe(0)
  })

  it('[Tanpa Builder] kalkulasi manual inline identik dengan Builder', () => {
    const logs: HabitLog[] = [
      { date: '2025-01-01', status: true },
      { date: '2025-01-02', status: true },
      { date: '2025-01-03', status: true },
    ]
    const completedDays = logs.filter(l => l.status).length
    const periodDays    = 10
    const progress      = Math.min(100, Math.round((completedDays / periodDays) * 10000) / 100)

    const result = new StreakProgressBuilder()
      .loadLogs(logs).setPeriod('2025-01-01','2025-01-10')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()

    expect(result.totalCompletedDays).toBe(completedDays)
    expect(result.progressPercent).toBe(progress)
  })

})

describe('StreakProgressBuilder — Performa', () => {

  it('memproses 365 log dalam waktu < 50ms', () => {
    const logs: HabitLog[] = Array.from({ length: 365 }, (_, i) => {
      const d = new Date('2025-01-01')
      d.setDate(d.getDate() + i)
      return { date: d.toISOString().slice(0, 10), status: true }
    })
    const start = performance.now()
    new StreakProgressBuilder()
      .loadLogs(logs).setPeriod('2025-01-01','2025-12-31')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(performance.now() - start).toBeLessThan(50)
  })

  it('dua instance Builder terisolasi — tidak saling bocor', () => {
    const r1 = new StreakProgressBuilder()
      .loadLogs(makeLogs(['2025-01-01','2025-01-02']))
      .setPeriod('2025-01-01','2025-01-10')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    const r2 = new StreakProgressBuilder()
      .loadLogs([]).setPeriod('2025-01-01','2025-01-10')
      .calculateCurrentStreak().calculateLongestStreak().calculateProgress().build()
    expect(r1.totalCompletedDays).toBe(2)
    expect(r2.totalCompletedDays).toBe(0)
  })

})
