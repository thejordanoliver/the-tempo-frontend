import { wcbbTeams } from "@/constants/teamsWCBB";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams as nbaTeams } from "constants/teams";
import { cbTeams } from "constants/teamsCB";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { sbTeams } from "constants/teamsSB";
import { wnbaTeams } from "constants/teamsWNBA";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import type { LeagueType, Team } from "types/types";
import { apiClient } from "utils/apiClient";
import { removeCachedUserProfile } from "utils/userProfileCache";

export type TeamWithLeague = Team & {
  league: string;
};

const LEGACY_STORAGE_KEY = "favorites";
const STORAGE_KEY_PREFIX = "favoriteTeams";
const FAVORITES_ENDPOINT = "/api/users/me/favorites";

const getFavoritesStorageKey = (userId: number | string) =>
  `${STORAGE_KEY_PREFIX}:${userId}`;

export function useFavoriteTeams() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [ready, setReady] = useState(false);

  const [previewTeam, setPreviewTeam] = useState<TeamWithLeague | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loadRequestId = useRef(0);

  const router = useRouter();
  const pathname = usePathname();

  /* ---------------- TEAM ID HELPER ---------------- */

  const getTeamId = (team: TeamWithLeague) => {
    return team.id;
  };

  /* ---------------- ALL TEAMS ---------------- */

  const allTeams = useMemo(
    () => [
      ...nbaTeams,
      ...wnbaTeams,
      ...nflTeams,
      ...cfbTeams,
      ...cbbTeams,
      ...wcbbTeams,
      ...cbTeams,
      ...sbTeams,
      ...mlbTeams,
      ...nhlTeams,
    ],
    [],
  );

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return allTeams;
    }

    return allTeams.filter((team) =>
      (team.fullName ?? team.name ?? "").toLowerCase().includes(query),
    );
  }, [allTeams, search]);

  /* ---------------- CLEAR FAVORITES ---------------- */

  const clearFavorites = useCallback(() => {
    loadRequestId.current += 1;

    setUserId(null);
    setFavorites([]);
    setReady(false);
    setIsLoading(false);
    setPreviewTeam(null);
    setModalVisible(false);
  }, []);

  /* ---------------- LOAD FAVORITES ---------------- */

  const loadFavorites = useCallback(
    async (targetUserId?: number | string | null) => {
      const requestId = ++loadRequestId.current;

      setIsLoading(true);

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

        if (requestId !== loadRequestId.current) {
          return;
        }

        if (!nextUserId || !Number.isInteger(nextUserId)) {
          setUserId(null);
          setFavorites([]);
          setReady(true);
          return;
        }

        if (nextUserId !== userId) {
          setFavorites([]);
        }

        setUserId(nextUserId);

        const storageKey = getFavoritesStorageKey(nextUserId);

        const storedFavorites = await AsyncStorage.getItem(storageKey);

        AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch((error) => {
          console.warn("Failed to remove legacy favorites:", error);
        });

        if (requestId !== loadRequestId.current) {
          return;
        }

        if (!storedFavorites) {
          setFavorites([]);
          return;
        }

        const parsedFavorites: unknown = JSON.parse(storedFavorites);

        if (!Array.isArray(parsedFavorites)) {
          setFavorites([]);
          return;
        }

        const validFavorites = parsedFavorites.filter(
          (favorite): favorite is string =>
            typeof favorite === "string" && favorite.includes(":"),
        );

        setFavorites(validFavorites);
      } catch (error) {
        if (requestId !== loadRequestId.current) {
          return;
        }

        console.error("Failed to load favorites:", error);
        setFavorites([]);
      } finally {
        if (requestId === loadRequestId.current) {
          setIsLoading(false);
          setReady(true);
        }
      }
    },
    [userId],
  );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, pathname]);

  /* ---------------- FAVORITE HELPERS ---------------- */

  const buildKey = (league: string, id: string | number) => `${league}:${id}`;

  const isFavorite = useCallback(
    (league: string, id: string | number) =>
      favorites.includes(buildKey(league, id)),
    [favorites],
  );

  /**
   * Sends the current favorite IDs to the authenticated user's endpoint.
   *
   * The backend determines the user from the access token, so the user ID
   * should not be included in the URL.
   */
  const syncFavoritesToServer = useCallback(
    async (nextFavorites: string[], action: string): Promise<boolean> => {
      if (!userId) {
        console.warn(`Unable to ${action}: no user ID is available.`);
        return false;
      }

      try {
        await apiClient.patch(FAVORITES_ENDPOINT, {
          favorites: nextFavorites,
        });

        await removeCachedUserProfile(String(userId));

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
    [userId],
  );

  /* ---------------- TOGGLE FAVORITE ---------------- */

  const toggleFavorite = useCallback(
    (league: LeagueType, id: string | number) => {
      const key = buildKey(league, id);

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

  /* ---------------- GRID / LIST TOGGLE ---------------- */

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

  /* ---------------- SAVE FAVORITES ---------------- */

  const saveFavorites = useCallback(async (): Promise<boolean> => {
    if (!ready || !userId) {
      return false;
    }

    const normalizedFavorites = favorites.filter(
      (favorite): favorite is string =>
        typeof favorite === "string" && favorite.includes(":"),
    );

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

  /* ---------------- SYNC FAVORITES ---------------- */

  const syncFavorites = useCallback(
    async (orderedIds: string[]) => {
      if (!userId) {
        console.warn("No user ID found — favorites will sync later.");
        return false;
      }

      const normalizedFavorites = orderedIds.filter(
        (favorite): favorite is string =>
          typeof favorite === "string" && favorite.includes(":"),
      );

      try {
        await AsyncStorage.setItem(
          getFavoritesStorageKey(userId),
          JSON.stringify(normalizedFavorites),
        );
      } catch (error) {
        console.error("Failed to save reordered favorites locally:", error);

        return false;
      }

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

  /* ---------------- TEAM PREVIEW ---------------- */

  const handleLongPress = useCallback((team: TeamWithLeague) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch((error) => {
      console.warn("Failed to trigger haptic feedback:", error);
    });

    setPreviewTeam(team);
    setModalVisible(true);
  }, []);

  /* ---------------- NAVIGATION ---------------- */

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

    const route =
      previewTeam.league === "NFL"
        ? "/team/nfl/[teamId]"
        : previewTeam.league === "NBA"
          ? "/team/[teamId]"
          : previewTeam.league === "WNBA"
            ? "/team/wnba/[teamId]"
            : previewTeam.league === "CFB"
              ? "/team/cfb/[teamId]"
              : previewTeam.league === "CBB"
                ? "/team/cbb/[teamId]"
                : previewTeam.league === "WCBB"
                  ? "/team/wcbb/[teamId]"
                  : previewTeam.league === "MLB"
                    ? "/team/mlb/[teamId]"
                    : previewTeam.league === "CB"
                      ? "/team/cb/[teamId]"
                      : previewTeam.league === "SB"
                        ? "/team/sb/[teamId]"
                        : "/team/nhl/[teamId]";

    router.push({
      pathname: route,
      params: {
        teamId: String(id),
        league: previewTeam.league,
      },
    });

    setModalVisible(false);
  }, [previewTeam, router]);

  /* ---------------- REMOVE FAVORITE ---------------- */

  const handleRemoveFavorite = useCallback(
    async (team: TeamWithLeague) => {
      const id = getTeamId(team);

      if (id === undefined || id === null) {
        console.warn(
          `Unable to remove ${team.league} favorite: missing team ID.`,
        );
        return false;
      }

      const key = buildKey(team.league, id);

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

  /* ---------------- RETURN ---------------- */

  return {
    search,
    setSearch,

    favorites,
    setFavorites,

    userId,
    isLoading,
    isGridView,
    ready,

    toggleLayout,
    fadeAnim,

    toggleFavorite,
    isFavorite,
    saveFavorites,
    syncFavorites,
    loadFavorites,
    clearFavorites,

    allTeams,
    filteredTeams,

    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  };
}
