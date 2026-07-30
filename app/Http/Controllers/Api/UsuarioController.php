<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

/**
 * Gestión de usuarios. Todo el controlador es solo-administrador
 * (ver routes/api.php, envuelto en ->middleware('can:admin')).
 *
 * No tiene destroy(): un usuario no se borra, se desactiva (campo `activo`),
 * para no perder el rastro de qué usuario registró o anuló cada venta.
 *
 * store() siempre crea rol = 'vendedor', sin importar qué venga en el body:
 * este endpoint es para que el admin cree cajeros, no para crear otros
 * administradores (eso se hace por tinker/seeder, como el primer admin).
 */
class UsuarioController extends Controller
{
    public function index(): JsonResponse
    {
        $usuarios = User::orderBy('name')->paginate(15);

        return UsuarioResource::collection($usuarios)->response();
    }

    public function store(UsuarioRequest $request): JsonResponse
    {
        $usuario = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'rol' => User::ROL_VENDEDOR,
            'activo' => $request->validated('activo') ?? true,
        ]);

        return (new UsuarioResource($usuario))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(User $usuario): JsonResponse
    {
        return (new UsuarioResource($usuario))->response();
    }

    public function update(UsuarioRequest $request, User $usuario): JsonResponse
    {
        $datos = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ];

        if ($request->filled('password')) {
            $datos['password'] = Hash::make($request->validated('password'));
        }

        if ($request->has('activo')) {
            $datos['activo'] = $request->validated('activo');
        }

        $usuario->update($datos);

        return (new UsuarioResource($usuario))->response();
    }
}
