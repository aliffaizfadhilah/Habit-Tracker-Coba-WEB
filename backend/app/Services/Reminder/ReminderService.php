<?php

namespace App\Services\Reminder;

use App\Models\Habit;
use App\Repositories\Contracts\ReminderRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Singleton — satu instance mengelola semua reminder habit.
 * Biasanya dipanggil dari scheduled command (artisan schedule).
 */
class ReminderService
{
    private static ?self $instance = null;

    private function __construct(
        private readonly ReminderRepositoryInterface $reminderRepo,
    ) {}

    public static function getInstance(ReminderRepositoryInterface $repo): static
    {
        if (static::$instance === null) {
            static::$instance = new static($repo);
        }

        return static::$instance;
    }

    /**
     * Ambil semua habit yang remindernya aktif pada waktu tertentu.
     */
    public function getDueHabits(string $time = null): Collection
    {
        $time = $time ?? Carbon::now()->format('H:i');

        return $this->reminderRepo->findHabitsWithReminder($time);
    }

    /**
     * Update pengaturan reminder untuk sebuah habit.
     */
    public function update(Habit $habit, array $data): Habit
    {
        return $this->reminderRepo->updateReminder($habit, $data);
    }

    /**
     * Nonaktifkan reminder jika habit sudah selesai/period berakhir.
     */
    public function disableIfCompleted(Habit $habit): void
    {
        $periodEnded = $habit->periode_end && Carbon::today()->isAfter($habit->periode_end);
        $isComplete  = $habit->progress_percent >= 100.0;

        if (($isComplete || $periodEnded) && $habit->reminder_enabled) {
            $this->reminderRepo->updateReminder($habit, ['reminder_enabled' => false]);
        }
    }
}
