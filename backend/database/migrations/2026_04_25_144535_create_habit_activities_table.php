<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habit_activities', function (Blueprint $table) {
            $table->id('id_activity');
            $table->unsignedBigInteger('id_habit');
            $table->string('name', 100);
            $table->timestamps();

            $table->foreign('id_habit')->references('id_habit')->on('habits')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habit_activities');
    }
};
