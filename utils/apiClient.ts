// utils/apiClient.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { CanceledError, create, isAxiosError } from "axios";
import { router } from "expo-router";
import { API_BASE_URL } from "utils/apiConfig";
import { isRefreshResponseForCurrentSession } from "utils/auth/authSessionRace";
import {
  getAuthSessionVersion,
  invalidateAuthSession,
  isAuthSessionCurrent,
  withAuthStorageLock,
} from "utils/auth/authSessionLifecycle";
import {
  clearSecureTokens,
  getSecureAccessToken,
  getSecureRefreshToken,
  saveSecureTokens,
} from "utils/auth/secureAuthStorage";
import { USER_PROFILE_CACHE_KEY_PREFIX } from "utils/profile/userProfileCache";

export const BASE_URL = API_BASE_URL;
export const API_REQUEST_TIMEOUT_MS = 15_000;
export const API_UPLOAD_TIMEOUT_MS = 120_000;

declare module "axios" {
  interface AxiosRequestConfig {
    _authSessionVersion?: number;
  }
}

const assertCurrentSession = (version: number) => {
  if (!isAuthSessionCurrent(version)) {
    throw new CanceledError("Authentication session changed");
  }
};

// ─── Shared Axios Instance ────────────────────────────────────────────────────

export const apiClient = create({
  baseURL: BASE_URL,
  timeout: API_REQUEST_TIMEOUT_MS,
  // Axios copies defaults when a request is created, before its asynchronous
  // interceptors run. This also binds requests queued immediately before logout.
  _authSessionVersion: getAuthSessionVersion(),
});

export const forgotPassword = (email: string) =>
  apiClient.post("/api/forgot-password", { email });

export const verifyResetCode = (email: string, code: string) =>
  apiClient.post("/api/verify-reset-code", { email, code });

export const resetPassword = (email: string, code: string, password: string) =>
  apiClient.post("/api/reset-password", { email, code, password });

export type SignupIdentityField = "username" | "email";

export const checkSignupAvailability = (
  field: SignupIdentityField,
  value: string,
) => apiClient.post("/api/signup/check-availability", { field, value });

// ─── Token helpers ────────────────────────────────────────────────────────────

let tokensAvailable = true; // Persisted credentials are read on cold startup.

export const getAccessToken = async () =>
  tokensAvailable ? getSecureAccessToken() : null;
export const getRefreshToken = getSecureRefreshToken;

type AuthSessionListener = (session: { accessToken: string | null }) => void;

const authSessionListeners = new Set<AuthSessionListener>();

const notifyAuthSessionListeners = (accessToken: string | null) => {
  authSessionListeners.forEach((listener) => {
    listener({ accessToken });
  });
};

export const refreshStoredAuthUser = async () => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    notifyAuthSessionListeners(accessToken);
  }
};

export const subscribeAuthSession = (listener: AuthSessionListener) => {
  authSessionListeners.add(listener);

  return () => {
    authSessionListeners.delete(listener);
  };
};

const storeTokens = async (
  accessToken: string,
  refreshToken: string,
  version: number,
) => {
  assertCurrentSession(version);
  await saveSecureTokens(accessToken, refreshToken);
  assertCurrentSession(version);
  tokensAvailable = true;

  notifyAuthSessionListeners(accessToken);
};

export const saveTokens = (
  accessToken: string,
  refreshToken: string,
  version = getAuthSessionVersion(),
) => withAuthStorageLock(() => storeTokens(accessToken, refreshToken, version));

export const startAuthSession = async (
  accessToken: string,
  refreshToken: string,
  userEntries: [string, string][],
) => {
  const cleanup = clearAuthSession();
  const version = getAuthSessionVersion();
  await cleanup;

  await withAuthStorageLock(async () => {
    assertCurrentSession(version);
    await AsyncStorage.multiSet(userEntries);
    await storeTokens(accessToken, refreshToken, version);
  });
  return version;
};

const AUTH_SESSION_STORAGE_KEYS = [
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
  "currentUser",
  "user",
  "authUser",
  "authState",
  "session",
];

const AUTH_SESSION_STORAGE_KEY_PREFIXES = [
  "favoriteTeams:",
  "chat_",
  "gameChat:",
  "@view_mode_preference_",
  USER_PROFILE_CACHE_KEY_PREFIX,
];

