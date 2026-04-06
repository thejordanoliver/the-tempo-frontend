import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams as nbaTeams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import type { LeagueType, Team } from "types/types";
import { apiClient } from "utils/apiClient";

export type TeamWithLeague = Team & { league: LeagueType };

const STORAGE_KEY = "favorites";

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

  /* ---------------- TEAM ID HELPER ---------------- */

  const getTeamId = (team: TeamWithLeague) => {
    if (team.league === "WCBB") {
      return (team as any).wid;
    }
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

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY);

      setUserId(storedUserId ? Number(storedUserId) : null);
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error("Failed to load favorites", err);
      setFavorites([]);
    } finally {
      setIsLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

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

        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((err) =>
          console.error("Failed to persist favorites", err),
        );

        return next;
      });
    },
    [],
  );

  /* ---------------- GRID / LIST TOGGLE ---------------- */

  const toggleLayout = () => {
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
  };

  /* ---------------- SAVE FAVORITES ---------------- */

  const saveFavorites = async () => {
    if (!ready || !userId) return false;

    const normalizedFavorites = favorites.filter(
      (f): f is string => typeof f === "string" && f.includes(":"),
    );

    try {
      const url = `/api/users/id/${userId}/favorites`;

      const res = await apiClient.patch(url, {
        favorites: normalizedFavorites,
      });

      if (res.status !== 200) return false;

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalizedFavorites),
      );

      return true;
    } catch (err: any) {
      console.error(
        "Error saving favorites",
        err.response?.data ?? err.message ?? err,
      );
      return false;
    }
  };

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

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));

      if (userId) {
        try {
          await apiClient.patch(`/api/users/id/${userId}/favorites`, {
            favorites: updatedFavorites,
          });
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
    loadFavorites,

    filteredTeams,

    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  };
}
