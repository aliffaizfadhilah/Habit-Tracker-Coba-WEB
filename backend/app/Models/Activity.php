<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    protected $primaryKey = 'id_activity';

    protected $fillable = ['id_habit', 'name'];

    public function habit(): BelongsTo
    {
        return $this->belongsTo(Habit::class, 'id_habit', 'id_habit');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'id_activity', 'id_activity');
    }
}