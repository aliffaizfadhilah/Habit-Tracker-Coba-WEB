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
        $response = $next($request);

        $path       = $request->path();
        $isExcluded = collect($this->exclude)->contains(fn($e) => str_starts_with($path, $e));

        if ($isExcluded || $request->cookie('visitor_tracked')) {
            return $response;
        }

        $consentRaw = $request->cookie('habittracker_cookie_consent');
        if (!$consentRaw) {
            return $response;
        }

        $consent = json_decode(urldecode($consentRaw), true);
        if (empty($consent['preferences']['analytics'])) {
            return $response;
        }

        $ua     = $request->userAgent() ?? '';
        $device = preg_match('/Mobile|Android|iPhone/i', $ua) ? 'mobile' : 'desktop';

        \App\Models\VisitorLog::create([
            'session_id'  => session()->getId(),
            'ip_address'  => $request->ip(),
            'device_type' => $device,
            'browser'     => substr($ua, 0, 100),
            'page'        => '/' . $path,
            'referer'     => $request->header('referer'),
        ]);

        $response->cookie('visitor_tracked', '1', 60);

        return $response;
    }
}
