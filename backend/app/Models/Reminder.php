<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model ini digunakan jika reminder disimpan sebagai entitas terpisah.
 * Saat ini reminder tersimpan sebagai field di tabel habits (reminder_time, reminder_enabled).
 * Buat migration jika ingin memisahkan ke tabel sendiri.
 */
class Reminder extends Model
{
    protected $fillable = [
        'habit_id',
        'user_id',
        'reminder_time',
        'is_enabled',
        'last_sent_at',
    ];

    protected $casts = [
        'is_enabled'   => 'boolean',
        'last_sent_at' => 'datetime',
        'reminder_time' => 'string',
    ];

    public function habit(): BelongsTo
    {
        return $this->belongsTo(Habit::class, 'habit_id', 'id_habit');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
