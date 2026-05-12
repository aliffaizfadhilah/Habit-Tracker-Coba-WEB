<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = [
        'username', 'email', 'password', 'salt',
        'full_name', 'bio', 'profile_picture',
        'date_of_birth', 'gender', 'reminder_time',
        'reminder_enabled', 'is_verified', 'is_active',
        'google_id', 'otp_code', 'otp_expires_at',
    ];

    protected $hidden = ['password', 'salt', 'otp_code'];

    protected $casts = [
        'otp_expires_at' => 'datetime',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
