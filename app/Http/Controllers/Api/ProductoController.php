<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductoRequest;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Producto::query()->with('categoria');

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->input('categoria_id'));
        }

        if ($request->filled('precio_min')) {
            $query->where('precio', '>=', $request->input('precio_min'));
        }

        if ($request->filled('precio_max')) {
            $query->where('precio', '<=', $request->input('precio_max'));
        }

        $productos = $query->orderBy('nombre')->paginate(15)->withQueryString();

        return ProductoResource::collection($productos)->response();
    }

    public function store(ProductoRequest $request): JsonResponse
    {
        $producto = Producto::create($request->validated());
        $producto->load('categoria');

        return (new ProductoResource($producto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Producto $producto): JsonResponse
    {
        $producto->load('categoria');

        return (new ProductoResource($producto))->response();
    }

    public function update(ProductoRequest $request, Producto $producto): JsonResponse
    {
        $producto->update($request->validated());
        $producto->load('categoria');

        return (new ProductoResource($producto))->response();
    }

    public function destroy(Producto $producto): JsonResponse
    {
        try {
            $producto->delete();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'No se puede eliminar: tiene ventas registradas.',
                ], Response::HTTP_CONFLICT);
            }

            throw $e;
        }

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}