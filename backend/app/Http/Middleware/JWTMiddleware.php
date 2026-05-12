<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;

class JWTMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Cek cookie dulu, kalau tidak ada cek Authorization header
            $token = $request->cookie('jwt_token') ?: $request->bearerToken();

            if (!$token) {
                // Terakhir coba ambil token dari JWTAuth otomatis (mungkin dari header)
                try {
                    if (!$user = JWTAuth::parseToken()->authenticate()) {
                        return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
                    }
                    return $next($request);
                } catch (\Exception $e) {
                    return response()->json(['success' => false, 'message' => 'Token tidak ditemukan'], 401);
                }
            }

            JWTAuth::setToken($token)->authenticate();
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid'
            ], 401);
        }

        return $next($request);
    }
}