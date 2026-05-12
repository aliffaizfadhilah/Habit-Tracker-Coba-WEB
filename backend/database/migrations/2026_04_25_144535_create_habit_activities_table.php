<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel activities (sub-aktivitas dari habit)
        Schema::create('activities', function (Blueprint $table) {
            $table->id('id_activity');
            $table->unsignedBigInteger('id_habit')->nullable();
            $table->string('name', 100)->nullable();
            $table->timestamps();

            $table->foreign('id_habit')
                  ->references('id_habit')
                  ->on('habits')
                  ->onDelete('cascade');
        });

        // Tabel activity_logs (log checklist harian)
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id('id_activitylog');
            $table->unsignedBigInteger('id_activity')->nullable();
            $table->date('date')->nullable();
            $table->tinyInteger('status')->default(0);
            $table->timestamps();

            $table->foreign('id_activity')
                  ->references('id_activity')
                  ->on('activities')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('activities');
    }
};