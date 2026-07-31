import api from '../../../api/axios';

export const clientesApi = {
  listar: (params = {}) =>
    api.get('/v1/clientes', { params }),

  crear: (data) =>
    api.post('/v1/clientes', data),

  actualizar: (id, data) =>
    api.put(`/v1/clientes/${id}`, data),

  eliminar: (id) =>
    api.delete(`/v1/clientes/${id}`),
};
