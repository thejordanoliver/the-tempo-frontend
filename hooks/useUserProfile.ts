import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { teams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { useFollowersStore } from "store/followersStore";
import type { LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";

type SupportedFavoriteLeague = Extract<
  LeagueType,
  "NBA" | "WNBA" | "NFL" | "CFB" | "CBB" | "WCBB" | "MLB" | "NHL"
>;

type TeamLookupItem = {
  id: number | string;
  wid?: number | string | null;
};

type FavoriteTeamWithLeague = TeamLookupItem & {
  league: SupportedFavoriteLeague;
};

type UserProfileResponse = {
  username?: string | null;
  fullName?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  bannerImage?: string | null;
  followersCount?: number | null;
  followingCount?: number | null;
  favorites?: unknown;
  isFollowing?: boolean | null;
};

const SUPPORTED_FAVORITE_LEAGUES = new Set<SupportedFavoriteLeague>([
  "NBA",
  "WNBA",
  "NFL",
  "CFB",
  "CBB",
  "WCBB",
  "MLB",
  "NHL",
]);

const isSupportedFavoriteLeague = (
  league: string,
): league is SupportedFavoriteLeague =>
  SUPPORTED_FAVORITE_LEAGUES.has(league as SupportedFavoriteLeague);

const createTeamLookup = <T extends TeamLookupItem>(
  teamList: readonly T[],
  idKey: "id" | "wid" = "id",
) => {
  const lookup = new Map<string, T>();

  teamList.forEach((team) => {
    const id = team[idKey];
    if (id !== undefined && id !== null) {
      lookup.set(String(id), team);
    }
  });

  return lookup;
};

const teamLookups: Record<SupportedFavoriteLeague, Map<string, TeamLookupItem>> =
  {
    NBA: createTeamLookup(teams),
    WNBA: createTeamLookup(wnbaTeams),
    NFL: createTeamLookup(nflTeams),
    CFB: createTeamLookup(cfbTeams),
    CBB: createTeamLookup(cbbTeams),
    WCBB: createTeamLookup(cbbTeams, "wid"),
    MLB: createTeamLookup(mlbTeams),
    NHL: createTeamLookup(nhlTeams),
  };

function parseImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "null" || url === "undefined") return null;
  if (!url.startsWith("http")) return null;
  return url;
}

function parseString(value: string | null | undefined): string | null {
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

function parseStoredUserId(id: string | null): number | null {
  if (!id) return null;

  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFavorites(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (favorite): favorite is string =>
      typeof favorite === "string" && favorite.includes(":"),
  );
}

function getProfileKey(userId: string, currentUserId: number | null) {
  return `${userId}:${currentUserId ?? "guest"}`;
}

export function useUserProfile(userId?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [hasLoadedCurrentUserId, setHasLoadedCurrentUserId] = useState(false);

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
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const lastLoadedProfileKeyRef = useRef<string | null>(null);
  const followLoadingRef = useRef(false);

  const { shouldRestore, targetUserId, type, openModal, clearRestore } =
    useFollowersStore();

  const resetProfileState = useCallback(() => {
    setUsername(null);
    setFullName(null);
    setBio(null);
    setProfileImage(null);
    setBannerImage(null);
    setFollowersCount(0);
    setFollowingCount(0);
    setFavorites([]);
    setIsFollowing(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadCurrentUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!isActive || !isMountedRef.current) return;

        setCurrentUserId(parseStoredUserId(storedUserId));
      } catch (error) {
        console.warn("Failed to load current user id", error);
        if (!isActive || !isMountedRef.current) return;

        setCurrentUserId(null);
      } finally {
        if (isActive && isMountedRef.current) {
          setHasLoadedCurrentUserId(true);
        }
      }
    };

    loadCurrentUserId();

    return () => {
      isActive = false;
    };
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      requestIdRef.current += 1;
      lastLoadedProfileKeyRef.current = null;
      resetProfileState();
      setIsLoading(false);
      return;
    }

    if (!hasLoadedCurrentUserId) return;

    const requestId = ++requestIdRef.current;
    const profileKey = getProfileKey(userId, currentUserId);
    const shouldShowInitialLoading =
      lastLoadedProfileKeyRef.current !== profileKey;

    if (shouldShowInitialLoading) {
      setIsLoading(true);
    }

    try {
      const { data } = await apiClient.get<UserProfileResponse>(
        `api/users/id/${userId}`,
        {
          params:
            currentUserId === null
              ? undefined
              : {
                  currentUserId,
                },
        },
      );

      if (!isMountedRef.current || requestId !== requestIdRef.current) return;

      setUsername(parseString(data.username));
      setFullName(parseString(data.fullName));
      setBio(parseString(data.bio));
      setProfileImage(parseImageUrl(data.profileImage));
      setBannerImage(parseImageUrl(data.bannerImage));
      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);
      setFavorites(normalizeFavorites(data.favorites));
      setIsFollowing(
        typeof data.isFollowing === "boolean" ? data.isFollowing : false,
      );
      lastLoadedProfileKeyRef.current = profileKey;
    } catch (error) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;

      console.warn("Failed to load user profile", error);
      resetProfileState();
      lastLoadedProfileKeyRef.current = null;
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentUserId, hasLoadedCurrentUserId, resetProfileState, userId]);

  useEffect(() => {
    if (!userId) {
      requestIdRef.current += 1;
      lastLoadedProfileKeyRef.current = null;
      resetProfileState();
      setIsLoading(false);
      return;
    }

    if (!hasLoadedCurrentUserId) return;

    const profileKey = getProfileKey(userId, currentUserId);
    if (lastLoadedProfileKeyRef.current === profileKey) return;

    fetchUserData();
  }, [
    currentUserId,
    fetchUserData,
    hasLoadedCurrentUserId,
    resetProfileState,
    userId,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (shouldRestore && targetUserId) {
        clearRestore();
        openModal(type, targetUserId, currentUserId?.toString());
      }
    }, [
      shouldRestore,
      targetUserId,
      type,
      currentUserId,
      openModal,
      clearRestore,
    ]),
  );

  const toggleFollow = useCallback(async () => {
    if (
      !userId ||
      currentUserId === null ||
      String(currentUserId) === userId ||
      followLoadingRef.current
    ) {
      return;
    }

    const previousIsFollowing = isFollowing ?? false;
    const previousFollowersCount = followersCount;
    const optimisticIsFollowing = !previousIsFollowing;

    setIsFollowing(optimisticIsFollowing);
    setFollowersCount((count) =>
      optimisticIsFollowing ? count + 1 : Math.max(count - 1, 0),
    );
    followLoadingRef.current = true;
    setFollowLoading(true);

    try {
      await apiClient.post("api/follows/toggle", {
        followerId: currentUserId,
        followeeId: userId,
      });
    } catch (error) {
      console.warn("Failed to toggle follow", error);
      if (isMountedRef.current) {
        setIsFollowing(previousIsFollowing);
        setFollowersCount(previousFollowersCount);
      }
    } finally {
      followLoadingRef.current = false;
      if (isMountedRef.current) {
        setFollowLoading(false);
      }
    }
  }, [currentUserId, followersCount, isFollowing, userId]);

  const favoriteTeamsWithLeague = useMemo(
    () =>
      favorites
        .map((favorite): FavoriteTeamWithLeague | null => {
          const [league, id] = favorite.split(":");
          if (!league || !id || !isSupportedFavoriteLeague(league)) {
            return null;
          }

          const team = teamLookups[league].get(id);
          return team ? { ...team, league } : null;
        })
        .filter(
          (team): team is FavoriteTeamWithLeague => team !== null,
        ),
    [favorites],
  );

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
