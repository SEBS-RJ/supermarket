import api from '../../../api/axios';

export const clientesApi = {
  listar: (params = {}) =>
    api.get('/clientes', { params }),

  crear: (data) =>
    api.post('/clientes', data),

  actualizar: (id, data) =>
    api.put(`/clientes/${id}`, data),

  eliminar: (id) =>
    api.delete(`/clientes/${id}`),
};
