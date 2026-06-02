<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('visitor_logs', function (Blueprint $table) {
            // Tambah kolom baru setelah ip_address
            $table->string('session_id', 64)->nullable()->after('ip_address');
            $table->string('device_type', 20)->nullable()->after('session_id');
            $table->string('browser', 100)->nullable()->after('device_type');
            $table->string('browser_version', 20)->nullable()->after('browser');
            $table->string('os', 100)->nullable()->after('browser_version');
            $table->string('language', 20)->nullable()->after('os');

            // Hapus kolom yang tidak dipakai
            $table->dropColumn(['country', 'city', 'user_agent']);
        });
    }

    public function down(): void
    {
        Schema::table('visitor_logs', function (Blueprint $table) {
            $table->dropColumn(['session_id', 'device_type', 'browser', 'browser_version', 'os', 'language']);
            $table->string('user_agent')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
        });
    }
};
