<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\Venta;
use Illuminate\Database\Eloquent\Factories\Factory;

class VentaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => $this->faker->boolean(85)
                ? Cliente::inRandomOrder()->value('id')
                : null, // venta sin cliente registrado, permitido por el modelo
            'total' => 0, // se recalcula en configure() según los detalles reales
            'fecha_venta' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'estado' => $this->faker->randomElement(['completada', 'completada', 'completada', 'completada', 'cancelada']),
        ];
    }

    /**
     * Al usar esta factory sola (tests, tinker) genera entre 1 y 5 detalles
     * y recalcula el total real de la venta. El VentaSeeder masivo NO usa
     * este flujo por rendimiento; hace inserción por lotes directamente.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Venta $venta) {
            $detalles = DetalleVenta::factory()
                ->count($this->faker->numberBetween(1, 5))
                ->create(['venta_id' => $venta->id]);

            $venta->update(['total' => $detalles->sum('subtotal')]);
        });
    }
}