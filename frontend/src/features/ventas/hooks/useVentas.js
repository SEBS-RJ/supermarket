import { useCallback, useEffect, useState } from 'react';
import { ventasApi } from '../api/ventasApi';

export function useVentas(filtros = {}) {
  const [ventas, setVentas] = useState([]);
  const [meta, setMeta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    ventasApi
      .listar(filtros)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setVentas(data);
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

  return { ventas, meta, cargando, error, recargar: cargar };
}
