<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Providers\RepositoryServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->register(RepositoryServiceProvider::class);
    }

    public function boot(): void
    {
        //
    }
}
