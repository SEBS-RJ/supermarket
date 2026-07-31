<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'categoria_id'=> $this->categoria_id,
            'nombre'      => $this->nombre,
            'sku'         => $this->sku,
            'descripcion' => $this->descripcion,
            'imagen'      => $this->imagen,
            'imagen_url'  => $this->imagen_url,   // URL pública o null
            'precio'      => (float) $this->precio,
            'stock'       => (int) $this->stock,
            'activo'      => (bool) $this->activo,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
            'categoria'   => new CategoriaResource($this->whenLoaded('categoria')),
        ];
    }
}