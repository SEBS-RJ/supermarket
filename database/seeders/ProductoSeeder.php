<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    private const TOTAL_PRODUCTOS = 2000;
    private const LOTE = 500;

    public function run(): void
    {
        $lotes = (int) ceil(self::TOTAL_PRODUCTOS / self::LOTE);

        for ($i = 0; $i < $lotes; $i++) {
            Producto::factory()->count(self::LOTE)->create();
            $this->command->info('Productos creados: ' . (($i + 1) * self::LOTE) . '/' . self::TOTAL_PRODUCTOS);
        }
    }
}