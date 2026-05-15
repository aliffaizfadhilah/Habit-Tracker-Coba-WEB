<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Habit extends Model
{
    protected $primaryKey = 'id_habit';

    protected $fillable = [
        'username',
        'title',
        'category',
        'periode_start',
        'periode_end',
        'total_period_days',
        'total_completed_days',
        'current_streak',
        'longest_streak',
        'progress_percent',
        'status',
        'reminder_time',
        'reminder_enabled',
    ];

    protected $casts = [
        'periode_start'    => 'date',
        'periode_end'      => 'date',
        'progress_percent' => 'decimal:2',
        'status'           => 'boolean',
        'reminder_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'username', 'username');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'id_habit', 'id_habit');
    }

public function activityLogs(): HasManyThrough
{
    return $this->hasManyThrough(
        ActivityLog::class,
        Activity::class,
        'id_habit',      // FK di activities
        'id_activity',   // FK di activity_logs
        'id_habit',      // PK di habits
        'id_activity'    // PK di activities
    );
}
}