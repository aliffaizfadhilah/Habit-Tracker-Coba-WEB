<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $primaryKey = 'id_activitylog';

    protected $fillable = ['id_activity', 'date', 'status'];

    protected $casts = [
        'date'   => 'date',
        'status' => 'boolean',
    ];

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'id_activity', 'id_activity');
    }
}