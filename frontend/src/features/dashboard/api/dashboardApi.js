import apiClient from '../../../api/axios';

export const getResumen = () => apiClient.get('/dashboard/resumen');
export const getVentasPorCategoria = () => apiClient.get('/dashboard/ventas-por-categoria');
export const getTendenciaVentas = () => apiClient.get('/dashboard/tendencia-ventas');
export const getProductosTop = () => apiClient.get('/dashboard/productos-top');
