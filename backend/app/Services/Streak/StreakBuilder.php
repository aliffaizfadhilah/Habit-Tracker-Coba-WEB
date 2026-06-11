<?php

namespace App\Services\Streak;

use App\Models\Habit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Builder — membangun data streak secara bertahap via method chaining.
 * Urutan: loadActivityLogs → calculatePeriodDays → calculateCurrentStreak
 *         → calculateLongestStreak → calculateProgress → saveToHabit → build
 */
class StreakBuilder
{
    private array $logDates      = [];
    private array $dailyStatus   = [];   // hasil CTE: [{log_date, terpenuhi}, ...]
    private int   $periodDays    = 0;
    private int   $completedDays = 0;

    private int   $currentStreak   = 0;
    private int   $longestStreak   = 0;
    private float $progressPercent = 0.0;

    public function loadActivityLogs(Habit $habit): static
    {
        /*
         * CTE: klasifikasikan setiap tanggal sebagai Terpenuhi (1) / Tidak Terpenuhi (0).
         * Satu hari bisa punya banyak log — MAX(status) memastikan hari dianggap
         * Terpenuhi jika ada setidaknya satu log dengan status = 1.
         */
        $this->dailyStatus = DB::select("
            WITH daily_completion AS (
                SELECT
                    DATE(al.date)                                      AS log_date,
                    MAX(CASE WHEN al.status = 1 THEN 1 ELSE 0 END)    AS terpenuhi
                FROM activity_logs al
                INNER JOIN habit_activities a ON al.id_activity = a.id_activity
                WHERE a.id_habit = :habit_id
                GROUP BY DATE(al.date)
            )
            SELECT log_date, terpenuhi
            FROM daily_completion
            ORDER BY log_date ASC
        ", ['habit_id' => $habit->id_habit]);

        // Gunakan hanya tanggal Terpenuhi untuk perhitungan streak
        $this->logDates = array_values(array_map(
            fn($r) => $r->log_date,
            array_filter($this->dailyStatus, fn($r) => (int) $r->terpenuhi === 1)
        ));

        return $this;
    }

    public function calculatePeriodDays(Habit $habit): static
    {
        if ($habit->periode_start && $habit->periode_end) {
            $this->periodDays = $habit->periode_start->diffInDays($habit->periode_end) + 1;
        }

        // completedDays dihitung dari baris CTE yang bertatus Terpenuhi
        $this->completedDays = count(array_filter(
            $this->dailyStatus,
            fn($r) => (int) $r->terpenuhi === 1
        ));

        return $this;
    }

    public function calculateCurrentStreak(): static
    {
        if (empty($this->logDates)) {
            $this->currentStreak = 0;
            return $this;
        }

        $streak    = 0;
        $checkDate = Carbon::today();

        while (true) {
            $dateStr = $checkDate->toDateString();

            if (in_array($dateStr, $this->logDates)) {
                $streak++;
                $checkDate->subDay();
            } else {
                break;
            }
        }

        $this->currentStreak = $streak;

        return $this;
    }

    public function calculateLongestStreak(): static
    {
        if (empty($this->logDates)) {
            $this->longestStreak = 0;
            return $this;
        }

        $dates   = array_map(fn($d) => Carbon::parse($d), $this->logDates);
        $longest = 1;
        $current = 1;

        for ($i = 1; $i < count($dates); $i++) {
            $diff = $dates[$i - 1]->diffInDays($dates[$i]);

            if ($diff === 1) {
                $current++;
                $longest = max($longest, $current);
            } else {
                $current = 1;
            }
        }

        $this->longestStreak = max($longest, $this->currentStreak);

        return $this;
    }

    public function calculateProgress(): static
    {
        if ($this->periodDays <= 0) {
            $this->progressPercent = 0.0;
            return $this;
        }

        $this->progressPercent = min(
            100.0,
            round(($this->completedDays / $this->periodDays) * 100, 2)
        );

        return $this;
    }

    public function saveToHabit(Habit $habit): static
    {
        $data = [
            'current_streak'       => $this->currentStreak,
            'longest_streak'       => $this->longestStreak,
            'progress_percent'     => $this->progressPercent,
            'total_period_days'    => $this->periodDays,
            'total_completed_days' => $this->completedDays,
        ];

        $periodEnded = $habit->periode_end && Carbon::today()->isAfter($habit->periode_end);
        $isComplete  = $this->progressPercent >= 100.0;

        if (($isComplete || $periodEnded) && $habit->reminder_enabled) {
            $data['reminder_enabled'] = false;
        }

        $habit->update($data);

        return $this;
    }

    public function build(): array
    {
        return [
            'current_streak'       => $this->currentStreak,
            'longest_streak'       => $this->longestStreak,
            'progress_percent'     => $this->progressPercent,
            'total_period_days'    => $this->periodDays,
            'total_completed_days' => $this->completedDays,
        ];
    }
}
