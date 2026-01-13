import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams as nbaTeams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as nflTeams } from "constants/teamsNFL";
import { teams as cfbTeams } from "constants/teamsCFB";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { LeagueType } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
const STORAGE_KEY = "favorites";

export function useFavoriteTeams() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [ready, setReady] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  /* ------------------ TEAMS ------------------ */

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
      const storedUsername = await AsyncStorage.getItem("username");
      const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY);

      setUsername(storedUsername);

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
      setReady(true); // ✅ important
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
    // 🚫 hard guards
    if (!ready) {
      console.warn("saveFavorites aborted: not ready");
      return false;
    }

    if (!username) {
      console.warn("saveFavorites aborted: username missing");
      return false;
    }

    // ✅ normalize favorites (backend requires array of strings)
    const normalizedFavorites = favorites.filter(
      (f): f is string => typeof f === "string" && f.includes(":")
    );

    try {
      const url = `${BASE_URL}/api/users/${username}/favorites`;
      console.log("Saving favorites →", url, normalizedFavorites);

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ favorites: normalizedFavorites }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Favorites update failed:",
          res.status,
          text || "(no body)"
        );
        return false;
      }

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalizedFavorites)
      );

      return true;
    } catch (err) {
      console.error("Error saving favorites", err);
      return false;
    }
  };

  /* ------------------ RETURN ------------------ */

  return {
    // state
    search,
    setSearch,
    favorites,
    setFavorites,
    username,
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
  };
}
