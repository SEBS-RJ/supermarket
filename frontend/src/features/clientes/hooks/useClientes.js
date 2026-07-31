import { useCallback, useEffect, useState } from 'react';
import { clientesApi } from '../api/clientesApi';

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    clientesApi
      .listar()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setClientes(data);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { clientes, cargando, error, recargar: cargar };
}
