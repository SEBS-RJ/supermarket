<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->index('categoria_id');
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->index(['estado', 'fecha_venta']);
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropIndex(['categoria_id']);
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->dropIndex(['estado', 'fecha_venta']);
        });
    }
};
