import { useCallback, useEffect, useState } from 'react';
import { ventasApi } from '../api/ventasApi';

export function useVentas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    ventasApi
      .listar()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setVentas(data);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { ventas, cargando, error, recargar: cargar };
}
