import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../features/auth/api/authApi';
import api from '../api/axios';
import { Box, CircularProgress } from '@mui/material';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // loading=true hasta que se verifique el token al arrancar
  const [loading, setLoading] = useState(true);

  // Al montar: verificar si hay token válido en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      // No hay token → ir directo a login
      setLoading(false);
      return;
    }

    // Verificar que el token todavía sea válido en el servidor
    api.get('/v1/me')
      .then((res) => {
        // /me devuelve el user plano: { id, name, email, rol }
        const userData = res.data;
        setToken(savedToken);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch(() => {
        // Token expirado o inválido → limpiar
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      const data = res.data;
      const authToken = data.token || data.access_token;
      const userData  = data.user;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Credenciales incorrectas';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignorar error de logout en servidor
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  // Mientras verifica el token, mostrar spinner centrado
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
