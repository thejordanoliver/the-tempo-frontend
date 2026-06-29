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

function parseCachedString(value: string | null | undefined): string {
  return parseString(value) ?? "";
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

  const resetProfile = useCallback(() => {
    setCurrentUserId(null);
    setUsername(null);
    setFullName(null);
    setBio(null);
    setProfileImage(null);
    setBannerImage(null);
    setFollowersCount(0);
    setFollowingCount(0);
  }, []);

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
      const cachedUserId = data.userId ? Number(data.userId) : null;

      if (cachedUserId) {
        setCurrentUserId(cachedUserId);
      }

      setUsername(parseString(data.username));
      setFullName(parseString(data.fullName));
      setBio(parseString(data.bio));
      setProfileImage(parseImageUrl(data.profileImage));
      setBannerImage(parseImageUrl(data.bannerImage));
      return cachedUserId;
    } catch (error) {
      console.warn("[useProfile] Cache load failed:", error);
      return null;
    }
  }, []);

  /* ------------------ SAVE TO CACHE ------------------ */
  const saveToCache = useCallback(async (data: any) => {
    try {
      const username = parseCachedString(data.username);
      const fullName = parseCachedString(data.fullName ?? data.full_name);
      const profileImage = parseCachedString(
        data.profileImage ?? data.profile_image,
      );
      const bannerImage = parseCachedString(
        data.bannerImage ?? data.banner_image,
      );

      const entries: [string, string][] = [
        ["userId", String(data.id)],
        ["username", username],
        ["fullName", fullName],
        ["bio", parseCachedString(data.bio)],
        ["profileImage", profileImage],
        ["bannerImage", bannerImage],
        [
          "authUser",
          JSON.stringify({
            id: data.id,
            username,
            fullName,
            profileImage,
          }),
        ],
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
      setFullName(parseString(data.fullName ?? data.full_name));
      setBio(parseString(data.bio));
      setProfileImage(parseImageUrl(data.profileImage ?? data.profile_image));
      setBannerImage(parseImageUrl(data.bannerImage ?? data.banner_image));
      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);

      // Save fresh data to cache
      await saveToCache(data);
      return Number(data.id);
    } catch (error) {
      console.warn("[useProfile] API load failed:", error);
      return Number(userId);
    }
  }, [saveToCache]);

  /* ------------------ MAIN LOAD FUNCTION ------------------ */
  const loadProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        resetProfile();
        setIsLoading(false);
        return null;
      }

      // 1. Load cached data instantly (fast UI)
      await loadFromCache();

      // 2. Fetch fresh data in background
      return await loadFromAPI(userId);
    } catch (error) {
      console.warn("[useProfile] Failed:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadFromCache, loadFromAPI, resetProfile]);

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
    resetProfile,
  };
}
