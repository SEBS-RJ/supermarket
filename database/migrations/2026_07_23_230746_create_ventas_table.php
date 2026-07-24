<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->onDelete('set null');
            $table->decimal('total', 12, 2);
            $table->dateTime('fecha_venta')->useCurrent();
            $table->string('estado', 20)->default('completada');
            $table->timestamps();

            $table->index('fecha_venta');
        });

        DB::statement("ALTER TABLE ventas ADD CONSTRAINT ventas_estado_check CHECK (estado IN ('completada', 'cancelada'))");
        DB::statement('ALTER TABLE ventas ADD CONSTRAINT ventas_total_check CHECK (total >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
