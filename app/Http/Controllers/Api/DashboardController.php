<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Endpoints de agregación para el dashboard (HU-07 a HU-10, doc 01).
 * Todo solo-administrador (ver routes/api.php, ->middleware('can:admin')).
 *
 * Todas las consultas excluyen ventas con estado = 'cancelada': el
 * dashboard debe reflejar ventas reales, no ventas anuladas.
 *
 * Se cachea cada respuesta 5 minutos (Cache::remember) porque la tabla
 * `ventas` tiene 500,000+ filas — sin cache, cada carga del dashboard
 * recalcularía las agregaciones desde cero.
 */
class DashboardController extends Controller
{
    private const TTL_MINUTOS = 5;

    /**
     * HU-09: resumen de métricas para las 4 tarjetas del dashboard.
     */
    public function resumen(): JsonResponse
    {
        $data = Cache::remember('dashboard:resumen', now()->addMinutes(self::TTL_MINUTOS), function () {
            return [
                'ventas_hoy' => (float) Venta::where('estado', 'completada')
                    ->whereDate('fecha_venta', today())
                    ->sum('total'),

                'ventas_mes' => (float) Venta::where('estado', 'completada')
                    ->whereYear('fecha_venta', now()->year)
                    ->whereMonth('fecha_venta', now()->month)
                    ->sum('total'),

                'productos_activos' => Producto::where('activo', true)->count(),

                'total_clientes' => Cliente::count(),
            ];
        });

        return response()->json($data);
    }

    /**
     * HU-10: informe de ventas por categoría, para la gráfica de barras.
     */
    public function ventasPorCategoria(): JsonResponse
    {
        $data = Cache::remember('dashboard:ventas-por-categoria', now()->addMinutes(self::TTL_MINUTOS), function () {
            return DetalleVenta::join('ventas', 'ventas.id', '=', 'detalles_venta.venta_id')
                ->join('productos', 'productos.id', '=', 'detalles_venta.producto_id')
                ->join('categorias', 'categorias.id', '=', 'productos.categoria_id')
                ->where('ventas.estado', 'completada')
                ->select('categorias.nombre as categoria', DB::raw('SUM(detalles_venta.subtotal) as total'))
                ->groupBy('categorias.nombre')
                ->orderByDesc('total')
                ->get()
                ->map(fn ($fila) => [
                    'categoria' => $fila->categoria,
                    'total' => (float) $fila->total,
                ]);
        });

        return response()->json(['data' => $data]);
    }

    /**
     * HU-07: total de ventas por día, últimos 30 días, para la gráfica
     * de línea. Rellena con 0 los días sin ventas para que no queden
     * huecos en la serie.
     */
    public function tendenciaVentas(): JsonResponse
    {
        $data = Cache::remember('dashboard:tendencia-ventas', now()->addMinutes(self::TTL_MINUTOS), function () {
            $desde = now()->subDays(29)->startOfDay();

            $porFecha = Venta::where('estado', 'completada')
                ->where('fecha_venta', '>=', $desde)
                ->select(DB::raw('DATE(fecha_venta) as fecha'), DB::raw('SUM(total) as total'))
                ->groupBy(DB::raw('DATE(fecha_venta)'))
                ->pluck('total', 'fecha');

            $serie = [];
            for ($i = 0; $i < 30; $i++) {
                $fecha = $desde->copy()->addDays($i)->toDateString();
                $serie[] = [
                    'fecha' => $fecha,
                    'total' => (float) ($porFecha[$fecha] ?? 0),
                ];
            }

            return $serie;
        });

        return response()->json(['data' => $data]);
    }

    /**
     * HU-08: producto más vendido (top 5), para la tabla del dashboard.
     */
    public function productosTop(): JsonResponse
    {
        $data = Cache::remember('dashboard:productos-top', now()->addMinutes(self::TTL_MINUTOS), function () {
            return DetalleVenta::join('ventas', 'ventas.id', '=', 'detalles_venta.venta_id')
                ->join('productos', 'productos.id', '=', 'detalles_venta.producto_id')
                ->where('ventas.estado', 'completada')
                ->select(
                    'productos.id as producto_id',
                    'productos.nombre',
                    DB::raw('SUM(detalles_venta.cantidad) as cantidad_vendida')
                )
                ->groupBy('productos.id', 'productos.nombre')
                ->orderByDesc('cantidad_vendida')
                ->limit(5)
                ->get()
                ->map(fn ($fila) => [
                    'producto_id' => $fila->producto_id,
                    'nombre' => $fila->nombre,
                    'cantidad_vendida' => (int) $fila->cantidad_vendida,
                ]);
        });

        return response()->json(['data' => $data]);
    }
}