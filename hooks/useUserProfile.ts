import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useFollowersModalStore } from "store/followersModalStore";

import { teams } from "constants/teams";
import { teams as cbbteams } from "constants/teamsCBB";
import { teams as cfbteams } from "constants/teamsCFB";
import { teams as mlbteams } from "constants/teamsMLB";
import { teams as nflteams } from "constants/teamsNFL";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const parseImageUrl = (url?: string | null) => {
  if (!url || url === "null") return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

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

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null); // null = not loaded yet
  const [followLoading, setFollowLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { shouldRestore, targetUserId, type, openModal, clearRestore } =
    useFollowersModalStore();

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
      const res = await fetch(
        `${BASE_URL}/api/users/id/${userId}?currentUserId=${currentUserId}`
      );

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();

      setUsername(data.username ?? null);
      setFullName(data.full_name ?? null);
      setBio(data.bio ?? null);

      setProfileImage(parseImageUrl(data.profile_image));
      setBannerImage(parseImageUrl(data.banner_image));

      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);
      setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
      if (typeof data.isFollowing === "boolean") {
        setIsFollowing(data.isFollowing);
      }
      console.log(JSON.stringify(setIsFollowing(data.isFollowing), null, 2));
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

      // Only refetch if both IDs are ready
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

  // Toggle follow/unfollow
  const toggleFollow = async () => {
    if (!userId || currentUserId === null || followLoading) return;

    const prev = isFollowing;
    const prevCount = followersCount;

    const optimistic = !prev;
    setIsFollowing(optimistic);
    setFollowersCount((c) => (optimistic ? c + 1 : Math.max(c - 1, 0)));
    setFollowLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/follows/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: currentUserId,
          followeeId: userId,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle follow");

      const data = await res.json();
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount ?? followersCount);
    } catch {
      setIsFollowing(prev);
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
    // state
    isLoading,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    followersCount,
    followingCount,
    isFollowing: isFollowing ?? false, // default false if not loaded
    followLoading,
    favoriteTeamsWithLeague,
    fadeAnim,
    currentUserId,

    // actions
    toggleFollow,
    fetchUserData,
  };
}
