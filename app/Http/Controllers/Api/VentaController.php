<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VentaResource;
use App\Models\Venta;
use Illuminate\Http\JsonResponse;

class VentaController extends Controller
{
    /**
     * Listado paginado, sin detalles anidados (contrato 05: para no
     * sobrecargar la respuesta dado el volumen de ventas).
     */
    public function index(): JsonResponse
    {
        $ventas = Venta::orderByDesc('fecha_venta')->paginate(15);

        return VentaResource::collection($ventas)->response();
    }

    /**
     * Detalle de una venta, con cliente y detalles (+ producto) anidados.
     */
    public function show(Venta $venta): JsonResponse
    {
        $venta->load(['cliente', 'detalles.producto']);

        return (new VentaResource($venta))->response();
    }
}