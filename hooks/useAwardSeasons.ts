import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { AwardSeason } from "types/types";
import { LeagueType } from "types/types";

export type League = LeagueType;

export type AwardCategory =
  | "all"

  // ---------------- NBA ----------------
  | "mvp"
  | "roy"
  | "sixthman"
  | "dpoy"
  | "coy"
  | "mip"
  | "fmvp"

  // ---------------- CFB ----------------
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
  | "unitas";

type Options = {
  category?: AwardCategory;
    league?: League;          // 👈 NEW
  playerId?: string;
  teamId?: string;
  season?: string;
  enabled?: boolean;
    refreshToken?: number; // 👈 ADD

};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useAwardSeasons(options: Options = {}) {
  const {
    league = "nba",
    category = "mvp",
    playerId,
    teamId,
    season,
    enabled = true,
    refreshToken, // 👈 NEW
  } = options;


  const [data, setData] = useState<AwardSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const fetchAwards = useCallback(async () => {
  if (!enabled) return;

  try {
    setLoading(true);
    setError(null);

    // 👇 CRITICAL: clear data so React re-renders
    setData([]);

    const params: Record<string, string | number> = {};
    if (playerId) params.player_id = playerId;
    if (teamId) params.team_id = teamId;
    if (season) params.season = season;
    if (category) params.type = category;

    // 👇 cache buster
    params._refresh = Date.now();

    const res = await axios.get(
      `${API_URL}/api/${league}/award-seasons`,
      { params }
    );

    setData(res.data?.[category] ?? []);
  } catch (err: any) {
    console.error("❌ Failed to fetch award seasons", err);
    setError("Failed to load award seasons");
  } finally {
    setLoading(false);
  }
}, [league, category, playerId, teamId, season, enabled, refreshToken]);

useEffect(() => {
  fetchAwards();
}, [fetchAwards, refreshToken]);

  return {
    data,
    loading,
    error,
    refetch: fetchAwards,
  };
}
