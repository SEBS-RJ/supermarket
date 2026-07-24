<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            'Lácteos', 'Panadería', 'Carnes y Embutidos', 'Frutas y Verduras',
            'Bebidas', 'Snacks y Golosinas', 'Limpieza del Hogar', 'Cuidado Personal',
            'Congelados', 'Abarrotes', 'Mascotas', 'Bebés', 'Licores',
            'Electrodomésticos', 'Ferretería',
        ];

        foreach ($categorias as $nombre) {
            Categoria::factory()->create([
                'nombre' => $nombre,
                'slug' => Str::slug($nombre),
                'activo' => true,
            ]);
        }

        $this->command->info('Categorías creadas: ' . count($categorias));
    }
}