import axios from 'axios';
import { AUTH_STORAGE_KEY } from './authStorage';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5001', // local
  baseURL: '/', // live
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore invalid storage
  }
  return config;
});

export default axiosInstance;
