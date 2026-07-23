<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');
            $table->string('nombre', 200);
            $table->string('sku', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 12, 2);
            $table->integer('stock')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        DB::statement('ALTER TABLE productos ADD CONSTRAINT productos_stock_check CHECK (stock >= 0)');
        DB::statement('ALTER TABLE productos ADD CONSTRAINT productos_precio_check CHECK (precio >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
