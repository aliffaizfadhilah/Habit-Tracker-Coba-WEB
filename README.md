# ZIP Hibban — Fitur 1 (Tambah Habit) + Fitur 2 (Edit Habit)

## File yang menjadi tanggung jawab Hibban

### Backend
- `app/Http/Controllers/HabitController.php` ← method store(), update(), index(), show()
- `app/Services/Habit/HabitService.php`
- `app/Services/Habit/HabitFactory.php`
- `app/Http/Requests/HabitRequest.php`
- `app/Models/Habit.php`
- `database/migrations/2026_04_25_144534_create_habits_table.php`

### Frontend
- `src/Presentasion/pages/HabitPage.tsx`
- `src/BusinessLogic/hooks/useHabit.ts`
- `src/BusinessLogic/factories/HabitFormFactory.tsx`

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
| hibban@example.com | password123 |
| test@example.com | password123 |

## Branch GitHub
`feature/hibban-tambah-edit-habit`

## Koordinator
Hubungi **Alip** untuk pertanyaan seputar merge conflict.
