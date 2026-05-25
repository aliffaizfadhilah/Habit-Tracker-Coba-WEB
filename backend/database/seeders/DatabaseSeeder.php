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
            ['username' => 'faiq', 'email' => 'faiq@example.com', 'full_name' => 'Faiq User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['username' => 'testuser', 'email' => 'test@example.com', 'full_name' => 'Test User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
        ]);

        $start = Carbon::now()->subDays(3)->toDateString();
        $end   = Carbon::now()->addDays(27)->toDateString();

        // Habits untuk attach reminder
        DB::table('habits')->insert([
            ['username' => 'faiq', 'title' => 'Olahraga Pagi', 'category' => 'Kesehatan',
             'periode_start' => $start, 'periode_end' => $end, 'status' => 1,
             'progress_percent' => 10, 'current_streak' => 1, 'longest_streak' => 2,
             'reminder_enabled' => 0, 'reminder_time' => null,
             'created_at' => now(), 'updated_at' => now()],
            ['username' => 'faiq', 'title' => 'Membaca Quran', 'category' => 'Mental',
             'periode_start' => $start, 'periode_end' => $end, 'status' => 1,
             'progress_percent' => 10, 'current_streak' => 2, 'longest_streak' => 3,
             'reminder_enabled' => 1, 'reminder_time' => '06:00:00',
             'created_at' => now(), 'updated_at' => now()],
            ['username' => 'faiq', 'title' => 'Belajar Coding', 'category' => 'Produktivitas',
             'periode_start' => $start, 'periode_end' => $end, 'status' => 1,
             'progress_percent' => 10, 'current_streak' => 1, 'longest_streak' => 1,
             'reminder_enabled' => 0, 'reminder_time' => null,
             'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
