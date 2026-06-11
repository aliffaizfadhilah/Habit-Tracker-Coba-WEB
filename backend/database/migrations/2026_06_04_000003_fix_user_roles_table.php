<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {
            if (!Schema::hasColumn('user_roles', 'user_id')) {
                $table->foreignId('user_id')->after('id')->constrained()->cascadeOnDelete();
            }
            if (!Schema::hasColumn('user_roles', 'role_id')) {
                $table->foreignId('role_id')->after('user_id')->constrained()->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['role_id']);
            $table->dropColumn(['user_id', 'role_id']);
        });
    }
};
