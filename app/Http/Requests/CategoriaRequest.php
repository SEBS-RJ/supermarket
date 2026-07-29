<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoriaId = $this->route('categoria');

        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categorias', 'nombre')->ignore($categoriaId),
            ],
            'slug' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categorias', 'slug')->ignore($categoriaId),
            ],
            'descripcion' => ['nullable', 'string'],
            'activo' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la categoría es obligatorio.',
            'nombre.string' => 'El nombre debe ser un texto válido.',
            'nombre.max' => 'El nombre no puede superar los 100 caracteres.',
            'nombre.unique' => 'Ya existe una categoría con ese nombre.',

            'slug.required' => 'El slug es obligatorio.',
            'slug.string' => 'El slug debe ser un texto válido.',
            'slug.max' => 'El slug no puede superar los 100 caracteres.',
            'slug.unique' => 'Ya existe una categoría con ese slug.',

            'descripcion.string' => 'La descripción debe ser un texto válido.',

            'activo.boolean' => 'El campo activo debe ser verdadero o falso.',
        ];
    }
}