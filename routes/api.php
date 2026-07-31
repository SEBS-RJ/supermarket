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
*/

Route::prefix('v1')->group(function () {
    // Pública
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',     [AuthController::class, 'me']);

        // --- Lectura abierta a cualquier usuario autenticado ---
        Route::apiResource('categorias', CategoriaController::class)->only(['index', 'show']);

        // Productos: listar y destacados accesibles para ambos roles
        Route::get('productos/destacados', [ProductoController::class, 'destacados']);
        Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);

        // CRUD completo de clientes abierto para ambos roles
        Route::apiResource('clientes', ClienteController::class);

        // Ventas: registrar y ver recibo (ambos roles)
        Route::post('ventas', [VentaController::class, 'store']);
        Route::get('ventas/{venta}', [VentaController::class, 'show']);

        // --- Solo administrador ---
        Route::middleware('can:admin')->group(function () {
            Route::apiResource('categorias', CategoriaController::class)->only(['store', 'update', 'destroy']);

            // Productos: crear, actualizar (JSON o multipart), eliminar
            Route::apiResource('productos', ProductoController::class)->only(['store', 'update', 'destroy']);
            // Ruta POST para actualización con imagen (multipart/form-data)
            Route::post('productos/{producto}/actualizar', [ProductoController::class, 'update']);

            // Historial y anulación de ventas
            Route::get('ventas',                   [VentaController::class, 'index']);
            Route::patch('ventas/{venta}/anular',  [VentaController::class, 'anular']);

            // Gestión de cajeros
            Route::apiResource('usuarios', UsuarioController::class)->only(['index', 'store', 'show', 'update']);

            // Dashboard estadístico
            Route::get('dashboard/resumen',               [DashboardController::class, 'resumen']);
            Route::get('dashboard/ventas-por-categoria',  [DashboardController::class, 'ventasPorCategoria']);
            Route::get('dashboard/tendencia-ventas',      [DashboardController::class, 'tendenciaVentas']);
            Route::get('dashboard/productos-top',         [DashboardController::class, 'productosTop']);
        });
    });
});