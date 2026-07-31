import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Páginas Admin
import DashboardPage    from '../features/dashboard/components/DashboardPage';
import CategoriasPage   from '../features/categorias/components/CategoriasPage';
import ProductosPage    from '../features/productos/components/ProductosPage';
import ClientesPage     from '../features/clientes/components/ClientesPage';
import UsuariosPage     from '../features/usuarios/components/UsuariosPage';
import VentasListPage   from '../features/ventas/components/VentasListPage';
import VentaDetailPage  from '../features/ventas/components/VentaDetailPage';

// Páginas Vendedor
import NuevaVentaPage   from '../features/ventas/components/NuevaVentaPage';

// Auth
import LoginPage        from '../features/auth/components/LoginPage';

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
  );
}
