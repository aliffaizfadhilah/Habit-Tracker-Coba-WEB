import { http } from './HttpService';

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  tags: string | null;
  pinned: boolean;
  reminder: string | null;
  reminder_alerted: boolean;
  created_at: string;
}

class ReminderService {
  private static instance: ReminderService;
  private notes: Note[] = [];
  private pollInterval: number | null = null;
  private listeners: ((notes: Note[]) => void)[] = [];

  private constructor() {
    // Jalankan permintaan izin notifikasi saat pertama kali diakses
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  // ─── Manajemen Listener ───
  public subscribe(listener: (notes: Note[]) => void) {
    this.listeners.push(listener);
    // Kirim data saat ini secara instan (cache-first)
    listener([...this.notes]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.notes]));
  }

  // ─── Core Logic ───
  public async startPolling() {
    if (this.pollInterval) return;

    // Hanya fetch jika data masih kosong untuk mempercepat render awal
    if (this.notes.length === 0) {
      await this.fetchNotes();
    }

    this.pollInterval = window.setInterval(async () => {
      try {
        const data = await http.get<any>('/api/poll-reminders');
        if (data.status === 'success' && data.data.has_reminders) {
          data.data.reminders.forEach((reminder: Note) => {
            this.showNotification(reminder);
          });
          // Refresh data setelah ada reminder yang dipicu
          await this.fetchNotes();
        }
      } catch (error) {
        console.error('ReminderService Polling Error:', error);
      }
    }, 30000); // 30 detik
  }

  public stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  public async fetchNotes() {
    try {
      const data = await http.get<any>('/api/notes');
      if (data.status === 'success') {
        this.notes = data.data;
        this.notify();
      }
    } catch (error) {
      console.error('ReminderService Fetch Error:', error);
    }
  }

  private showNotification(reminder: Note) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`⏰ Reminder: ${reminder.title}`, {
        body: reminder.content,
        icon: '/favicon.ico'
      });
    } else {
      alert(`⏰ Reminder: ${reminder.title}\n${reminder.content}`);
    }
  }

  // ─── CRUD Bridge (Opsional agar terpusat) ───
  public async addNote(noteData: any) {
    const res = await http.post<any>('/api/notes', noteData);
    if (res.status === 'success') {
      await this.fetchNotes();
    }
    return res;
  }

  public async updateNote(id: number, fields: any) {
    const res = await http.put<any>(`/api/notes/${id}`, fields);
    if (res.status === 'success') {
      await this.fetchNotes();
    }
    return res;
  }

  public async deleteNote(id: number) {
    const res = await http.delete<any>(`/api/notes/${id}`);
    if (res.status === 'success') {
      await this.fetchNotes();
    }
    return res;
  }
}

export const reminderService = ReminderService.getInstance();
