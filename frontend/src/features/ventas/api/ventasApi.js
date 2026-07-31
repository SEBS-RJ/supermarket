import api from '../../../api/axios';

export const ventasApi = {
  listar: (params = {}) =>
    api.get('/v1/ventas', { params }),

  obtener: (id) =>
    api.get(`/v1/ventas/${id}`),

  crear: (data) =>
    api.post('/v1/ventas', data),

  anular: (id) =>
    api.patch(`/v1/ventas/${id}/anular`),
};
