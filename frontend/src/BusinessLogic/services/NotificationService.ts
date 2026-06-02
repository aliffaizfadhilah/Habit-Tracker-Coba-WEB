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

  show(title: string, body: string): void {
    window.dispatchEvent(
      new CustomEvent(IN_APP_NOTIFICATION_EVENT, { detail: { title, body } })
    )
  }
}

export const notificationService = NotificationService.getInstance()
