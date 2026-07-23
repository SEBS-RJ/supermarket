<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalles_venta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();

            $table->index('venta_id');
            $table->index('producto_id');
        });

        DB::statement('ALTER TABLE detalles_venta ADD CONSTRAINT detalles_venta_cantidad_check CHECK (cantidad > 0)');
        DB::statement('ALTER TABLE detalles_venta ADD CONSTRAINT detalles_venta_precio_unitario_check CHECK (precio_unitario >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('detalles_venta');
    }
};
