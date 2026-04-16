import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('qena_token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
        localStorage.removeItem('qena_token');
        location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
