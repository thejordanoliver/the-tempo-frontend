import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams as nbaTeams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import type { LeagueType, Team } from "types/types";
import { apiClient } from "utils/apiClient";
import { removeCachedUserProfile } from "utils/userProfileCache";

export type TeamWithLeague = Team & { league: LeagueType };

const LEGACY_STORAGE_KEY = "favorites";
const STORAGE_KEY_PREFIX = "favoriteTeams";

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
  const router = useRouter();
  const pathname = usePathname();
  const loadRequestId = useRef(0);

  /* ---------------- TEAM ID HELPER ---------------- */

  const getTeamId = (team: TeamWithLeague) => {
    if (team.league === "WCBB") return (team as any).wid;
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
      ...mlbTeams,
      ...nhlTeams,
    ],
    [],
  );

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase();
    return allTeams.filter((team) =>
      (team.fullName ?? team.name ?? "").toLowerCase().includes(q),
    );
  }, [search, allTeams]);

  /* ---------------- LOAD FAVORITES ---------------- */

  const clearFavorites = useCallback(() => {
    loadRequestId.current += 1;
    setUserId(null);
    setFavorites([]);
    setReady(false);
    setIsLoading(false);
    setPreviewTeam(null);
    setModalVisible(false);
  }, []);

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

        if (requestId !== loadRequestId.current) return;

        if (!nextUserId) {
          setUserId(null);
          setFavorites([]);
          setReady(true);
          return;
        }

        if (nextUserId !== userId) {
          setFavorites([]);
        }
        setUserId(nextUserId);

        const storedFavorites = await AsyncStorage.getItem(
          getFavoritesStorageKey(nextUserId),
        );
        AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});

        if (requestId !== loadRequestId.current) return;

        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites);
          setFavorites(Array.isArray(parsed) ? parsed : []);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        if (requestId !== loadRequestId.current) return;
        console.error("Failed to load favorites", err);
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

  const buildKey = (league: LeagueType, id: string | number) =>
    `${league}:${id}`;

  const isFavorite = useCallback(
    (league: LeagueType, id: string | number) =>
      favorites.includes(buildKey(league, id)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (league: LeagueType, id: string | number) => {
      const key = buildKey(league, id);

      setFavorites((prev) => {
        const next = prev.includes(key)
          ? prev.filter((f) => f !== key)
          : [...prev, key];

        if (!userId) return next;

        AsyncStorage.setItem(
          getFavoritesStorageKey(userId),
          JSON.stringify(next),
        )
          .then(() => {
            apiClient
              .patch(`/api/users/id/${userId}/favorites`, { favorites: next })
              .then(() => removeCachedUserProfile(String(userId)))
              .catch((err) => console.warn("❌ Sync error on toggle:", err));
          })
          .catch((err) => console.error("Failed to persist favorites", err));

        return next;
      });
    },
    [userId],
  );

  /* ---------------- GRID / LIST TOGGLE ---------------- */

  const toggleLayout = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsGridView((prev) => !prev);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  /* ---------------- SAVE FAVORITES ---------------- */

  const saveFavorites = async () => {
    if (!ready || !userId) return false;

    const normalizedFavorites = favorites.filter(
      (f): f is string => typeof f === "string" && f.includes(":"),
    );

    try {
      const res = await apiClient.patch(`/api/users/id/${userId}/favorites`, {
        favorites: normalizedFavorites,
      });

      if (res.status !== 200) return false;

      await AsyncStorage.setItem(
        getFavoritesStorageKey(userId),
        JSON.stringify(normalizedFavorites),
      );
      await removeCachedUserProfile(String(userId));

      return true;
    } catch (err: any) {
      console.error(
        "Error saving favorites",
        err.response?.data ?? err.message ?? err,
      );
      return false;
    }
  };

  /* ---------------- SYNC FAVORITES (drag reorder) ---------------- */

  const syncFavorites = useCallback(
    async (orderedIds: string[]) => {
      if (!userId) {
        console.warn("No userId found — will sync later.");
        return;
      }

      await AsyncStorage.setItem(
        getFavoritesStorageKey(userId),
        JSON.stringify(orderedIds),
      );

      try {
        await apiClient.patch(`/api/users/id/${userId}/favorites`, {
          favorites: orderedIds,
        });
        await removeCachedUserProfile(String(userId));
        console.log("✅ Favorites synced.");
      } catch (err) {
        console.warn("❌ Sync error:", err);
      }
    },
    [userId],
  );

  /* ---------------- TEAM PREVIEW ---------------- */

  const handleLongPress = useCallback((team: TeamWithLeague) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPreviewTeam(team);
    setModalVisible(true);
  }, []);

  /* ---------------- NAVIGATION ---------------- */

  const handleGoToTeam = useCallback(() => {
    if (!previewTeam) return;

    const id = getTeamId(previewTeam);

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
                  : "/team/nhl/[teamId]";

    router.push({
      pathname: route,
      params: { teamId: id.toString() },
    });

    setModalVisible(false);
  }, [previewTeam, router]);

  /* ---------------- REMOVE FAVORITE ---------------- */

  const handleRemoveFavorite = useCallback(
    async (team: TeamWithLeague) => {
      const id = getTeamId(team);
      const key = buildKey(team.league, id);

      const updatedFavorites = favorites.filter((f) => f !== key);

      setFavorites(updatedFavorites);
      setModalVisible(false);
      setPreviewTeam(null);

      if (userId) {
        await AsyncStorage.setItem(
          getFavoritesStorageKey(userId),
          JSON.stringify(updatedFavorites),
        );

        try {
          await apiClient.patch(`/api/users/id/${userId}/favorites`, {
            favorites: updatedFavorites,
          });
          await removeCachedUserProfile(String(userId));
          console.log("✅ Favorites synced after remove.");
        } catch (err: any) {
          console.error(
            "Failed to remove favorite",
            err.response?.data ?? err.message ?? err,
          );
        }
      }
    },
    [favorites, userId],
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

    filteredTeams,

    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  };
}
