# ZIP Anisa — Fitur 9 (Lock Checklist) + Fitur 10 (Laporan Final Habit)

## File yang menjadi tanggung jawab Anisa

### Backend
- `app/Services/Checklist/ChecklistService.php` ← bagian lock logic
- `app/Http/Controllers/StreakController.php` ← dependency laporan

### Frontend
- `src/Presentasion/components/HabitDetailModal.tsx` ← lock UI (🔒 setelah selesai)
- `src/Presentasion/components/HabitReportModal.tsx` ← laporan final
- `src/BusinessLogic/services/HabitReportPrototype.ts`

### ⚠️ File Conflict saat Merge
- `ChecklistService.php` → koordinasikan dengan Faizah (checklist) & Elma (auto-complete)
- `HabitDetailModal.tsx` → koordinasikan dengan Faizah (checklist UI)
- `Dashboard.tsx` → koordinasikan dengan Alip

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
| anisa@example.com | password123 |
| test@example.com | password123 |

## Seed data tersedia
- Habit **Yoga Pagi**: progress 100% → tampil ikon Lock ✓
- Habit **Belajar Bahasa**: periode expired → tampil Lock + status expired ✓
- Habit **Menulis Jurnal**: in-progress → bisa dilihat laporannya ✓

## Branch GitHub
`feature/anisa-lock-laporan`

## Koordinator
Hubungi **Alip** untuk pertanyaan seputar merge conflict.