export const clearAuthSession = async (userId?: number | string | null) => {
  const version = invalidateAuthSession();
  apiClient.defaults._authSessionVersion = version;
  tokensAvailable = false;
  activeRefresh?.controller.abort();
  activeRefresh = null;
  refreshFailure = null;
  delete apiClient.defaults.headers.common.Authorization;
  delete apiClient.defaults.headers.common.authorization;
  notifyAuthSessionListeners(null);

  return withAuthStorageLock(async () => {
    const keysToRemove = new Set(AUTH_SESSION_STORAGE_KEYS);

    if (userId != null) {
      keysToRemove.add(`favoriteTeams:${userId}`);
      keysToRemove.add(`@view_mode_preference_${userId}`);
    }

    try {
      const existingKeys = await AsyncStorage.getAllKeys();

      existingKeys.forEach((key) => {
        if (
          AUTH_SESSION_STORAGE_KEY_PREFIXES.some((prefix) =>
            key.startsWith(prefix),
          )
        ) {
          keysToRemove.add(key);
        }
      });
    } catch (err) {
      console.warn("Failed to list auth storage keys:", err);
    }

    try {
      await AsyncStorage.multiRemove(
        Array.from(keysToRemove).filter(
          (key) => key !== "accessToken" && key !== "refreshToken",
        ),
      );
    } finally {
      try {
        await clearSecureTokens();
      } finally {
        delete apiClient.defaults.headers.common.Authorization;
        delete apiClient.defaults.headers.common.authorization;
        if (isAuthSessionCurrent(version)) notifyAuthSessionListeners(null);
      }
    }
  });
};

export const clearTokens = async () => {
  await clearAuthSession();
};

const AUTH_REFRESH_EXEMPT_PATHS = [
  "/api/login",
  "/api/signup",
  "/api/forgot-password",
  "/api/verify-reset-code",
  "/api/reset-password",
  "/api/refresh",
  "/api/logout",
  // Explore analytics is optional and fire-and-forget. A stale token must not
  // trigger session refresh or login navigation from a telemetry failure.
  "/api/explore/search/events",
];

const getRequestPath = (url?: string) => {
  if (!url) return "";

  try {
    return new URL(url, BASE_URL || "http://localhost").pathname;
  } catch {
    const withoutQuery = url.split("?")[0];
    const withoutBase =
      BASE_URL && withoutQuery.startsWith(BASE_URL)
        ? withoutQuery.slice(BASE_URL.length)
        : withoutQuery;

    return withoutBase.startsWith("/") ? withoutBase : `/${withoutBase}`;
  }
};

const shouldSkipAuthRefresh = (url?: string) => {
  const requestPath = getRequestPath(url);

  return AUTH_REFRESH_EXEMPT_PATHS.some(
    (path) => requestPath === path || requestPath === `${path}/`,
  );
};

// ─── Request interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use(async (config) => {
  const version = config._authSessionVersion ?? getAuthSessionVersion();
  config._authSessionVersion = version;
  assertCurrentSession(version);
  const token = await getAccessToken();
  assertCurrentSession(version);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
    delete config.headers.authorization;
  }

  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────

type ActiveRefresh = {
  version: number;
  controller: AbortController;
  promise: Promise<string>;
};

let activeRefresh: ActiveRefresh | null = null;
let refreshFailure: { version: number; until: number; error: unknown } | null =
  null;

const DEFAULT_REFRESH_BACKOFF_MS = 5_000;
const MAX_REFRESH_BACKOFF_MS = 60_000;

const isTransientRefreshError = (error: unknown) => {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return !status || status === 429 || status >= 500;
};

const getRefreshBackoffMs = (error: unknown) => {
  const retryAfterSeconds = isAxiosError(error)
    ? Number(error.response?.headers?.["retry-after"])
    : NaN;

  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? Math.min(
        MAX_REFRESH_BACKOFF_MS,
        Math.max(DEFAULT_REFRESH_BACKOFF_MS, retryAfterSeconds * 1_000),
      )
    : DEFAULT_REFRESH_BACKOFF_MS;
};

