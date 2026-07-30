<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Se lanza dentro de la transacción de VentaController::store() cuando
 * uno o más productos no tienen stock suficiente. Se captura en el
 * controlador para devolver 409 con el detalle de qué faltó.
 */
class StockInsuficienteException extends RuntimeException
{
    public array $faltantes;

    public function __construct(array $faltantes)
    {
        parent::__construct('Stock insuficiente.');
        $this->faltantes = $faltantes;
    }
}
