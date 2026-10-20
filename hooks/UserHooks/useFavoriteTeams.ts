import { useVolleyballDirectory } from "hooks/VolleyballHooks/useVolleyball";
import { isEligibleFavoriteTeam } from "utils/favorites/favoriteTeamEligibility";
import { useScopedRouter } from "hooks/useScopedRouter";
import { wcbbTeams } from "@/constants/teamsWCBB";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams as nbaTeams } from "constants/teams";
import { cbTeams } from "constants/teamsCB";
import { mcbbTeams } from "constants/teamsMCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { soccerTeams } from "@/constants/teamsSOCC";
import { sbTeams } from "constants/teamsSB";
import { wnbaTeams } from "constants/teamsWNBA";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import {
  getFavoriteTeams,
  updateFavoriteTeams as updateFavoriteTeamsRequest,
} from "services/usersApi";
import {
  buildFavoriteTeamKey,
  normalizeFavoriteTeamKeys,
  type FavoriteTeamKey,
} from "types/favorites";
import type { Team } from "types/types";
import { subscribeAuthSession } from "utils/apiClient";
import { removeCachedUserProfile } from "utils/profile/userProfileCache";
import { useNotifications } from "contexts/NotificationContext";
import { useFavoriteSports } from "./useFavoriteSports";

export type TeamWithLeague = Team & {
  league: string;
};

const LEGACY_STORAGE_KEY = "favorites";
// Migrated pro and college IDs overlap former IDs; discard cached keys and refetch.
const STORAGE_KEY_PREFIX = "favoriteTeams:v6";
const FAVORITES_ENDPOINT = "/api/users/me/favorites";

const getFavoritesStorageKey = (userId: number | string) =>
  `${STORAGE_KEY_PREFIX}:${userId}`;

