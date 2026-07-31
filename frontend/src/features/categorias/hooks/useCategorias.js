import { useCallback, useEffect, useState } from 'react';
import { categoriasApi } from '../api/categoriasApi';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    categoriasApi
      .listar()
      .then((res) => {
        // Laravel paginate devuelve { data: { data: [...] } }
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setCategorias(data);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { categorias, cargando, error, recargar: cargar };
}
