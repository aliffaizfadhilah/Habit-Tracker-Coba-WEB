# ZIP Elma — Fitur 7 (Login & Sign Up) + Fitur 8 (Auto Complete)

## File yang menjadi tanggung jawab Elma

### Backend
- `app/Http/Controllers/Auth/AuthController.php`
- `app/Services/Auth/AuthService.php`
- `app/Services/Auth/OtpService.php`
- `app/Http/Requests/Auth/*.php`
- `app/Services/Checklist/ChecklistService.php` ← bagian auto-complete logic
- `app/Services/Streak/StreakBuilder.php` ← dependency auto-complete

### Frontend
- `src/Presentasion/pages/auth/Login.tsx`
- `src/Presentasion/pages/auth/Register.tsx`
- `src/Presentasion/pages/auth/ForgotPassword.tsx`
- `src/Presentasion/components/auth/AuthLayout.tsx`
- `src/Presentasion/components/auth/OtpInputGroup.tsx`
- `src/Presentasion/components/auth/PasswordStrengthBar.tsx`
- `src/BusinessLogic/hooks/useLogin.ts`
- `src/BusinessLogic/hooks/useRegister.ts`
- `src/BusinessLogic/hooks/useForgotPassword.ts`
- `src/BusinessLogic/services/HabitCompletionService.ts` ← auto-complete logic
- `src/BusinessLogic/context/AuthContext.tsx`

## Cara menjalankan

```bash
# 1. Copy .env.example menjadi .env
cp backend/.env.example backend/.env

# 2. Generate app key + JWT secret
# (Dilakukan otomatis saat docker compose up — lihat di backend/bootstrap/app.php)

# 3. Jalankan project
docker compose up --build

# 4. Jalankan migrasi + seeder (di terminal lain)
docker compose exec php php artisan migrate --seed

# 5. Buka browser
# http://localhost:5173
```

## Akun test
| Email | Password |
|-------|----------|
| elma@example.com | password123 |
| test@example.com | password123 |

## Branch GitHub
`feature/elma-auth-autocomplete`

## Koordinator
Hubungi **Alip** untuk pertanyaan seputar merge conflict.

## Catatan fitur
- **Fitur 7 (Auth):** Login, Register, Forgot Password sudah tersedia
- **Fitur 8 (Auto Complete):** Habit dengan progress 100% atau periode berakhir
  akan otomatis terkunci (tampil ikon 🔒 di Dashboard)
- Seed data sudah berisi 3 habit contoh: 1 expired, 1 complete (100%), 1 in-progress
