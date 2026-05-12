<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habits', function (Blueprint $table) {
            $table->id('id_habit');
            $table->string('username', 50)->nullable();
            $table->string('title', 100)->nullable();
            $table->string('category', 30)->default('other');
            $table->date('periode_start')->nullable();
            $table->date('periode_end')->nullable();
            $table->integer('total_period_days')->default(0);
            $table->integer('total_completed_days')->default(0);
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->decimal('progress_percent', 5, 2)->default(0.00);
            $table->tinyInteger('status')->default(1);
            $table->timestamps();

            $table->foreign('username')
                  ->references('username')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habits');
    }
};