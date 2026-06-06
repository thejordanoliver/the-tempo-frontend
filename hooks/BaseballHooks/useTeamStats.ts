import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

type StatItem = {
  name: string;
  displayName?: string;
  shortDisplayName?: string;
  description?: string;
  abbreviation?: string;
  value?: string | number | null;
  displayValue?: string;
};

type StatGroup = {
  name?: string;
  stats?: StatItem[];
};

type TeamStatsApiResponse = {
  team?: {
    id?: string | number;
    name?: string;
    fullName?: string;
    code?: string;
    abbreviation?: string;
    logo?: string;
    recordSummary?: string;
    standingSummary?: string;
  };
  season?: {
    year?: string | number;
    type?: string | number;
    name?: string;
    displayName?: string;
  };
  stats?: {
    b?: StatGroup;
    p?: StatGroup;
    f?: StatGroup;
  };
};

type UseTeamStatsOptions = {
  teamId: number;
  season?: string | number;
  league?: "MLB";
};

export type TeamAggregatedStats = {
  team: {
    id: string;
    name: string;
    fullName: string;
    code: string;
    recordSummary: string;
    standingSummary: string;
  };

  season: {
    year: string;
    type: string;
    name: string;
    displayName: string;
  };

  batting: {
    gamesPlayed: number;
    atBats: number;
    runs: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    rbis: number;
    stolenBases: number;
    caughtStealing: number;
    walks: number;
    strikeouts: number;
    totalBases: number;
    plateAppearances: number;
    extraBaseHits: number;
    battingAverage: number;
    onBasePct: number;
    sluggingPct: number;
    ops: number;
  };

  pitching: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winPct: number;
    saves: number;
    saveOpportunities: number;
    holds: number;
    qualityStarts: number;
    innings: number;
    hitsAllowed: number;
    runsAllowed: number;
    earnedRuns: number;
    homeRunsAllowed: number;
    walksAllowed: number;
    strikeouts: number;
    era: number;
    whip: number;
    strikeoutsPerNine: number;
    opponentAvg: number;
    opponentOnBasePct: number;
    opponentSluggingPct: number;
    opponentOps: number;
  };

  fielding: {
    gamesPlayed: number;
    inningsPlayed: number;
    totalChances: number;
    putouts: number;
    assists: number;
    errors: number;
    doublePlays: number;
    fieldingPct: number;
    rangeFactor: number;
  };
};

const toNumber = (value: string | number | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (num: number, decimals = 1): number => {
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(decimals));
};

const buildStatMap = (group?: StatGroup): Record<string, number> => {
  return (group?.stats ?? []).reduce<Record<string, number>>((acc, stat) => {
    acc[stat.name] = toNumber(stat.value);
    return acc;
  }, {});
};

