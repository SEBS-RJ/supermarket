import { useCallback, useEffect, useState } from 'react';
import { usuariosApi } from '../api/usuariosApi';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    usuariosApi
      .listar()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setUsuarios(data);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { usuarios, cargando, error, recargar: cargar };
}
