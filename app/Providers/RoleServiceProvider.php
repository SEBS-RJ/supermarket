<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Access\Response;
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
        Gate::define('admin', function (User $user) {
            return $user->esAdministrador()
                ? Response::allow()
                : Response::deny('No tienes permisos de administrador para esta acción.');
        });
    }
}