<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ──
        DB::table('users')->insert([
            ['username' => 'elma', 'email' => 'elma@example.com', 'full_name' => 'Elma User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['username' => 'testuser', 'email' => 'test@example.com', 'full_name' => 'Test User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── Habits (untuk demo Auto Complete & Lock) ──
        $start30 = Carbon::now()->subDays(30)->toDateString();
        $end30   = Carbon::now()->subDays(1)->toDateString();   // Periode sudah selesai (expired)
        $start10 = Carbon::now()->subDays(10)->toDateString();
        $end10   = Carbon::now()->addDays(20)->toDateString();  // Periode sedang berjalan
        $start7  = Carbon::now()->subDays(7)->toDateString();
        $end7    = Carbon::now()->addDays(7)->toDateString();

        DB::table('habits')->insert([
            // Habit 1: Periode berakhir (expired → auto-lock)
            ['username' => 'elma', 'title' => 'Baca Buku 30 Hari', 'category' => 'Ilmu Pengetahuan',
             'periode_start' => $start30, 'periode_end' => $end30, 'status' => 1,
             'progress_percent' => 70, 'current_streak' => 0, 'longest_streak' => 5,
             'created_at' => now(), 'updated_at' => now()],
            // Habit 2: Progress 100% (auto-complete → locked)
            ['username' => 'elma', 'title' => 'Olahraga 7 Hari', 'category' => 'Kesehatan',
             'periode_start' => $start7, 'periode_end' => $end7, 'status' => 1,
             'progress_percent' => 100, 'current_streak' => 7, 'longest_streak' => 7,
             'created_at' => now(), 'updated_at' => now()],
            // Habit 3: Masih berjalan normal
            ['username' => 'elma', 'title' => 'Meditasi Harian', 'category' => 'Mental',
             'periode_start' => $start10, 'periode_end' => $end10, 'status' => 1,
             'progress_percent' => 40, 'current_streak' => 3, 'longest_streak' => 4,
             'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
