import api from './api.js';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const registrar = (datos) => api.post('/auth/register', datos);