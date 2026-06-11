<?php

namespace App\Providers;

use App\Repositories\Contracts\ActivityLogRepositoryInterface;
use App\Repositories\Contracts\HabitRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\PostRepositoryInterface;
use App\Repositories\Contracts\ReminderRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\ActivityLogRepository;
use App\Repositories\Eloquent\HabitRepository;
use App\Repositories\Eloquent\NotificationRepository;
use App\Repositories\Eloquent\PostRepository;
use App\Repositories\Eloquent\ReminderRepository;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class,        UserRepository::class);
        $this->app->bind(HabitRepositoryInterface::class,       HabitRepository::class);
        $this->app->bind(ActivityLogRepositoryInterface::class,  ActivityLogRepository::class);
        $this->app->bind(PostRepositoryInterface::class,         PostRepository::class);
        $this->app->bind(ReminderRepositoryInterface::class,     ReminderRepository::class);
        $this->app->bind(NotificationRepositoryInterface::class, NotificationRepository::class);
    }
}
