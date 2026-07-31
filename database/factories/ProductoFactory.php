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

    // Paleta de colores para el fondo de la imagen generada (sin el "#",
    // como lo pide ui-avatars). Se elige por índice según el nombre del
    // producto, para que un mismo producto tienda a repetir color.
    protected static array $colores = [
        '6366f1', '059669', 'dc2626', 'd97706', '2563eb',
        '7c3aed', '0891b2', 'db2777', '65a30d', 'ea580c',
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
            'imagen' => $this->generarImagenPlaceholder($nombre),
            'precio' => $this->faker->randomFloat(2, 2, 500),
            'stock' => $this->faker->numberBetween(0, 1000), // nunca negativo
            'activo' => $this->faker->boolean(92),
        ];
    }

    /**
     * Genera una URL de imagen "placeholder" con las iniciales del producto
     * sobre un fondo de color (servicio ui-avatars.com).
     *
     * Por qué así y no con IA: generar 2000 imágenes reales con un modelo
     * de imagen tomaría minutos/horas y tiene costo por imagen — no tiene
     * sentido para datos de prueba. Este servicio arma la imagen al vuelo
     * (solo se descarga cuando el navegador la muestra, no durante el
     * seeder), así que sembrar los 2000 productos sigue siendo instantáneo.
     *
     * Si en algún momento se quiere reemplazar por fotos reales, solo hay
     * que cambiar esta función — el resto del sistema (accessor del modelo,
     * frontend) ya sabe mostrar tanto rutas de archivo como URLs externas.
     */
    private function generarImagenPlaceholder(string $nombre): string
    {
        $color = self::$colores[crc32($nombre) % count(self::$colores)];

        return 'https://ui-avatars.com/api/?' . http_build_query([
            'name' => $nombre,
            'background' => $color,
            'color' => 'fff',
            'size' => 400,
            'bold' => 'true',
            'length' => 2,
        ]);
    }
}
