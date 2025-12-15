import { useEffect, useState } from "react";
import axios from "axios";
import { loadGameStats, saveGameStats } from "utils/gameStatsStorage";

export type TeamStat = {
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  statistics: {
    fastBreakPoints: number;
    pointsInPaint: number;
    biggestLead: number;
    secondChancePoints: number;
    pointsOffTurnovers: number;
    longestRun: number;
    points: number;
    fgm: number;
    fga: number;
    fgp: string;
    ftm: number;
    fta: number;
    ftp: string;
    tpm: number;
    tpa: number;
    tpp: string;
    offReb: number;
    defReb: number;
    totReb: number;
    assists: number;
    pFouls: number;
    steals: number;
    turnovers: number;
    blocks: number;
    plusMinus: string;
    min: string;
  };
};

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

export function useGameStatistics(gameId: number) {
  const [data, setData] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);

        const cached = await loadGameStats(gameId);
     if (cached && cached.length > 0) {
  setData(cached);
  setLoading(false);
  return;
}

        const res = await axios.get(`https://${RAPIDAPI_HOST}/games/statistics`, {
          params: { id: gameId },
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        });


        const stats = res.data.response ?? [];
        setData(stats);
        saveGameStats(gameId, stats);

      } catch (err) {
        console.error(err);
        setError("Failed to fetch game statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [gameId]);

  return { data, loading, error };
}

