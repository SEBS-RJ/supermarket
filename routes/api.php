<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\VentaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Supermercado
|--------------------------------------------------------------------------
|
| Prefijo /api/v1. Autenticación con Sanctum (tokens). Roles: administrador
| y vendedor (columna users.rol). Ver Gate 'admin' en RoleServiceProvider.
|
| - Categorías: lectura para ambos roles, escritura solo administrador.
| - Productos:  lectura para ambos roles, escritura solo administrador.
| - Clientes:   CRUD completo para ambos roles.
| - Ventas:     store y show para ambos roles; index y anular solo admin.
| - Usuarios:   todo solo administrador. No hay destroy: se desactiva.
| - Dashboard:  todo solo administrador (HU-07 a HU-10).
|
*/

Route::prefix('v1')->group(function () {
    // Pública
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);

        // Lectura abierta a cualquier usuario autenticado
        Route::apiResource('categorias', CategoriaController::class)->only(['index', 'show']);
        Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);

        // CRUD completo abierto a cualquier usuario autenticado
        Route::apiResource('clientes', ClienteController::class);

        // Ventas: registrar y ver el propio recibo, para ambos roles
        Route::post('ventas', [VentaController::class, 'store']);
        Route::get('ventas/{venta}', [VentaController::class, 'show']);

        // Solo administrador
        Route::middleware('can:admin')->group(function () {
            Route::apiResource('categorias', CategoriaController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('productos', ProductoController::class)->only(['store', 'update', 'destroy']);

            // Reportes y control de ventas
            Route::get('ventas', [VentaController::class, 'index']);
            Route::patch('ventas/{venta}/anular', [VentaController::class, 'anular']);

            // Gestión de cajeros (sin destroy: se desactiva, no se borra)
            Route::apiResource('usuarios', UsuarioController::class)->only(['index', 'store', 'show', 'update']);

            // Dashboard (HU-07 a HU-10)
            Route::get('dashboard/resumen', [DashboardController::class, 'resumen']);
            Route::get('dashboard/ventas-por-categoria', [DashboardController::class, 'ventasPorCategoria']);
            Route::get('dashboard/tendencia-ventas', [DashboardController::class, 'tendenciaVentas']);
            Route::get('dashboard/productos-top', [DashboardController::class, 'productosTop']);
        });
    });
});