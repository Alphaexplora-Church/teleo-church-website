import axios, { type AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extracts human-readable error messages from standard backend API errors.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.details?.[0]?.message || data?.message || error.message || 'An unexpected server error occurred.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

// ─── Response Interceptor: 401 Unauthorized Eviction ──────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      // Notify auth listeners to clear user session
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));

        // If unauthorized while accessing an admin route, evict to /login
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const isLoginRequest = requestUrl.includes('/api/auth/login');

        if (isAdminRoute && !isLoginRequest) {
          window.location.replace('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
