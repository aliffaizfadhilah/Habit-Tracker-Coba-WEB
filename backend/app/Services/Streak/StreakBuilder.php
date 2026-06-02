<?php

namespace App\Services\Streak;

use App\Models\Habit;
use Carbon\Carbon;

/**
 * Builder — membangun data streak secara bertahap via method chaining.
 * Urutan: loadActivityLogs → calculatePeriodDays → calculateCurrentStreak
 *         → calculateLongestStreak → calculateProgress → saveToHabit → build
 */
class StreakBuilder
{
    private array $logDates      = [];
    private int   $periodDays    = 0;
    private int   $completedDays = 0;

    private int   $currentStreak   = 0;
    private int   $longestStreak   = 0;
    private float $progressPercent = 0.0;

    public function loadActivityLogs(Habit $habit): static
    {
        $this->logDates = $habit->activityLogs()
            ->where('status', 1)
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        return $this;
    }

    public function calculatePeriodDays(Habit $habit): static
    {
        if ($habit->periode_start && $habit->periode_end) {
            $this->periodDays = $habit->periode_start->diffInDays($habit->periode_end) + 1;
        }

        $this->completedDays = count(array_unique($this->logDates));

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
