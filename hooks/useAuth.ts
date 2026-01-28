// hooks/useAuth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

interface User {
  id: number;
  username: string;
  full_name?: string;
  bio?: string;
  profile_image?: string | null;
  banner_image?: string | null;
  favorites?: string[];
}

export function useAuth() {
  const router = useRouter();

  // 🔹 User/token state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 🔹 Loading states
  const [loadingUser, setLoadingUser] = useState(true); // loading from AsyncStorage
  const [loadingAction, setLoadingAction] = useState(false); // login/signup/delete
  const normalizeImage = (value?: string | null) => {
    if (!value || value === "null") return null;
    return value;
  };

  
console.log(user)
  // 🔹 Load user & token from AsyncStorage
useEffect(() => {
  const loadUser = async () => {
    try {
      // 🔹 Purge broken images first
      await purgeBrokenImages();

      const values = await AsyncStorage.multiGet([
        "token",
        "accessToken",
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
          profile_image: normalizeImage(userData.profileImage),
          banner_image: normalizeImage(userData.bannerImage),
          favorites: userData.favorites ? JSON.parse(userData.favorites) : [],
        });
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Function that removes broken image keys
  const purgeBrokenImages = async () => {
    const keys = ["profileImage", "bannerImage"];
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (!value || value === "null" || value === "undefined") {
        await AsyncStorage.removeItem(key);
      }
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

  // 🔹 Login
  const login = async (username: string, password: string) => {
    try {
      setLoadingAction(true);
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
      setLoadingAction(false);
    }
  };

  // 🔹 Signup
  const signup = async (formData: FormData) => {
    try {
      setLoadingAction(true);
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
      setLoadingAction(false);
    }
  };

  // 🔹 Logout
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

  // 🔹 Delete account
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

  return {
    user,
    token,
    loadingUser, // ← now explicitly exposed
    loading: loadingAction,
    login,
    signup,
    logout,
    deleteAccount,
  };
}
