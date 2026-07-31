import api from '../../../api/axios';

export const usuariosApi = {
  listar: (params = {}) =>
    api.get('/usuarios', { params }),

  crear: (data) =>
    api.post('/usuarios', data),

  actualizar: (id, data) =>
    api.put(`/usuarios/${id}`, data),
};
