<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoriaFactory extends Factory
{
    public function definition(): array
    {
        // Nombre único generado con faker (el seeder usará nombres reales de supermercado
        // sobrescribiendo este valor, pero la factory queda lista para tests/tinker).
        $nombre = ucfirst($this->faker->unique()->words(2, true));

        return [
            'nombre' => $nombre,
            'slug' => Str::slug($nombre),
            'descripcion' => $this->faker->optional(0.7)->sentence(10),
            'activo' => $this->faker->boolean(90),
        ];
    }
}