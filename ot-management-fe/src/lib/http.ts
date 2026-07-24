import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toApiError } from '@/shared/utils/api-error';
import type { ApiResponse } from '@/shared/types/api.type';
import type { AuthResponse } from '@/shared/api/types';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const instance: AxiosInstance = axios.create({
  baseURL: env.backendApiUrl,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function runRefresh(): Promise<string> {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
  if (!refreshToken) {
    clearAuth();
    throw new Error('No refresh token');
  }

  try {
    const res = await axios.post<ApiResponse<AuthResponse>>(
      `${env.backendApiUrl}/auth/refresh-token`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const { accessToken, refreshToken: nextRefresh } = res.data.data;
    setTokens(accessToken, nextRefresh);
    return accessToken;
  } catch (error) {
    clearAuth();
    throw error;
  }
}

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh-token');

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? runRefresh();
        const token = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${token}`;
        return instance(original);
      } catch (refreshError) {
        refreshPromise = null;
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(toApiError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

/** Typed helpers — the backend wraps every payload as { status, message, data }. */
async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(instance.get(url, config)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(instance.post(url, body, config)),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(instance.patch(url, body, config)),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(instance.put(url, body, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(instance.delete(url, config)),
};

export { instance as axiosInstance };
