import axios from "axios";
import { useEffect, useState } from "react";
import { CBBPlayer } from "types/types";
import { BASE_URL } from "utils/apiClient";

// --- Types ---

export type PlayerSeasonStat = {
  season: number;
  displaySeason: string;
  team: string;
  teamId: string;
  teamSlug: string;
  position?: string;

  averages: {
    avgPoints: string;
    avgAssists: string;
    avgRebounds: string;
    avgMinutes: string;
    avgBlocks: string;
    avgSteals: string;
    avgFouls: string;
    avgTurnovers: string;
    avgOffensiveRebounds: string;
    avgDefensiveRebounds: string;
    fieldGoalPct: string;
    freeThrowPct: string;
    threePointFieldGoalPct: string;
    gamesPlayed: string;
    gamesStarted: string;
  };

  totals: {
    points: string;
    assists: string;
    totalRebounds: string;
    offensiveRebounds: string;
    defensiveRebounds: string;
    blocks: string;
    steals: string;
    turnovers: string;
    fouls: string;
    fieldGoalPct: string;
    freeThrowPct: string;
    threePointFieldGoalPct: string;
  };

  miscellaneous: Record<string, string>;
};

// Flattened stats type for easier table/chart usage
export type FlattenedSeasonStat = {
  season: number;
  teamId: string;
  displaySeason: string;
  team: string;
  position?: string;
  gamesPlayed: number;
  gamesStarted: number;
  points: number;
  assists: number;
  rebounds: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fieldGoalPct: number;
  freeThrowPct: number;
  threePointFieldGoalPct: number;
  avgPoints: number;
  avgAssists: number;
  avgRebounds: number;
  avgOffensiveRebounds: number;
  avgDefensiveRebounds: number;
  avgSteals: number;
  avgBlocks: number;
  avgTurnovers: number;
  avgFouls: number;
  avgMinutes: number;
  misc: Record<string, string>;
};

interface PlayerSeasonsResponse extends CBBPlayer {
  season_stats: PlayerSeasonStat[] | null;
  careerStats: PlayerSeasonStat[] | null;
}

// --- Helper to flatten stats ---
function flattenSeasonStats(stats: PlayerSeasonStat[] | null | undefined): FlattenedSeasonStat[] {
  if (!stats) return [];
  return stats.map((s) => ({
    season: s.season,
    displaySeason: s.displaySeason,
    team: s.team,
    teamId: s.teamId,
    position: s.position,
    gamesPlayed: Number(s.averages.gamesPlayed),
    gamesStarted: Number(s.averages.gamesStarted),
    points: Number(s.totals.points),
    assists: Number(s.totals.assists),
    rebounds: Number(s.totals.totalRebounds),
    offensiveRebounds: Number(s.totals.offensiveRebounds),
    defensiveRebounds: Number(s.totals.defensiveRebounds),
    steals: Number(s.totals.steals),
    blocks: Number(s.totals.blocks),
    turnovers: Number(s.totals.turnovers),
    fouls: Number(s.totals.fouls),
    fieldGoalPct: Number(s.totals.fieldGoalPct),
    freeThrowPct: Number(s.totals.freeThrowPct),
    threePointFieldGoalPct: Number(s.totals.threePointFieldGoalPct),
    avgPoints: Number(s.averages.avgPoints),
    avgAssists: Number(s.averages.avgAssists),
    avgRebounds: Number(s.averages.avgRebounds),
    avgOffensiveRebounds: Number(s.averages.avgOffensiveRebounds),
    avgDefensiveRebounds: Number(s.averages.avgDefensiveRebounds),
    avgSteals: Number(s.averages.avgSteals),
    avgBlocks: Number(s.averages.avgBlocks),
    avgTurnovers: Number(s.averages.avgTurnovers),
    avgFouls: Number(s.averages.avgFouls),
    avgMinutes: Number(s.averages.avgMinutes),
    misc: s.miscellaneous,
  }));
}

// --- Hook ---
export function useBasketballPlayerSeasons(
  playerId?: number,
  isWomen: boolean = false,
  isWNBA: boolean = false,
) {
  const [player, setPlayer] = useState<PlayerSeasonsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;

    async function fetchPlayerSeasons() {
      setLoading(true);
      setError(null);

      try {
        const league = isWomen ? "wcbb" : isWNBA ? "wnba" : "cbb";

        const { data } = await axios.get<PlayerSeasonsResponse>(
          `${BASE_URL}/api/players/${league}/${playerId}/seasons`,
        );

        if (!cancelled) {
          setPlayer(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              err.message ||
              "Failed to fetch player seasons",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPlayerSeasons();

    return () => {
      cancelled = true;
    };
  }, [playerId, isWomen, isWNBA]);

  const seasonStatsFlattened = flattenSeasonStats(player?.season_stats);
  const careerStatsFlattened = flattenSeasonStats(player?.careerStats);

  return {
    player,
    careerStats: player?.careerStats ?? [],
    seasonStats: player?.season_stats ?? [],
    seasonStatsFlattened,
    careerStatsFlattened,
    loading,
    error,
  };
}