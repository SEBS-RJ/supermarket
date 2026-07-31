import { useCallback, useEffect, useState } from 'react';
import { productosApi } from '../api/productosApi';

export function useProductos(filtros = {}) {
  const [productos, setProductos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    productosApi
      .listar(filtros)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setProductos(data);
        if (res.data?.meta) {
          setMeta(res.data.meta);
        } else if (res.data?.current_page) {
          // Sometimes Laravel returns pagination data in the root object
          setMeta(res.data);
        }
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setCargando(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)]);

  useEffect(() => { cargar(); }, [cargar]);

  return { productos, meta, cargando, error, recargar: cargar };
}

export function useProductosDestacados() {
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    productosApi
      .destacados()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);
        setDestacados(data);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { destacados, cargando, error, recargar: cargar };
}
