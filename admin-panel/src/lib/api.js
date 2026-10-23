import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
let refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

export function setTokens({ accessToken: at, refreshToken: rt }) {
  accessToken = at;
  refreshToken = rt;
  if (typeof window !== 'undefined') {
    if (at) localStorage.setItem('accessToken', at);
    else localStorage.removeItem('accessToken');
    if (rt) localStorage.setItem('refreshToken', rt);
    else localStorage.removeItem('refreshToken');
  }
}

export function getAccessToken() { return accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null); }
export function getRefreshToken() { return refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null); }
export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

api.interceptors.request.use((cfg) => {
  const token = getAccessToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let refreshing = null;

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    const status = err.response?.status;
    const data = err.response?.data;
    const msg = data?.error || data?.message || err.message;

    // Surface validation errors
    if (status === 422 && data?.details) {
      const detailMsg = data.details.map((d) => `${d.field}: ${d.message}`).join(', ');
      toast.error(detailMsg || msg);
    } else if (status === 429) {
      toast.error(data?.error || 'Too many requests. Try again later.');
    } else if (status && status >= 400 && status < 500 && !orig._retry) {
      // Avoid toast for 401 here — handled by refresh
      if (status !== 401) toast.error(msg);
    }

    if (status === 401 && !orig._retry && !orig.url?.includes('/api/auth')) {
      orig._retry = true;
      const rt = getRefreshToken();
      if (!rt) {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(err);
      }
      refreshing ||= axios
        .post('/api/auth/refresh', { refreshToken: rt }, { withCredentials: true })
        .then(({ data }) => {
          setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        })
        .catch(() => {
          clearTokens();
          if (typeof window !== 'undefined') window.location.href = '/login';
          throw err;
        })
        .finally(() => (refreshing = null));

      try {
        await refreshing;
        orig.headers.Authorization = `Bearer ${getAccessToken()}`;
        return api(orig);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);
