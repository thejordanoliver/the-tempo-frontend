import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type PlayerSeason = {
  player_id: number;
  season: string;
  age: number | null;
  team: string | null;
  pos: string | null;
  g: number | null;
  gs: number | null;
  mp: number | null;
  fg: number | null;
  fga: number | null;
  fg_pct: string | null;
  three_p: number | null;
  three_pa: number | null;
  three_pct: string | null;
  two_p: number | null;
  two_pa: number | null;
  two_pct: string | null;
  efg_pct: string | null;
  ft: number | null;
  fta: number | null;
  ft_pct: string | null;
  orb: number | null;
  drb: number | null;
  trb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  tov: number | null;
  pf: number | null;
  pts: number | null;
};

type PlayerInfo = {
  full_name: string;
  first_name: string;
  last_name: string;
};

type ApiResponse = {
  playerId: string;
  player: PlayerInfo;
  seasons: PlayerSeason[];
};

export function usePlayerSeasons(playerId?: number | string) {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [seasons, setSeasons] = useState<PlayerSeason[]>([]);
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);

  const fetchSeasons = useCallback(async () => {
    if (!playerId) {
      setPlayer(null);
      setSeasons([]);
      setSeasonsError(null);
      setSeasonsLoading(false);
      return;
    }

    try {
      setSeasonsLoading(true);
      setSeasonsError(null);

      const res = await apiClient.get<ApiResponse>(
        `/api/player/stats/${playerId}`,
      );

      const data = res.data;

      setPlayer(data.player ?? null);
      setSeasons(
        Array.isArray(data.seasons)
          ? data.seasons.filter((s) => s?.season)
          : [],
      );
    } catch (err) {
      console.error("Failed to fetch player seasons:", err);
      setSeasonsError(
        err instanceof Error ? err.message : "Failed to fetch player seasons",
      );
      setPlayer(null);
      setSeasons([]);
    } finally {
      setSeasonsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  return {
    player,
    seasons,
    seasonsLoading,
    seasonsError,
    refetch: fetchSeasons,
  };
}
