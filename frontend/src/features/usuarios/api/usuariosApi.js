import api from '../../../api/axios';

export const usuariosApi = {
  listar: (params = {}) =>
    api.get('/v1/usuarios', { params }),

  crear: (data) =>
    api.post('/v1/usuarios', data),

  actualizar: (id, data) =>
    api.put(`/v1/usuarios/${id}`, data),
};
