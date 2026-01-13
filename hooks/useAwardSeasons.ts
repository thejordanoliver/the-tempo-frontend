import axios from "axios";
import { ResizeMode } from "expo-av";
import { useCallback, useEffect, useState } from "react";
import { AwardSeason, LeagueType } from "types/types";

export type League = LeagueType;

export type AwardCategory =
  | "all"

  // NBA
  | "mvp"
  | "roy"
  | "sixthman"
  | "dpoy"
  | "coy"
  | "mip"
  | "fmvp"

  // CFB
  | "heisman"
  | "apoy"
  | "camp"
  | "maxwell"
  | "biletnikoff"
  | "doak"
  | "mackey"
  | "groza"
  | "thorpe"
  | "nagurski"
  | "butkus"
  | "hendricks"
  | "lombardi"
  | "lott"
  | "obrien"
  | "manning"
  | "rimington"
  | "outland"
  | "unitas"
  | "apcoy"
  | "afca"

  // NFL
  | "ropoy"
  | "rdpoy"
  | "opoy"
  | "dpoy"
  | "coy";

type Options = {
  category?: AwardCategory;
  league?: League;
  playerId?: string; // NBA only
  season?: string;
  enabled?: boolean;
  refreshToken?: number;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useAwardSeasons(options: Options = {}) {
  const {
    league = "nba",
    category = "all",
    playerId,
    season,
    enabled = true,
    refreshToken,
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

      // cache-buster (safe)
      params._refresh = refreshToken ?? Date.now();
      type AwardSeasonsResponse = Record<string, AwardSeason[]>;

      const res = await axios.get(`${API_URL}/api/${league}/award-seasons`, {
        params,
      });

      const payload = res.data as AwardSeasonsResponse;

      if (category === "all") {
        const flattened = Object.values(payload).flat();
        setData(flattened);
      } else {
        setData(payload[category] ?? []);
      }
    } catch (err) {
      console.error("❌ Failed to fetch award seasons", err);
      setError("Failed to load award seasons");
    } finally {
      setLoading(false);
    }
  }, [league, category, playerId, season, enabled, refreshToken]);

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
