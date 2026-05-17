<?php

namespace App\Services\Notification;

use App\Models\Notification;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Support\Collection;

/**
 * Singleton — satu instance mengelola notifikasi in-app untuk semua user.
 */
class NotificationService
{
    private static ?self $instance = null;

    private function __construct(
        private readonly NotificationRepositoryInterface $notifRepo,
    ) {}

    public static function getInstance(NotificationRepositoryInterface $repo): static
    {
        if (static::$instance === null) {
            static::$instance = new static($repo);
        }

        return static::$instance;
    }

    public function getForUser(int $userId): Collection
    {
        return $this->notifRepo->getByUserId($userId);
    }

    public function create(int $userId, string $type, string $message, array $meta = []): Notification
    {
        return $this->notifRepo->create([
            'user_id' => $userId,
            'type'    => $type,
            'message' => $message,
            'meta'    => $meta,
            'read_at' => null,
        ]);
    }

    public function markAllRead(int $userId): void
    {
        $this->notifRepo->markAllRead($userId);
    }

    public function markRead(int $notifId, int $userId): bool
    {
        return $this->notifRepo->markRead($notifId, $userId);
    }

    public function getUnreadCount(int $userId): int
    {
        return $this->notifRepo->countUnread($userId);
    }
}
