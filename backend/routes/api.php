<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\StreakController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\FeedEventController;
use App\Http\Controllers\HabitEventController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ReportController;

// ─── AUTH (Public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register',       [AuthController::class, 'register']);
    Route::post('/login',          [AuthController::class, 'login']);
    Route::post('/logout',         [AuthController::class, 'logout']);

    // Forgot Password
    Route::post('/forgot-password',        [AuthController::class, 'forgotPassword']);
    Route::post('/forgot-password/verify', [AuthController::class, 'verifyForgotOtp']);
    Route::post('/reset-password',         [AuthController::class, 'resetPassword']);
});

// ─── PROTECTED (JWT) ─────────────────────────────────────────────────────────
Route::middleware('auth.jwt')->group(function () {

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

        // Static routes MUST come before /{id} wildcard to avoid shadowing
        Route::get('/stream', [HabitEventController::class, 'stream']);

        Route::get('/{id}',              [HabitController::class, 'show']);
        Route::put('/{id}',              [HabitController::class, 'update']);
        Route::delete('/{id}',           [HabitController::class, 'destroy']);
        Route::patch('/{id}/reminder',   [HabitController::class, 'updateReminder']);

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

    // ── Feed Real-time ────────────────────────────────────────────────────────
    Route::get('/feed/stream', [FeedEventController::class, 'stream']);

    // ── Posts (Public Feed) ───────────────────────────────────────────────────
    Route::prefix('posts')->group(function () {
        Route::get('/',                                    [PostController::class, 'index']);
        Route::get('/{id}',                                [PostController::class, 'show']);
        Route::post('/',                                   [PostController::class, 'store']);
        Route::delete('/{id}',                             [PostController::class, 'destroy']);
        Route::post('/{id}/like',                          [PostController::class, 'toggleLike']);
        Route::get('/{id}/comments',                       [PostController::class, 'comments']);
        Route::post('/{id}/comments',                      [PostController::class, 'storeComment']);
        Route::delete('/{postId}/comments/{commentId}',    [PostController::class, 'destroyComment']);
    });

    // ── Reports (Bug/Feedback dari user) ─────────────────────────────────────
    Route::post('/reports', [ReportController::class, 'store']);

    // ── ADMIN (JWT + role admin) ──────────────────────────────────────────────
    Route::middleware('role.admin')->prefix('admin')->group(function () {
        Route::get('/stats',              [AdminController::class, 'stats']);
        Route::get('/visitors',           [AdminController::class, 'visitors']);
        Route::get('/visitors/chart',     [AdminController::class, 'visitorsChart']);
        Route::get('/visitors/locations', [AdminController::class, 'visitorLocations']);
        Route::get('/visitors/export',    [AdminController::class, 'exportVisitorsCsv']);
        Route::get('/users',              [AdminController::class, 'users']);
        Route::patch('/users/{id}/suspend', [AdminController::class, 'suspendUser']);
        Route::get('/posts',              [AdminController::class, 'posts']);
        Route::delete('/posts/{id}',      [AdminController::class, 'deletePost']);
        Route::get('/reports',            [AdminController::class, 'reports']);
        Route::patch('/reports/{id}/resolve',  [AdminController::class, 'resolveReport']);
        Route::patch('/reports/{id}/dismiss',  [AdminController::class, 'dismissReport']);
    });
});

// ─── VISITOR TRACKING (Public) ───────────────────────────────────────────────
Route::post('/track', function (\Illuminate\Http\Request $request) {
    $ua     = \UAParser\Parser::create()->parse($request->userAgent());
    $detect = new \Detection\MobileDetect();
    $detect->setUserAgent($request->userAgent());
    $device = $detect->isMobile() ? 'mobile' : ($detect->isTablet() ? 'tablet' : 'desktop');

    $langs    = $request->getLanguages();
    $language = count($langs) > 0 ? substr($langs[0], 0, 20) : null;

    $version = trim(($ua->ua->major ?? '') . '.' . ($ua->ua->minor ?? ''), '.');

    // Prefer real IP from proxy headers (nginx forwards HTTP_X_FORWARDED_FOR)
    $forwardedFor = $request->header('X-Forwarded-For') ?? $request->header('X-Real-IP');
    $ip = $forwardedFor
        ? trim(explode(',', $forwardedFor)[0])
        : $request->ip();

    // Prioritaskan lokasi dari browser Geolocation API (dikirim di body request)
    // Jika tidak ada → fallback ke GeoIP dari IP address
    $country = $request->input('country') ? substr($request->input('country'), 0, 100) : null;
    $city    = $request->input('city')    ? substr($request->input('city'),    0, 100) : null;

    if (!$country && !$city) {
        // Skip private/local IPs — GeoIP only works for public addresses
        $isPrivate = !$ip || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;

        // GeoIP lookup via ip-api.com (free, no key needed, max 45 req/min)
        if (!$isPrivate) {
            try {
                $geo = json_decode(@file_get_contents("http://ip-api.com/json/{$ip}?fields=country,city,status"), true);
                if (($geo['status'] ?? '') === 'success') {
                    $country = $geo['country'] ?? null;
                    $city    = $geo['city']    ?? null;
                }
            } catch (\Throwable) {}
        }
    }

    \App\Models\VisitorLog::create([
        'session_id'      => $request->input('session_id'),
        'ip_address'      => $ip,
        'country'         => $country,
        'city'            => $city,
        'device_type'     => $device,
        'browser'         => $ua->ua->family,
        'browser_version' => $version ?: null,
        'os'              => $ua->os->family,
        'language'        => $language,
        'page'            => $request->input('page', 'landing'),
        'referer'         => $request->headers->get('referer'),
    ]);

    return response()->json(['success' => true]);
});
