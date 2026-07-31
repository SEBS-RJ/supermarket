import { useState } from 'react';
import { authApi } from '../api/authApi';

export function useLogin() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const iniciarSesion = (email, password) => {
    setCargando(true);
    setError(null);

    return authApi
      .login(email, password)
      .then((res) => res.data)
      .catch((err) => {
        const mensaje = err.response?.data?.message || 'credenciales inválidas';
        setError(mensaje);
        throw err;
      })
      .finally(() => setCargando(false));
  };

  return { iniciarSesion, cargando, error };
}
