import api from '../../../api/axios';

export const authApi = {
  login: (email, password) =>
    api.post('/v1/login', { email, password }),

  logout: () =>
    api.post('/v1/logout'),

  me: () =>
    api.get('/v1/me'),
};
