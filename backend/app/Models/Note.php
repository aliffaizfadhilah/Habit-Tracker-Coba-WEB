<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'color',
        'tags',
        'pinned',
        'reminder',
        'reminder_alerted',
    ];

    protected $casts = [
        'pinned' => 'boolean',
        'reminder_alerted' => 'boolean',
        'reminder' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
