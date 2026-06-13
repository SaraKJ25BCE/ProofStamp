import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'https://proofstamp-server.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PUBLIC_AUTH_PATHS = ['/login', '/auth/callback'];

function isPublicAuthRoute() {
  const path = window.location.pathname;
  return PUBLIC_AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalRequestUrl = error.config?.url;
    if (
      status === 401 &&
      !isPublicAuthRoute() &&
      originalRequestUrl !== '/auth/me'
    ) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
