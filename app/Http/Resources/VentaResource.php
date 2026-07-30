<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VentaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'total' => (float) $this->total,
            'fecha_venta' => $this->fecha_venta,
            'estado' => $this->estado,
            'motivo_anulacion' => $this->motivo_anulacion,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Solo se incluyen cuando el controlador hace eager load
            // (GET /api/v1/ventas/{id}); en el listado (index) se omiten
            // a propósito para no sobrecargar la respuesta.
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(function ($detalle) {
                    return [
                        'id' => $detalle->id,
                        'producto_id' => $detalle->producto_id,
                        'producto' => $detalle->relationLoaded('producto') ? [
                            'id' => $detalle->producto->id,
                            'nombre' => $detalle->producto->nombre,
                            'sku' => $detalle->producto->sku,
                        ] : null,
                        'cantidad' => (int) $detalle->cantidad,
                        'precio_unitario' => (float) $detalle->precio_unitario,
                        'subtotal' => (float) $detalle->subtotal,
                    ];
                });
            }),
        ];
    }
}
