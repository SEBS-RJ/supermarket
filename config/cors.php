<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // En false porque todavía no se usa Sanctum con cookies/sesión.
    // Si se activa auth:sanctum con SPA (cookie-based), cambiar a true
    // y usar el dominio exacto en allowed_origins (no '*').
    'supports_credentials' => false,

];