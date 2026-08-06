<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function (User $user): ?bool {
            return $user->hasRole('superadmin') ? true : null;
        });

        // Memaksa semua URL menggunakan HTTPS jika berjalan di Render (Production)
        // if (config('app.env') === 'production' || env('RENDER')) {
        //     URL::forceScheme('https');
        // }

        // lokalan
        if (config('operations.force_https')) {
            URL::forceScheme('https');
        }
    }
}
