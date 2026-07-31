import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  // loading ya está manejado en AuthContext, aquí siempre llega resuelto

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user?.rol || user?.role?.name || user?.role || '').toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!isAllowed) {
      const isAdmin = userRole === 'administrador' || userRole === 'admin';
      return <Navigate to={isAdmin ? '/admin' : '/venta'} replace />;
    }
  }

  return <Outlet />;
}
