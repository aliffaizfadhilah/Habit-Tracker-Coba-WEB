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
        DB::table('users')->insert([
            ['username' => 'faizah', 'email' => 'faizah@example.com', 'full_name' => 'Faizah User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['username' => 'testuser', 'email' => 'test@example.com', 'full_name' => 'Test User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
        ]);

        $start = Carbon::now()->subDays(7)->toDateString();
        $end   = Carbon::now()->addDays(23)->toDateString();

        DB::table('habits')->insert([
            ['username' => 'faizah', 'title' => 'Baca Buku', 'category' => 'Ilmu Pengetahuan',
             'periode_start' => $start, 'periode_end' => $end, 'status' => 1,
             'progress_percent' => 20, 'current_streak' => 2, 'longest_streak' => 2,
             'created_at' => now(), 'updated_at' => now()],
            ['username' => 'faizah', 'title' => 'Olahraga Pagi', 'category' => 'Kesehatan',
             'periode_start' => $start, 'periode_end' => $end, 'status' => 1,
             'progress_percent' => 30, 'current_streak' => 3, 'longest_streak' => 3,
             'created_at' => now(), 'updated_at' => now()],
            ['username' => 'faizah', 'title' => 'Jurnal Harian', 'category' => 'Mental',
             'periode_start' => $start, 'periode_end' => $end, 'status' => 1,
             'progress_percent' => 10, 'current_streak' => 1, 'longest_streak' => 2,
             'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
