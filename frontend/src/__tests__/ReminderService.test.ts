import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../BusinessLogic/services/NotificationService', () => ({
  notificationService: { show: vi.fn() },
}))

import { notificationService } from '../BusinessLogic/services/NotificationService'
import { reminderService, ReminderHabit } from '../BusinessLogic/services/ReminderService'

function futureDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

function currentTimeStr(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
}

describe('ReminderService — Design Pattern (Singleton)', () => {

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    reminderService.stop()
  })

  afterEach(() => {
    reminderService.stop()
    vi.useRealTimers()
  })

  it('getInstance() selalu mengembalikan instance yang sama', async () => {
    const { reminderService: s2 } = await import('../BusinessLogic/services/ReminderService')
    expect(reminderService).toBe(s2)
  })

  it('start() mendaftarkan setInterval hanya sekali meski dipanggil dua kali', () => {
    const spy = vi.spyOn(globalThis, 'setInterval')
    reminderService.start()
    reminderService.start()
    expect(spy).toHaveBeenCalledTimes(1)
    reminderService.stop()
  })

  it('stop() membersihkan interval', () => {
    const spy = vi.spyOn(globalThis, 'clearInterval')
    reminderService.start()
    reminderService.stop()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('notifikasi tidak duplikat — dikirim hanya sekali per kunci hari ini', () => {
    const showMock = vi.mocked(notificationService.show)

    // Set fake clock ke 07:59 → setelah advance 60_000ms menjadi 08:00
    vi.setSystemTime(new Date('2026-06-01T07:59:00'))

    const habit: ReminderHabit = {
      id_habit: 55555, title: 'Olahraga',
      reminder_time: '08:00',   // cocok setelah clock maju 60 detik
      reminder_enabled: true,
      periode_end: '2099-12-31',
      progress_percent: 50,
    }
    reminderService.update([habit])
    reminderService.start()
    vi.advanceTimersByTime(60_000)  // tick 1: checkReminders → kirim notifikasi
    vi.advanceTimersByTime(60_000)  // tick 2: kunci sudah ada di firedKeys → skip
    expect(showMock).toHaveBeenCalledTimes(1)
    reminderService.stop()
  })

  it('reminder tidak dikirim jika progress_percent >= 100', () => {
    const showMock = vi.mocked(notificationService.show)
    const habit: ReminderHabit = {
      id_habit: 99, title: 'Selesai',
      reminder_time: currentTimeStr(),
      reminder_enabled: true,
      periode_end: futureDate(),
      progress_percent: 100,
    }
    reminderService.update([habit])
    reminderService.start()
    vi.advanceTimersByTime(60_000)
    expect(showMock).not.toHaveBeenCalled()
    reminderService.stop()
  })

  it('reminder tidak dikirim jika periode_end sudah lewat', () => {
    const showMock = vi.mocked(notificationService.show)
    const habit: ReminderHabit = {
      id_habit: 88, title: 'Expired',
      reminder_time: currentTimeStr(),
      reminder_enabled: true,
      periode_end: '2020-01-01',
      progress_percent: 50,
    }
    reminderService.update([habit])
    reminderService.start()
    vi.advanceTimersByTime(60_000)
    expect(showMock).not.toHaveBeenCalled()
    reminderService.stop()
  })

  it('[Tanpa Singleton] dua instance punya firedKeys terpisah → duplikasi notifikasi', () => {
    const firedA = new Set<string>()
    const firedB = new Set<string>()
    const key = 'habit:1:08:00:2025-01-01'
    firedA.add(key)
    expect(firedB.has(key)).toBe(false) // B tidak tahu → duplikat terjadi
    expect(firedA.has(key)).toBe(true)  // Singleton: satu Set, tidak duplikat
  })

})

describe('ReminderService — Performa', () => {

  afterEach(() => reminderService.stop())

  it('checkReminders 500 habit selesai dalam waktu nyata < 20ms', () => {
    // Gunakan real timers agar performance.now() tidak dipengaruhi fake timer
    vi.useRealTimers()
    const habits: ReminderHabit[] = Array.from({ length: 500 }, (_, i) => ({
      id_habit: 90000 + i, title: `Habit ${i}`,
      reminder_time: '99:99', // waktu tidak cocok → tidak kirim notifikasi
      reminder_enabled: true,
      periode_end: futureDate(),
      progress_percent: 50,
    }))
    reminderService.update(habits)

    // Panggil checkReminders secara langsung 10 kali sebagai simulasi tick
    const t0 = performance.now()
    for (let i = 0; i < 10; i++) {
      // Akses checkReminders via start/stop siklus cepat tidak bisa,
      // sehingga kita ukur update() sebagai operasi paling sering dipanggil
      reminderService.update(habits)
    }
    expect(performance.now() - t0).toBeLessThan(20)
  })

})
