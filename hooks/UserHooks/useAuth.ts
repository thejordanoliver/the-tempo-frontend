// hooks/useAuth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { apiClient, BASE_URL, saveTokens } from "utils/apiClient";

interface User {
  id: number;
  username: string;
  full_name?: string;
  bio?: string;
  profile_image?: string | null;
  banner_image?: string | null;
  favorites?: string[];
}

const LEGACY_FAVORITES_KEY = "favorites";

const getFavoritesStorageKey = (userId: number | string) =>
  `favoriteTeams:${userId}`;

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
  LEGACY_FAVORITES_KEY,
];

const normalizeImage = (value?: string | null): string | null => {
  if (!value || value === "null" || value === "undefined") return null;
  return value;
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

        if (stored.accessToken) {
          setToken(stored.accessToken);
        }

        if (stored.userId && stored.username) {
          setUser({
            id: parseInt(stored.userId, 10),
            username: stored.username,
            full_name: stored.fullName ?? "",
            bio: stored.bio ?? "",
            profile_image: normalizeImage(stored.profileImage),
            banner_image: normalizeImage(stored.bannerImage),
            favorites: storedFavorites ? JSON.parse(storedFavorites) : [],
          });
        }
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
      ["username", user.username],
      ["fullName", user.full_name ?? ""],
      ["bio", user.bio ?? ""],
      ["profileImage", normalizeImage(user.profile_image) ?? ""],
      ["bannerImage", normalizeImage(user.banner_image) ?? ""],
      [getFavoritesStorageKey(user.id), JSON.stringify(user.favorites ?? [])],
    ]);

    await AsyncStorage.removeItem(LEGACY_FAVORITES_KEY);
  };

  const login = async (username: string, password: string) => {
    setLoadingAction(true);

    try {
      const res = await axios.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>(`${BASE_URL}/api/login`, { username, password });

      await handleAuthSuccess(
        res.data.accessToken,
        res.data.refreshToken,
        res.data.user,
      );

      router.replace("/(tabs)/profile");
    } catch (err: any) {
      const message =
        err.response?.data?.warn ?? err.message ?? "Invalid credentials";
      console.error("Login error:", message);
      throw new Error(message);
    } finally {
      setLoadingAction(false);
    }
  };

  const signup = async (formData: FormData) => {
    setLoadingAction(true);

    try {
      const res = await axios.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>(`${BASE_URL}/api/signup`, formData, {
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
    try {
      const stored = await AsyncStorage.multiGet(["refreshToken"]);
      const refreshToken = Object.fromEntries(stored).refreshToken;

      if (refreshToken) {
        await axios
          .post(`${BASE_URL}/api/logout`, { refreshToken })
          .catch(() => {});
      }

      if (user?.id) {
        await AsyncStorage.removeItem(`@view_mode_preference_${user.id}`);
      }
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      await AsyncStorage.multiRemove([
        ...SESSION_STORAGE_KEYS,
        ...(user?.id ? [getFavoritesStorageKey(user.id)] : []),
      ]);

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

    await AsyncStorage.multiRemove([
      ...SESSION_STORAGE_KEYS,
      ...(user?.id ? [getFavoritesStorageKey(user.id)] : []),
      ...(user?.id ? [`@view_mode_preference_${user.id}`] : []),
    ]);

    setUser(null);
    setToken(null);
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