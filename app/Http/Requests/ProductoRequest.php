<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productoId = $this->route('producto');

        return [
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'nombre'       => ['required', 'string', 'max:200'],
            'sku'          => [
                'required',
                'string',
                'max:50',
                Rule::unique('productos', 'sku')->ignore($productoId),
            ],
            'descripcion'  => ['nullable', 'string'],
            'imagen'       => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'precio'       => ['required', 'numeric', 'min:0'],
            'stock'        => ['required', 'integer', 'min:0'],
            'activo'       => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'categoria_id.required' => 'Debes seleccionar una categoría.',
            'categoria_id.exists'   => 'La categoría seleccionada no existe.',

            'nombre.required' => 'El nombre del producto es obligatorio.',
            'nombre.max'      => 'El nombre no puede superar los 200 caracteres.',

            'sku.required' => 'El código del producto es obligatorio.',
            'sku.max'      => 'El código no puede superar los 50 caracteres.',
            'sku.unique'   => 'Ya existe un producto con ese código.',

            'imagen.image' => 'El archivo debe ser una imagen válida.',
            'imagen.mimes' => 'Solo se aceptan imágenes JPG, PNG o WebP.',
            'imagen.max'   => 'La imagen no puede pesar más de 2 MB.',

            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric'  => 'El precio debe ser un número.',
            'precio.min'      => 'El precio no puede ser negativo.',

            'stock.required' => 'La cantidad en inventario es obligatoria.',
            'stock.integer'  => 'La cantidad debe ser un número entero.',
            'stock.min'      => 'La cantidad no puede ser negativa.',
        ];
    }
}