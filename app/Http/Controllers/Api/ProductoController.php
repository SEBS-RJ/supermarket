<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductoRequest;
use App\Http\Resources\ProductoResource;
use App\Models\DetalleVenta;
use App\Models\Producto;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Producto::query()->with('categoria');

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->input('categoria_id'));
        }

        if ($request->filled('nombre')) {
            $query->whereRaw('LOWER(nombre) LIKE ?', ['%' . strtolower($request->input('nombre')) . '%']);
        }

        if ($request->filled('precio_min')) {
            $query->where('precio', '>=', $request->input('precio_min'));
        }

        if ($request->filled('precio_max')) {
            $query->where('precio', '<=', $request->input('precio_max'));
        }

        $productos = $query->orderByDesc('id')->paginate(50)->withQueryString();

        return ProductoResource::collection($productos)->response();
    }

    /**
     * Productos más vendidos (sin restricción de rol).
     * Usados por la pantalla de venta del cajero para mostrar los favoritos.
     */
    public function destacados(): JsonResponse
    {
        $destacados = Producto::select('productos.*')
            ->selectSub(
                DetalleVenta::join('ventas', 'ventas.id', '=', 'detalles_venta.venta_id')
                    ->where('ventas.estado', 'completada')
                    ->whereColumn('detalles_venta.producto_id', 'productos.id')
                    ->selectRaw('COALESCE(SUM(detalles_venta.cantidad), 0)'),
                'total_vendido'
            )
            ->where('productos.activo', true)
            ->with('categoria')
            ->orderByDesc('total_vendido')
            ->limit(8)
            ->get();

        return ProductoResource::collection($destacados)->response();
    }

    public function show(Producto $producto): JsonResponse
    {
        $producto->load('categoria');

        return (new ProductoResource($producto))->response();
    }

    public function store(ProductoRequest $request): JsonResponse
    {
        $datos = $request->validated();

        if ($request->hasFile('imagen')) {
            $datos['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto = Producto::create($datos);
        $producto->load('categoria');

        return (new ProductoResource($producto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Se acepta tanto PUT (JSON) como POST multipart con _method=PUT.
     * Para simplificar, la ruta de actualización acepta POST explícitamente.
     */
    public function update(ProductoRequest $request, Producto $producto): JsonResponse
    {
        $datos = $request->validated();

        if ($request->hasFile('imagen')) {
            // Eliminar imagen anterior si existe
            if ($producto->imagen) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $datos['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($datos);
        $producto->load('categoria');

        return (new ProductoResource($producto))->response();
    }

    public function destroy(Producto $producto): JsonResponse
    {
        try {
            // Eliminar imagen de storage si existe
            if ($producto->imagen) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $producto->delete();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'No se puede eliminar: el producto tiene ventas registradas.',
                ], Response::HTTP_CONFLICT);
            }

            throw $e;
        }

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}