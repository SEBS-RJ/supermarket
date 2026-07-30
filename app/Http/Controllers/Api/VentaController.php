<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\StockInsuficienteException;
use App\Http\Controllers\Controller;
use App\Http\Requests\AnularVentaRequest;
use App\Http\Requests\VentaRequest;
use App\Http\Resources\VentaResource;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class VentaController extends Controller
{
    /**
     * Listado paginado, sin detalles anidados (contrato 05: para no
     * sobrecargar la respuesta dado el volumen de ventas).
     * Restringido a administrador vía ->middleware('can:admin') en routes/api.php.
     */
    public function index(): JsonResponse
    {
        $ventas = Venta::orderByDesc('fecha_venta')->paginate(15);

        return VentaResource::collection($ventas)->response();
    }

    /**
     * Detalle de una venta, con cliente y detalles (+ producto) anidados.
     * Accesible para administrador y vendedor (el vendedor necesita ver
     * el recibo de la venta que acaba de registrar).
     */
    public function show(Venta $venta): JsonResponse
    {
        $venta->load(['cliente', 'detalles.producto']);

        return (new VentaResource($venta))->response();
    }

    /**
     * Registra una venta con uno o más productos.
     * Accesible para administrador y vendedor.
     *
     * Reglas:
     * - Todo o nada: si un solo producto no tiene stock suficiente,
     *   no se crea ninguna fila (transacción).
     * - Se usa lockForUpdate() para evitar condiciones de carrera si
     *   dos cajeros venden el mismo producto al mismo tiempo.
     * - El precio_unitario se congela al momento de la venta (no se
     *   recalcula después si el producto cambia de precio).
     * - 409 (no 422) para stock insuficiente: los datos enviados son
     *   válidos en su formato, el conflicto es de estado del negocio
     *   (mismo criterio que el 409 ya usado en destroy() por integridad
     *   referencial).
     */
    public function store(VentaRequest $request): JsonResponse
    {
        $datos = $request->validated();

        try {
            $venta = DB::transaction(function () use ($datos) {
                $productoIds = collect($datos['detalles'])->pluck('producto_id')->unique();

                // Bloquea las filas de producto involucradas hasta que termine
                // la transacción, para que dos ventas simultáneas no puedan
                // dejar el stock en negativo.
                $productos = Producto::whereIn('id', $productoIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $faltantes = [];
                $total = 0;

                foreach ($datos['detalles'] as $detalle) {
                    $producto = $productos[$detalle['producto_id']];

                    if ($producto->stock < $detalle['cantidad']) {
                        $faltantes[] = [
                            'producto_id' => $producto->id,
                            'nombre' => $producto->nombre,
                            'stock_disponible' => $producto->stock,
                            'cantidad_solicitada' => $detalle['cantidad'],
                        ];
                    }

                    $total += $producto->precio * $detalle['cantidad'];
                }

                if (! empty($faltantes)) {
                    // Se lanza dentro de la transacción para que el rollback
                    // sea automático; se captura afuera para devolver 409.
                    throw new StockInsuficienteException($faltantes);
                }

                $venta = Venta::create([
                    'cliente_id' => $datos['cliente_id'] ?? null,
                    'total' => $total,
                    'fecha_venta' => now(),
                    'estado' => 'completada',
                ]);

                foreach ($datos['detalles'] as $detalle) {
                    $producto = $productos[$detalle['producto_id']];
                    $subtotal = $producto->precio * $detalle['cantidad'];

                    DetalleVenta::create([
                        'venta_id' => $venta->id,
                        'producto_id' => $producto->id,
                        'cantidad' => $detalle['cantidad'],
                        'precio_unitario' => $producto->precio,
                        'subtotal' => $subtotal,
                    ]);

                    $producto->decrement('stock', $detalle['cantidad']);
                }

                return $venta;
            });
        } catch (StockInsuficienteException $e) {
            return response()->json([
                'message' => 'No se puede registrar la venta: stock insuficiente.',
                'productos' => $e->faltantes,
            ], Response::HTTP_CONFLICT);
        }

        $venta->load(['cliente', 'detalles.producto']);

        return (new VentaResource($venta))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Anula una venta: repone el stock de cada producto vendido y marca
     * estado = 'cancelada'. No borra ninguna fila (ni la venta ni sus
     * detalles) — el historial se conserva para reportes/auditoría.
     * Restringido a administrador vía ->middleware('can:admin') en routes/api.php.
     */
    public function anular(AnularVentaRequest $request, Venta $venta): JsonResponse
    {
        if ($venta->estado === 'cancelada') {
            return response()->json([
                'message' => 'Esta venta ya fue anulada.',
            ], Response::HTTP_CONFLICT);
        }

        DB::transaction(function () use ($venta, $request) {
            // Recarga los detalles dentro de la transacción y bloquea los
            // productos involucrados, igual que en store(), para que una
            // anulación y una venta nueva del mismo producto no se pisen.
            $venta->load('detalles');

            $productoIds = $venta->detalles->pluck('producto_id')->unique();

            $productos = Producto::whereIn('id', $productoIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($venta->detalles as $detalle) {
                $productos[$detalle->producto_id]->increment('stock', $detalle->cantidad);
            }

            $venta->update([
                'estado' => 'cancelada',
                'motivo_anulacion' => $request->validated('motivo'),
            ]);
        });

        $venta->load(['cliente', 'detalles.producto']);

        return (new VentaResource($venta))->response();
    }
}