export function useTeamStats({
  teamId,
  season,
  league = "MLB",
}: UseTeamStatsOptions) {
  const [teamStats, setTeamStats] = useState<TeamAggregatedStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshingStats, setRefreshingStats] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeamStats = useCallback(
    async (isRefresh = false) => {
      if (!teamId) {
        setTeamStats(null);
        setLoading(false);
        setRefreshingStats(false);
        return;
      }

      if (isRefresh) {
        setRefreshingStats(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const leaguePath = league.toLowerCase();

        const response = await apiClient.get<TeamStatsApiResponse>(
          `http://localhost:4000/api/team/stats/${leaguePath}/${teamId}`,
          {
            params: season ? { season } : undefined,
          },
        );

        const data = response.data;

        const batting = buildStatMap(data.stats?.b);
        const pitching = buildStatMap(data.stats?.p);
        const fielding = buildStatMap(data.stats?.f);

        const aggregated: TeamAggregatedStats = {
          team: {
            id: String(data.team?.id ?? ""),
            name: data.team?.name ?? "",
            fullName: data.team?.fullName ?? data.team?.name ?? "",
            code: data.team?.code ?? data.team?.abbreviation ?? "",
            recordSummary: data.team?.recordSummary ?? "",
            standingSummary: data.team?.standingSummary ?? "",
          },

          season: {
            year: String(data.season?.year ?? ""),
            type: String(data.season?.type ?? ""),
            name: data.season?.name ?? "",
            displayName: data.season?.displayName ?? "",
          },

          batting: {
            gamesPlayed: toNumber(
              batting.teamGamesPlayed ?? batting.gamesPlayed,
            ),
            atBats: toNumber(batting.atBats),
            runs: toNumber(batting.runs),
            hits: toNumber(batting.hits),
            doubles: toNumber(batting.doubles),
            triples: toNumber(batting.triples),
            homeRuns: toNumber(batting.homeRuns),
            rbis: toNumber(batting.RBIs),
            stolenBases: toNumber(batting.stolenBases),
            caughtStealing: toNumber(batting.caughtStealing),
            walks: toNumber(batting.walks),
            strikeouts: toNumber(batting.strikeouts),
            totalBases: toNumber(batting.totalBases),
            plateAppearances: toNumber(batting.plateAppearances),
            extraBaseHits: toNumber(batting.extraBaseHits),
            battingAverage: round(toNumber(batting.avg), 3),
            onBasePct: round(toNumber(batting.onBasePct), 3),
            sluggingPct: round(toNumber(batting.slugAvg), 3),
            ops: round(toNumber(batting.OPS), 3),
          },

          pitching: {
            gamesPlayed: toNumber(
              pitching.teamGamesPlayed ?? pitching.gamesPlayed,
            ),
            wins: toNumber(pitching.wins),
            losses: toNumber(pitching.losses),
            winPct: round(toNumber(pitching.winPct), 3),
            saves: toNumber(pitching.saves),
            saveOpportunities: toNumber(pitching.saveOpportunities),
            holds: toNumber(pitching.holds),
            qualityStarts: toNumber(pitching.qualityStarts),
            innings: round(toNumber(pitching.innings), 1),
            hitsAllowed: toNumber(pitching.hits),
            runsAllowed: toNumber(pitching.runs),
            earnedRuns: toNumber(
              pitching.teamEarnedRuns ?? pitching.earnedRuns,
            ),
            homeRunsAllowed: toNumber(pitching.homeRuns),
            walksAllowed: toNumber(pitching.walks),
            strikeouts: toNumber(pitching.strikeouts),
            era: round(toNumber(pitching.ERA), 2),
            whip: round(toNumber(pitching.WHIP), 2),
            strikeoutsPerNine: round(
              toNumber(pitching.strikeoutsPerNineInnings),
              1,
            ),
            opponentAvg: round(toNumber(pitching.opponentAvg), 3),
            opponentOnBasePct: round(
              toNumber(pitching.opponentOnBasePct),
              3,
            ),
            opponentSluggingPct: round(
              toNumber(pitching.opponentSlugAvg),
              3,
            ),
            opponentOps: round(toNumber(pitching.opponentOPS), 3),
          },

          fielding: {
            gamesPlayed: toNumber(
              fielding.teamGamesPlayed ?? fielding.gamesPlayed,
            ),
            inningsPlayed: toNumber(fielding.fullInningsPlayed),
            totalChances: toNumber(fielding.totalChances),
            putouts: toNumber(fielding.putouts),
            assists: toNumber(fielding.assists),
            errors: toNumber(fielding.errors),
            doublePlays: toNumber(fielding.doublePlays),
            fieldingPct: round(toNumber(fielding.fieldingPct), 3),
            rangeFactor: round(toNumber(fielding.rangeFactor), 1),
          },
        };

        setTeamStats(aggregated);
      } catch (err: unknown) {
        const normalizedError =
          err instanceof Error
            ? err
            : new Error("Failed to load team stats");

        console.error("❌ Error fetching team stats:", normalizedError.message);

        setError(normalizedError);
        setTeamStats(null);
      } finally {
        if (isRefresh) {
          setRefreshingStats(false);
        } else {
          setLoading(false);
        }
      }
    },
    [teamId, season, league],
  );

  useEffect(() => {
    void fetchTeamStats();
  }, [fetchTeamStats]);

  return {
    teamStats,
    loading,
    refreshingStats,
    error,
    refresh: () => fetchTeamStats(true),
  };
}