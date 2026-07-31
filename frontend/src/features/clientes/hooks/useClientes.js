import { useCallback, useEffect, useState } from 'react';
import { clientesApi } from '../api/clientesApi';

export function useClientes(filtros = {}) {
  const [clientes, setClientes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    clientesApi
      .listar(filtros)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setClientes(data);
        if (res.data?.meta) {
          setMeta(res.data.meta);
        } else if (res.data?.current_page) {
          setMeta(res.data);
        }
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setCargando(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { clientes, meta, cargando, error, recargar: cargar };
}
