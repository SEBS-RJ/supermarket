import api from '../../../api/axios';

export const productosApi = {
  listar: (params = {}) =>
    api.get('/productos', { params }),

  destacados: () =>
    api.get('/productos/destacados'),

  obtener: (id) =>
    api.get(`/productos/${id}`),

  crear: (data) => {
    // Detectar si viene con imagen (FormData)
    if (data instanceof FormData) {
      return api.post('/productos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/productos', data);
  },

  actualizar: (id, data) => {
    // Usar ruta POST dedicada para multipart (evita límite de PHP con PUT)
    if (data instanceof FormData) {
      return api.post(`/productos/${id}/actualizar`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/productos/${id}`, data);
  },

  eliminar: (id) =>
    api.delete(`/productos/${id}`),
};
