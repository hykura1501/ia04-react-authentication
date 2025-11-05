import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/api";
import { ENDPOINT } from "@/constants/endpoint";
import { PATH } from "@/constants/path";

// Store access token in memory (not in localStorage)
let inMemoryAccessToken: string | null = null;

export const tokenStore = {
  getAccess: () => inMemoryAccessToken,
  setAccess: (token: string | null) => {
    inMemoryAccessToken = token;
  },
  getRefresh: () => localStorage.getItem("refresh_token"),
  setRefresh: (token: string | null) => {
    if (token) {
      localStorage.setItem("refresh_token", token);
    } else {
      localStorage.removeItem("refresh_token");
    }
  },
  clearAll: () => {
    inMemoryAccessToken = null;
    localStorage.removeItem("refresh_token");
  },
};

// Create Axios instance
export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach access token to every request
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccess();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors and refresh tokens
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// List of public endpoints that should not trigger token refresh
const publicEndpoints = [ENDPOINT.AUTH.LOGIN, ENDPOINT.AUTH.REGISTER, ENDPOINT.AUTH.REFRESH];

const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried to refresh yet
    // AND it's not a public endpoint (login/register/refresh)
    // AND we have a refresh token (user is authenticated)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicEndpoint(originalRequest.url) &&
      tokenStore.getRefresh()
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStore.getRefresh();

      if (!refreshToken) {
        // No refresh token, clear everything and redirect to login
        tokenStore.clearAll();
        processQueue(error, null);
        isRefreshing = false;
        // Redirect to login if we're in browser
        if (typeof window !== "undefined") {
          window.location.href = PATH.LOGIN;
        }
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}${ENDPOINT.AUTH.REFRESH}`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens
        tokenStore.setAccess(accessToken);
        tokenStore.setRefresh(newRefreshToken);

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        isRefreshing = false;
        return http(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenStore.clearAll();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;

        // Redirect to login if we're in browser
        if (typeof window !== "undefined") {
          window.location.href = PATH.LOGIN;
        }

        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);


