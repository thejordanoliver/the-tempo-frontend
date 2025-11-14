import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams as nbaTeams } from "constants/teams";
import { teams as nflTeams } from "constants/teamsNFL";
import { teams as cfbTeams } from "constants/teamsCFB";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { LeagueType } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export function useFavoriteTeams() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGridView, setIsGridView] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ✅ Combine NBA, NFL, and CFB teams
  const allTeams = useMemo(() => [...nbaTeams, ...nflTeams, ...cfbTeams], []);

  // ✅ Safely filter teams by name
  const filteredTeams = useMemo(() => {
    return allTeams.filter((team) => {
      const fullName = team.fullName ?? "";
      return fullName.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, allTeams]);

  // ✅ Load username and favorites from AsyncStorage on mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        const storedFavorites = await AsyncStorage.getItem("favorites");

        setUsername(storedUsername);

        if (storedFavorites) {
          try {
            const parsed = JSON.parse(storedFavorites);
            if (Array.isArray(parsed)) setFavorites(parsed);
            else setFavorites([]);
          } catch {
            console.error("Failed to parse favorites JSON");
            setFavorites([]);
          }
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // ✅ Toggle favorite with persistence
  const toggleFavorite = async (league: LeagueType, id: string | number) => {
    const key = `${league}:${id}`;
    setFavorites((prev) => {
      const newFavorites = prev.includes(key)
        ? prev.filter((f) => f !== key)
        : [...prev, key];

      // Persist immediately to AsyncStorage
      AsyncStorage.setItem("favorites", JSON.stringify(newFavorites)).catch(
        (err) => console.error("Failed to save favorites", err)
      );

      return newFavorites;
    });
  };

  // ✅ Check if a team is favorited
  const isFavorite = (league: LeagueType, id: string | number) =>
    favorites.includes(`${league}:${id}`);

  // ✅ Toggle between grid/list view with fade animation
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

  // ✅ Save favorites to backend (optional)
  const saveFavorites = async () => {
    if (!username) {
      console.warn("Username not loaded");
      return false;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/users/${username}/favorites`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites }),
      });

      if (!res.ok) throw new Error("Failed to update favorites");

      // Store updated favorites locally
      await AsyncStorage.setItem("favorites", JSON.stringify(favorites));

      return true;
    } catch (err) {
      console.error("Error saving favorites", err);
      return false;
    }
  };

  return {
    search,
    setSearch,
    favorites,
    setFavorites,
    username,
    isLoading,
    isGridView,
    toggleLayout,
    toggleFavorite,
    isFavorite,
    fadeAnim,
    saveFavorites,
    filteredTeams,
  };
}