// Called with the storage lock held so a password rotation cannot race a refresh
// between comparing the refresh token and writing its replacement.
const getRotatedAccessToken = async (
  requestedToken: string,
  version: number,
) => {
  const currentRefreshToken = await getRefreshToken();
  assertCurrentSession(version);
  if (isRefreshResponseForCurrentSession(requestedToken, currentRefreshToken)) {
    return null;
  }

  const currentAccessToken = await getAccessToken();
  assertCurrentSession(version);
  if (!currentAccessToken)
    throw new CanceledError("Authentication session changed");
  return currentAccessToken;
};

const refreshAccessToken = async (
  version: number,
  signal: AbortSignal,
): Promise<string> => {
  let requestedToken: string | null = null;
  try {
    requestedToken = await getRefreshToken();
    assertCurrentSession(version);
    if (!requestedToken) throw new Error("No refresh token available");

    const { data } = await axios.post(
      `${BASE_URL}/api/refresh`,
      { refreshToken: requestedToken },
      { timeout: API_REQUEST_TIMEOUT_MS, signal },
    );

    const token = requestedToken;
    return await withAuthStorageLock(async () => {
      assertCurrentSession(version);
      const rotatedAccessToken = await getRotatedAccessToken(token, version);
      if (rotatedAccessToken) return rotatedAccessToken;

      const { accessToken, refreshToken } = data ?? {};
      if (
        typeof accessToken !== "string" ||
        !accessToken.trim() ||
        typeof refreshToken !== "string" ||
        !refreshToken.trim()
      ) {
        throw new Error("Invalid token refresh response");
      }

      await storeTokens(accessToken, refreshToken, version);
      refreshFailure = null;
      return accessToken;
    });
  } catch (error) {
    // A login/logout invalidates the entire operation, including queued retries
    // and cleanup. A token rotation for the same session may safely be reused.
    assertCurrentSession(version);
    if (requestedToken) {
      const token = requestedToken;
      const rotatedAccessToken = await withAuthStorageLock(() =>
        getRotatedAccessToken(token, version),
      );
      if (rotatedAccessToken) return rotatedAccessToken;
    }
    assertCurrentSession(version);

    if (isTransientRefreshError(error)) {
      refreshFailure = {
        version,
        until: Date.now() + getRefreshBackoffMs(error),
        error,
      };
    } else {
      const cleanup = clearAuthSession();
      const clearedVersion = getAuthSessionVersion();
      await cleanup;
      if (isAuthSessionCurrent(clearedVersion)) router.replace("/login");
    }
    throw error;
  }
};

const getRefreshedAccessToken = (version: number) => {
  assertCurrentSession(version);
  if (activeRefresh?.version === version) return activeRefresh.promise;
  if (
    refreshFailure?.version === version &&
    Date.now() < refreshFailure.until
  ) {
    return Promise.reject(refreshFailure.error);
  }

  const controller = new AbortController();
  const refresh: ActiveRefresh = {
    version,
    controller,
    promise: refreshAccessToken(version, controller.signal).finally(() => {
      if (activeRefresh === refresh) activeRefresh = null;
    }),
  };
  activeRefresh = refresh;
  return refresh.promise;
};

apiClient.interceptors.response.use(
  (response) => {
    assertCurrentSession(
      response.config._authSessionVersion ?? getAuthSessionVersion(),
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    const version =
      originalRequest._authSessionVersion ?? getAuthSessionVersion();
    assertCurrentSession(version);

    const status = error.response?.status;
    const requestUrl = originalRequest.url;
    const requestPath = getRequestPath(requestUrl);
    const responseError = error.response?.data?.error;
    const isAuthError =
      status === 401 ||
      (status === 403 &&
        (error.response?.data?.code === "ACCESS_TOKEN_INVALID" ||
          responseError === "Invalid or expired token"));
    const isInvalidCurrentPassword =
      status === 401 &&
      ((requestPath === "/api/users/me/password" &&
        responseError === "Invalid current password") ||
        (requestPath === "/api/users/me" &&
          responseError === "Invalid password"));

    // Login/reset validation failures and permission denials do not expire a session.
    if (
      shouldSkipAuthRefresh(requestUrl) ||
      isInvalidCurrentPassword ||
      !isAuthError ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const token = await getRefreshedAccessToken(version);
    assertCurrentSession(version);
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return apiClient(originalRequest);
  },
);
