<?php

namespace App\Repositories\Contracts;

use App\Models\Notification;
use Illuminate\Support\Collection;

interface NotificationRepositoryInterface
{
    public function getByUserId(int $userId): Collection;
    public function create(array $data): Notification;
    public function markAllRead(int $userId): void;
    public function markRead(int $notifId, int $userId): bool;
    public function countUnread(int $userId): int;
}
