<?php

namespace App\Services\Share;

use App\Models\Habit;

/**
 * Builder — membangun payload postingan/share secara bertahap.
 */
class ShareBuilder
{
    private array $payload = [];

    public function fromHabit(Habit $habit): static
    {
        $this->payload['habit_id']         = $habit->id_habit;
        $this->payload['habit_title']      = $habit->title;
        $this->payload['progress_percent'] = $habit->progress_percent;

        return $this;
    }

    public function withTitle(string $title): static
    {
        $this->payload['title'] = $title;
        return $this;
    }

    public function withCaption(?string $caption): static
    {
        $this->payload['caption'] = $caption;
        return $this;
    }

    public function withImagePath(string $path): static
    {
        $this->payload['image_path'] = $path;
        return $this;
    }

    public function withUserId(int $userId): static
    {
        $this->payload['user_id'] = $userId;
        return $this;
    }

    public function build(): array
    {
        return $this->payload;
    }
}
