import api from '../../../api/axios';

export const categoriasApi = {
  listar: (params = {}) =>
    api.get('/categorias', { params }),

  crear: (data) =>
    api.post('/categorias', data),

  actualizar: (id, data) =>
    api.put(`/categorias/${id}`, data),

  eliminar: (id) =>
    api.delete(`/categorias/${id}`),
};
