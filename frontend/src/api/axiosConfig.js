import axios from 'axios';
import store from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

// On 401: attempt refresh, retry original request; on failure, logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Auth endpoints (login, register, refresh) surface their own 401s directly —
    // a failed login must show "invalid credentials", not trigger the refresh flow.
    const isAuthEndpoint = original?.url?.includes('/auth/');

    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      store.dispatch(logout());
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = data.data;
      const currentUser = store.getState().auth.user;

      store.dispatch(
        setCredentials({ user: currentUser, accessToken, refreshToken: newRefreshToken })
      );

      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      store.dispatch(logout());
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
