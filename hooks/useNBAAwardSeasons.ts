import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NBAMVPSeason } from "types/types";

export type AwardCategory =
  | "all"
  | "mvp"
  | "roy"
  | "sixthman"
  | "dpoy"
  | "coy"
  | "mip"
  | "fmvp";

type Options = {
  category?: AwardCategory;
  playerId?: string;
  teamId?: string;
  season?: string;
  enabled?: boolean;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useNBAAwardSeasons(options: Options = {}) {
  const {
    category = "mvp", // default behavior preserved
    playerId,
    teamId,
    season,
    enabled = true,
  } = options;

  const [data, setData] = useState<NBAMVPSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAwards = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (playerId) params.player_id = playerId;
      if (season) params.season = season;
      if (category) params.type = category; // 👈 optional backend filter

      const res = await axios.get(`${API_URL}/api/nba/award-seasons`, {
        params,
      });

      const payload = res.data;

      // 👇 Extract category safely
      setData(payload?.[category] ?? []);
    } catch (err: any) {
      console.error("❌ Failed to fetch NBA award seasons", err);
      setError("Failed to load award seasons");
    } finally {
      setLoading(false);
    }
  }, [category, playerId, season, enabled]);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  return {
    data,
    loading,
    error,
    refetch: fetchAwards,
  };
}
