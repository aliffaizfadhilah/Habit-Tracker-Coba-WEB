<?php

/**
 * Mobile API Routes — prefix: /api/mobile
 *
 * Perbedaan dari web (/api/...):
 * - Auth: token dikembalikan di JSON body, tidak di-set sebagai HttpOnly cookie
 * - Client mobile menyimpan token sendiri dan mengirimnya via header:
 *   Authorization: Bearer <token>
 * - Tidak ada endpoint SSE (stream) — mobile menggunakan push notification
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\StreakController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\PostController;

// ─── AUTH (Public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register',              [AuthController::class, 'registerMobile']);
    Route::post('/login',                 [AuthController::class, 'loginMobile']);

    Route::post('/forgot-password',        [AuthController::class, 'forgotPassword']);
    Route::post('/forgot-password/verify', [AuthController::class, 'verifyForgotOtp']);
    Route::post('/reset-password',         [AuthController::class, 'resetPassword']);
});

// ─── PROTECTED (Bearer Token) ─────────────────────────────────────────────────
Route::middleware('auth.jwt')->group(function () {

    // ── Auth / Me ─────────────────────────────────────────────────────────────
    Route::post('/auth/logout', [AuthController::class, 'logoutMobile']);
    Route::get('/me',           [AuthController::class, 'me']);

    // ── Profile ───────────────────────────────────────────────────────────────
    Route::prefix('profile')->group(function () {
        Route::get('/',  [ProfileController::class, 'show']);
        Route::put('/',  [ProfileController::class, 'update']);
        Route::post('/change-password/request', [ProfileController::class, 'requestChangePasswordOtp']);
        Route::post('/change-password/verify',  [ProfileController::class, 'verifyChangePasswordOtp']);
        Route::post('/change-password',         [ProfileController::class, 'changePassword']);
    });

    // ── Habits ────────────────────────────────────────────────────────────────
    Route::prefix('habits')->group(function () {
        Route::get('/',    [HabitController::class, 'index']);
        Route::post('/',   [HabitController::class, 'store']);
        Route::get('/{id}',              [HabitController::class, 'show']);
        Route::put('/{id}',              [HabitController::class, 'update']);
        Route::delete('/{id}',           [HabitController::class, 'destroy']);
        Route::patch('/{id}/reminder',   [HabitController::class, 'updateReminder']);
        Route::post('/{id}/check-today', [ActivityLogController::class, 'checkToday']);
        Route::get('/{id}/checklist',    [ActivityLogController::class, 'checklistHistory']);
    });

    // ── Streak & Progress ─────────────────────────────────────────────────────
    Route::prefix('streak')->group(function () {
        Route::get('/',        [StreakController::class, 'index']);
        Route::get('/summary', [StreakController::class, 'summary']);
        Route::get('/{id}',    [StreakController::class, 'show']);
    });

    // ── Activity Log ──────────────────────────────────────────────────────────
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

    // ── Posts ─────────────────────────────────────────────────────────────────
    Route::prefix('posts')->group(function () {
        Route::get('/',                                 [PostController::class, 'index']);
        Route::get('/{id}',                             [PostController::class, 'show']);
        Route::post('/',                                [PostController::class, 'store']);
        Route::delete('/{id}',                          [PostController::class, 'destroy']);
        Route::post('/{id}/like',                       [PostController::class, 'toggleLike']);
        Route::get('/{id}/comments',                    [PostController::class, 'comments']);
        Route::post('/{id}/comments',                   [PostController::class, 'storeComment']);
        Route::delete('/{postId}/comments/{commentId}', [PostController::class, 'destroyComment']);
    });
});
