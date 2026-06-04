<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use App\Models\VisitorLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'total_users'    => User::count(),
                'total_habits'   => Habit::count(),
                'total_posts'    => Post::count(),
                'total_visitors' => VisitorLog::count(),
                'pending_reports'=> Report::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function visitors(Request $request): JsonResponse
    {
        $visitors = VisitorLog::orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json(['success' => true, 'data' => $visitors]);
    }

    public function visitorsChart(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);

        $chart = VisitorLog::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json(['success' => true, 'data' => $chart]);
    }

    public function visitorLocations(): JsonResponse
    {
        $locations = VisitorLog::select('country', 'city', DB::raw('COUNT(*) as total'))
            ->whereNotNull('country')
            ->groupBy('country', 'city')
            ->orderByDesc('total')
            ->limit(50)
            ->get();

        return response()->json(['success' => true, 'data' => $locations]);
    }

    public function exportVisitorsCsv(): \Illuminate\Http\Response
    {
        $visitors = VisitorLog::orderByDesc('created_at')->get();

        $csv  = "ID,IP,Country,City,Device,Browser,OS,Language,Page,Referer,Date\n";
        foreach ($visitors as $v) {
            $csv .= implode(',', [
                $v->id,
                $v->ip_address,
                $v->country  ?? '',
                $v->city     ?? '',
                $v->device_type ?? '',
                $v->browser  ?? '',
                $v->os       ?? '',
                $v->language ?? '',
                '"' . str_replace('"', '""', $v->page ?? '') . '"',
                '"' . str_replace('"', '""', $v->referer ?? '') . '"',
                $v->created_at->format('Y-m-d H:i:s'),
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="visitors_' . now()->format('Ymd_His') . '.csv"',
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        /*
         * Window Function: RANK() OVER (ORDER BY jumlah habit aktif DESC)
         * Menghasilkan peringkat pengguna berdasarkan keaktifan habit.
         * Diimplementasikan sebagai subquery (joinSub) agar hasil RANK()
         * bisa dipakai di query luar tanpa melanggar aturan GROUP BY.
         */
        $ranked = DB::table('users as u')
            ->select(
                'u.id',
                DB::raw('COUNT(h.id_habit) AS habits_count'),
                DB::raw('RANK() OVER (ORDER BY COUNT(h.id_habit) DESC) AS ranking')
            )
            ->leftJoin('habits as h', function ($join) {
                $join->on('h.username', '=', 'u.username')
                     ->where('h.status', '=', 1);
            })
            ->groupBy('u.id');

        $users = User::with('roles')
            ->joinSub($ranked, 'ranked', 'ranked.id', '=', 'users.id')
            ->select('users.*', 'ranked.habits_count', 'ranked.ranking')
            ->orderByDesc('users.created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function suspendUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->roles()->where('role_name', 'ADMIN')->exists()) {
            return response()->json(['success' => false, 'message' => 'Tidak bisa suspend admin.'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Akun diaktifkan.' : 'Akun disuspend.',
            'is_active' => $user->is_active,
        ]);
    }

    public function posts(Request $request): JsonResponse
    {
        $posts = Post::with('user:id,username,full_name')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function deletePost(int $id): JsonResponse
    {
        Post::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Postingan dihapus.']);
    }

    public function reports(Request $request): JsonResponse
    {
        $query = Report::with('user:id,username,full_name')
            ->orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json(['success' => true, 'data' => $query->paginate($request->integer('per_page', 20))]);
    }

    public function resolveReport(int $id): JsonResponse
    {
        Report::findOrFail($id)->update([
            'status'      => 'resolved',
            'resolved_at' => now(),
        ]);
        return response()->json(['success' => true, 'message' => 'Laporan ditandai selesai.']);
    }

    public function dismissReport(int $id): JsonResponse
    {
        Report::findOrFail($id)->update([
            'status'      => 'dismissed',
            'resolved_at' => now(),
        ]);
        return response()->json(['success' => true, 'message' => 'Laporan diabaikan.']);
    }
}
