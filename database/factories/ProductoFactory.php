<?php

namespace Database\Factories;

use App\Models\Categoria;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductoFactory extends Factory
{
    protected static array $prefijos = [
        'Premium', 'Clásico', 'Light', 'Orgánico', 'Artesanal', 'Selecto', 'Tradicional', 'Fresco',
    ];

    protected static array $productosBase = [
        'Leche entera 1L', 'Yogur natural', 'Queso fresco', 'Pan integral', 'Pan de molde',
        'Pollo entero', 'Carne molida', 'Jamón de pavo', 'Manzana roja', 'Plátano', 'Tomate',
        'Papa', 'Cebolla', 'Coca Cola 2L', 'Jugo de naranja', 'Agua mineral', 'Papas fritas',
        'Galletas de chocolate', 'Detergente líquido', 'Jabón de baño', 'Shampoo',
        'Pasta dental', 'Helado de vainilla', 'Pizza congelada', 'Arroz 1kg', 'Fideos',
        'Aceite vegetal', 'Alimento para perro', 'Pañales talla M', 'Cerveza', 'Vino tinto',
        'Taladro eléctrico', 'Foco LED',
    ];

    public function definition(): array
    {
        $nombreBase = $this->faker->randomElement(self::$productosBase);
        $prefijo = $this->faker->optional(0.4)->randomElement(self::$prefijos);
        $nombre = $prefijo ? "{$nombreBase} {$prefijo}" : $nombreBase;

        return [
            'categoria_id' => Categoria::inRandomOrder()->value('id') ?? Categoria::factory(),
            'nombre' => $nombre,
            'sku' => strtoupper(Str::random(3)) . '-' . $this->faker->unique()->numerify('######'),
            'descripcion' => $this->faker->optional(0.6)->sentence(15),
            'precio' => $this->faker->randomFloat(2, 2, 500),
            'stock' => $this->faker->numberBetween(0, 1000), // nunca negativo
            'activo' => $this->faker->boolean(92),
        ];
    }
}