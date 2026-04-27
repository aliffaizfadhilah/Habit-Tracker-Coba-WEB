<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

Route::prefix('auth')->group(function () {
    Route::post('/register',       [AuthController::class, 'register']);
    Route::post('/login',          [AuthController::class, 'login']);
    Route::post('/logout',         [AuthController::class, 'logout']);
    Route::post('/otp/verify',     [AuthController::class, 'verifyOtp']);
    Route::post('/otp/resend',     [AuthController::class, 'resendOtp']);
    Route::get('/google',          [AuthController::class, 'googleRedirect']);
    Route::get('/google/callback', [AuthController::class, 'googleCallback']);
});

Route::middleware('jwt.auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
});

Route::post('/auth/forgot-password',        [AuthController::class, 'forgotPassword']);
Route::post('/auth/forgot-password/verify', [AuthController::class, 'verifyForgotOtp']);
Route::post('/auth/reset-password',         [AuthController::class, 'resetPassword']);
Route::post('/auth/google/set-cookie', [AuthController::class, 'setGoogleCookie']);

Route::get('/admin/visitors', function () {
    return response()->json([
        'total'    => \App\Models\VisitorLog::count(),
        'today'    => \App\Models\VisitorLog::whereDate('created_at', today())->count(),
        'latest'   => \App\Models\VisitorLog::latest()->take(20)->get(),
    ]);
});

Route::post('/track', function (\Illuminate\Http\Request $request) {
    $ua = \UAParser\Parser::create()->parse($request->userAgent());
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

Route::get('/admin/visits', function () {
    return response()->json([
        'total'   => \Shetabit\Visitor\Models\Visit::count(),
        'today'   => \Shetabit\Visitor\Models\Visit::whereDate('created_at', today())->count(),
        'latest'  => \Shetabit\Visitor\Models\Visit::latest()->take(20)->get(),
    ]);
});
