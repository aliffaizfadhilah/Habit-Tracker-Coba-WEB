<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\FeedEventController;
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

    // ── FITUR 14: POST WALL PRIBADI ───────────────────────────────────────────
    Route::prefix('posts')->group(function () {
        Route::get('/',                                    [PostController::class, 'index']);
        Route::post('/',                                   [PostController::class, 'store']);
        Route::delete('/{id}',                             [PostController::class, 'destroy']);
        Route::post('/{id}/like',                          [PostController::class, 'toggleLike']);
        Route::get('/{id}/comments',                       [PostController::class, 'comments']);
        Route::post('/{id}/comments',                      [PostController::class, 'storeComment']);
        Route::delete('/{postId}/comments/{commentId}',    [PostController::class, 'destroyComment']);
    });

    // ── FITUR 13: SHARE PROGRESS (Generate Snapshot) ─────────────────────────
    // ── FITUR 14: FEED REAL-TIME ──────────────────────────────────────────────
    Route::get('/feed/stream', [FeedEventController::class, 'stream']);
});
