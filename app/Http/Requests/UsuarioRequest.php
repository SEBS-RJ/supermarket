<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $usuarioId = $this->route('usuario');
        $creando = $this->isMethod('post');

        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($usuarioId),
            ],
            // Obligatoria al crear; opcional al editar (si no se manda,
            // se conserva la contraseña actual — ver UsuarioController).
            'password' => [
                $creando ? 'required' : 'nullable',
                'string',
            Password::min(8)->mixedCase()->numbers()->symbols()
          ],
            'activo' => ['nullable', 'boolean'],

            // Importante: 'rol' NO se acepta desde el body. Este endpoint es
            // solo-admin y siempre crea cuentas de vendedor (ver controlador);
            // si algún día se necesita crear otro admin, se hace por tinker/
            // seeder, igual que el primer admin, para no exponer una forma de
            // que la API misma otorgue privilegios de administrador.
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser un texto válido.',
            'name.max' => 'El nombre no puede superar los 150 caracteres.',

            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'El correo no tiene un formato válido.',
            'email.max' => 'El correo no puede superar los 150 caracteres.',
            'email.unique' => 'Ya existe un usuario con ese correo.',

            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe ser un texto válido.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixed' => 'La contraseña debe incluir mayúsculas y minúsculas.',
            'password.numbers' => 'La contraseña debe incluir al menos un número.',
            'password.symbols' => 'La contraseña debe incluir al menos un carácter especial.',

            'activo.boolean' => 'El campo activo debe ser verdadero o falso.',
        ];
    }
}