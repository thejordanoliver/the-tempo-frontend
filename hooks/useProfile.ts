// hooks/useProfile.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

/**
 * Normalize image URLs (Cloudinary or server URLs)
 */
function parseImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "null" || url === "undefined") return null;
  if (!url.startsWith("http")) return null;
  return url;
}

export function useProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  /**
   * Fetch follower / following counts from API using axios
   */
  const loadFollowCounts = useCallback(async (userId: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/users/id/${userId}`);
      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);
    } catch (error) {
      console.warn("[useProfile] Failed to load follow counts:", error);
      // Silent failure — counts are non-critical
    }
  }, []);

  /**
   * Load profile data from AsyncStorage (source of truth for logged-in user)
   */
  const loadProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const keys = [
        "userId",
        "username",
        "fullName",
        "bio",
        "profileImage",
        "bannerImage",
        "favorites",
      ];

      const result = await AsyncStorage.multiGet(keys);
      const data = Object.fromEntries(result);

      setUsername(data.username ?? null);
      setFullName(data.fullName ?? null);
      setBio(data.bio ?? null);
      setProfileImage(parseImageUrl(data.profileImage));
      setBannerImage(parseImageUrl(data.bannerImage));
      setFavorites(data.favorites ? JSON.parse(data.favorites) : []);

      if (data.userId) {
        setCurrentUserId(Number(data.userId));
        await loadFollowCounts(data.userId);
      }
    } catch (error) {
      console.warn("[useProfile] Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFollowCounts]);

  return {
    isLoading,
    currentUserId,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    favorites,
    followersCount,
    followingCount,
    loadProfile,
  };
}
