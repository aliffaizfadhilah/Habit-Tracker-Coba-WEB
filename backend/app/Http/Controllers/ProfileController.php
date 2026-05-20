<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ProfileRequest;
use App\Services\Profile\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profileService) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user'    => $this->profileService->show($request->user()),
        ]);
    }

    public function update(ProfileRequest $request): JsonResponse
    {
        $user = $this->profileService->update($request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui!',
            'user'    => $user,
        ]);
    }

    public function requestChangePasswordOtp(Request $request): JsonResponse
    {
        $this->profileService->requestOtp($request->user());

        return response()->json(['success' => true, 'message' => 'Kode OTP telah dikirim ke email kamu.']);
    }

    public function verifyChangePasswordOtp(Request $request): JsonResponse
    {
        $valid = $this->profileService->verifyOtp($request->user(), $request->otp ?? '');

        if (!$valid) {
            return response()->json(['success' => false, 'message' => 'Kode OTP salah atau kadaluarsa.'], 422);
        }

        return response()->json(['success' => true, 'message' => 'OTP valid. Silakan buat password baru.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $ok = $this->profileService->changePassword(
            $request->user(),
            $request->otp,
            $request->password
        );

        if (!$ok) {
            return response()->json(['success' => false, 'message' => 'Kode OTP tidak valid atau kadaluarsa.'], 422);
        }

        try {
            auth('api')->logout();
        } catch (\Throwable) {
        }

        return response()
            ->json(['success' => true, 'message' => 'Password berhasil diganti! Silakan login kembali.'])
            ->withCookie(cookie()->forget('jwt_token'));
    }
}
