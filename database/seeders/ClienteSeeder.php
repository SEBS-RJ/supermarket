<?php

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    private const TOTAL_CLIENTES = 5000;
    private const LOTE = 500;

    public function run(): void
    {
        $lotes = (int) ceil(self::TOTAL_CLIENTES / self::LOTE);

        for ($i = 0; $i < $lotes; $i++) {
            Cliente::factory()->count(self::LOTE)->create();
            $this->command->info('Clientes creados: ' . (($i + 1) * self::LOTE) . '/' . self::TOTAL_CLIENTES);
        }
    }
}