import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams as nbaTeams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as nflTeams } from "constants/teamsNFL";
import { teams as cfbTeams } from "constants/teamsCFB";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import axios from "axios";
import type { LeagueType, Team } from "types/types";

type TeamWithLeague = Team & { league: LeagueType };

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
const STORAGE_KEY = "favorites";

export function useFavoriteTeams() {
  /* ------------------ STATE ------------------ */
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

  /* ------------------ ALL TEAMS ------------------ */
  const allTeams = useMemo(
    () => [...nbaTeams, ...nflTeams, ...cfbTeams, ...cbbTeams],
    []
  );

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase();
    return allTeams.filter((team) =>
      (team.fullName ?? team.name ?? "").toLowerCase().includes(q)
    );
  }, [search, allTeams]);

  /* ------------------ LOAD FAVORITES ------------------ */
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

  /* ------------------ FAVORITE HELPERS ------------------ */
  const buildKey = (league: LeagueType, id: string | number) =>
    `${league}:${id}`;

  const isFavorite = useCallback(
    (league: LeagueType, id: string | number) =>
      favorites.includes(buildKey(league, id)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (league: LeagueType, id: string | number) => {
      const key = buildKey(league, id);

      setFavorites((prev) => {
        const next = prev.includes(key)
          ? prev.filter((f) => f !== key)
          : [...prev, key];

        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((err) =>
          console.error("Failed to persist favorites", err)
        );

        return next;
      });
    },
    []
  );

  /* ------------------ LAYOUT ------------------ */
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

  /* ------------------ SAVE TO BACKEND ------------------ */
  const saveFavorites = async () => {
    if (!ready) {
      console.warn("saveFavorites aborted: not ready");
      return false;
    }
    if (!userId) {
      console.warn("saveFavorites aborted: userId missing");
      return false;
    }

    const normalizedFavorites = favorites.filter(
      (f): f is string => typeof f === "string" && f.includes(":")
    );

    try {
      const url = `${BASE_URL}/api/users/id/${userId}/favorites`;
      console.log("Saving favorites →", url, normalizedFavorites);

      const res = await axios.patch(url, { favorites: normalizedFavorites });

      if (res.status !== 200) {
        console.error("Favorites update failed:", res.status, res.data);
        return false;
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedFavorites));
      return true;
    } catch (err: any) {
      console.error("Error saving favorites", err.response?.data ?? err.message ?? err);
      return false;
    }
  };

  /* ------------------ MODAL & TEAM PREVIEW ------------------ */
  const handleLongPress = useCallback((team: TeamWithLeague) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPreviewTeam(team);
    setModalVisible(true);
  }, []);

  const handleGoToTeam = useCallback(() => {
    if (!previewTeam) return;

    const route =
      previewTeam.league === "NFL"
        ? "/team/nfl/[teamId]"
        : previewTeam.league === "NBA"
        ? "/team/[teamId]"
        : previewTeam.league === "CFB"
        ? "/team/cfb/[teamId]"
        : previewTeam.league === "CBB"
        ? "/team/cbb/[teamId]"
        : "/team/wcbb/[teamId]";

    router.push({
      pathname: route,
      params: { teamId: previewTeam.id.toString() },
    });

    setModalVisible(false);
  }, [previewTeam, router]);

  const handleRemoveFavorite = useCallback(async () => {
    if (!previewTeam) return;

    const key = buildKey(previewTeam.league, previewTeam.id);

    const updatedFavorites = favorites.filter((f) => f !== key);
    setFavorites(updatedFavorites);

    setModalVisible(false);
    setPreviewTeam(null);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));

    if (userId) {
      const url = `${BASE_URL}/api/users/id/${userId}/favorites`;
      try {
        await axios.patch(url, { favorites: updatedFavorites });
      } catch (err: any) {
        console.error("Failed to remove favorite on backend", err.response?.data ?? err.message ?? err);
      }
    }
  }, [previewTeam, favorites, userId]);

  /* ------------------ RETURN ------------------ */
  return {
    // state
    search,
    setSearch,
    favorites,
    setFavorites,
    userId,
    isLoading,
    isGridView,
    ready,

    // layout
    toggleLayout,
    fadeAnim,

    // favorites API
    toggleFavorite,
    isFavorite,
    saveFavorites,
    loadFavorites,

    // search
    filteredTeams,

    // modal & preview
    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  };
}
