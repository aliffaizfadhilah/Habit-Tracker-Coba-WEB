<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Mail;

/**
 * Singleton — satu instance untuk seluruh siklus request.
 * Bertanggung jawab atas generate, simpan, dan kirim OTP.
 */
class OtpService
{
    private static ?self $instance = null;

    private function __construct() {}

    public static function getInstance(): static
    {
        if (static::$instance === null) {
            static::$instance = new static();
        }

        return static::$instance;
    }

    public function send(User $user, string $subject = 'Kode OTP Habit Tracker'): void
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        Mail::raw(
            "Kode OTP kamu: {$otp}\n\nBerlaku 10 menit. Jangan bagikan kepada siapapun.",
            fn($msg) => $msg->to($user->email)->subject($subject)
        );
    }

    public function verify(User $user, string $otp): bool
    {
        if ($user->otp_code !== $otp) {
            return false;
        }

        if (now()->isAfter($user->otp_expires_at)) {
            return false;
        }

        return true;
    }

    public function clear(User $user): void
    {
        $user->update(['otp_code' => null, 'otp_expires_at' => null]);
    }
}