export function useFavoriteTeams() {
  const volleyball = useVolleyballDirectory();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<FavoriteTeamKey[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [ready, setReady] = useState(false);
  const [previewTeam, setPreviewTeam] = useState<TeamWithLeague | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const loadRequestId = useRef(0);
  const currentUserIdRef = useRef<number | null>(null);
  const hasLoadedFavoritesRef = useRef(false);
  const savedFavoritesRef = useRef<FavoriteTeamKey[]>([]);
  const router = useScopedRouter();
  const { refreshTeamSubscriptions, removeUnfavoritedTeamSubscriptions } =
    useNotifications();
  const favoriteSportsState = useFavoriteSports(userId);
  const { clearFavoriteSports } = favoriteSportsState;

  const getTeamId = (team: TeamWithLeague) => {
    return team.id;
  };

  const allTeams = useMemo(
    () => [
      ...nbaTeams,
      ...wnbaTeams,
      ...nflTeams,
      ...cfbTeams,
      ...mcbbTeams,
      ...wcbbTeams,
      ...cbTeams,
      ...sbTeams,
      ...mlbTeams,
      ...nhlTeams,
      ...soccerTeams,
      ...volleyball.teams,
    ],
    [volleyball.teams],
  );

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allTeams.filter((team) => {
      if (!isEligibleFavoriteTeam(team)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const teamName = team.fullName ?? team.name ?? "";
      const teamLeague = team.league;

      return (
        teamName.toLowerCase().includes(query) ||
        teamLeague.toLowerCase().includes(query)
      );
    });
  }, [allTeams, search]);

  const clearFavorites = useCallback(() => {
    loadRequestId.current += 1;
    currentUserIdRef.current = null;
    hasLoadedFavoritesRef.current = false;

    savedFavoritesRef.current = [];
    setUserId(null);
    setFavorites([]);
    setReady(false);
    setIsLoading(false);
    setPreviewTeam(null);
    setModalVisible(false);
    clearFavoriteSports();
  }, [clearFavoriteSports]);

  const loadFavorites = useCallback(
    async (targetUserId?: number | string | null) => {
      const loadGeneration = loadRequestId.current;
      let requestId: number | null = null;
      let skippedUnchangedUser = false;

      try {
        const storedUserId =
          targetUserId === undefined
            ? await AsyncStorage.getItem("userId")
            : null;

        const nextUserId =
          targetUserId !== undefined
            ? targetUserId == null
              ? null
              : Number(targetUserId)
            : storedUserId
              ? Number(storedUserId)
              : null;

        if (loadGeneration !== loadRequestId.current) {
          return;
        }

        // Repeated implicit loads for the same authenticated user should not
        // refetch or show a loading state. Explicit user-targeted loads remain
        // available to the profile/auth flow when the account changes.
        if (
          targetUserId === undefined &&
          hasLoadedFavoritesRef.current &&
          nextUserId === currentUserIdRef.current
        ) {
          skippedUnchangedUser = true;
          return;
        }

        requestId = ++loadRequestId.current;
        setIsLoading(true);

        if (!nextUserId || !Number.isInteger(nextUserId)) {
          currentUserIdRef.current = null;
          hasLoadedFavoritesRef.current = true;
          savedFavoritesRef.current = [];
          setUserId(null);
          setFavorites([]);
          setReady(true);
          return;
        }

        if (nextUserId !== currentUserIdRef.current) {
          savedFavoritesRef.current = [];
          setFavorites([]);
        }

        currentUserIdRef.current = nextUserId;
        hasLoadedFavoritesRef.current = true;
        setUserId(nextUserId);

        const storageKey = getFavoritesStorageKey(nextUserId);

        const storedFavorites = await AsyncStorage.getItem(storageKey);

        AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch((error) => {
          console.warn("Failed to remove legacy favorites:", error);
        });

        if (requestId !== loadRequestId.current) {
          return;
        }

        let cachedFavorites: FavoriteTeamKey[] = [];

        if (storedFavorites) {
          cachedFavorites = normalizeFavoriteTeamKeys(
            JSON.parse(storedFavorites),
          );
        }

        savedFavoritesRef.current = cachedFavorites;
        setFavorites(cachedFavorites);

        try {
          const serverFavorites = await getFavoriteTeams();

          if (requestId !== loadRequestId.current) {
            return;
          }

          savedFavoritesRef.current = serverFavorites;
          setFavorites(serverFavorites);
          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify(serverFavorites),
          );
        } catch (error: any) {
          const isAuthSessionError =
            error?.message === "No refresh token available" ||
            error?.response?.status === 401 ||
            error?.response?.status === 403;

          if (!isAuthSessionError) {
            console.warn(
              "Failed to refresh favorite teams from the server; using the local cache:",
              error,
            );
          }
        }
      } catch (error) {
        const isCurrentRequest =
          requestId === null
            ? loadGeneration === loadRequestId.current
            : requestId === loadRequestId.current;

        if (!isCurrentRequest) {
          return;
        }

        console.error("Failed to load favorites:", error);
        setFavorites([]);
      } finally {
        const isCurrentRequest =
          requestId === null
            ? loadGeneration === loadRequestId.current
            : requestId === loadRequestId.current;

        if (!skippedUnchangedUser && isCurrentRequest) {
          setIsLoading(false);
          setReady(true);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void Promise.resolve().then(() => loadFavorites());
  }, [loadFavorites]);

  // A background refresh bypasses hydration's same-user shortcut and local
  // cache, keeping the current favorites visible if the request fails.
  const refreshFavorites = useCallback(async () => {
    const requestUserId = currentUserIdRef.current;
    if (requestUserId === null) return;

    const requestId = ++loadRequestId.current;

    try {
      const serverFavorites = await getFavoriteTeams();
      if (
        requestId !== loadRequestId.current ||
        currentUserIdRef.current !== requestUserId
      ) return;

      savedFavoritesRef.current = serverFavorites;
      setFavorites(serverFavorites);
      await AsyncStorage.setItem(
        getFavoritesStorageKey(requestUserId),
        JSON.stringify(serverFavorites),
      );
    } catch (error) {
      if (requestId === loadRequestId.current) {
        console.warn("Failed to refresh favorite teams:", error);
      }
    } finally {
      if (requestId === loadRequestId.current) {
        setIsLoading(false);
        setReady(true);
      }
    }
  }, []);

  useEffect(() => {
    return subscribeAuthSession(({ accessToken }) => {
      if (!accessToken) {
        clearFavorites();
        return;
      }

      // saveTokens publishes only after the new token and user identity have
      // been persisted, so this hydrates Home for the newly signed-in user.
      void loadFavorites();
    });
  }, [clearFavorites, loadFavorites]);

  const isFavorite = useCallback(
    (league: string, id: string | number) => {
      const key = buildFavoriteTeamKey(league, id);
      return key ? favorites.includes(key) : false;
    },
    [favorites],
  );

  // The access token identifies the user for this endpoint.
  const syncFavoritesToServer = useCallback(
    async (
      nextFavorites: readonly string[],
      action: string,
    ): Promise<boolean> => {
      if (!userId) {
        console.warn(`Unable to ${action}: no user ID is available.`);
        return false;
      }

      try {
        const savedFavorites = await updateFavoriteTeamsRequest(
          normalizeFavoriteTeamKeys(nextFavorites),
        );

        if (currentUserIdRef.current !== userId) return false;

        removeUnfavoritedTeamSubscriptions(
          savedFavoritesRef.current.filter(
            (favorite) => !savedFavorites.includes(favorite),
          ),
        );
        savedFavoritesRef.current = savedFavorites;
        setFavorites(savedFavorites);
        await AsyncStorage.setItem(
          getFavoritesStorageKey(userId),
          JSON.stringify(savedFavorites),
        );

        await removeCachedUserProfile(String(userId));
        await refreshTeamSubscriptions();

        return true;
      } catch (error: any) {
        console.warn(`❌ Unable to ${action}:`, {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
          url: FAVORITES_ENDPOINT,
        });

        return false;
      }
    },
    [refreshTeamSubscriptions, removeUnfavoritedTeamSubscriptions, userId],
  );

  const toggleFavorite = useCallback(
    (league: string, id: string | number) => {
      const key = buildFavoriteTeamKey(league, id);

      if (!key) return;

      setFavorites((previousFavorites) => {
        const nextFavorites = previousFavorites.includes(key)
          ? previousFavorites.filter((favorite) => favorite !== key)
          : [...previousFavorites, key];

        if (!userId) {
          return nextFavorites;
        }

        const storageKey = getFavoritesStorageKey(userId);

        AsyncStorage.setItem(storageKey, JSON.stringify(nextFavorites))
          .then(async () => {
            await syncFavoritesToServer(
              nextFavorites,
              "sync favorites after toggle",
            );
          })
          .catch((error) => {
            console.error("Failed to persist favorites after toggle:", error);
          });

        return nextFavorites;
      });
    },
    [syncFavoritesToServer, userId],
  );

  const toggleLayout = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsGridView((previousValue) => !previousValue);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  const saveFavorites = useCallback(async (): Promise<boolean> => {
    if (!ready || !userId) {
      return false;
    }

    const normalizedFavorites = normalizeFavoriteTeamKeys(favorites);

    const synced = await syncFavoritesToServer(
      normalizedFavorites,
      "save favorites",
    );

    if (!synced) {
      return false;
    }

    try {
      await AsyncStorage.setItem(
        getFavoritesStorageKey(userId),
        JSON.stringify(normalizedFavorites),
      );

      return true;
    } catch (error) {
      console.error("Failed to save favorites locally:", error);
      return false;
    }
  }, [favorites, ready, syncFavoritesToServer, userId]);

  const syncFavorites = useCallback(
    async (orderedIds: string[]) => {
      if (!userId) {
        console.warn("No user ID found — favorites will sync later.");
        return false;
      }

      const normalizedFavorites = normalizeFavoriteTeamKeys(orderedIds);

      const synced = await syncFavoritesToServer(
        normalizedFavorites,
        "sync reordered favorites",
      );

      if (synced) {
        console.log("✅ Favorites synced.");
      }

      return synced;
    },
    [syncFavoritesToServer, userId],
  );

  const handleLongPress = useCallback((team: TeamWithLeague) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch((error) => {
      console.warn("Failed to trigger haptic feedback:", error);
    });

    setPreviewTeam(team);
    setModalVisible(true);
  }, []);

  const handleGoToTeam = useCallback(() => {
    if (!previewTeam) {
      return;
    }

    const id = getTeamId(previewTeam);

    if (id === undefined || id === null) {
      console.warn(
        `Unable to open ${previewTeam.league} team: missing team ID.`,
      );
      return;
    }

    const league = previewTeam.league.toLowerCase();
    const route =
      league === "mcvb" ? "/team/mcvb/[teamId]" : league === "wcvb" ? "/team/wcvb/[teamId]" :
      league === "nfl"
        ? "/team/nfl/[teamId]"
        : league === "nba"
          ? "/team/[teamId]"
          : league === "wnba"
            ? "/team/wnba/[teamId]"
            : league === "cfb"
              ? "/team/cfb/[teamId]"
              : league === "mcbb"
                ? "/team/mcbb/[teamId]"
                : league === "wcbb"
                  ? "/team/wcbb/[teamId]"
                  : league === "mlb"
                    ? "/team/mlb/[teamId]"
                    : league === "cb"
                      ? "/team/cb/[teamId]"
                      : league === "sb"
                        ? "/team/sb/[teamId]"
                        : league === "socc"
                          ? "/team/soccer/[teamId]"
                          : "/team/nhl/[teamId]";

    router.push({
      pathname: route,
      params: {
        teamId: String(id),
        league,
      },
    });

    setModalVisible(false);
  }, [previewTeam, router]);

  const handleRemoveFavorite = useCallback(
    async (team: Team) => {
      const id = getTeamId(team);

      if (id === undefined || id === null) {
        console.warn(
          `Unable to remove ${team.league} favorite: missing team ID.`,
        );
        return false;
      }

      const key = buildFavoriteTeamKey(team.league, id);

      if (!key) {
        return false;
      }

      const updatedFavorites = favorites.filter((favorite) => favorite !== key);

      setFavorites(updatedFavorites);
      setModalVisible(false);
      setPreviewTeam(null);

      if (!userId) {
        return true;
      }

      try {
        await AsyncStorage.setItem(
          getFavoritesStorageKey(userId),
          JSON.stringify(updatedFavorites),
        );
      } catch (error) {
        console.error("Failed to remove favorite from local storage:", error);

        return false;
      }

      const synced = await syncFavoritesToServer(
        updatedFavorites,
        "sync favorites after removal",
      );

      if (synced) {
        console.log("✅ Favorites synced after removal.");
      }

      return synced;
    },
    [favorites, syncFavoritesToServer, userId],
  );

  return {
    search,
    setSearch,

    favorites,
    setFavorites,

    userId,
    isLoading: isLoading || volleyball.loading,
    directoryError: volleyball.error,
    refreshDirectory: volleyball.refresh,
    isGridView,
    ready,

    toggleLayout,
    fadeAnim,

    toggleFavorite,
    isFavorite,
    saveFavorites,
    syncFavorites,
    loadFavorites,
    refreshFavorites,
    clearFavorites,

    allTeams,
    filteredTeams,

    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,

    ...favoriteSportsState,
  };
}
