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
import {
  clearExpiredUserProfileCache,
  getCachedUserProfile,
  setCachedUserProfile,
  type CachedUserProfilePayload,
  type UserProfileCacheState,
  USER_PROFILE_CACHE_VERSION,
} from "utils/userProfileCache";

type SupportedFavoriteLeague = Extract<
  LeagueType,
  "NBA" | "WNBA" | "NFL" | "CFB" | "CBB" | "WCBB" | "MLB" | "NHL"
>;

type TeamLookupItem = {
  id: number | string | null;
  wid?: number | string | null;
};

type FavoriteTeamWithLeague = TeamLookupItem & {
  league: SupportedFavoriteLeague;
};

type UserProfileResponse = {
  id?: number | string | null;
  username?: string | null;
  fullName?: string | null;
  full_name?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  profile_image?: string | null;
  bannerImage?: string | null;
  banner_image?: string | null;
  followersCount?: number | null;
  followingCount?: number | null;
  favorites?: unknown;
  isFollowing?: boolean | null;
  updatedAt?: string | null;
  updated_at?: string | null;
};

type DisplayProfile = {
  id: string;
  username: string | null;
  fullName: string | null;
  bio: string | null;
  profileImage: string | null;
  bannerImage: string | null;
  favorites: string[];
  updatedAt: string | null;
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

function parseString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

  return value;
}

function parseImageUrl(url: unknown): string | null {
  const parsed = parseString(url);
  if (!parsed?.startsWith("http")) return null;
  return parsed;
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

function parseProfileId(value: unknown, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return parseString(value) ?? fallback;
}

function parseCount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseUpdatedAt(data: UserProfileResponse): string | null {
  return parseString(data.updatedAt ?? data.updated_at);
}

function normalizeDisplayProfile(
  data: UserProfileResponse,
  fallbackUserId: string,
): DisplayProfile {
  return {
    id: parseProfileId(data.id, fallbackUserId),
    username: parseString(data.username),
    fullName: parseString(data.fullName ?? data.full_name),
    bio: parseString(data.bio),
    profileImage: parseImageUrl(data.profileImage ?? data.profile_image),
    bannerImage: parseImageUrl(data.bannerImage ?? data.banner_image),
    favorites: normalizeFavorites(data.favorites),
    updatedAt: parseUpdatedAt(data),
  };
}

function buildCachedProfilePayload(
  profile: DisplayProfile,
): CachedUserProfilePayload {
  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.fullName,
    bio: profile.bio,
    profileImage: profile.profileImage,
    bannerImage: profile.bannerImage,
    favorites: profile.favorites,
    updatedAt: profile.updatedAt,
    cachedAt: Date.now(),
    version: USER_PROFILE_CACHE_VERSION,
  };
}

