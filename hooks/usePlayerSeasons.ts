import { useEffect, useState, useCallback } from "react";

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

const API_URL = process.env.EXPO_PUBLIC_API_URL;


export function usePlayerSeasons(playerId?: number | string) {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [seasons, setSeasons] = useState<PlayerSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasons = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_URL}/api/players/${playerId}/seasons`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch player seasons");
      }

      const data: ApiResponse = await res.json();
      setPlayer(data.player);
      setSeasons(
        // defensive: remove empty rows if any slipped in
        data.seasons.filter(s => s?.season)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  return {
    player,
    seasons,
    loading,
    error,
    refetch: fetchSeasons,
  };
}
