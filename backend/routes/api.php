<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\StreakController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ProfileController;

Route::prefix('auth')->group(function () {
    Route::post('/register',               [AuthController::class, 'register']);
    Route::post('/login',                  [AuthController::class, 'login']);
    Route::post('/logout',                 [AuthController::class, 'logout']);
    Route::post('/forgot-password',        [AuthController::class, 'forgotPassword']);
    Route::post('/forgot-password/verify', [AuthController::class, 'verifyForgotOtp']);
    Route::post('/reset-password',         [AuthController::class, 'resetPassword']);
});

Route::middleware('auth.jwt')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::prefix('profile')->group(function () {
        Route::get('/',  [ProfileController::class, 'show']);
        Route::put('/',  [ProfileController::class, 'update']);
        Route::post('/change-password/request', [ProfileController::class, 'requestChangePasswordOtp']);
        Route::post('/change-password/verify',  [ProfileController::class, 'verifyChangePasswordOtp']);
        Route::post('/change-password',         [ProfileController::class, 'changePassword']);
    });

    Route::prefix('habits')->group(function () {
        Route::get('/',    [HabitController::class, 'index']);
        // ── FITUR 9: LOCK CHECKLIST (data untuk tampilkan status lock) ─────────
        Route::post('/{id}/check-today', [ActivityLogController::class, 'checkToday']);
        Route::get('/{id}/checklist',    [ActivityLogController::class, 'checklistHistory']);
    });

    // ── FITUR 10: LAPORAN FINAL HABIT ────────────────────────────────────────
    Route::prefix('streak')->group(function () {
        Route::get('/',        [StreakController::class, 'index']);
        Route::get('/summary', [StreakController::class, 'summary']);
        Route::get('/{id}',    [StreakController::class, 'show']);
    });

    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});
