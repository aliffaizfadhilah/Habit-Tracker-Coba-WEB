<?php

namespace App\Services\Auth;

use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepo,
        private readonly OtpService             $otpService,
    ) {}

    public function register(array $data): array
    {
        $user = $this->userRepo->create([
            'username'    => $data['username'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'salt'        => bin2hex(random_bytes(32)),
            'full_name'   => $data['full_name'] ?? null,
            'is_verified' => true,
        ]);

        $role = Role::where('role_name', 'USER')->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        $token = JWTAuth::fromUser($user);

        return ['token' => $token, 'user' => $user];
    }

    public function login(string $email, string $password): ?array
    {
        $token = auth('api')->attempt(compact('email', 'password'));

        if (!$token) {
            return null;
        }

        return ['token' => $token, 'user' => auth('api')->user()];
    }

    public function logout(): void
    {
        try {
            auth('api')->logout();
        } catch (\Exception) {
        }
    }

    public function sendForgotOtp(string $email): ?User
    {
        $user = $this->userRepo->findByEmail($email);

        if (!$user) {
            return null;
        }

        $this->otpService->send($user, 'Kode OTP Reset Password - Habit Tracker');

        return $user;
    }

    public function verifyForgotOtp(string $email, string $otp): ?User
    {
        $user = $this->userRepo->findByEmail($email);

        if (!$user || !$this->otpService->verify($user, $otp)) {
            return null;
        }

        return $user;
    }

    public function resetPassword(string $email, string $otp, string $password): bool
    {
        $user = $this->userRepo->findByEmail($email);

        if (!$user || !$this->otpService->verify($user, $otp)) {
            return false;
        }

        $this->userRepo->update($user, ['password' => Hash::make($password)]);
        $this->otpService->clear($user);

        return true;
    }

}
