<?php

namespace App\Repositories\Contracts;

use App\Models\Habit;
use Illuminate\Support\Collection;

interface HabitRepositoryInterface
{
    public function allByUsername(string $username): Collection;
    public function findById(int $id): ?Habit;
    public function findByIdAndUsername(int $id, string $username): ?Habit;
    public function create(array $data): Habit;
    public function update(Habit $habit, array $data): Habit;
    public function softDelete(Habit $habit): void;
}
