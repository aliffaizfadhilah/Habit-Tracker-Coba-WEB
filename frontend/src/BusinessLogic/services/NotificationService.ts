export const IN_APP_NOTIFICATION_EVENT = 'habittracker:inapp-notification'

class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  get isSupported(): boolean {
    return 'Notification' in window
  }

  get isGranted(): boolean {
    return this.isSupported && Notification.permission === 'granted'
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  show(title: string, body: string): void {
    if (this.isGranted) {
      new Notification(title, { body, icon: '/favicon.ico' })
    } else {
      window.dispatchEvent(
        new CustomEvent(IN_APP_NOTIFICATION_EVENT, { detail: { title, body } })
      )
    }
  }
}

export const notificationService = NotificationService.getInstance()
