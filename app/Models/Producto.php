<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'nombre',
        'sku',
        'descripcion',
        'imagen',
        'precio',
        'stock',
        'activo',
    ];

    protected $appends = ['imagen_url'];

    protected $casts = [
        'precio' => 'decimal:2',
        'stock'  => 'integer',
        'activo' => 'boolean',
    ];

    /**
     * URL pública de la imagen. Devuelve null si el producto no tiene portada.
     */
    public function getImagenUrlAttribute(): ?string
    {
        return $this->imagen
            ? asset('storage/' . $this->imagen)
            : null;
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class);
    }
}