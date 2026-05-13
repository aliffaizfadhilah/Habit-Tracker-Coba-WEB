<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\StreakController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityLogController;

// ─── AUTH (Public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register',       [AuthController::class, 'register']);
    Route::post('/login',          [AuthController::class, 'login']);
    Route::post('/logout',         [AuthController::class, 'logout']);
    Route::post('/otp/verify',     [AuthController::class, 'verifyOtp']);
    Route::post('/otp/resend',     [AuthController::class, 'resendOtp']);

    // Forgot Password
    Route::post('/forgot-password',        [AuthController::class, 'forgotPassword']);
    Route::post('/forgot-password/verify', [AuthController::class, 'verifyForgotOtp']);
    Route::post('/reset-password',         [AuthController::class, 'resetPassword']);
});

// ─── PROTECTED (JWT) ─────────────────────────────────────────────────────────
Route::middleware('jwt.auth')->group(function () {

    // ── Auth / Me ─────────────────────────────────────────────────────────────
    Route::get('/me', [AuthController::class, 'me']);

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
        Route::get('/',        [HabitController::class, 'index']);
        Route::post('/',       [HabitController::class, 'store']);
        Route::get('/{id}',    [HabitController::class, 'show']);
        Route::put('/{id}',    [HabitController::class, 'update']);
        Route::delete('/{id}', [HabitController::class, 'destroy']);

        // Check harian
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
});

// ─── VISITOR TRACKING (Public) ───────────────────────────────────────────────
Route::post('/track', function (\Illuminate\Http\Request $request) {
    $ua     = \UAParser\Parser::create()->parse($request->userAgent());
    $detect = new \Detection\MobileDetect();
    $detect->setUserAgent($request->userAgent());
    $device = $detect->isMobile() ? 'mobile' : ($detect->isTablet() ? 'tablet' : 'desktop');

    \Shetabit\Visitor\Models\Visit::create([
        'method'    => $request->method(),
        'request'   => json_encode($request->all()),
        'url'       => $request->input('page', 'landing'),
        'referer'   => $request->headers->get('referer'),
        'languages' => json_encode($request->getLanguages()),
        'useragent' => $request->userAgent(),
        'headers'   => json_encode($request->headers->all()),
        'ip'        => $request->ip(),
        'device'    => $device,
        'platform'  => $ua->os->family,
        'browser'   => $ua->ua->family,
    ]);

    return response()->json(['success' => true]);
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────
Route::prefix('admin')->group(function () {
    Route::get('/visitors', function () {
        return response()->json([
            'total'  => \App\Models\VisitorLog::count(),
            'today'  => \App\Models\VisitorLog::whereDate('created_at', today())->count(),
            'latest' => \App\Models\VisitorLog::latest()->take(20)->get(),
        ]);
    });

    Route::get('/visits', function () {
        return response()->json([
            'total'  => \Shetabit\Visitor\Models\Visit::count(),
            'today'  => \Shetabit\Visitor\Models\Visit::whereDate('created_at', today())->count(),
            'latest' => \Shetabit\Visitor\Models\Visit::latest()->take(20)->get(),
        ]);
    });
});