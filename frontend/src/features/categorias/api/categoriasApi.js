import api from '../../../api/axios';

export const categoriasApi = {
  listar: (params = {}) =>
    api.get('/v1/categorias', { params }),

  crear: (data) =>
    api.post('/v1/categorias', data),

  actualizar: (id, data) =>
    api.put(`/v1/categorias/${id}`, data),

  eliminar: (id) =>
    api.delete(`/v1/categorias/${id}`),
};
