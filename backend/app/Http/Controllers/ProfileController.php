<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user'    => [
                'username'    => $user->username,
                'email'       => $user->email,
                'full_name'   => $user->full_name,
                'is_verified' => $user->is_verified,
                'google_id'   => $user->google_id ?? null,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:100',
            'username'  => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->username, 'username')],
            'email'     => ['required', 'email', Rule::unique('users', 'email')->ignore($user->email, 'email')],
        ], [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'username.required'  => 'Username wajib diisi.',
            'username.unique'    => 'Username sudah digunakan.',
            'email.required'     => 'Email wajib diisi.',
            'email.unique'       => 'Email sudah digunakan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user->update([
            'full_name' => $request->full_name,
            'username'  => $request->username,
            'email'     => $request->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui!',
            'user'    => [
                'username'    => $user->username,
                'email'       => $user->email,
                'full_name'   => $user->full_name,
                'is_verified' => $user->is_verified,
                'google_id'   => $user->google_id ?? null,
            ],
        ]);
    }

    public function requestChangePasswordOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        // Cegah user Google dari ganti password
        if ($user->google_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google tidak dapat mengganti password di sini.',
            ], 403);
        }

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        Mail::raw(
            "Kode OTP ganti password kamu: {$otp}\n\nBerlaku 10 menit. Jangan bagikan kepada siapapun.",
            function ($msg) use ($user) {
                $msg->to($user->email)->subject('Kode OTP Ganti Password - Habit Tracker');
            }
        );

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP telah dikirim ke email kamu.',
        ]);
    }

    public function verifyChangePasswordOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6',
        ], [
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size'     => 'Kode OTP harus 6 digit.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if ($user->otp_code !== $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP salah.',
            ], 422);
        }

        if (now()->isAfter($user->otp_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP sudah kadaluarsa. Minta kode baru.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP valid. Silakan buat password baru.',
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'otp'                   => 'required|string|size:6',
            'password'              => 'required|string|min:8|confirmed',
        ], [
            'otp.required'          => 'Kode OTP wajib diisi.',
            'password.required'     => 'Password baru wajib diisi.',
            'password.min'          => 'Password minimal 8 karakter.',
            'password.confirmed'    => 'Konfirmasi password tidak cocok.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Validasi OTP sekali lagi untuk keamanan
        if ($user->otp_code !== $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid.',
            ], 422);
        }

        if (now()->isAfter($user->otp_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP sudah kadaluarsa.',
            ], 422);
        }

        $user->update([
            'password'       => Hash::make($request->password),
            'otp_code'       => null,
            'otp_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diganti!',
        ]);
    }
}