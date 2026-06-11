<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['bug', 'post', 'user'])->default('bug');
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('reason', 100)->nullable();
            $table->text('note')->nullable();
            $table->string('page', 255)->nullable();
            $table->string('browser', 150)->nullable();
            $table->enum('status', ['pending', 'resolved', 'dismissed'])->default('pending');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
