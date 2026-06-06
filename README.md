# Habit Tracker

Aplikasi web untuk tracking kebiasaan harian, dilengkapi fitur sosial (postingan), reminder, streak, dan dashboard progress.

**Stack:** React + TypeScript (Frontend) · Laravel + PHP (Backend) · MySQL 8 · Docker

---

## Prasyarat

Pastikan sudah terinstall di laptopmu:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (sudah include Docker Compose)
- Git

---

## Cara Menjalankan

### 1. Clone repository

```bash
git clone <url-repo>
cd habit-tracker1
```

### 2. Buat file `.env`

```bash
cp backend/.env.example backend/.env
```

Lalu buka `backend/.env` dan isi variabel berikut:

| Variabel | Keterangan |
|---|---|
| `APP_KEY` | Generate dengan `php artisan key:generate` atau biarkan kosong, akan di-generate otomatis |
| `JWT_SECRET` | Generate dengan `php artisan jwt:secret` atau isi string acak panjang |
| `MAIL_USERNAME` | Email Gmail untuk kirim OTP |
| `MAIL_PASSWORD` | App Password Gmail (bukan password biasa) |
| `MAIL_FROM_ADDRESS` | Sama dengan `MAIL_USERNAME` |
| `GOOGLE_CLIENT_ID` | Dari Google Cloud Console (opsional, untuk login Google) |
| `GOOGLE_CLIENT_SECRET` | Dari Google Cloud Console (opsional) |

> Variabel lain seperti `DB_HOST`, `DB_DATABASE`, dll sudah terisi default dan langsung bisa dipakai.

### 3. Jalankan Docker

```bash
docker compose up --build
```

Proses pertama kali akan memakan waktu beberapa menit untuk build image.

### 4. Jalankan migrasi database

Buka terminal **baru** (biarkan terminal Docker tetap berjalan), lalu:

```bash
docker compose exec php php artisan migrate --seed
```

### 5. Buka di browser

```
http://localhost:5173
```

---

## Akun Default (dari Seeder)

| Role | Email | Password |
|---|---|---|
| Admin | admin@habittracker.com | password123 |
| User | user@habittracker.com | password123 |

> Panel admin tersedia di `http://localhost:5173/admin`

---

## Akses dari Device / Laptop Lain (Satu Jaringan)

Jika ingin anggota lain mengakses server yang sudah berjalan di laptopmu:

**1. Cari IP lokal laptopmu:**
```bash
# Linux/Mac
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows (PowerShell)
ipconfig
```

**2. Izinkan port di firewall (Windows):**
```powershell
# Jalankan PowerShell sebagai Administrator
netsh advfirewall firewall add rule name="HabitTracker" dir=in action=allow protocol=TCP localport=5173
```

**3. Anggota lain buka browser:**
```
http://<IP_laptopmu>:5173
```

> Mereka perlu **register akun baru** karena database ada di laptopmu. Data (termasuk foto postingan) sepenuhnya tersimpan di servermu.

---

## Perintah Berguna

```bash
# Menjalankan ulang tanpa rebuild
docker compose up

# Stop semua container
docker compose down

# Reset database (hapus semua data lalu migrate ulang)
docker compose exec php php artisan migrate:fresh --seed

# Melihat log backend
docker compose logs php -f

# Masuk ke shell container backend
docker compose exec php bash
```

---

## Struktur Proyek

```
habit-tracker1/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── BusinessLogic/   # Hooks, services, context
│       └── Presentasion/    # Pages & components
├── backend/           # Laravel (PHP)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   └── routes/api.php
├── nginx/             # Konfigurasi web server
├── docker-compose.yml
└── README.md
```

---

## Fitur Aplikasi

| Fitur | Keterangan |
|---|---|
| Auth | Register, Login, Forgot Password via OTP email |
| Habit | Buat, edit, hapus habit dengan periode dan kategori |
| Dashboard | Progress mingguan, streak, insight otomatis |
| Reminder | Notifikasi pengingat per habit |
| Postingan | Bagikan progress habit sebagai postingan publik |
| Profil | Edit profil, ganti password |
| Admin | Kelola user, postingan, laporan, data pengunjung |

---

## Troubleshooting

**Port 5173 sudah dipakai:**
```bash
# Ganti port di docker-compose.yml bagian frontend:
ports:
  - "3000:80"   # ganti 5173 ke port lain
```

**Migrasi gagal / error database:**
```bash
# Pastikan container mysql sudah running dulu
docker compose ps
# Tunggu status mysql jadi "healthy" baru jalankan migrate
```

**Email OTP tidak terkirim:**
- Pastikan `MAIL_USERNAME` dan `MAIL_PASSWORD` sudah diisi di `.env`
- Gunakan **App Password** Gmail, bukan password akun biasa
- Aktifkan 2FA di akun Gmail terlebih dahulu sebelum generate App Password
