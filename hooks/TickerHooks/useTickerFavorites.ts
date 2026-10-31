import { useMemo } from "react";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useTickerController } from "store/tickerStore";
import {
  favoriteTeamsSignature,
  tickerFavoriteTeams,
} from "services/ticker/favorites";

export function useTickerFavorites() {
  const { favorites, ready, isLoading } = useFavoriteTeamsContext();
  const ticker = useTickerController();
  const teams = useMemo(() => tickerFavoriteTeams(favorites), [favorites]);
  return {
    count: teams.length,
    unsupportedCount: favorites.length - teams.length,
    ready: ready && !isLoading,
    signature: teams.length ? favoriteTeamsSignature(teams) : null,
    show: () => {
      if (!ready || isLoading) {
        ticker.store.setState({
          error: "Wait for your saved favorite teams to finish loading.",
        });
        return Promise.resolve(false);
      }
      return ticker.showFavorites(teams);
    },
  };
}
