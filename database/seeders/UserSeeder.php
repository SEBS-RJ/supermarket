<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Crea usuarios de prueba (uno de cada rol) para que cualquiera que clone
 * el repo pueda loguearse solo siguiendo el README, sin pasos manuales
 * de tinker. Usa updateOrCreate para que correr el seeder dos veces no
 * falle por email duplicado.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@super.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('Admin@1234'),
                'rol' => 'administrador',
                'activo' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'cajero1@super.com'],
            [
                'name' => 'Cajero de prueba',
                'password' => bcrypt('Cajero@1234'),
                'rol' => 'vendedor',
                'activo' => true,
            ]
        );

        $this->command->info('Usuarios de prueba creados: admin@super.com / cajero1@super.com');
    }
}
