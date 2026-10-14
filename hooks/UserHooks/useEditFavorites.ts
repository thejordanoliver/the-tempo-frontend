import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import type { EditFavoritesHeaderTab } from "components/CustomHeader";
import type { FavoriteSportId } from "constants/leagues";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useScopedRouter } from "hooks/useScopedRouter";
import { buildFavoriteTeamKey, type FavoriteTeamKey } from "types/favorites";
import { isEligibleFavoriteTeam } from "utils/favorites/favoriteTeamEligibility";

// Drafts and searches stay local until Save; leaving the screen discards edits.
export function useEditFavorites(selectedTab: EditFavoritesHeaderTab) {
  const router = useScopedRouter();
  const {
    favorites,
    syncFavorites,
    isLoading,
    ready: favoriteTeamsReady,
    allTeams,
    userId,
    favoriteSports,
    favoriteSportsLoading,
    favoriteSportsSaving,
    favoriteSportsReady,
    loadFavoriteSports,
    updateFavoriteSports,
  } = useFavoriteTeamsContext();

  const [teamSearch, setTeamSearch] = useState("");
  const [sportSearch, setSportSearch] = useState("");
  const [draftFavoriteTeams, setDraftFavoriteTeams] = useState<FavoriteTeamKey[]>([]);
  const [favoriteTeamsDirty, setFavoriteTeamsDirty] = useState(false);
  const [draftFavoriteSports, setDraftFavoriteSports] = useState<FavoriteSportId[]>([]);
  const [favoriteSportsDirty, setFavoriteSportsDirty] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadFavoriteSports();
  }, [loadFavoriteSports]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      setDraftFavoriteTeams([]);
      setFavoriteTeamsDirty(false);
      setDraftFavoriteSports([]);
      setFavoriteSportsDirty(false);

      setTeamSearch("");
      setSportSearch("");
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!favoriteTeamsReady || favoriteTeamsDirty) {
        return;
      }

      setDraftFavoriteTeams(favorites);
    });

    return () => {
      cancelled = true;
    };
  }, [favoriteTeamsDirty, favoriteTeamsReady, favorites, userId]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!favoriteSportsReady || favoriteSportsDirty) {
        return;
      }

      setDraftFavoriteSports(favoriteSports);
    });

    return () => {
      cancelled = true;
    };
  }, [favoriteSports, favoriteSportsDirty, favoriteSportsReady, userId]);

  const activeSearch = selectedTab === "teams" ? teamSearch : sportSearch;

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase();

    return allTeams.filter((team) => {
      if (!isEligibleFavoriteTeam(team)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const teamName = team.fullName ?? team.name ?? "";

      return (
        teamName.toLowerCase().includes(query) ||
        team.league.toLowerCase().includes(query)
      );
    });
  }, [allTeams, teamSearch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      if (selectedTab === "teams") {
        setTeamSearch(value);
        return;
      }

      setSportSearch(value);
    },
    [selectedTab],
  );

  const handleToggleFavoriteSport = useCallback((league: FavoriteSportId) => {
    setDraftFavoriteSports((current) => {
      if (current.includes(league)) {
        return current.filter((favorite) => favorite !== league);
      }

      return [...current, league];
    });

    setFavoriteSportsDirty(true);
  }, []);

  const handleToggleFavoriteTeam = useCallback((league: string, id: string) => {
    const key = buildFavoriteTeamKey(league, id);

    if (!key) {
      return;
    }

    setDraftFavoriteTeams((current) =>
      current.includes(key)
        ? current.filter((favorite) => favorite !== key)
        : [...current, key],
    );
    setFavoriteTeamsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (saving || !favoriteTeamsReady || !favoriteSportsReady) {
      return;
    }

    setSaving(true);

    try {
      const [teamsSaved, sportsSaved] = await Promise.all([
        favoriteTeamsDirty
          ? syncFavorites(draftFavoriteTeams)
          : Promise.resolve(true),

        favoriteSportsDirty
          ? updateFavoriteSports(draftFavoriteSports)
          : Promise.resolve(true),
      ]);

      if (teamsSaved && sportsSaved) {
        router.back();
        return;
      }

      const message = !sportsSaved
        ? "Your previous favorite sports are still saved. Please try again."
        : "Your favorite sports were saved, but your teams could not be saved. Please try again.";

      Alert.alert("Couldn’t save favorites", message);
    } catch (error) {
      console.error("Failed to save favorites:", error);

      Alert.alert(
        "Couldn’t save favorites",
        "Something went wrong while saving your favorites. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }, [
    draftFavoriteSports,
    draftFavoriteTeams,
    favoriteSportsDirty,
    favoriteSportsReady,
    favoriteTeamsDirty,
    favoriteTeamsReady,
    router,
    saving,
    syncFavorites,
    updateFavoriteSports,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const screenBusy =
    isLoading || favoriteSportsLoading || favoriteSportsSaving || saving;

  return {
    activeSearch,
    sportSearch,
    filteredTeams,
    draftFavoriteTeams,
    draftFavoriteSports,
    teamsLoading: isLoading || !favoriteTeamsReady,
    sportsLoading: favoriteSportsLoading,
    sportsSaving: favoriteSportsSaving || saving,
    saving,
    screenBusy,
    saveDisabled: screenBusy || !favoriteTeamsReady || !favoriteSportsReady,
    handleSearchChange,
    handleToggleFavoriteTeam,
    handleToggleFavoriteSport,
    handleSave,
    handleCancel,
  };
}
