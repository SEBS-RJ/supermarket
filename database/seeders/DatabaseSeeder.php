<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Cliente;
use App\Models\Venta;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

  public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategoriaSeeder::class,
            ProductoSeeder::class,
            ClienteSeeder::class,
            VentaSeeder::class,
        ]);
    }
}