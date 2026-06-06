import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

/** ------------------- TYPES ------------------- */
export interface SeasonAverages {
  avgPoints: number;
  avgRebounds: number;
  avgAssists: number;
  avgMinutes: number;
  gamesPlayed: number;
  [key: string]: number | undefined;
}

export interface Player {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  jersey_number: string;
  position: string;
  headshot_url: string;
  team: string;
  team_id: number;

  currentSeason?: {
    season: number;
    displaySeason: string;
    averages: SeasonAverages;
  };
}

type League = "CBB" | "WCBB" | "WNBA";

/** ------------------- HOOK ------------------- */
export const useRosterStats = (league: League, teamId: number) => {
  const [rosterStats, setRosterStats] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get(
          `api/team/stats/${league}/roster/${teamId}`,
        );

        const normalizedRoster: Player[] = response.data.map((player: any) => {
          const seasons = player.seasonStats || player.season_stats || [];

          const currentSeason =
            seasons.length > 0
              ? seasons.reduce((latest: any, season: any) =>
                  season.season > latest.season ? season : latest,
                )
              : null;

          const averages: SeasonAverages | undefined = currentSeason
            ? (Object.fromEntries(
                Object.entries(currentSeason.averages || {}).map(
                  ([key, value]) => [key, Number(value) || 0],
                ),
              ) as SeasonAverages)
            : undefined;

          return {
            id: player.id,
            name: player.name,
            first_name: player.first_name,
            last_name: player.last_name,
            jersey_number: player.jersey_number,
            position: player.position,
            headshot_url: player.headshot_url,
            team: player.team,
            team_id: player.team_id,
            currentSeason: averages
              ? {
                  season: currentSeason.season,
                  displaySeason: currentSeason.displaySeason,
                  averages,
                }
              : undefined,
          };
        });

        setRosterStats(normalizedRoster);
      } catch (err) {
        console.error(err);
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
    if (!league || !teamId) return;
    fetchRoster();
  }, [fetchRoster, teamId, league]);

  const onRefresh = () => {
    fetchRoster(true);
  };

  return {
    rosterStats,
    loading,
    refreshingStats,
    error,
    onRefresh,
  };
};
