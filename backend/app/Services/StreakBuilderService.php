<?php

namespace App\Services;

use App\Models\Habit;
use Carbon\Carbon;

class StreakBuilderService
{
    private array $logDates    = [];   // tanggal yang sudah dicentang
    private int   $periodDays  = 0;    // total hari dalam periode
    private int   $completedDays = 0;  // total hari yang dicentang

    private int   $currentStreak  = 0;
    private int   $longestStreak  = 0;
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
            $this->periodDays = $habit->periode_start
                ->diffInDays($habit->periode_end) + 1;
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

        $streak  = 0;
        $checkDate = Carbon::today();

        while (true) {
            $dateStr = $checkDate->toDateString();

            if (in_array($dateStr, $this->logDates)) {
                $streak++;
                $checkDate->subDay();
            } else {
                break; // streak putus
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
                // Hari berurutan — tambah streak
                $current++;
                $longest = max($longest, $current);
            } else {
                // Streak putus — reset
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

        $this->progressPercent = round(
            ($this->completedDays / $this->periodDays) * 100,
            2
        );

        
        $this->progressPercent = min(100.0, $this->progressPercent);

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