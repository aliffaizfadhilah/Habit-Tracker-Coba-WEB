<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    private function jwtCookie(string $token)
    {
        return cookie(
            'jwt_token', $token,
            60 * 24,
            '/',
            null,
            true,
            true,
            false,
            'None'
        );
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username'  => 'required|string|max:50|unique:users',
            'email'     => 'required|email|unique:users',
            'password'  => 'required|string|min:8|confirmed',
            'full_name' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'salt'      => bin2hex(random_bytes(32)),
            'full_name' => $request->full_name,
        ]);

        $userRole = Role::where('role_name', 'USER')->first();
        if ($userRole) $user->roles()->attach($userRole->id);

        $this->sendOtp($user);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil! Cek email untuk kode OTP.',
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if (!$token = auth('api')->attempt($request->only('email', 'password'))) {
            return response()->json(['success' => false, 'message' => 'Email atau password salah!'], 401);
        }

        $user = auth('api')->user();

        if (!$user->is_verified) {
            $this->sendOtp($user);
            return response()->json([
                'success'      => false,
                'message'      => 'Email belum diverifikasi. Kode OTP telah dikirim.',
                'requires_otp' => true,
                'email'        => $user->email,
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'user'    => $user,
        ])->withCookie($this->jwtCookie($token));
    }

    private function sendOtp(User $user): void
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        Mail::raw(
            "Kode OTP kamu: {$otp}\n\nBerlaku 10 menit. Jangan bagikan kepada siapapun.",
            function ($msg) use ($user) {
                $msg->to($user->email)->subject('Kode OTP Habit Tracker');
            }
        );
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
        }

        if ($user->otp_code !== $request->otp) {
            return response()->json(['success' => false, 'message' => 'Kode OTP salah.'], 422);
        }

        if (now()->isAfter($user->otp_expires_at)) {
            return response()->json(['success' => false, 'message' => 'Kode OTP sudah kadaluarsa.'], 422);
        }

        $user->update([
            'is_verified'    => true,
            'otp_code'       => null,
            'otp_expires_at' => null,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Email berhasil diverifikasi!',
            'user'    => $user,
        ])->withCookie($this->jwtCookie($token));
    }

    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
        }

        if ($user->is_verified) {
            return response()->json(['success' => false, 'message' => 'Email sudah diverifikasi.'], 422);
        }

        $this->sendOtp($user);

        return response()->json(['success' => true, 'message' => 'Kode OTP telah dikirim ulang.']);
    }

    public function googleRedirect()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl()
        ]);
    }

    public function googleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Google login gagal.'], 400);
        }

        $user = User::where('google_id', $googleUser->getId())
                    ->orWhere('email', $googleUser->getEmail())
                    ->first();

        if (!$user) {
            $user = User::create([
                'username'    => Str::slug($googleUser->getName()) . '_' . Str::random(5),
                'email'       => $googleUser->getEmail(),
                'full_name'   => $googleUser->getName(),
                'google_id'   => $googleUser->getId(),
                'password'    => Hash::make(Str::random(32)),
                'salt'        => bin2hex(random_bytes(32)),
                'is_verified' => true,
            ]);

            $userRole = Role::where('role_name', 'USER')->first();
            if ($userRole) $user->roles()->attach($userRole->id);
        } else {
            $user->update(['google_id' => $googleUser->getId(), 'is_verified' => true]);
        }

         $token = JWTAuth::fromUser($user);

    // ✅ Kirim token sebagai query param
    return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/auth/callback?token=' . $token);
    // Hapus ->withCookie(...) karena kita pakai query param
}
public function setGoogleCookie(Request $request)
{
    $token = $request->input('token');

    try {
        $user = JWTAuth::setToken($token)->toUser();
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Token tidak valid.'], 401);
    }

    return response()->json([
        'success' => true,
        'user'    => $user,
    ])->withCookie($this->jwtCookie($token));
}
    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil!'
        ])->withCookie(cookie()->forget('jwt_token'));
    }

    public function me()
    {
        return response()->json([
            'success' => true,
            'user'    => auth('api')->user()
        ]);
    }
    
}
