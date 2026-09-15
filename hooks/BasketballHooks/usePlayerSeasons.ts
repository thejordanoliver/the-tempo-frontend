import { isAxiosError, isCancel } from "axios";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type StatValue = number | string | null | undefined;

export type BasketballLeague = "nba" | "wnba" | "cbb" | "wcbb";

export interface Player {
  id?: StatValue;
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

export interface BasketballCanonicalProfile {
  league: BasketballLeague;
  playerId: string;
  redirected: boolean;
  redirectedFrom: {
    league: BasketballLeague;
    playerId: string;
  } | null;
}

interface CollegeStatsResponse {
  league: "cbb";
  playerId: string;
  seasons?: Season[] | null;
}

interface ApiResponse {
  requestedLeague?: BasketballLeague;
  requestedPlayerId?: StatValue;
  league?: BasketballLeague;
  playerId?: StatValue;
  player?: Player | null;
  canonicalProfile?: BasketballCanonicalProfile | null;
  seasons?: Season[] | null;
  collegeStats?: CollegeStatsResponse | null;
}

const normalizeApiSeason = (season: Season): Season => ({
  ...season,
  averages: season.averages ?? {},
  totals: season.totals ?? {},
  miscellaneous: season.miscellaneous ?? {},
});

const isBasketballLeague = (value: unknown): value is BasketballLeague =>
  value === "nba" ||
  value === "wnba" ||
  value === "cbb" ||
  value === "wcbb";

const normalizeLeague = (
  value: unknown,
  fallback: BasketballLeague,
): BasketballLeague => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return isBasketballLeague(normalized) ? normalized : fallback;
};

const normalizePlayerId = (value: StatValue, fallback: string) => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const getRequestErrorMessage = (error: unknown) => {
  if (isAxiosError<{ error?: string; message?: string }>(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch player seasons"
    );
  }

  return error instanceof Error
    ? error.message
    : "Failed to fetch player seasons";
};

export function usePlayerSeasons(
  playerId: number | string,
  league: BasketballLeague,
) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [collegeSeasons, setCollegeSeasons] = useState<Season[]>([]);
  const [resolvedLeague, setResolvedLeague] =
    useState<BasketballLeague>(league);
  const [canonicalProfile, setCanonicalProfile] =
    useState<BasketballCanonicalProfile | null>(null);
  const [seasonsLoading, setSeasonsLoading] = useState(true);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(
    null,
  );

  const normalizedPlayerId = String(playerId ?? "").trim();
  const hasValidPlayerId =
    normalizedPlayerId.length > 0 &&
    Number.isFinite(Number(normalizedPlayerId)) &&
    Number(normalizedPlayerId) > 0;
  const requestKey = hasValidPlayerId
    ? `${league}:${normalizedPlayerId}`
    : null;

  const fetchSeasons = useCallback(async (signal?: AbortSignal) => {
    if (!hasValidPlayerId) {
      setPlayer(null);
      setSeasons([]);
      setCollegeSeasons([]);
      setCanonicalProfile(null);
      setResolvedLeague(league);
      setSeasonsError("Invalid player ID");
      setSeasonsLoading(false);
      return;
    }

    try {
      setSeasonsLoading(true);
      setSeasonsError(null);
      setCanonicalProfile(null);
      setResolvedRequestKey(null);

      const res = await apiClient.get<ApiResponse>(
        `/api/player/stats/${league}/${normalizedPlayerId}`,
        { signal },
      );

      if (signal?.aborted) return;

      const effectiveLeague = normalizeLeague(res.data.league, league);
      const canonicalPlayerId = normalizePlayerId(
        res.data.canonicalProfile?.playerId ?? res.data.playerId,
        normalizedPlayerId,
      );
      const redirectedFrom = res.data.canonicalProfile?.redirectedFrom;

      setResolvedLeague(effectiveLeague);
      setCanonicalProfile({
        league: effectiveLeague,
        playerId: canonicalPlayerId,
        redirected:
          res.data.canonicalProfile?.redirected ?? effectiveLeague !== league,
        redirectedFrom: redirectedFrom
          ? {
              league: normalizeLeague(redirectedFrom.league, league),
              playerId: normalizePlayerId(
                redirectedFrom.playerId,
                normalizedPlayerId,
              ),
            }
          : effectiveLeague !== league
            ? { league, playerId: normalizedPlayerId }
            : null,
      });
      setPlayer(res.data.player ?? null);
      setSeasons(
        Array.isArray(res.data.seasons)
          ? res.data.seasons.map(normalizeApiSeason)
          : [],
      );
      setCollegeSeasons(
        res.data.collegeStats?.league === "cbb" &&
          Array.isArray(res.data.collegeStats.seasons)
          ? res.data.collegeStats.seasons.map(normalizeApiSeason)
          : [],
      );
      setResolvedRequestKey(requestKey);
    } catch (err: unknown) {
      if (isCancel(err)) return;

      const message = getRequestErrorMessage(err);
      console.error("Failed to fetch player seasons:", message);
      setSeasonsError(message);
      setPlayer(null);
      setSeasons([]);
      setCollegeSeasons([]);
      setCanonicalProfile(null);
      setResolvedLeague(league);
      setResolvedRequestKey(requestKey);
    } finally {
      if (!signal?.aborted) {
        setSeasonsLoading(false);
      }
    }
  }, [hasValidPlayerId, league, normalizedPlayerId, requestKey]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => fetchSeasons(controller.signal));

    return () => controller.abort();
  }, [fetchSeasons]);

  const hasCurrentResult =
    requestKey !== null && resolvedRequestKey === requestKey;

  const currentCollegeSeasons = hasCurrentResult ? collegeSeasons : [];

  return {
    player: hasCurrentResult ? player : null,
    seasons: hasCurrentResult ? seasons : [],
    collegeSeasons: currentCollegeSeasons,
    resolvedLeague: hasCurrentResult ? resolvedLeague : league,
    canonicalProfile: hasCurrentResult ? canonicalProfile : null,
    hasCollegeStats: currentCollegeSeasons.length > 0,
    seasonsLoading: hasValidPlayerId
      ? seasonsLoading || !hasCurrentResult
      : false,
    seasonsError: hasValidPlayerId
      ? hasCurrentResult
        ? seasonsError
        : null
      : "Invalid player ID",
    refetch: () => fetchSeasons(),
  };
}
