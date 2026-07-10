import axios from 'axios';

// Get base API URL from environment variables, defaulting to local port 5000 gateway
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure the baseURL always has the /api suffix to route requests correctly
if (API_BASE_URL) {
  const cleanUrl = API_BASE_URL.replace(/\/$/, ''); // Strip trailing slash
  if (!cleanUrl.endsWith('/api')) {
    API_BASE_URL = `${cleanUrl}/api`;
  } else {
    API_BASE_URL = cleanUrl;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token & Normalize Path Slashes
api.interceptors.request.use(
  (config) => {
    // Normalize path by stripping leading slash. 
    // This forces Axios to resolve relative URLs against baseURL (which contains /api)
    // instead of resetting path to the server root domain.
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Authentication Errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized (invalid/expired JWT token), clear storage and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
