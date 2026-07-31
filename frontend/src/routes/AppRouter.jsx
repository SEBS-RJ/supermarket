import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Páginas Admin — con lazy() cada una se descarga en un chunk aparte,
// solo cuando el usuario navega a esa ruta. Antes todas (incluyendo
// NuevaVentaPage, que es la más pesada) se cargaban de una sola vez en
// el bundle inicial, aunque el usuario solo fuera a ver Estadísticas.
const DashboardPage    = lazy(() => import('../features/dashboard/components/DashboardPage'));
const CategoriasPage   = lazy(() => import('../features/categorias/components/CategoriasPage'));
const ProductosPage    = lazy(() => import('../features/productos/components/ProductosPage'));
const ClientesPage     = lazy(() => import('../features/clientes/components/ClientesPage'));
const UsuariosPage     = lazy(() => import('../features/usuarios/components/UsuariosPage'));
const VentasListPage   = lazy(() => import('../features/ventas/components/VentasListPage'));
const VentaDetailPage  = lazy(() => import('../features/ventas/components/VentaDetailPage'));

// Páginas Vendedor
const NuevaVentaPage   = lazy(() => import('../features/ventas/components/NuevaVentaPage'));

// Auth — esta sí se carga siempre de entrada (es la primera pantalla
// para un usuario no autenticado), así que se importa normal.
import LoginPage        from '../features/auth/components/LoginPage';

/** Loader simple mientras se descarga el chunk de la ruta */
function RouteLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={32} />
    </Box>
  );
}

/** Redirección dinámica según el rol del usuario autenticado */
function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const rol = (user?.rol || '').toLowerCase();
  const isAdmin = rol === 'administrador' || rol === 'admin';
  return <Navigate to={isAdmin ? '/admin' : '/venta'} replace />;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* 1. Login — ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Raíz → redirige al panel correcto */}
        <Route path="/" element={<HomeRedirect />} />

        {/* 3. Panel ADMINISTRADOR */}
        <Route element={<ProtectedRoute allowedRoles={['administrador', 'admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin"              element={<DashboardPage />} />
            <Route path="/admin/categorias"   element={<CategoriasPage />} />
            <Route path="/admin/productos"    element={<ProductosPage />} />
            <Route path="/admin/clientes"     element={<ClientesPage />} />
            <Route path="/admin/usuarios"     element={<UsuariosPage />} />
            <Route path="/admin/ventas"       element={<VentasListPage />} />
            <Route path="/admin/ventas/:id"   element={<VentaDetailPage />} />
            <Route path="/admin/venta"        element={<NuevaVentaPage />} />
          </Route>
        </Route>

        {/* 4. Panel VENDEDOR / CAJERO */}
        <Route element={<ProtectedRoute allowedRoles={['vendedor', 'cajero']} />}>
          <Route element={<MainLayout />}>
            <Route path="/venta"              element={<NuevaVentaPage />} />
            <Route path="/venta/recibo/:id"   element={<VentaDetailPage />} />
          </Route>
        </Route>

        {/* 5. Cualquier otra ruta → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
