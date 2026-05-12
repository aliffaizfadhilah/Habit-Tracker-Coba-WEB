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
        $path = $request->path();

        // Skip excluded paths
        foreach ($this->exclude as $excluded) {
            if (str_starts_with($path, $excluded)) {
                return $next($request);
            }
        }

        // Simpan log visitor
        VisitorLog::create([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'page'       => '/' . $path,
            'referer'    => $request->headers->get('referer'),
        ]);

        return $next($request);
    }
}
