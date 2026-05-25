<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('visitor_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->string('page', 255)->default('/');
            $table->string('referer')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('visitor_logs');
    }
};
