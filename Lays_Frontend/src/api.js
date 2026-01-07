import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV
    ? 'http://localhost:4000/api/v1'
    : 'https://lays-api-f5e978f9aa73.herokuapp.com/api/v1');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
