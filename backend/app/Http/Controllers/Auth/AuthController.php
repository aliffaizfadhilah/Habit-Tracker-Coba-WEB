<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\OtpRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;

use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    private function jwtCookie(string $token)
    {
        $secure = request()->isSecure();
        return cookie('jwt_token', $token, 60 * 24, '/', null, $secure, true, false, 'Lax');
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil!',
            'token'   => $result['token'],
            'user'    => $result['user'],
        ], 201)->withCookie($this->jwtCookie($result['token']));
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->email, $request->password);

        if (!$result) {
            return response()->json(['success' => false, 'message' => 'Email atau password salah!'], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'token'   => $result['token'],
            'user'    => $result['user'],
        ])->withCookie($this->jwtCookie($result['token']));
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return response()->json(['success' => true, 'message' => 'Logout berhasil!'])
            ->withCookie(cookie()->forget('jwt_token'));
    }

    public function me(): JsonResponse
    {
        return response()->json(['success' => true, 'user' => auth('api')->user()]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = $this->authService->sendForgotOtp($request->email);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Email tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Kode OTP telah dikirim ke emailmu.']);
    }

    public function verifyForgotOtp(OtpRequest $request): JsonResponse
    {
        $user = $this->authService->verifyForgotOtp($request->email, $request->otp);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Kode OTP salah atau kadaluarsa.'], 422);
        }

        return response()->json(['success' => true, 'message' => 'OTP valid. Silakan buat password baru.']);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $ok = $this->authService->resetPassword($request->email, $request->otp, $request->password);

        if (!$ok) {
            return response()->json(['success' => false, 'message' => 'Kode OTP tidak valid atau kadaluarsa.'], 422);
        }

        return response()->json(['success' => true, 'message' => 'Password berhasil diubah!']);
    }

}
