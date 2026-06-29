import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

/** ------------------- TYPES ------------------- */
type League = "CBB" | "WCBB" | "WNBA";

type StatValue = number | string | undefined;

export interface SeasonAverages {
  avgPoints: number;
  avgRebounds: number;
  avgAssists: number;
  avgMinutes: number;
  gamesPlayed: number;
  [key: string]: StatValue;
}

export interface PlayerStatsSeason {
  season: number;
  teamId?: string;
  totals?: Record<string, StatValue>;
  averages?: Record<string, StatValue>;
  miscellaneous?: Record<string, StatValue>;
  position?: string;
  teamSlug?: string;
  displaySeason: string;
}

export interface ApiRosterPlayer {
  id: number;
  league: League;
  full_name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  jersey_number: string;
  position: string;
  height?: string | null;
  weight?: string | null;
  experience?: number | null;
  experience_display?: string | null;
  experience_abbr?: string | null;
  team: string;
  team_id: number;
  headshot_url?: string | null;
  birth_place_city?: string | null;
  birth_place_state?: string | null;
  birth_place_country?: string | null;
  birth_display?: string | null;
  active?: boolean;
  latestSeasonStats?: Partial<PlayerStatsSeason>;
  seasonStats?: PlayerStatsSeason[];
  careerStats?: PlayerStatsSeason[];
}

export interface Player {
  id: number;
  league: League;
  name: string;
  full_name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  jersey_number: string;
  position: string;
  height?: string | null;
  weight?: string | null;
  experience?: number | null;
  experience_display?: string | null;
  experience_abbr?: string | null;
  team: string;
  team_id: number;
  headshot_url?: string | null;
  birth_display?: string | null;
  active?: boolean;
  currentSeason?: {
    season: number;
    displaySeason: string;
    averages: SeasonAverages;
    totals?: Record<string, StatValue>;
    miscellaneous?: Record<string, StatValue>;
  };
}

/** ------------------- HELPERS ------------------- */
const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeAverages = (
  averages: Record<string, StatValue> = {},
): SeasonAverages => ({
  ...averages,
  avgPoints: toNumber(averages.avgPoints),
  avgRebounds: toNumber(averages.avgRebounds),
  avgAssists: toNumber(averages.avgAssists),
  avgMinutes: toNumber(averages.avgMinutes),
  gamesPlayed: toNumber(averages.gamesPlayed),
});

const getLatestSeason = (
  player: ApiRosterPlayer,
): PlayerStatsSeason | undefined => {
  if (
    player.latestSeasonStats?.season &&
    player.latestSeasonStats?.averages &&
    Object.keys(player.latestSeasonStats.averages).length > 0
  ) {
    return player.latestSeasonStats as PlayerStatsSeason;
  }

  const stats = [...(player.seasonStats ?? []), ...(player.careerStats ?? [])];

  return stats.sort((a, b) => Number(b.season) - Number(a.season))[0];
};

const normalizePlayer = (player: ApiRosterPlayer): Player => {
  const currentSeason = getLatestSeason(player);

  return {
    id: player.id,
    league: player.league,
    name: player.full_name,
    full_name: player.full_name,
    first_name: player.first_name,
    last_name: player.last_name,
    short_name: player.short_name,
    jersey_number: player.jersey_number,
    position: player.position,
    height: player.height,
    weight: player.weight,
    experience: player.experience,
    experience_display: player.experience_display,
    experience_abbr: player.experience_abbr,
    team: player.team,
    team_id: player.team_id,
    headshot_url: player.headshot_url,
    birth_display: player.birth_display,
    active: player.active,
    currentSeason: currentSeason
      ? {
          season: Number(currentSeason.season),
          displaySeason: currentSeason.displaySeason,
          averages: normalizeAverages(currentSeason.averages),
          totals: currentSeason.totals,
          miscellaneous: currentSeason.miscellaneous,
        }
      : undefined,
  };
};

/** ------------------- HOOK ------------------- */
export const useRosterStats = (league: League, teamId: number) => {
  const [rosterStats, setRosterStats] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = useCallback(
    async (isRefresh = false) => {
      if (!teamId) {
        setRosterStats([]);
        setLoading(false);
        return;
      }

      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        setError(null);

        const response = await apiClient.get<ApiRosterPlayer[]>(
          `api/team/stats/${league}/roster/${teamId}`,
        );

        const roster = Array.isArray(response.data) ? response.data : [];

        setRosterStats(roster.map(normalizePlayer));
      } catch (err) {
        console.error("Failed to load roster stats:", err);
        setRosterStats([]);
        setError(
          err instanceof Error ? err : new Error("Failed to load roster stats"),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const onRefresh = useCallback(() => {
    fetchRoster(true);
  }, [fetchRoster]);

  return {
    rosterStats,
    loading,
    refreshingStats,
    error,
    onRefresh,
  };
};

export default useRosterStats;