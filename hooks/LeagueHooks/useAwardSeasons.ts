import { useCallback, useEffect, useState } from "react";
import { AwardSeason, LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";
import { AwardCategory } from "types/types";

type Options = {
  category?: AwardCategory;
  league?: LeagueType;
  playerId?: string; // NBA only
  season?: string;
  enabled?: boolean;
};

export function useAwardSeasons(options: Options = {}) {
  const {
    league = "nba",
    category = "all",
    playerId,
    season,
    enabled = true,
  } = options;

  const [data, setData] = useState<AwardSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAwards = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        type: category,
      };

      // NBA-only filter
      if (league === "nba" && playerId) {
        params.player_id = playerId;
      }

      if (season) {
        params.season = season;
      }

      const res = await apiClient.get(`api/${league}/award-seasons`, {
        params,
      });

      const payload = res.data as Record<string, AwardSeason[]>;

      const normalized =
        category === "all"
          ? Object.values(payload).flat()
          : (payload[category] ?? []);

      setData(normalized);
    } catch (err) {
      console.error("❌ Failed to fetch award seasons", err);
      setError("Failed to load award seasons");
    } finally {
      setLoading(false);
    }
  }, [league, category, playerId, season, enabled]);

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
