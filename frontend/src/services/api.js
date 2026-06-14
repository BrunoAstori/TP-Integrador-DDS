import axios from 'axios';

const api = axios.create({
    baseURL: 'https://tp-integrador-dds.onrender.com:3000/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;