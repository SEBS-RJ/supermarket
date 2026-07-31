import api from '../../../api/axios';

export const authApi = {
  login: (email, password) =>
    api.post('/login', { email, password }),

  logout: () =>
    api.post('/logout'),

  me: () =>
    api.get('/me'),
};
