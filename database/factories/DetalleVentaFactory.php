<?php

namespace Database\Factories;

use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Database\Eloquent\Factories\Factory;

class DetalleVentaFactory extends Factory
{
    public function definition(): array
    {
        $producto = Producto::inRandomOrder()->first() ?? Producto::factory()->create();
        $cantidad = $this->faker->numberBetween(1, 10);
        $precioUnitario = (float) $producto->precio; // precio "congelado" al momento de la venta

        return [
            'venta_id' => Venta::factory(),
            'producto_id' => $producto->id,
            'cantidad' => $cantidad,
            'precio_unitario' => $precioUnitario,
            'subtotal' => round($cantidad * $precioUnitario, 2),
        ];
    }
}