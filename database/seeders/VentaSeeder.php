<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Producto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VentaSeeder extends Seeder
{
    private const TOTAL_VENTAS = 500000;

    // Ventas insertadas por lote. 2000 filas x 6 columnas = 12,000 parámetros,
    // muy por debajo del límite de PostgreSQL (65,535 parámetros por query).
    private const VENTAS_POR_LOTE = 2000;

    // Sub-lote para detalles_venta. 3000 filas x 5 columnas = 15,000 parámetros.
    private const DETALLES_POR_LOTE = 3000;

    public function run(): void
    {
        $productos = Producto::select('id', 'precio')->get();
        $clienteIds = Cliente::pluck('id')->all();

        if ($productos->isEmpty()) {
            $this->command->error('No hay productos. Ejecuta ProductoSeeder antes que VentaSeeder.');
            return;
        }

        $totalLotes = (int) ceil(self::TOTAL_VENTAS / self::VENTAS_POR_LOTE);

        for ($lote = 0; $lote < $totalLotes; $lote++) {
            $cantidadEnEsteLote = min(
                self::VENTAS_POR_LOTE,
                self::TOTAL_VENTAS - ($lote * self::VENTAS_POR_LOTE)
            );

            $this->procesarLote($cantidadEnEsteLote, $productos, $clienteIds);

            if (($lote + 1) % 10 === 0 || $lote === $totalLotes - 1) {
                $ventasHechas = min(self::TOTAL_VENTAS, ($lote + 1) * self::VENTAS_POR_LOTE);
                $this->command->info("Ventas insertadas: {$ventasHechas}/" . self::TOTAL_VENTAS);
            }
        }
    }

    /**
     * Genera un lote de ventas: primero arma los detalles en memoria (para poder
     * calcular el total real de cada venta), inserta las ventas devolviendo sus IDs
     * (RETURNING id, propio de PostgreSQL), y finalmente inserta los detalles ya
     * enlazados a esos IDs, en sub-lotes.
     */
    private function procesarLote(int $cantidadVentas, $productos, array $clienteIds): void
    {
        $ahora = Carbon::now()->format('Y-m-d H:i:s');

        $ventasParaInsertar = [];
        $detallesPorVentaTemporal = [];

        for ($i = 0; $i < $cantidadVentas; $i++) {
            $numDetalles = random_int(1, 5);
            $detallesTemp = [];
            $totalVenta = 0.0;

            for ($d = 0; $d < $numDetalles; $d++) {
                $producto = $productos->random();
                $cantidad = random_int(1, 10);
                $precioUnitario = (float) $producto->precio;
                $subtotal = round($cantidad * $precioUnitario, 2);

                $detallesTemp[] = [
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precioUnitario,
                    'subtotal' => $subtotal,
                ];

                $totalVenta += $subtotal;
            }

            $fechaVenta = Carbon::now()
                ->subDays(random_int(0, 730))
                ->subMinutes(random_int(0, 1440))
                ->format('Y-m-d H:i:s');

            $estado = random_int(1, 100) <= 5 ? 'cancelada' : 'completada';

            $clienteId = (!empty($clienteIds) && random_int(1, 100) <= 85)
                ? $clienteIds[array_rand($clienteIds)]
                : null;

            $ventasParaInsertar[] = [
                'cliente_id' => $clienteId,
                'total' => round($totalVenta, 2), // suma real de los subtotales de sus detalles
                'fecha_venta' => $fechaVenta,
                'estado' => $estado,
                'created_at' => $ahora,
                'updated_at' => $ahora,
            ];

            $detallesPorVentaTemporal[] = $detallesTemp;
        }

        $ventaIds = $this->insertarVentasYObtenerIds($ventasParaInsertar);

        $detallesParaInsertar = [];
        foreach ($ventaIds as $index => $ventaId) {
            foreach ($detallesPorVentaTemporal[$index] as $detalle) {
                $detallesParaInsertar[] = [
                    'venta_id' => $ventaId,
                    'producto_id' => $detalle['producto_id'],
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'subtotal' => $detalle['subtotal'],
                ];
            }
        }

        foreach (array_chunk($detallesParaInsertar, self::DETALLES_POR_LOTE) as $subLote) {
            DB::table('detalles_venta')->insert($subLote);
        }
    }

    /**
     * Inserta un lote de ventas con una sola sentencia INSERT ... RETURNING id
     * (sintaxis de PostgreSQL) y devuelve los IDs generados, en el mismo orden
     * en que se insertaron las filas.
     */
    private function insertarVentasYObtenerIds(array $ventas): array
    {
        $columnas = ['cliente_id', 'total', 'fecha_venta', 'estado', 'created_at', 'updated_at'];

        $placeholders = [];
        $bindings = [];

        foreach ($ventas as $venta) {
            $placeholders[] = '(' . implode(', ', array_fill(0, count($columnas), '?')) . ')';
            foreach ($columnas as $columna) {
                $bindings[] = $venta[$columna];
            }
        }

        $sql = 'INSERT INTO ventas (' . implode(', ', $columnas) . ') VALUES '
            . implode(', ', $placeholders)
            . ' RETURNING id';

        $resultados = DB::select($sql, $bindings);

        return array_map(fn ($fila) => $fila->id, $resultados);
    }
}