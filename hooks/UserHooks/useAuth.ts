// hooks/useAuth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { apiClient, clearAuthSession, saveTokens } from "utils/apiClient";

interface User {
  id: number;
  username: string;
  fullName?: string;
  full_name?: string;
  bio?: string;
  profileImage?: string | null;
  profile_image?: string | null;
  banner_image?: string | null;
  favorites?: string[];
}

const LEGACY_FAVORITES_KEY = "favorites";

const getFavoritesStorageKey = (userId: number | string) =>
  `favoriteTeams:${userId}`;

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

const parseFavorites = (value: string | null): string[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const values = await AsyncStorage.multiGet([
          "accessToken",
          "userId",
          "username",
          "fullName",
          "bio",
          "profileImage",
          "bannerImage",
        ]);

        const stored: Record<string, string | null> =
          Object.fromEntries(values);

        const storedFavorites = stored.userId
          ? await AsyncStorage.getItem(getFavoritesStorageKey(stored.userId))
          : null;
        const parsedUserId = stored.userId
          ? Number.parseInt(stored.userId, 10)
          : NaN;

        if (
          !stored.accessToken ||
          !stored.userId ||
          !stored.username ||
          Number.isNaN(parsedUserId)
        ) {
          await clearAuthSession(stored.userId);
          setToken(null);
          setUser(null);
          return;
        }

        setToken(stored.accessToken);
        setUser({
          id: parsedUserId,
          username: stored.username,
          full_name: stored.fullName ?? "",
          bio: stored.bio ?? "",
          profile_image: normalizeImage(stored.profileImage),
          banner_image: normalizeImage(stored.bannerImage),
          favorites: parseFavorites(storedFavorites),
        });
      } catch (err) {
        console.error("Failed to load user from storage:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const handleAuthSuccess = async (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => {
    setToken(accessToken);
    setUser(user);

    await saveTokens(accessToken, refreshToken);

    await AsyncStorage.multiSet([
      ["userId", user.id.toString()],
      ["username", normalizeString(user.username)],
      ["fullName", normalizeString(user.full_name ?? user.fullName)],
      ["bio", normalizeString(user.bio)],
      [
        "profileImage",
        normalizeImage(user.profile_image ?? user.profileImage) ?? "",
      ],
      ["bannerImage", normalizeImage(user.banner_image) ?? ""],
      [getFavoritesStorageKey(user.id), JSON.stringify(user.favorites ?? [])],
      ["authUser", JSON.stringify(normalizeCachedAuthUser(user))],
    ]);

    await AsyncStorage.removeItem(LEGACY_FAVORITES_KEY);
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

      router.replace("/(tabs)/profile");
    } catch (err: any) {
      const status = err.response?.status;
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Login failed";

      console.warn("Login failed:", message);

      const loginError = new Error(message) as Error & {
        status?: number;
        code?: "USERNAME_NOT_FOUND" | "WRONG_PASSWORD";
      };

      loginError.status = status;

      if (status === 404 || message.toLowerCase().includes("username")) {
        loginError.code = "USERNAME_NOT_FOUND";
        loginError.message = "Username does not exist.";
      } else if (status === 401 || message.toLowerCase().includes("password")) {
        loginError.code = "WRONG_PASSWORD";
        loginError.message = "Wrong password.";
      }

      throw loginError;
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
      });

      await handleAuthSuccess(
        res.data.accessToken,
        res.data.refreshToken,
        res.data.user,
      );

      router.replace("/(tabs)/profile");
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
    let refreshToken: string | null = null;

    try {
      refreshToken = await AsyncStorage.getItem("refreshToken");
    } catch (err) {
      console.warn("Failed to read refresh token before logout:", err);
    }

    try {
      try {
        await AsyncStorage.removeItem("authUser");
      } catch (err) {
        console.warn("Failed to clear cached auth user:", err);
      }

      await clearAuthSession(currentUserId);
      setUser(null);
      setToken(null);

      router.replace("/login");

      if (refreshToken) {
        void apiClient.post(`/api/logout`, { refreshToken }).catch(() => {});
      }
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
      setToken(null);
      router.replace("/login");
    }
  };

  const deleteAccount = async (password: string) => {
    const currentPassword = password.trim();

    if (!currentPassword) {
      throw new Error("Password is required");
    }

    try {
      await apiClient.delete("/api/delete-account", {
        data: {
          password: currentPassword,
        },
      });

      await clearAuthSession(user?.id);
      setUser(null);
      setToken(null);
      router.replace("/login");
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Failed to delete account";

      // Do not use console.error here for expected validation errors like wrong password.
      console.warn("Delete account failed:", message);

      throw new Error(message);
    }
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
