<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class RoleSeeder extends Seeder {
    public function run(): void {
        DB::table('roles')->insertOrIgnore([
            ['role_name' => 'ADMIN', 'description' => 'Administrator Penuh'],
            ['role_name' => 'USER', 'description' => 'Pengguna Biasa'],
        ]);
    }
}
