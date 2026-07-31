# Supermercado — Sistema Web de Gestión de Ventas

Aplicación web para la gestión de ventas de un supermercado: registro de
ventas, control de stock, gestión de catálogo (categorías/productos),
clientes, usuarios con roles, y un dashboard con métricas e informes.

Arquitectura cliente-servidor desacoplada: **Laravel** expone una API
RESTful (`/api/v1/*`), autenticada con **Laravel Sanctum** (tokens), y
**React** (Vite + Material UI) la consume como SPA. Persistencia en
**PostgreSQL**.

## Stack técnico

| Capa          | Tecnología                                          |
| ------------- | --------------------------------------------------- |
| Backend       | Laravel 11, PHP 8.3+                                |
| Base de datos | PostgreSQL                                          |
| Autenticación | Laravel Sanctum (tokens)                            |
| Frontend      | React (Vite), Material UI, MUI X (DataGrid, Charts) |
| Cliente HTTP  | Axios                                               |
| Ruteo         | React Router                                        |

## Roles del sistema

| Rol                   | Puede hacer                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **administrador**     | CRUD completo de Categorías/Productos, CRUD de Clientes, registrar y anular Ventas, gestionar Usuarios, ver Dashboard |
| **vendedor** (cajero) | Solo lectura de Categorías/Productos, CRUD de Clientes, registrar Ventas y ver su detalle                             |

## Estructura del repositorio

```
/                     (raíz del repo)
├── app/               Backend Laravel (modelos, controladores, requests, resources)
├── database/          Migraciones, factories, seeders
├── routes/api.php     Definición de endpoints /api/v1/*
├── docs/              Documentos de diseño (00 a 06)
└── frontend/          Aplicación React (Vite + Material UI)
```

## Requisitos previos

- PHP 8.3+ y Composer
- Node.js 18+ y npm
- PostgreSQL 14+ corriendo localmente

## 1. Backend (Laravel)

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Edita `.env` con los datos de tu PostgreSQL local:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=543X
DB_DATABASE=supermarket
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```

Crea la base de datos vacía (`createdb supermarket` o desde pgAdmin), luego:

```bash
php artisan migrate
php artisan db:seed
```

Esto crea: 15 categorías, 2,000 productos, 5,000 clientes, 500,000 ventas
(el seeder de ventas tarda 2–3 minutos, es normal), y **dos usuarios de
prueba** (ver credenciales abajo).

```bash
php artisan serve
```

Backend disponible en `http://localhost:8000`.

## 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`.

## Variables de entorno

### Backend (`.env`, basado en `.env.example`)

```
APP_NAME=Supermercado
APP_ENV=local
APP_KEY=                          # generado con php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=543X
DB_DATABASE=supermarket
DB_USERNAME=postgres
DB_PASSWORD=

CACHE_STORE=database              # usado por el cache del dashboard (5 min TTL)
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

### Frontend (`frontend/.env`, basado en `frontend/.env.example`)

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Usuarios de prueba

Creados automáticamente por `php artisan db:seed` (ver `UserSeeder`):

| Rol           | Email               | Password      |
| ------------- | ------------------- | ------------- |
| administrador | `admin@super.com`   | `Admin@1234`  |
| vendedor      | `cajero1@super.com` | `Cajero@1234` |

## Endpoints principales

Ver la colección de Postman (`docs/postman/supermercado.postman_collection.json`)
para el detalle completo de cada endpoint, incluyendo ejemplos de los
errores 401, 403, 409 y 422.

| Recurso    | Rutas                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Auth       | `POST /login`, `POST /logout`, `GET /me`                                                         |
| Categorías | `GET/POST /categorias`, `GET/PUT/DELETE /categorias/{id}`                                        |
| Productos  | `GET/POST /productos`, `GET/PUT/DELETE /productos/{id}`                                          |
| Clientes   | `GET/POST /clientes`, `GET/PUT/DELETE /clientes/{id}`                                            |
| Ventas     | `GET /ventas` (admin), `POST /ventas`, `GET /ventas/{id}`, `PATCH /ventas/{id}/anular` (admin)   |
| Usuarios   | `GET/POST /usuarios` (admin), `GET/PUT /usuarios/{id}` (admin)                                   |
| Dashboard  | `GET /dashboard/resumen`, `/ventas-por-categoria`, `/tendencia-ventas`, `/productos-top` (admin) |

Todas las rutas, salvo `/login`, requieren `Authorization: Bearer {token}`.

## Capturas de pantalla

> [PENDIENTE: agregar capturas de — pantalla de login, listado de
>
> > productos con DataGrid, formulario de creación/edición con validación
> > 422, diálogo de confirmación de borrado, formulario de registro de
> > venta, dashboard con las 4 tarjetas y las 2 gráficas]

## Notas técnicas relevantes

- **Anular ≠ eliminar**: una venta nunca se edita ni se borra, solo se
  anula (`PATCH /ventas/{id}/anular`); esto repone el stock y preserva el
  historial para auditoría.
- **Integridad referencial**: borrar una categoría con productos, o un
  producto con ventas asociadas, responde `409` en vez de un borrado en
  cascada silencioso.
- **Stock insuficiente** al registrar una venta responde `409` con el
  detalle de qué producto(s) fallaron.
- El dashboard cachea sus 4 endpoints 5 minutos (`Cache::remember`), dado
  el volumen de la tabla `ventas` (500,000+ filas).
