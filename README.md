# ZIP Faizah — Fitur 3 (Hapus Habit) + Fitur 4 (Checklist Harian)

## File yang menjadi tanggung jawab Faizah

### Backend
- `app/Http/Controllers/HabitController.php` ← method destroy()
- `app/Http/Controllers/ActivityLogController.php` ← checkToday(), checklistHistory()
- `app/Http/Controllers/HabitEventController.php` ← stream SSE
- `app/Services/Checklist/ChecklistService.php` ← toggleToday(), getCheckedDates()
- `app/Services/Checklist/HabitPrototype.php`

### Frontend
- `src/Presentasion/pages/Dashboard.tsx` ← tampilan checklist harian
- `src/Presentasion/components/HabitDetailModal.tsx` ← kalender checklist
- `src/BusinessLogic/hooks/useHabitRealtime.ts` ← real-time updates
- `src/BusinessLogic/hooks/useDashboard.ts`

### ⚠️ File Conflict saat Merge
- `ChecklistService.php` → koordinasikan dengan Elma (auto-complete) & Anisa (lock)
- `HabitDetailModal.tsx` → koordinasikan dengan Anisa (lock UI)
- `Dashboard.tsx` → koordinasikan dengan Alip (streak section)

## Cara menjalankan
```bash
cp backend/.env.example backend/.env
docker compose up --build
docker compose exec php php artisan migrate --seed
# Buka: http://localhost:5173
```

## Akun test
| Email | Password |
|-------|----------|
| faizah@example.com | password123 |
| test@example.com | password123 |

## Branch GitHub
`feature/faizah-hapus-checklist`

## Koordinator
Hubungi **Alip** untuk pertanyaan seputar merge conflict.
