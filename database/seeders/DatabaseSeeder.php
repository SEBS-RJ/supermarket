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
            CategoriaSeeder::class, // 1. sin dependencias
            ProductoSeeder::class,  // 2. depende de categorias
            ClienteSeeder::class,   // 3. sin dependencias
            VentaSeeder::class,     // 4. depende de productos y clientes; genera ventas + detalles_venta
        ]);
    }
}
