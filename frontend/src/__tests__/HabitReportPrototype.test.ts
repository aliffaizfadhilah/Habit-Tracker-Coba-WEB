import { describe, it, expect } from 'vitest'
import { HabitReport, createReport } from '../BusinessLogic/services/HabitReportPrototype'

describe('HabitReportPrototype — Design Pattern (Prototype)', () => {

  it('createReport(false) mengembalikan type ongoing', () => {
    expect(createReport(false).type).toBe('ongoing')
  })

  it('createReport(true) mengembalikan type final', () => {
    expect(createReport(true).type).toBe('final')
  })

  it('ongoing memiliki 5 sections yang benar', () => {
    const r = createReport(false)
    expect(r.sections).toEqual(['stats','progress_bar','day_analysis','calendar','streak_info'])
    expect(r.sections).toHaveLength(5)
  })

  it('final memiliki 7 sections termasuk badge dan summary_text', () => {
    const r = createReport(true)
    expect(r.sections).toEqual(['badge','summary_text','stats','progress_bar','day_analysis','calendar','streak_info'])
    expect(r.sections).toHaveLength(7)
    expect(r.sections).toContain('badge')
    expect(r.sections).toContain('summary_text')
  })

  it('clone() menghasilkan objek baru yang independen dari original', () => {
    const orig = new HabitReport()
    orig.sections = ['stats','progress_bar']
    const cloned = orig.clone()
    cloned.sections.push('calendar')
    expect(orig.sections).toHaveLength(2)
    expect(cloned.sections).toHaveLength(3)
  })

  it('dua panggilan createReport menghasilkan instance yang berbeda', () => {
    expect(createReport(false)).not.toBe(createReport(false))
  })

  it('modifikasi clone satu tidak mempengaruhi clone lain', () => {
    const r1 = createReport(true)
    const r2 = createReport(true)
    r1.sections = []
    expect(r2.sections).toHaveLength(7)
  })

  it('[Tanpa Prototype] spread manual lupa menyalin field type', () => {
    const proto = { type: 'final', sections: ['badge','stats'] }
    const manual = { sections: [...proto.sections] } // lupa type!
    expect((manual as any).type).toBeUndefined()

    // Dengan Prototype: clone() selalu lengkap
    expect(createReport(true).type).toBe('final')
  })

  it('clone() menyalin type dengan benar', () => {
    const r = new HabitReport()
    r.type = 'final'; r.sections = ['badge']
    expect(r.clone().type).toBe('final')
  })

})

describe('HabitReportPrototype — Performa', () => {

  it('membuat 10.000 clone < 50ms', () => {
    const start = performance.now()
    for (let i = 0; i < 10_000; i++) createReport(i % 2 === 0)
    expect(performance.now() - start).toBeLessThan(50)
  })

  it('prototype asli tidak berubah setelah 100 clone dimodifikasi', () => {
    Array.from({ length: 100 }, () => createReport(false)).forEach(c => (c.sections = []))
    expect(createReport(false).sections).toHaveLength(5)
  })

})
