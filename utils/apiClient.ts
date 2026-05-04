// utils/apiClient.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

// ─── Shared Axios Instance ────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

export const forgotPassword = (email: string) =>
  apiClient.post("/api/forgot-password", { email });

export const verifyResetCode = (email: string, code: string) =>
  apiClient.post("/api/verify-reset-code", { email, code });

export const resetPassword = (
  email: string,
  code: string,
  password: string,
) => apiClient.post("/api/reset-password", { email, code, password });

// ─── Token helpers ────────────────────────────────────────────────────────────

export const getAccessToken = () => AsyncStorage.getItem("accessToken");
export const getRefreshToken = () => AsyncStorage.getItem("refreshToken");

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.multiSet([
    ["accessToken", accessToken],
    ["refreshToken", refreshToken],
  ]);
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
};

const SESSION_STORAGE_KEYS = [
  "accessToken",
  "refreshToken",
  "userId",
  "username",
  "fullName",
  "bio",
  "profileImage",
  "bannerImage",
  "loggedInUser",
  "favorites",
];

// ─── Request interceptor ─────────────────────────────────────────────────────
// Attach the current access token to every outgoing request.

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
// On a 401 or 403:
//   1. Try to refresh — if successful, retry the original request once.
//   2. If refresh fails, clear all auth data and send the user to /login.

let isRefreshing = false;
let failedQueue: {
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}[] = [];

// While a refresh is in-flight, queue other failed auth requests instead of
// firing more refresh requests. Once the refresh settles, drain the queue.
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // FIX #2: catch both 401 (missing token) and 403 (expired/invalid token).
    //         authenticateToken middleware returns 403 for expired JWTs, so
    //         only catching 401 meant expired tokens were never refreshed.
    const isAuthError = status === 401 || status === 403;

    if (!isAuthError || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is already in-flight — queue this request.
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Use a plain axios call (not apiClient) to avoid triggering this
      // interceptor again on the refresh request itself.
      // FIX #1: corrected URL from /api/users/refresh → /api/refresh
      //         (auth router is mounted at /api in server.js, not /api/users)
      const res = await axios.post(`${BASE_URL}/api/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        res.data;

      await saveTokens(newAccessToken, newRefreshToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh failed — session is unrecoverable. Clear everything and redirect.
      await AsyncStorage.multiRemove(SESSION_STORAGE_KEYS);
      router.replace("/login");

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
