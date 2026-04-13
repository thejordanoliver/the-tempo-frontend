// hooks/useProfile.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { apiClient } from "utils/apiClient";

/**
 * Normalize image URLs (Cloudinary or server URLs)
 */
function parseImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "null" || url === "undefined") return null;
  if (!url.startsWith("http")) return null;
  return url;
}

/**
 * Normalize string values
 */
function parseString(value: string | null | undefined): string | null {
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

export function useProfile() {
  /* ------------------ STATE ------------------ */
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  /* ------------------ LOAD FROM CACHE ------------------ */
  const loadFromCache = useCallback(async () => {
    try {
      const keys = [
        "userId",
        "username",
        "fullName",
        "bio",
        "profileImage",
        "bannerImage",
      ];

      const result = await AsyncStorage.multiGet(keys);
      const data = Object.fromEntries(result);

      if (data.userId) {
        setCurrentUserId(Number(data.userId));
      }

      setUsername(parseString(data.username));
      setFullName(parseString(data.fullName));
      setBio(parseString(data.bio));
      setProfileImage(parseImageUrl(data.profileImage));
      setBannerImage(parseImageUrl(data.bannerImage));
    } catch (error) {
      console.warn("[useProfile] Cache load failed:", error);
    }
  }, []);

  /* ------------------ SAVE TO CACHE ------------------ */
  const saveToCache = useCallback(async (data: any) => {
    try {
      const entries: [string, string][] = [
        ["userId", String(data.id)],
        ["username", data.username ?? ""],
        ["fullName", data.fullName ?? ""],
        ["bio", data.bio ?? ""],
        ["profileImage", data.profileImage ?? ""],
        ["bannerImage", data.bannerImage ?? ""],
      ];

      await AsyncStorage.multiSet(entries);
    } catch (error) {
      console.warn("[useProfile] Cache save failed:", error);
    }
  }, []);

  /* ------------------ LOAD FROM API ------------------ */
  const loadFromAPI = useCallback(async (userId: string) => {
    try {
      const { data } = await apiClient.get(`/api/users/id/${userId}`);

      setCurrentUserId(data.id);
      setUsername(parseString(data.username));
      setFullName(parseString(data.fullName));
      setBio(parseString(data.bio));
      setProfileImage(parseImageUrl(data.profileImage));
      setBannerImage(parseImageUrl(data.bannerImage));
      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);

      // Save fresh data to cache
      await saveToCache(data);
    } catch (error) {
      console.warn("[useProfile] API load failed:", error);
    }
  }, [saveToCache]);

  /* ------------------ MAIN LOAD FUNCTION ------------------ */
  const loadProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setIsLoading(false);
        return;
      }

      // 1. Load cached data instantly (fast UI)
      await loadFromCache();

      // 2. Fetch fresh data in background
      await loadFromAPI(userId);
    } catch (error) {
      console.warn("[useProfile] Failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromCache, loadFromAPI]);

  /* ------------------ RETURN ------------------ */
  return {
    isLoading,
    currentUserId,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    followersCount,
    followingCount,
    loadProfile,
  };
}