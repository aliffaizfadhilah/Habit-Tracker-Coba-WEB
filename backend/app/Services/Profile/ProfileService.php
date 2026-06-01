<?php

namespace App\Services\Profile;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Auth\OtpService;
use Illuminate\Support\Facades\Hash;

class ProfileService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepo,
        private readonly OtpService             $otpService,
    ) {}

    public function show(User $user): array
    {
        return [
            'username'    => $user->username,
            'email'       => $user->email,
            'full_name'   => $user->full_name,
            'is_verified' => $user->is_verified,
        ];
    }

    public function update(User $user, array $data): array
    {
        $this->userRepo->update($user, [
            'full_name' => $data['full_name'],
            'username'  => $data['username'],
            'email'     => $data['email'],
        ]);

        return $this->show($user->fresh());
    }

    public function requestOtp(User $user): void
    {
        $this->otpService->send($user, 'Kode OTP Ganti Password - Habit Tracker');
    }

    public function verifyOtp(User $user, string $otp): bool
    {
        return $this->otpService->verify($user, $otp);
    }

    public function changePassword(User $user, string $otp, string $password): bool
    {
        if (!$this->otpService->verify($user, $otp)) {
            return false;
        }

        $this->userRepo->update($user, ['password' => Hash::make($password)]);
        $this->otpService->clear($user);

        return true;
    }
}
