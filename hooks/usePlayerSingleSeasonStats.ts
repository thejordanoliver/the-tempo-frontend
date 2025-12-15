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
  triple_doubles: number | null;
  awards: string | null;
};

type PlayerInfo = {
  full_name: string;
  first_name: string;
  last_name: string;
};

type SeasonsResponse = {
  playerId: string;
  player: PlayerInfo;
  seasons: PlayerSeason[];
};

type SingleSeasonResponse = {
  playerId: string;
  player: PlayerInfo;
  season: PlayerSeason;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function usePlayerSingleSeasonStats(
  playerId?: number | string,
  season?: string
) {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [seasonData, setSeasonData] = useState<PlayerSeason | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeason = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const endpoint = season
        ? `${API_URL}/api/players/${playerId}/seasons/${season}`
        : `${API_URL}/api/players/${playerId}/seasons`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        throw new Error("Failed to fetch player season");
      }

      const data: SeasonsResponse | SingleSeasonResponse = await res.json();

      setPlayer(data.player);

      // ✅ Normalize to ONE season
      if ("season" in data) {
        setSeasonData(data.season);
      } else {
        setSeasonData(data.seasons?.[0] ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [playerId, season]);

  useEffect(() => {
    fetchSeason();
  }, [fetchSeason]);

  return {
    player,
    season: seasonData, // ✅ THIS FIXES YOUR TS ERROR
    loading,
    error,
    refetch: fetchSeason,
  };
}
