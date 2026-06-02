import { describe, it, expect } from 'vitest'
import { getCategoryLabel, HABIT_CATEGORIES } from '../BusinessLogic/factories/HabitFormFactory'

describe('HabitFormFactory — Design Pattern (Factory)', () => {

  it('getCategoryLabel mengembalikan label benar untuk value yang dikenal', () => {
    expect(getCategoryLabel('kesehatan')).toBe('Kesehatan')
    expect(getCategoryLabel('finansial')).toBe('Finansial')
    expect(getCategoryLabel('spiritual')).toBe('Spiritual')
  })

  it('getCategoryLabel mengembalikan value asli jika kategori tidak dikenal', () => {
    expect(getCategoryLabel('unknown_cat')).toBe('unknown_cat')
    expect(getCategoryLabel('')).toBe('')
  })

  it('HABIT_CATEGORIES memiliki 6 kategori standar', () => {
    const values = HABIT_CATEGORIES.map(c => c.value)
    expect(values).toContain('kesehatan')
    expect(values).toContain('ilmu_pengetahuan')
    expect(values).toContain('spiritual')
    expect(values).toContain('finansial')
    expect(values).toContain('personal')
    expect(values).toContain('lainnya')
    expect(HABIT_CATEGORIES).toHaveLength(6)
  })

  it('setiap kategori memiliki value dan label yang unik', () => {
    const values = new Set(HABIT_CATEGORIES.map(c => c.value))
    const labels = new Set(HABIT_CATEGORIES.map(c => c.label))
    expect(values.size).toBe(HABIT_CATEGORIES.length)
    expect(labels.size).toBe(HABIT_CATEGORIES.length)
  })

  it('[Tanpa Factory] hardcode manual rawan typo — Factory konsisten', () => {
    const typo      = 'Kesehatann'
    const fromFactory = getCategoryLabel('kesehatan')
    expect(typo).not.toBe(fromFactory)
    expect(fromFactory).toBe('Kesehatan')
  })

  it('getCategoryLabel bersifat pure — output sama untuk input yang sama', () => {
    expect(getCategoryLabel('personal')).toBe(getCategoryLabel('personal'))
  })

})

describe('HabitFormFactory — Performa', () => {

  it('getCategoryLabel 100.000 kali < 20ms', () => {
    const start = performance.now()
    for (let i = 0; i < 100_000; i++) getCategoryLabel('kesehatan')
    expect(performance.now() - start).toBeLessThan(20)
  })

})
