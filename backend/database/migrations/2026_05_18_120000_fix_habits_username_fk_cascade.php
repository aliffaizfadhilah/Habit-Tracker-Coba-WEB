<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('habits', function (Blueprint $table) {
            $table->dropForeign('habits_username_foreign');
            $table->foreign('username')
                  ->references('username')->on('users')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('habits', function (Blueprint $table) {
            $table->dropForeign('habits_username_foreign');
            $table->foreign('username')
                  ->references('username')->on('users')
                  ->onDelete('cascade');
        });
    }
};
