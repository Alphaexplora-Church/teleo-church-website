import axios, { type AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/auth.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extracts human-readable error messages from standard backend API errors.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as (ApiErrorResponse & { error?: { message?: string } }) | undefined;
    return (
      data?.error?.message ||
      data?.details?.[0]?.message ||
      data?.message ||
      error.message ||
      'An unexpected server error occurred.'
    );
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
      const isLoginRequest = requestUrl.includes('/api/auth/login');

      // Notify AuthContext to evict session state reactively.
      // ProtectedRoute will smoothly navigate to /login without a full page reload.
      if (typeof window !== 'undefined' && !isLoginRequest) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
