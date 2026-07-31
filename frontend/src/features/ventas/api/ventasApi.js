import api from '../../../api/axios';

export const ventasApi = {
  listar: (params = {}) =>
    api.get('/ventas', { params }),

  obtener: (id) =>
    api.get(`/ventas/${id}`),

  crear: (data) =>
    api.post('/ventas', data),

  anular: (id) =>
    api.patch(`/ventas/${id}/anular`),
};
