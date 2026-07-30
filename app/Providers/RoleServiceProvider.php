<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class RoleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Usado en las rutas como ->middleware('can:admin').
        Gate::define('admin', function (User $user) {
            return $user->esAdministrador();
        });
    }
}
