import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboard() {
  const [resumen, setResumen] = useState(null);
  const [ventasCategoria, setVentasCategoria] = useState([]);
  const [tendencia, setTendencia] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);

    Promise.allSettled([
      dashboardApi.resumen(),
      dashboardApi.ventasPorCategoria(),
      dashboardApi.tendenciaVentas(),
      dashboardApi.productosTop(),
    ])
      .then(([resRes, catRes, tendRes, topRes]) => {
        if (resRes.status === 'fulfilled') {
          setResumen(resRes.value.data);
        }
        if (catRes.status === 'fulfilled') {
          const data = catRes.value.data?.data || catRes.value.data || [];
          setVentasCategoria(Array.isArray(data) ? data : []);
        }
        if (tendRes.status === 'fulfilled') {
          const data = tendRes.value.data?.data || tendRes.value.data || [];
          setTendencia(Array.isArray(data) ? data : []);
        }
        if (topRes.status === 'fulfilled') {
          const data = topRes.value.data?.data || topRes.value.data || [];
          setProductosTop(Array.isArray(data) ? data : []);
        }
        // Si todos fallaron, mostramos error
        if ([resRes, catRes, tendRes, topRes].every(r => r.status === 'rejected')) {
          setError('error al cargar el panel de control');
        }
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { resumen, ventasCategoria, tendencia, productosTop, cargando, error, recargar: cargar };
}
