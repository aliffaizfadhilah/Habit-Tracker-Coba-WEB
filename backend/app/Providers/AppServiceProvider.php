<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Providers\RepositoryServiceProvider;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\ReminderRepositoryInterface;
use App\Services\Auth\OtpService;
use App\Services\Notification\NotificationService;
use App\Services\Reminder\ReminderService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(RepositoryServiceProvider::class);

        $this->app->singleton(OtpService::class, fn() => OtpService::getInstance());

        $this->app->singleton(
            NotificationService::class,
            fn($app) => NotificationService::getInstance($app->make(NotificationRepositoryInterface::class))
        );

        $this->app->singleton(
            ReminderService::class,
            fn($app) => ReminderService::getInstance($app->make(ReminderRepositoryInterface::class))
        );
    }

    public function boot(): void
    {
        //
    }
}
