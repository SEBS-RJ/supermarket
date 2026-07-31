import api from '../../../api/axios';

export const dashboardApi = {
  resumen: () =>
    api.get('/v1/dashboard/resumen'),

  ventasPorCategoria: () =>
    api.get('/v1/dashboard/ventas-por-categoria'),

  tendenciaVentas: () =>
    api.get('/v1/dashboard/tendencia-ventas'),

  productosTop: () =>
    api.get('/v1/dashboard/productos-top'),
};
