import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { LeagueType } from "types/types";

export type ChampionSeason = {
  id: number;
  season: string | number;
  team_name: string;

  // CFB-only (nullable for NBA)
  selector?: string | null;
  era?: string | null;

  // NBA-only (nullable for CFB)
  league?: string | null;

  team: {
    id: number;
    code: string;
    name: string;
    full_name?: string;
    conference?: string;
    color?: string;
  } | null;
  notes: string,
};

type Options = {
  enabled?: boolean;
  refreshToken?: number;
  league: LeagueType;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useChampions({
  league,
  enabled = true,
  refreshToken,
}: Options) {
  const [data, setData] = useState<ChampionSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChampions = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const endpoint =
        league === "CFB"
          ? "/api/cfb/champion-seasons"
          : league === "NBA"
          ? "/api/nba/champion-seasons"
          : "/api/nfl/champion-seasons";

      const res = await axios.get(`${API_URL}${endpoint}`, {
        params: {
          _refresh: refreshToken ?? Date.now(), // cache buster
        },
      });

      setData(res.data ?? []);
    } catch (err) {
      console.error(`❌ Failed to fetch ${league} champions`, err);
      setError(`Failed to load ${league} championships`);
    } finally {
      setLoading(false);
    }
  }, [league, enabled, refreshToken]);

  useEffect(() => {
    fetchChampions();
  }, [fetchChampions]);

  return {
    data,
    loading,
    error,
    refetch: fetchChampions,
  };
}
