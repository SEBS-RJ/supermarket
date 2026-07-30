<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VentaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['nullable', 'integer', 'exists:clientes,id'],
            'detalles' => ['required', 'array', 'min:1'],
            'detalles.*.producto_id' => ['required', 'integer', 'exists:productos,id'],
            'detalles.*.cantidad' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.integer' => 'El cliente seleccionado no es válido.',
            'cliente_id.exists' => 'El cliente seleccionado no existe.',

            'detalles.required' => 'La venta debe tener al menos un producto.',
            'detalles.array' => 'El formato de los productos de la venta no es válido.',
            'detalles.min' => 'La venta debe tener al menos un producto.',

            'detalles.*.producto_id.required' => 'Cada producto de la venta es obligatorio.',
            'detalles.*.producto_id.integer' => 'El producto seleccionado no es válido.',
            'detalles.*.producto_id.exists' => 'Uno de los productos seleccionados no existe.',

            'detalles.*.cantidad.required' => 'La cantidad es obligatoria para cada producto.',
            'detalles.*.cantidad.integer' => 'La cantidad debe ser un número entero.',
            'detalles.*.cantidad.min' => 'La cantidad debe ser al menos 1.',
        ];
    }
}
