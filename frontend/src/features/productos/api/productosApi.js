import api from '../../../api/axios';

export const productosApi = {
  listar: (params = {}) =>
    api.get('/v1/productos', { params }),

  destacados: () =>
    api.get('/v1/productos/destacados'),

  obtener: (id) =>
    api.get(`/v1/productos/${id}`),

  crear: (data) => {
    // Detectar si viene con imagen (FormData)
    if (data instanceof FormData) {
      return api.post('/v1/productos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/v1/productos', data);
  },

  actualizar: (id, data) => {
    // Usar ruta POST dedicada para multipart (evita límite de PHP con PUT)
    if (data instanceof FormData) {
      return api.post(`/v1/productos/${id}/actualizar`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/v1/productos/${id}`, data);
  },

  eliminar: (id) =>
    api.delete(`/v1/productos/${id}`),
};
