<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Autentica al usuario y devuelve un token de Sanctum.
     * Usa el mismo formato de error 422 que el resto del contrato (05)
     * cuando las credenciales no son válidas o la cuenta está desactivada.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        if (! $user->activo) {
            throw ValidationException::withMessages([
                'email' => ['Esta cuenta está desactivada. Contacta al administrador.'],
            ]);
        }

        $token = $user->createToken('token-frontend')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'rol'),
            'token' => $token,
        ]);
    }

    /**
     * Revoca únicamente el token usado en la request actual
     * (no todos los tokens del usuario, por si tiene sesión en otro dispositivo).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }

    /**
     * Devuelve el usuario autenticado (útil para que el frontend
     * verifique la sesión al recargar la app).
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->only('id', 'name', 'email', 'rol'));
    }
}
