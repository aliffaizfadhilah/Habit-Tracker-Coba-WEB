<?php

namespace App\Services\Checklist;

use App\Models\Habit;
use Carbon\Carbon;

/**
 * Prototype — menyimpan template habit dan menghasilkan salinannya
 * dengan periode baru tanpa mengubah data asli.
 */
class HabitPrototype
{
    private ?Habit $prototype = null;

    public function setPrototype(Habit $habit): static
    {
        $this->prototype = $habit;
        return $this;
    }

    public function cloneWithNewPeriod(string $newStart, string $newEnd): Habit
    {
        if (!$this->prototype) {
            throw new \RuntimeException('Prototype habit belum di-set.');
        }

        $start      = Carbon::parse($newStart);
        $end        = Carbon::parse($newEnd);
        $periodDays = $start->diffInDays($end) + 1;

        return Habit::create([
            'username'          => $this->prototype->username,
            'title'             => $this->prototype->title,
            'category'          => $this->prototype->category,
            'periode_start'     => $newStart,
            'periode_end'       => $newEnd,
            'total_period_days' => $periodDays,
            'status'            => 1,
            'reminder_time'     => $this->prototype->reminder_time,
            'reminder_enabled'  => true,
        ]);
    }
}
