import { useCallback, useEffect, useState } from 'react';
import { categoriasApi } from '../api/categoriasApi';

export function useCategorias(filtros = {}) {
  const [categorias, setCategorias] = useState([]);
  const [meta, setMeta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    categoriasApi
      .listar(filtros)
      .then((res) => {
        // Laravel paginate devuelve { data: { data: [...] } }
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setCategorias(data);
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

  return { categorias, meta, cargando, error, recargar: cargar };
}
