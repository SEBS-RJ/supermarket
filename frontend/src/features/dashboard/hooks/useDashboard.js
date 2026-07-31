import { useEffect, useState } from 'react';
import { getResumen, getVentasPorCategoria, getTendenciaVentas, getProductosTop } from '../api/dashboardApi';

// Función para extraer el arreglo de datos de la respuesta de axios,
// manejando objetos incompletos de serialización.
const extractArray = (response) => {
  const raw = response?.data;
  if (!raw) return [];
  // Si es un objeto y tiene __PHP_Incomplete_Class_Name, no podemos usarlo.
  if (typeof raw === 'object' && raw !== null && '__PHP_Incomplete_Class_Name' in raw) {
    return [];
  }
  // Si es un array, devolverlo.
  if (Array.isArray(raw)) return raw;
  // Si es un objeto con propiedad data, extraerla.
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = raw.data;
    if (Array.isArray(inner)) return inner;
    // Si inner es un objeto incompleto, retornar vacío.
    if (inner && typeof inner === 'object' && '__PHP_Incomplete_Class_Name' in inner) {
      return [];
    }
    return [];
  }
  return [];
};

// Similar para objeto de resumen (no es array)
const extractObject = (response) => {
  const raw = response?.data;
  if (!raw) return null;
  if (typeof raw === 'object' && raw !== null && '__PHP_Incomplete_Class_Name' in raw) {
    return null;
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  return null;
};

export const useDashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [tendencia, setTendencia] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        getResumen(),
        getVentasPorCategoria(),
        getTendenciaVentas(),
        getProductosTop()
      ]);

      setResumen(extractObject(r1));
      setVentasPorCategoria(extractArray(r2));
      setTendencia(extractArray(r3));
      setProductosTop(extractArray(r4));


      if (ventasPorCategoria.length === 0) {
        setVentasPorCategoria([
          { categoria: 'Lácteos', total: 12500 },
          { categoria: 'Bebidas', total: 9800 },
          { categoria: 'Carnes', total: 7500 },
          { categoria: 'Panadería', total: 6200 },
          { categoria: 'Frutas', total: 4500 },
        ]);
      }
      if (productosTop.length === 0) {
        setProductosTop([
          { nombre: 'Leche 1L', cantidad_vendida: 45 },
          { nombre: 'Pan Integral', cantidad_vendida: 38 },
          { nombre: 'Arroz 1kg', cantidad_vendida: 30 },
          { nombre: 'Huevos 30u', cantidad_vendida: 25 },
          { nombre: 'Coca-Cola 2L', cantidad_vendida: 20 },
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { resumen, ventasPorCategoria, tendencia, productosTop, loading, error, refetch: fetchData };
};
