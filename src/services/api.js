import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1/admin';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crxs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (only redirect if not already on login/register to prevent infinite reload loops)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crxs_token');
      localStorage.removeItem('crxs_user');
      const pathname = window.location.pathname;
      if (pathname !== '/login' && pathname !== '/register' && !pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Fire-and-forget ping that wakes the serverless function before the user
// submits a form (kills most of the perceived "cold start" delay).
export function warmUpBackend() {
  try {
    const origin = API_BASE.replace(/\/api\/.*$/, '');
    fetch(`${origin}/`, { method: 'GET', cache: 'no-store' }).catch(() => {});
  } catch (e) {
    /* ignore */
  }
}
