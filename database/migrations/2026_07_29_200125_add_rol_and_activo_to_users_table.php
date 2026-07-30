<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 'administrador' o 'vendedor'. String (no enum) para no depender
            // de ALTER TABLE si se agrega un rol nuevo más adelante.
            $table->string('rol', 20)->default('vendedor')->after('email');

            // En vez de borrar cajeros (rompería el rastro de qué usuario
            // hizo qué venta), el admin los desactiva.
            $table->boolean('activo')->default(true)->after('rol');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rol', 'activo']);
        });
    }
};
