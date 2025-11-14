import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

interface User {
  id: number;
  username: string;
  full_name?: string;
  bio?: string;
  profile_image?: string;
  banner_image?: string;
  favorites?: string[];
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 🔹 Load user & token from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const values = await AsyncStorage.multiGet([
          "token",
          "accessToken", // backward compatibility
          "userId",
          "username",
          "fullName",
          "bio",
          "profileImage",
          "bannerImage",
          "favorites",
        ]);

        const userData: Record<string, string | null> = Object.fromEntries(values);
        const storedToken = userData.token ?? userData.accessToken;
        if (storedToken) setToken(storedToken);

        if (userData.userId && userData.username) {
          setUser({
            id: parseInt(userData.userId, 10),
            username: userData.username,
            full_name: userData.fullName ?? "",
            bio: userData.bio ?? "",
            profile_image: userData.profileImage ?? "",
            banner_image: userData.bannerImage ?? "",
            favorites: userData.favorites ? JSON.parse(userData.favorites) : [],
          });
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  // 🔹 Helper: store everything consistently
  const handleAuthSuccess = async (token: string, user: User) => {
    try {
      setToken(token);
      setUser(user);

      await AsyncStorage.multiSet([
        ["token", token],
        ["userId", user.id.toString()],
        ["username", user.username],
        ["fullName", user.full_name ?? ""],
        ["bio", user.bio ?? ""],
        ["profileImage", user.profile_image ?? ""],
        ["bannerImage", user.banner_image ?? ""],
        ["favorites", JSON.stringify(user.favorites ?? [])],
      ]);
    } catch (err) {
      console.error("Failed to save auth data:", err);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Invalid login");

      const { token, user } = await res.json();

      await handleAuthSuccess(token, user);
      router.replace("/(tabs)/profile");
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData: FormData) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/signup`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Signup failed");

      const { token, user } = await res.json();

      await handleAuthSuccess(token, user);
      router.replace("/(tabs)/profile");
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user?.id) {
        await AsyncStorage.removeItem(`@view_mode_preference_${user.id}`);
      }

      await AsyncStorage.clear();
      setUser(null);
      setToken(null);
      router.replace("/login");
    } catch (err) {
      console.warn("Logout error:", err);
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      const username = await AsyncStorage.getItem("username");
      if (!username) throw new Error("No user found");

      const res = await fetch(`${BASE_URL}/api/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to delete account");
      }

      await AsyncStorage.clear();
      setUser(null);
      setToken(null);
      router.replace("/login");
    } catch (err) {
      console.error("Delete error:", err);
      throw err;
    }
  };

  return { user, token, login, signup, logout, deleteAccount, loading };
}
