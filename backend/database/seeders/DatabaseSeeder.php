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
            ['username' => 'anisa', 'email' => 'anisa@example.com', 'full_name' => 'Anisa User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['username' => 'testuser', 'email' => 'test@example.com', 'full_name' => 'Test User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
        ]);

        $start7   = Carbon::now()->subDays(7)->toDateString();
        $end7     = Carbon::now()->addDays(7)->toDateString();
        $startExp = Carbon::now()->subDays(20)->toDateString();
        $endExp   = Carbon::now()->subDays(1)->toDateString();

        $h1 = DB::table('habits')->insertGetId([
            'username' => 'anisa', 'title' => 'Yoga Pagi', 'category' => 'Kesehatan',
            'periode_start' => $start7, 'periode_end' => $end7, 'status' => 1,
            'progress_percent' => 100, 'current_streak' => 7, 'longest_streak' => 7,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $h2 = DB::table('habits')->insertGetId([
            'username' => 'anisa', 'title' => 'Belajar Bahasa', 'category' => 'Ilmu Pengetahuan',
            'periode_start' => $startExp, 'periode_end' => $endExp, 'status' => 1,
            'progress_percent' => 60, 'current_streak' => 0, 'longest_streak' => 8,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $h3 = DB::table('habits')->insertGetId([
            'username' => 'anisa', 'title' => 'Menulis Jurnal', 'category' => 'Mental',
            'periode_start' => $start7, 'periode_end' => $end7, 'status' => 1,
            'progress_percent' => 43, 'current_streak' => 2, 'longest_streak' => 4,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // Activity logs untuk habit 1 (selesai 100%)
        $act1 = DB::table('habit_activities')->insertGetId(['id_habit' => $h1, 'title' => 'Yoga Pagi', 'created_at' => now(), 'updated_at' => now()]);
        for ($i = 6; $i >= 0; $i--) {
            DB::table('activity_logs')->insert(['id_activity' => $act1, 'date' => Carbon::now()->subDays($i)->toDateString(), 'status' => 1, 'created_at' => now(), 'updated_at' => now()]);
        }
        // Activity logs untuk habit 3
        $act3 = DB::table('habit_activities')->insertGetId(['id_habit' => $h3, 'title' => 'Menulis Jurnal', 'created_at' => now(), 'updated_at' => now()]);
        foreach ([3, 2, 1] as $daysAgo) {
            DB::table('activity_logs')->insert(['id_activity' => $act3, 'date' => Carbon::now()->subDays($daysAgo)->toDateString(), 'status' => 1, 'created_at' => now(), 'updated_at' => now()]);
        }
    }
}
