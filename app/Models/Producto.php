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
     *
     * Soporta dos casos:
     * - Un archivo subido manualmente por el admin, guardado en el disco
     *   "public" (ruta relativa tipo "productos/xxxx.jpg").
     * - Una URL absoluta generada por el seeder (ver ProductoFactory), que
     *   se devuelve tal cual sin pasar por asset('storage/...').
     */
    public function getImagenUrlAttribute(): ?string
    {
        if (! $this->imagen) {
            return null;
        }

        if (str_starts_with($this->imagen, 'http://') || str_starts_with($this->imagen, 'https://')) {
            return $this->imagen;
        }

        return asset('storage/' . $this->imagen);
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
