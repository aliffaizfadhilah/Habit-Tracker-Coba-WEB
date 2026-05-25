# ZIP Faiq — Fitur 11 (Set Reminder) + Fitur 12 (Notifikasi Otomatis)

## File yang menjadi tanggung jawab Faiq

### Backend
- `app/Http/Controllers/HabitController.php` ← method updateReminder()
- `app/Services/Reminder/ReminderService.php`
- `app/Services/Notification/NotificationService.php`
- `app/Models/Reminder.php`
- `app/Models/Notification.php`
- `database/migrations/2026_05_15_000001_add_reminder_to_habits_table.php`
- `database/migrations/2026_04_25_144536_create_notifications_table.php`

### Frontend
- `src/Presentasion/pages/Reminder.tsx`
- `src/BusinessLogic/hooks/useReminder.ts`
- `src/BusinessLogic/services/ReminderService.ts`
- `src/Presentasion/components/InAppNotification.tsx` ← notifikasi in-app
- `src/BusinessLogic/services/NotificationService.ts`

### ⚠️ Catatan
- Reminder disimpan sebagai field di tabel `habits` (reminder_time, reminder_enabled)
- Notifikasi Otomatis (Fitur 12) berjalan via InAppNotification component yang sudah mount di App.tsx

## Cara menjalankan
```bash
cp backend/.env.example backend/.env
docker compose up --build
docker compose exec php php artisan migrate --seed
# Buka: http://localhost:5173/reminder
```

## Akun test
| Email | Password |
|-------|----------|
| faiq@example.com | password123 |
| test@example.com | password123 |

## Seed data tersedia
- 3 habits sudah tersedia untuk dicoba set reminder-nya
- 1 habit sudah memiliki reminder aktif (Membaca Quran — 06:00)

## Branch GitHub
`feature/faiq-reminder-notifikasi`

## Koordinator
Hubungi **Alip** untuk pertanyaan seputar merge conflict.
