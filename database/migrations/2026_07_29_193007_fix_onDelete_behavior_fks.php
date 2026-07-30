<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Corrige solo las 2 FK que estaban mal en las migraciones originales
 * (verificado contra el código real del proyecto):
 *
 * - productos.categoria_id      cascade -> restrict
 * - detalles_venta.producto_id  cascade -> restrict
 *
 * ventas.cliente_id (ya está en 'set null') y detalles_venta.venta_id
 * (ya está en 'cascade') NO se tocan porque ya estaban correctas.
 *
 * Motivo (ver doc 02, "Comportamiento de borrado por clave foránea"):
 * con cascade en categoria_id/producto_id, Laravel nunca lanza el error de
 * integridad que CategoriaController::destroy() y ProductoController::destroy()
 * necesitan capturar para devolver 409 — en su lugar borraría en cascada
 * productos o el historial de ventas sin avisar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->foreign('categoria_id')
                ->references('id')->on('categorias')
                ->restrictOnDelete();
        });

        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->foreign('producto_id')
                ->references('id')->on('productos')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->foreign('categoria_id')
                ->references('id')->on('categorias')
                ->cascadeOnDelete();
        });

        Schema::table('detalles_venta', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->foreign('producto_id')
                ->references('id')->on('productos')
                ->cascadeOnDelete();
        });
    }
};
