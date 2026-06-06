import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

import { TeamStats } from "@/types/types";

type StatItem = {
  name: string;
  displayName?: string;
  shortDisplayName?: string;
  description?: string;
  abbreviation?: string;
  value?: string | number | null;
  displayValue?: string;
  perGameValue?: string | number | null;
  perGameDisplayValue?: string;
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
    gen?: StatGroup;
    off?: StatGroup;
    def?: StatGroup;
  };
};

type UseTeamStatsOptions = {
  teamId: number;
  season?: string | number;
  league?: "NBA" | "CBB" | "WCBB" | "WNBA";
};

type StatMap = Record<string, StatItem>;

const toNumber = (value: string | number | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const format = (num: number, decimals = 1): number => {
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(decimals));
};

const buildStatMap = (group?: StatGroup): StatMap => {
  return (group?.stats ?? []).reduce<StatMap>((acc, stat) => {
    acc[stat.name] = stat;
    return acc;
  }, {});
};

const getValue = (maps: StatMap[], keys: string[]): number => {
  for (const map of maps) {
    for (const key of keys) {
      const stat = map[key];

      if (stat?.value !== null && stat?.value !== undefined) {
        return toNumber(stat.value);
      }
    }
  }

  return 0;
};

const getPerGameValue = (
  maps: StatMap[],
  keys: string[],
  fallbackTotal: number,
  gamesPlayed: number,
): number => {
  for (const map of maps) {
    for (const key of keys) {
      const stat = map[key];

      if (stat?.perGameValue !== null && stat?.perGameValue !== undefined) {
        return format(toNumber(stat.perGameValue));
      }

      if (key.toLowerCase().startsWith("avg") && stat?.value !== undefined) {
        return format(toNumber(stat.value));
      }
    }
  }

  const safeGames = gamesPlayed > 0 ? gamesPlayed : 1;
  return format(fallbackTotal / safeGames);
};

export function useTeamStats({
  teamId,
  season,
  league = "NBA",
}: UseTeamStatsOptions) {
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
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
          `/api/team/stats/${leaguePath}/${teamId}`,
          {
            params: season ? { season } : undefined,
          },
        );

        const data = response.data;

        const gen = buildStatMap(data.stats?.gen);
        const off = buildStatMap(data.stats?.off);
        const def = buildStatMap(data.stats?.def);

        const allMaps = [gen, off, def];

        const gamesPlayed = getValue(allMaps, [
          "gamesPlayed",
          "teamGamesPlayed",
        ]);

        const totalPoints = getValue([off, gen], ["points"]);
        const totalRebounds = getValue([off, gen, def], [
          "totalRebounds",
          "rebounds",
        ]);
        const totalAssists = getValue([off, gen], ["assists"]);
        const totalSteals = getValue([def, off, gen], ["steals"]);
        const totalBlocks = getValue([def, off, gen], ["blocks"]);
        const totalTurnovers = getValue([off, gen], ["turnovers"]);
        const totalFouls = getValue([gen, def, off], [
          "fouls",
          "personalFouls",
          "totalFouls",
        ]);

        const aggregated: TeamStats = {
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

          gamesPlayed,

          totalPoints,
          totalRebounds,
          totalAssists,
          totalSteals,
          totalBlocks,
          totalTurnovers,
          totalFouls,

          pointsPerGame: getPerGameValue(
            [off, gen],
            ["avgPoints", "points"],
            totalPoints,
            gamesPlayed,
          ),
          reboundsPerGame: getPerGameValue(
            [off, gen, def],
            ["avgRebounds", "totalRebounds", "rebounds"],
            totalRebounds,
            gamesPlayed,
          ),
          assistsPerGame: getPerGameValue(
            [off, gen],
            ["avgAssists", "assists"],
            totalAssists,
            gamesPlayed,
          ),
          stealsPerGame: getPerGameValue(
            [def, off, gen],
            ["avgSteals", "steals"],
            totalSteals,
            gamesPlayed,
          ),
          blocksPerGame: getPerGameValue(
            [def, off, gen],
            ["avgBlocks", "blocks"],
            totalBlocks,
            gamesPlayed,
          ),
          turnoversPerGame: getPerGameValue(
            [off, gen],
            ["avgTurnovers", "turnovers"],
            totalTurnovers,
            gamesPlayed,
          ),
          foulsPerGame: getPerGameValue(
            [gen, def, off],
            ["avgFouls", "fouls", "personalFouls", "totalFouls"],
            totalFouls,
            gamesPlayed,
          ),

          fgPercent: format(
            getValue([off, gen], ["fieldGoalPct", "fieldGoalPercentage"]),
          ),
          ftPercent: format(
            getValue([off, gen], ["freeThrowPct", "freeThrowPercentage"]),
          ),
          tpPercent: format(
            getValue([off, gen], [
              "threePointFieldGoalPct",
              "threePointPct",
              "threePointFieldGoalPercentage",
            ]),
          ),
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