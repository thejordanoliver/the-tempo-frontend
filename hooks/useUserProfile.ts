import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useFollowersStore } from "store/followersStore";

import { teams } from "constants/teams";
import { teams as cbbteams } from "constants/teamsCBB";
import { teams as cfbteams } from "constants/teamsCFB";
import { teams as mlbteams } from "constants/teamsMLB";
import { teams as nflteams } from "constants/teamsNFL";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

/**
 * Normalize image URLs (Cloudinary or server URLs)
 */
function parseImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "null" || url === "undefined") return null;
  if (!url.startsWith("http")) return null;
  return url;
}

export function useUserProfile(userId?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { shouldRestore, targetUserId, type, openModal, clearRestore } =
    useFollowersStore();

  // Load current user ID from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("userId").then((id) => {
      if (id) setCurrentUserId(Number(id));
    });
  }, []);

  // Fetch user profile
  const fetchUserData = useCallback(async () => {
    if (!userId || currentUserId === null) return;

    setIsLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/users/id/${userId}`, {
        params: { currentUserId },
      });

      setUsername(data.username ?? null);
      setFullName(data.fullName ?? null);
      setBio(data.bio ?? null);
      setProfileImage(parseImageUrl(data.profileImage));
      setBannerImage(parseImageUrl(data.bannerImage));
      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);
      setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
      if (typeof data.isFollowing === "boolean")
        setIsFollowing(data.isFollowing);
    } catch (err) {
      console.warn("Failed to load user profile", err);
      setUsername(null);
      setFullName(null);
      setBio(null);
      setProfileImage(null);
      setBannerImage(null);
      setFollowersCount(0);
      setFollowingCount(0);
      setFavorites([]);
      setIsFollowing(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentUserId]);

  // Refetch when both userId and currentUserId are ready
  useEffect(() => {
    if (userId && currentUserId !== null) {
      fetchUserData();
    }
  }, [userId, currentUserId, fetchUserData]);

  // Restore modal + refetch on focus
  useFocusEffect(
    useCallback(() => {
      if (shouldRestore && targetUserId) {
        clearRestore();
        openModal(type, targetUserId, currentUserId?.toString());
      }

      if (userId && currentUserId !== null) {
        fetchUserData();
      }
    }, [
      shouldRestore,
      targetUserId,
      type,
      currentUserId,
      userId,
      fetchUserData,
      openModal,
      clearRestore,
    ])
  );

  // Toggle follow/unfollow with optimistic update
  const toggleFollow = async () => {
    if (!userId || currentUserId === null || followLoading) return;

    const prevFollowing = isFollowing;
    const prevCount = followersCount;
    const optimistic = !prevFollowing;

    // Optimistic update
    setIsFollowing(optimistic);
    setFollowersCount((c) => (optimistic ? c + 1 : Math.max(c - 1, 0)));
    setFollowLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/follows/toggle`, {
        followerId: currentUserId,
        followeeId: userId,
      });
      // No need to update count if backend doesn't return it
    } catch (err) {
      // Revert if request fails
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
    } finally {
      setFollowLoading(false);
    }
  };

  // Map favorite teams with league info
  const favoriteTeamsWithLeague = favorites
    .map((fav) => {
      const [league, id] = fav.split(":");
      let team;
      if (league === "NBA") team = teams.find((t) => String(t.id) === id);
      if (league === "NFL") team = nflteams.find((t) => String(t.id) === id);
      if (league === "CFB") team = cfbteams.find((t) => String(t.id) === id);
      if (league === "CBB") team = cbbteams.find((t) => String(t.id) === id);
      if (league === "WCBB") team = cbbteams.find((t) => String(t.wid) === id);
      if (league === "MLB") team = mlbteams.find((t) => String(t.id) === id);
      return team ? { ...team, league } : null;
    })
    .filter(Boolean);

  return {
    isLoading,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    followersCount,
    followingCount,
    isFollowing: isFollowing ?? false,
    followLoading,
    favoriteTeamsWithLeague,
    fadeAnim,
    currentUserId,

    // Actions
    toggleFollow,
    fetchUserData,
  };
}
