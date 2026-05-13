<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            \Illuminate\Support\Facades\Log::info('JWT', ['cookies' => $request->cookies->all(), 'header_cookie' => $request->header('cookie')]);
            $token = $request->cookie('jwt_token') 
                  ?? $request->bearerToken()
                  ?? $request->input('token');

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak ditemukan'
                ], 401);
            }
            JWTAuth::setToken($token)->authenticate();
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid: ' . $e->getMessage()
            ], 401);
        }
        return $next($request);
    }
}
