<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->cookie('jwt_token')
                  ?? $request->bearerToken()
                  ?? $request->input('token');

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak ditemukan'
                ], 401);
            }

            // Gunakan user() bukan authenticate() agar expired/invalid token
            // tidak melempar AuthenticationException yang menyebabkan redirect ke route 'login'
            $user = auth('api')->setToken($token)->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak valid atau kadaluarsa'
                ], 401);
            }

            $request->setUserResolver(fn() => $user);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid: ' . $e->getMessage()
            ], 401);
        }
        return $next($request);
    }
}
