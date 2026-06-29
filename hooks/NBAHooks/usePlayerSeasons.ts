import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type StatValue = number | string | null | undefined;

export interface Player {
  team_id?: StatValue;
  position?: string | null;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface Averages extends Record<string, StatValue> {
  avgFouls?: StatValue;
  avgBlocks?: StatValue;
  avgPoints?: StatValue;
  avgSteals?: StatValue;
  avgAssists?: StatValue;
  avgMinutes?: StatValue;
  avgRebounds?: StatValue;
  gamesPlayed?: StatValue;
  avgTurnovers?: StatValue;
  fieldGoalPct?: StatValue;
  freeThrowPct?: StatValue;
  gamesStarted?: StatValue;
  avgDefensiveRebounds?: StatValue;
  avgOffensiveRebounds?: StatValue;
  threePointFieldGoalPct?: StatValue;
  "avgFieldGoalsMade-avgFieldGoalsAttempted"?: StatValue;
  "avgFreeThrowsMade-avgFreeThrowsAttempted"?: StatValue;
  "avgThreePointFieldGoalsMade-avgThreePointFieldGoalsAttempted"?: StatValue;
}

export interface Totals extends Record<string, StatValue> {
  fouls?: StatValue;
  blocks?: StatValue;
  points?: StatValue;
  steals?: StatValue;
  assists?: StatValue;
  turnovers?: StatValue;
  fieldGoalPct?: StatValue;
  freeThrowPct?: StatValue;
  totalRebounds?: StatValue;
  defensiveRebounds?: StatValue;
  offensiveRebounds?: StatValue;
  threePointFieldGoalPct?: StatValue;
  "fieldGoalsMade-fieldGoalsAttempted"?: StatValue;
  "freeThrowsMade-freeThrowsAttempted"?: StatValue;
  "threePointFieldGoalsMade-threePointFieldGoalsAttempted"?: StatValue;
}

export interface Miscellaneous extends Record<string, StatValue> {
  ejections?: StatValue;
  doubleDouble?: StatValue;
  tripleDouble?: StatValue;
  flagrantFouls?: StatValue;
  technicalFouls?: StatValue;
  disqualifications?: StatValue;
  scoringEfficiency?: StatValue;
  shootingEfficiency?: StatValue;
  stealTurnoverRatio?: StatValue;
  assistTurnoverRatio?: StatValue;
}

export interface Season {
  id?: StatValue;
  player_id?: StatValue;
  player_name?: string | null;
  season?: StatValue;
  display_season?: StatValue;
  team_id?: StatValue;
  team_slug?: StatValue;
  season_type?: StatValue;
  season_type_value?: StatValue;
  season_type_label?: StatValue;
  averages: Averages;
  totals: Totals;
  miscellaneous: Miscellaneous;
  created_at?: string;
  updated_at?: string;
}

export type PlayerSeason = Season;

interface ApiResponse {
  playerId?: StatValue;
  player?: Player | null;
  seasons?: Season[] | null;
}

const normalizeApiSeason = (season: Season): Season => ({
  ...season,
  averages: season.averages ?? {},
  totals: season.totals ?? {},
  miscellaneous: season.miscellaneous ?? {},
});

export function usePlayerSeasons(playerId?: number | string) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
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

      setPlayer(res.data.player ?? null);
      setSeasons(
        Array.isArray(res.data.seasons)
          ? res.data.seasons.map(normalizeApiSeason)
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