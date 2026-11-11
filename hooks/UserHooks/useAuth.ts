import { useScopedRouter } from "hooks/useScopedRouter";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { CanceledError } from "axios";
import { useEffect, useState } from "react";
import { disconnectNotificationSocket } from "services/notificationSocket";
import { useBadgeNotificationStore } from "store/badgeNotificationStore";
import { useLikesStore } from "store/useLikesStore";
import {
  apiClient,
  API_REQUEST_TIMEOUT_MS,
  API_UPLOAD_TIMEOUT_MS,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  startAuthSession,
  subscribeAuthSession,
} from "utils/apiClient";
import {
  getAuthSessionVersion,
  isAuthSessionCurrent,
} from "utils/auth/authSessionLifecycle";

interface User {
  id: number;
  username: string;
  fullName?: string;
  full_name?: string;
  bio?: string;
  profileImage?: string | null;
  profile_image?: string | null;
  banner_image?: string | null;
}

const normalizeImage = (value?: string | null): string | null => {
  if (!value || value === "null" || value === "undefined") return null;
  return value;
};

const normalizeString = (value?: string | null): string => {
  if (!value || value === "null" || value === "undefined") return "";
  return value;
};

const normalizeCachedAuthUser = (user: User) => ({
  id: user.id,
  username: normalizeString(user.username),
  fullName: normalizeString(user.full_name ?? user.fullName),
  profileImage: normalizeImage(user.profile_image ?? user.profileImage) ?? "",
});

const loadStoredAuthSnapshot = async (): Promise<{
  accessToken: string;
  user: User;
} | null> => {
  const version = getAuthSessionVersion();
  const [accessToken, values] = await Promise.all([
    getAccessToken(),
    AsyncStorage.multiGet([
      "userId",
      "username",
      "fullName",
      "bio",
      "profileImage",
      "bannerImage",
    ]),
  ]);

  const stored: Record<string, string | null> = Object.fromEntries(values);
  if (!isAuthSessionCurrent(version)) return null;
  const parsedUserId = stored.userId ? Number.parseInt(stored.userId, 10) : NaN;

  if (
    !accessToken ||
    !stored.userId ||
    !stored.username ||
    Number.isNaN(parsedUserId)
  ) {
    return null;
  }

  return {
    accessToken,
    user: {
      id: parsedUserId,
      username: stored.username,
      full_name: stored.fullName ?? "",
      bio: stored.bio ?? "",
      profile_image: normalizeImage(stored.profileImage),
      banner_image: normalizeImage(stored.bannerImage),
    },
  };
};

export function useAuth() {
  const router = useScopedRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeAuthSession(({ accessToken }) => {
      if (!isMounted) return;
      const version = getAuthSessionVersion();

      setToken(accessToken);

      if (!accessToken) {
        useLikesStore.getState().setUser(null);
        setUser(null);
        return;
      }

      void loadStoredAuthSnapshot()
        .then((snapshot) => {
          if (!isMounted || !snapshot || !isAuthSessionCurrent(version)) return;
          useLikesStore.getState().setUser(String(snapshot.user.id));
          setUser(snapshot.user);
        })
        .catch((err) => {
          if (__DEV__) {
            console.warn("Failed to refresh auth user from storage:", err);
          }
        });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const version = getAuthSessionVersion();
      try {
        const snapshot = await loadStoredAuthSnapshot();
        if (!isMounted || !isAuthSessionCurrent(version)) return;

        if (!snapshot) {
          await clearAuthSession();
          useLikesStore.getState().setUser(null);
          setToken(null);
          setUser(null);
          return;
        }

        useLikesStore.getState().setUser(String(snapshot.user.id));
        setToken(snapshot.accessToken);
        setUser(snapshot.user);
      } catch (err) {
        console.error("Failed to load user from storage:", err);
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthSuccess = async (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => {
    const version = await startAuthSession(accessToken, refreshToken, [
      ["userId", user.id.toString()],
      ["username", normalizeString(user.username)],
      ["fullName", normalizeString(user.full_name ?? user.fullName)],
      ["bio", normalizeString(user.bio)],
      [
        "profileImage",
        normalizeImage(user.profile_image ?? user.profileImage) ?? "",
      ],
      ["bannerImage", normalizeImage(user.banner_image) ?? ""],
      ["authUser", JSON.stringify(normalizeCachedAuthUser(user))],
    ]);

    if (!isAuthSessionCurrent(version)) {
      throw new CanceledError("Authentication session changed");
    }
    useLikesStore.getState().setUser(String(user.id));
    setToken(accessToken);
    setUser(user);
  };

  const login = async (username: string, password: string) => {
    setLoadingAction(true);

    try {
      const res = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>("/api/login", { username, password });

      await handleAuthSuccess(
        res.data.accessToken,
        res.data.refreshToken,
        res.data.user,
      );

      router.replace("/profile");
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Login failed";

      console.warn("Login failed:", message);

      throw new Error(message);
    } finally {
      setLoadingAction(false);
    }
  };

  const signup = async (formData: FormData) => {
    setLoadingAction(true);

    try {
      const res = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>("api/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: API_UPLOAD_TIMEOUT_MS,
      });

      await handleAuthSuccess(
        res.data.accessToken,
        res.data.refreshToken,
        res.data.user,
      );

      router.replace("/signup/success");
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Signup failed";
      console.error("Signup error:", message);
      throw new Error(message);
    } finally {
      setLoadingAction(false);
    }
  };

  const logout = async () => {
    const currentUserId = user?.id;
    const version = getAuthSessionVersion();
    let refreshToken: string | null = null;

    try {
      refreshToken = await getRefreshToken();
    } catch (err) {
      console.warn("Failed to read refresh token before logout:", err);
    }

    if (!isAuthSessionCurrent(version)) return;
    const cleanup = clearAuthSession(currentUserId);
    disconnectNotificationSocket();
    useBadgeNotificationStore.getState().clearBadgeNotifications();
    useLikesStore.getState().setUser(null);
    setUser(null);
    setToken(null);

    if (refreshToken) {
      // Revocation uses only the captured credential. It must not attach a later
      // account's token or run session interceptors after local sign-out.
      void axios
        .post(
          `${apiClient.defaults.baseURL}/api/logout`,
          { refreshToken },
          { timeout: API_REQUEST_TIMEOUT_MS },
        )
        .catch((err) =>
          console.warn("Failed to revoke refresh token on server:", err),
        );
    }

    try {
      await cleanup;
    } catch (err) {
      console.warn("Failed to clear local auth session:", err);
    }
  };

  const deleteAccount = async (password: string) => {
    const currentPassword = password;

    if (!currentPassword) {
      throw new Error("Password is required");
    }

    try {
      await apiClient.delete("/api/users/me", {
        data: {
          currentPassword,
        },
      });
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Failed to delete account";

      // Do not use console.error here for expected validation errors like wrong password.
      console.warn("Delete account failed:", message);

      throw new Error(message);
    }

    // Move to the public completion screen before publishing the signed-out
    // state so the root auth guard cannot race this navigation back to login.
    router.replace("/settings/deleteaccountsplash");

    try {
      await clearAuthSession(user?.id);
    } catch (err) {
      // The server deletion succeeded, so local cleanup failures should not be
      // reported as though the account still exists.
      console.warn("Failed to clear deleted account session:", err);
    }

    disconnectNotificationSocket();
    useBadgeNotificationStore.getState().clearBadgeNotifications();
    useLikesStore.getState().setUser(null);
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    loadingUser,
    loading: loadingAction,
    login,
    signup,
    logout,
    deleteAccount,
  };
}
