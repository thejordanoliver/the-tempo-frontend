import { useCallback, useEffect, useRef, useState } from "react";
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
  games: StatValue;
  goals: StatValue;
  points: StatValue;
  assists: StatValue;
  plusMinus: StatValue;
  production: StatValue;
  shootingPct: StatValue;
  shootoutGoals: StatValue;
  penaltyMinutes: StatValue;
  powerPlayGoals: StatValue;
  gameWinningGoals: StatValue;
  powerPlayAssists: StatValue;
  shortHandedGoals: StatValue;
  timeOnIcePerGame: StatValue;
  shortHandedAssists: StatValue;
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
  averages: Averages | null;
  totals: Totals;
  miscellaneous: Miscellaneous | null;
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

export function usePlayerSeasons(playerId: number | string, league: string) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);

  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(
    null,
  );
  const controllerRef = useRef<AbortController | null>(null);
  const normalizedPlayerId = String(playerId ?? "").trim();
  const requestKey =
    /^\d+$/.test(normalizedPlayerId) && Number(normalizedPlayerId) > 0
      ? `${league}:${normalizedPlayerId}`
      : null;

  const fetchSeasons = useCallback(async () => {
    controllerRef.current?.abort();
    if (!requestKey) {
      setPlayer(null);
      setSeasons([]);
      setSeasonsError(null);
      setSeasonsLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setSeasonsLoading(true);
      setSeasonsError(null);
      setResolvedRequestKey(null);

      const res = await apiClient.get<ApiResponse>(
        `/api/player/stats/${league}/${normalizedPlayerId}`,
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;

      setPlayer(res.data.player ?? null);
      setSeasons(
        Array.isArray(res.data.seasons)
          ? res.data.seasons.map(normalizeApiSeason)
          : [],
      );
      setResolvedRequestKey(requestKey);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error("Failed to fetch player seasons:", err);
      setSeasonsError(
        err instanceof Error ? err.message : "Failed to fetch player seasons",
      );
      setPlayer(null);
      setSeasons([]);
      setResolvedRequestKey(requestKey);
    } finally {
      if (!controller.signal.aborted) setSeasonsLoading(false);
    }
  }, [normalizedPlayerId, league, requestKey]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return fetchSeasons();
    });
    return () => {
      active = false;
      controllerRef.current?.abort();
    };
  }, [fetchSeasons]);

  const hasCurrentResult =
    requestKey !== null && resolvedRequestKey === requestKey;

  return {
    player: hasCurrentResult ? player : null,
    seasons: hasCurrentResult ? seasons : [],
    seasonsLoading:
      requestKey !== null && (seasonsLoading || !hasCurrentResult),
    seasonsError: hasCurrentResult ? seasonsError : null,
    refetch: fetchSeasons,
  };
}
