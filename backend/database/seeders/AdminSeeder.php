<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL',    'admin@habittracker.com');
        $username = env('ADMIN_USERNAME', 'admin');
        $password = env('ADMIN_PASSWORD', 'admin123');

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'username'  => $username,
                'full_name' => 'Administrator',
                'password'  => Hash::make($password),
                'salt'      => bin2hex(random_bytes(16)),
                'is_active' => true,
            ]
        );

        $role = Role::where('role_name', 'ADMIN')->first();
        if ($role && !$admin->roles()->where('role_id', $role->id)->exists()) {
            $admin->roles()->attach($role->id);
        }
    }
}
