export const IN_APP_NOTIFICATION_EVENT = 'habittracker:inapp-notification'

class NotificationService {
  private static instance: NotificationService
  private audioCtx: AudioContext | null = null

  private constructor() {
    const warmUp = () => {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext()
      } else if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      document.removeEventListener('click', warmUp)
      document.removeEventListener('keydown', warmUp)
    }
    document.addEventListener('click', warmUp)
    document.addEventListener('keydown', warmUp)
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  private async playSound(): Promise<void> {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext()
      }
      const ctx = this.audioCtx
      if (ctx.state === 'suspended') await ctx.resume()

      const notes = [
        { freq: 784, start: 0,    duration: 0.15 },  // G5
        { freq: 988, start: 0.15, duration: 0.25 },  // B5
      ]

      for (const note of notes) {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)

        gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + note.start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.start + note.duration)

        osc.start(ctx.currentTime + note.start)
        osc.stop(ctx.currentTime + note.start + note.duration)
      }
    } catch {
      // Audio tidak tersedia di browser ini
    }
  }

  show(title: string, body: string): void {
    // Selalu kirim event untuk in-app toast
    window.dispatchEvent(
      new CustomEvent(IN_APP_NOTIFICATION_EVENT, { detail: { title, body } })
    )

    // Mainkan suara
    this.playSound()

    // Tampilkan browser notification saat tab tidak aktif/fokus
    if ('Notification' in window && Notification.permission === 'granted') {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'habit-reminder',
          renotify: true,
        })
        notif.onclick = () => {
          window.focus()
          notif.close()
        }
      }
    }
  }
}

export const notificationService = NotificationService.getInstance()
