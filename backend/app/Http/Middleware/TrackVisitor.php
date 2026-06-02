<?php
namespace App\Http\Middleware;

use App\Models\VisitorLog;
use Closure;
use Illuminate\Http\Request;

class TrackVisitor
{
    protected array $exclude = [
        'api/admin/visitors',
        'api/track',
        'api/auth/logout',
        'up',
    ];

    public function handle(Request $request, Closure $next)
    {
        return $next($request);
    }
}
