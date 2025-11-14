import { useEffect, useState } from "react";
import axios from "axios";

export type TeamAggregatedStats = {
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  foulsPerGame: number;
  fgPercent: number;
  ftPercent: number;
  tpPercent: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
};

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY || "";
const RAPIDAPI_HOST = "v2.nba.api-sports.io";

export function useTeamStats(teamId: number, season = "2025") {
  const [teamStats, setTeamStats] = useState<TeamAggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const fetchTeamStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.request<{ response: any[] }>({
          method: "GET",
          url: `https://${RAPIDAPI_HOST}/teams/statistics`,
          params: { id: teamId.toString(), season },
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        });

        const resArray = response.data.response;
        if (!resArray || resArray.length === 0) {
          throw new Error("No team stats found");
        }

        const stats = resArray[0];
        const totalGames = stats.games || 1;

        const format = (num: number) => Number(num.toFixed(1));

        const aggregated: TeamAggregatedStats = {
          gamesPlayed: totalGames,
          totalPoints: stats.points || 0,
          totalRebounds: stats.totReb || 0,
          totalAssists: stats.assists || 0,

          pointsPerGame: format(stats.points / totalGames),
          reboundsPerGame: format(stats.totReb / totalGames),
          assistsPerGame: format(stats.assists / totalGames),
          stealsPerGame: format(stats.steals / totalGames),
          blocksPerGame: format(stats.blocks / totalGames),
          turnoversPerGame: format(stats.turnovers / totalGames),
          foulsPerGame: format(stats.pFouls / totalGames),

          fgPercent: format(parseFloat(stats.fgp || "0")),
          ftPercent: format(parseFloat(stats.ftp || "0")),
          tpPercent: format(parseFloat(stats.tpp || "0")),
        };

        setTeamStats(aggregated);
      } catch (err: any) {
        console.error("❌ Error fetching team stats:", err.message);
        setError(err);
        setTeamStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamStats();
  }, [teamId, season]);

  return { teamStats, loading, error };
}
