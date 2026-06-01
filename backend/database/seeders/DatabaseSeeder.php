<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            ['username' => 'shofi', 'email' => 'shofi@example.com', 'full_name' => 'Shofi User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['username' => 'testuser', 'email' => 'test@example.com', 'full_name' => 'Test User',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['username' => 'user2', 'email' => 'user2@example.com', 'full_name' => 'User Dua',
             'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
        ]);
        // Post dibuat oleh user sendiri via fitur Upload Post
    }
}
