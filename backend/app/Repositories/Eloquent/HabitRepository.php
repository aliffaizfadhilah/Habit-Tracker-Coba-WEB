<?php

namespace App\Repositories\Eloquent;

use App\Models\Habit;
use App\Repositories\Contracts\HabitRepositoryInterface;
use Illuminate\Support\Collection;

class HabitRepository implements HabitRepositoryInterface
{
    public function allByUsername(string $username): Collection
    {
        return Habit::where('username', $username)
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findById(int $id): ?Habit
    {
        return Habit::where('id_habit', $id)->where('status', 1)->first();
    }

    public function findByIdAndUsername(int $id, string $username): ?Habit
    {
        return Habit::where('id_habit', $id)
            ->where('username', $username)
            ->where('status', 1)
            ->first();
    }

    public function create(array $data): Habit
    {
        return Habit::create($data);
    }

    public function update(Habit $habit, array $data): Habit
    {
        $habit->update($data);
        return $habit->fresh();
    }

    public function softDelete(Habit $habit): void
    {
        $habit->update(['status' => 0]);
    }
}