function getUpdatedAtTime(value?: string | null): number | null {
  if (!value) return null;

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function shouldPreferCachedDisplay(
  cachedProfile: CachedUserProfilePayload | null,
  freshProfile: DisplayProfile,
) {
  const cachedUpdatedAt = getUpdatedAtTime(cachedProfile?.updatedAt);
  const freshUpdatedAt = getUpdatedAtTime(freshProfile.updatedAt);

  return (
    cachedUpdatedAt !== null &&
    freshUpdatedAt !== null &&
    cachedUpdatedAt > freshUpdatedAt
  );
}

function getProfileKey(userId: string, currentUserId: number | null) {
  return `${userId}:${currentUserId ?? "guest"}`;
}

export function useUserProfile(userId?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCachedProfile, setHasCachedProfile] = useState(false);
  const [cacheState, setCacheState] =
    useState<UserProfileCacheState>("none");
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
  const activeProfileKeyRef = useRef<string | null>(null);
  const lastLoadedProfileKeyRef = useRef<string | null>(null);
  const followLoadingRef = useRef(false);

  const { shouldRestore, targetUserId, type, openModal, clearRestore } =
    useFollowersStore();

  activeProfileKeyRef.current =
    userId && hasLoadedCurrentUserId
      ? getProfileKey(userId, currentUserId)
      : null;

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

  const applyDisplayProfile = useCallback(
    (profile: DisplayProfile | CachedUserProfilePayload) => {
      setUsername(profile.username);
      setFullName(profile.fullName);
      setBio(profile.bio);
      setProfileImage(profile.profileImage);
      setBannerImage(profile.bannerImage);
      setFavorites(profile.favorites);
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    void clearExpiredUserProfileCache();
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

  const fetchUserData = useCallback(
    async (options?: { hydrateCache?: boolean }) => {
      if (!userId) {
        requestIdRef.current += 1;
        lastLoadedProfileKeyRef.current = null;
        resetProfileState();
        setHasCachedProfile(false);
        setCacheState("none");
        setIsRefreshing(false);
        setIsLoading(false);
        return;
      }

      if (!hasLoadedCurrentUserId) return;

      const requestId = ++requestIdRef.current;
      const profileKey = getProfileKey(userId, currentUserId);
      const shouldShowInitialLoading =
        lastLoadedProfileKeyRef.current !== profileKey;
      let cachedProfile: CachedUserProfilePayload | null = null;
      let didHydrateCache = false;

      if (shouldShowInitialLoading) {
        resetProfileState();
        setHasCachedProfile(false);
        setCacheState("none");
        setIsRefreshing(false);
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      if (options?.hydrateCache !== false) {
        const cachedResult = await getCachedUserProfile(userId);

        if (
          !isMountedRef.current ||
          requestId !== requestIdRef.current ||
          activeProfileKeyRef.current !== profileKey
        ) {
          return;
        }

        if (cachedResult) {
          cachedProfile = cachedResult.profile;
          didHydrateCache = true;
          applyDisplayProfile(cachedResult.profile);
          setHasCachedProfile(true);
          setCacheState(cachedResult.cacheState);
          setIsLoading(false);
          setIsRefreshing(true);
          lastLoadedProfileKeyRef.current = profileKey;
        }
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

        if (
          !isMountedRef.current ||
          requestId !== requestIdRef.current ||
          activeProfileKeyRef.current !== profileKey
        ) {
          return;
        }

        const freshProfile = normalizeDisplayProfile(data, userId);
        const displayProfile =
          cachedProfile &&
          shouldPreferCachedDisplay(cachedProfile, freshProfile)
            ? cachedProfile
            : freshProfile;

        applyDisplayProfile(displayProfile);
        setFollowersCount(parseCount(data.followersCount));
        setFollowingCount(parseCount(data.followingCount));
        setIsFollowing(
          typeof data.isFollowing === "boolean" ? data.isFollowing : false,
        );
        setHasCachedProfile(true);
        if (displayProfile !== cachedProfile) {
          setCacheState("fresh");
        }
        lastLoadedProfileKeyRef.current = profileKey;

        await setCachedUserProfile(
          userId,
          buildCachedProfilePayload(freshProfile),
        );
      } catch (error) {
        if (
          !isMountedRef.current ||
          requestId !== requestIdRef.current ||
          activeProfileKeyRef.current !== profileKey
        ) {
          return;
        }

        console.warn("Failed to load user profile", error);

        if (shouldShowInitialLoading && !didHydrateCache) {
          resetProfileState();
          setHasCachedProfile(false);
          setCacheState("none");
          lastLoadedProfileKeyRef.current = null;
        }
      } finally {
        if (
          isMountedRef.current &&
          requestId === requestIdRef.current &&
          activeProfileKeyRef.current === profileKey
        ) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [
      applyDisplayProfile,
      currentUserId,
      hasLoadedCurrentUserId,
      resetProfileState,
      userId,
    ],
  );

  useEffect(() => {
    if (!userId) {
      requestIdRef.current += 1;
      lastLoadedProfileKeyRef.current = null;
      resetProfileState();
      setHasCachedProfile(false);
      setCacheState("none");
      setIsRefreshing(false);
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
      await fetchUserData({ hydrateCache: false });
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
  }, [currentUserId, fetchUserData, followersCount, isFollowing, userId]);

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

  const refreshProfile = useCallback(
    () => fetchUserData({ hydrateCache: false }),
    [fetchUserData],
  );

  return {
    isLoading,
    isRefreshing,
    hasCachedProfile,
    cacheState,
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
    refreshProfile,
    fetchUserData,
  };
}
