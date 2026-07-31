<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClienteRequest;
use App\Http\Resources\ClienteResource;
use App\Models\Cliente;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClienteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Cliente::query();

        if ($request->filled('nombre')) {
            $query->whereRaw('LOWER(nombre) LIKE ?', ['%' . strtolower($request->input('nombre')) . '%']);
        }

        $clientes = $query->orderBy('nombre')->paginate(15)->withQueryString();

        return ClienteResource::collection($clientes)->response();
    }

    public function store(ClienteRequest $request): JsonResponse
    {
        $cliente = Cliente::create($request->validated());

        return (new ClienteResource($cliente))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        return (new ClienteResource($cliente))->response();
    }

    public function update(ClienteRequest $request, Cliente $cliente): JsonResponse
    {
        $cliente->update($request->validated());

        return (new ClienteResource($cliente))->response();
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        try {
            $cliente->delete();
        } catch (QueryException $e) {
            // El contrato (05) no exige 409 para clientes, pero se cubre
            // por consistencia si en el futuro una venta referencia al cliente
            // y la FK no está configurada con onDelete('set null'/'cascade').
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'No se puede eliminar: el cliente tiene ventas registradas.',
                ], Response::HTTP_CONFLICT);
            }

            throw $e;
        }

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
