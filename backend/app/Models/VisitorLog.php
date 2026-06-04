<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    protected $fillable = [
        'session_id',
        'ip_address',
        'country',
        'city',
        'device_type',
        'browser',
        'browser_version',
        'os',
        'language',
        'page',
        'referer',
    ];
}
