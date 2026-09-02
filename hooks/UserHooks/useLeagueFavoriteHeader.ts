import {
  isFavoriteSportId,
  LEAGUE_CONFIG,
  type FavoriteSportId,
} from "constants/leagues";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useCallback, useMemo } from "react";

export function resolveCanonicalFavoriteSportId(
  league: unknown,
): FavoriteSportId | null {
  if (!isFavoriteSportId(league)) {
    return null;
  }

  return LEAGUE_CONFIG[league].id;
}

export function useLeagueFavoriteHeader(league: unknown) {
  const {
    favoriteSportsLoading,
    favoriteSportsReady,
    favoriteSportsSaving,
    isFavoriteSport,
    toggleFavoriteSport,
  } = useFavoriteTeamsContext();

  const favoriteSportId = useMemo(
    () => resolveCanonicalFavoriteSportId(league),
    [league],
  );

  const isFavorite = favoriteSportId
    ? isFavoriteSport(favoriteSportId)
    : false;
  const favoritePending =
    favoriteSportsLoading || favoriteSportsSaving || !favoriteSportsReady;

  const onToggleFavorite = useCallback(() => {
    if (!favoriteSportId || favoritePending) {
      return;
    }

    void toggleFavoriteSport(favoriteSportId);
  }, [favoritePending, favoriteSportId, toggleFavoriteSport]);

  return useMemo(
    () => ({
      showFavoriteAction: favoriteSportId !== null,
      isFavorite,
      favoritePending,
      onToggleFavorite,
    }),
    [favoritePending, favoriteSportId, isFavorite, onToggleFavorite],
  );
}
