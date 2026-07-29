<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoriaRequest;
use App\Http\Resources\CategoriaResource;
use App\Models\Categoria;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::orderBy('nombre')->paginate(15);

        return CategoriaResource::collection($categorias)->response();
    }

    public function store(CategoriaRequest $request): JsonResponse
    {
        $categoria = Categoria::create($request->validated());

        return (new CategoriaResource($categoria))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Categoria $categoria): JsonResponse
    {
        return (new CategoriaResource($categoria))->response();
    }

    public function update(CategoriaRequest $request, Categoria $categoria): JsonResponse
    {
        $categoria->update($request->validated());

        return (new CategoriaResource($categoria))->response();
    }

    public function destroy(Categoria $categoria): JsonResponse
    {
        try {
            $categoria->delete();
        } catch (QueryException $e) {
            // Código 23000 = violación de restricción de integridad (FK)
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'No se puede eliminar: la categoría tiene productos asociados.',
                ], Response::HTTP_CONFLICT);
            }

            throw $e;
        }

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}