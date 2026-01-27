import { useEffect, useState } from "react";
import axios from "axios";

type AggregatedStats = Record<string, number>;

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_FOOTBALL_RAPIDAPI_HOST || "";

export function useFootballPlayerStats(playerId: number, season = "2025") {
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`https://${RAPIDAPI_HOST}/players/statistics`, {
          params: { id: playerId.toString(), season },
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        });

        const playerData = response.data.response?.[0];
        if (!playerData) throw new Error("No player stats found");

        const totals: AggregatedStats = {};

        // Loop through teams (usually 1)
        playerData.teams.forEach((teamData: any) => {
          teamData.groups.forEach((group: any) => {
            group.statistics.forEach((stat: any) => {
              const statName = stat.name;
              const value = parseFloat(String(stat.value).replace(/,/g, "")) || 0;
              if (!totals[statName]) totals[statName] = 0;
              totals[statName] += value;
            });
          });
        });
console.log(JSON.stringify(playerData, null, 2))
        setAggregatedStats(totals);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, season]);

  return { aggregatedStats, loading, error };
}
