<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('visitor_logs', function (Blueprint $table) {
            $table->string('country', 100)->nullable()->after('ip_address');
            $table->string('city', 100)->nullable()->after('country');
        });
    }

    public function down(): void
    {
        Schema::table('visitor_logs', function (Blueprint $table) {
            $table->dropColumn(['country', 'city']);
        });
    }
};
