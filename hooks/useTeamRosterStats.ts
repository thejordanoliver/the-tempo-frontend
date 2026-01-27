import { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY;

const API_HEADERS = {
  "x-rapidapi-key": API_KEY,
  "x-rapidapi-host": "v2.nba.api-sports.io",
};

type Player = {
  id: number;
  firstname: string;
  lastname: string;
  birth?: { date?: string };
  height?: string;
  weight?: string;
  college?: string;
  nba?: { start?: number; pro?: number };
  active?: boolean;
  headshot_url?: string;
};

type PlayerStat = {
  player: { id: number };
  team: { id: number };
  points?: number;
  min?: string;
  fgm?: number;
  fga?: number;
  fgp?: string;
  ftm?: number;
  fta?: number;
  ftp?: string;
  tpm?: number;
  tpa?: number;
  tpp?: string;
  offReb?: number;
  defReb?: number;
  totReb?: number;
  assists?: number;
  pFouls?: number;
  steals?: number;
  turnovers?: number;
  blocks?: number;
  plusMinus?: string;
};

export type AggregatedStats = {
  playerId: number;
  name: string;
  headshot_url?: string;
  gamesPlayed: number;
  minutesPlayed: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
  totalFGM: number;
  totalFGA: number;
  totalFGP: number;
  total3PM: number;
  total3PA: number;
  total3PP: number;
  totalFTM: number;
  totalFTA: number;
  totalFTP: number;
  totalOffReb: number;
  totalDefReb: number;
  plusMinus: number;
};

export function useTeamRosterStats(teamId: number, season = "2025") {
  const [rosterStats, setRosterStats] = useState<AggregatedStats[]>([]);
  const [loading, setLoading] = useState(true);      // initial load
  const [refreshingStats, setRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState<Error | null>(null);

  const fetchRosterAndStats = async (isRefresh = false) => {
    if (!teamId) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch team roster
      const rosterRes = await axios.get("https://v2.nba.api-sports.io/players", {
        params: { team: teamId, season },
        headers: API_HEADERS,
      });

      const players: Player[] = rosterRes.data.response || [];

      // Step 2: Fetch stats
      const statsRes = await axios.get<{ response: PlayerStat[] }>(
        "https://v2.nba.api-sports.io/players/statistics",
        {
          params: { team: teamId, season },
          headers: API_HEADERS,
        }
      );

      const allStats = statsRes.data.response || [];

      // Step 3: Aggregate
      const playerStatsMap: Record<number, AggregatedStats> = {};

      for (const g of allStats) {
        const pid = g.player?.id;
        if (!pid) continue;

        if (!playerStatsMap[pid]) {
          const player = players.find((p) => p.id === pid);
          playerStatsMap[pid] = {
            playerId: pid,
            name: player
              ? `${player.firstname} ${player.lastname}`
              : `Player ${pid}`,
            headshot_url: player?.headshot_url,
            gamesPlayed: 0,
            minutesPlayed: 0,
            totalPoints: 0,
            totalRebounds: 0,
            totalAssists: 0,
            totalSteals: 0,
            totalBlocks: 0,
            totalTurnovers: 0,
            totalFouls: 0,
            totalFGM: 0,
            totalFGA: 0,
            totalFGP: 0,
            total3PM: 0,
            total3PA: 0,
            total3PP: 0,
            totalFTM: 0,
            totalFTA: 0,
            totalFTP: 0,
            totalOffReb: 0,
            totalDefReb: 0,
            plusMinus: 0,
          };
        }

        const totals = playerStatsMap[pid];
        totals.gamesPlayed += 1;
        totals.totalPoints += g.points ?? 0;
        totals.totalRebounds += g.totReb ?? 0;
        totals.totalAssists += g.assists ?? 0;
        totals.totalSteals += g.steals ?? 0;
        totals.totalBlocks += g.blocks ?? 0;
        totals.totalTurnovers += g.turnovers ?? 0;
        totals.totalFouls += g.pFouls ?? 0;
        totals.totalFGM += g.fgm ?? 0;
        totals.totalFGA += g.fga ?? 0;
        totals.total3PM += g.tpm ?? 0;
        totals.total3PA += g.tpa ?? 0;
        totals.totalFTM += g.ftm ?? 0;
        totals.totalFTA += g.fta ?? 0;
        totals.totalOffReb += g.offReb ?? 0;
        totals.totalDefReb += g.defReb ?? 0;

        if (g.plusMinus) {
          const parsed = parseInt(g.plusMinus, 10);
          totals.plusMinus += isNaN(parsed) ? 0 : parsed;
        }

        if (g.min) {
          const [min, sec] = g.min.split(":").map(Number);
          totals.minutesPlayed += (min || 0) + (sec || 0) / 60;
        }
      }

      const finalResults = Object.values(playerStatsMap).map((p) => ({
        ...p,
        totalFGP: p.totalFGA ? +(p.totalFGM / p.totalFGA * 100).toFixed(1) : 0,
        total3PP: p.total3PA ? +(p.total3PM / p.total3PA * 100).toFixed(1) : 0,
        totalFTP: p.totalFTA ? +(p.totalFTM / p.totalFTA * 100).toFixed(1) : 0,
      }));

      setRosterStats(finalResults);
    } catch (err: any) {
      setError(err);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRosterAndStats();
  }, [teamId, season]);

  return {
    rosterStats,
    loading,
    refreshingStats,
    error,
    refetch: () => fetchRosterAndStats(true),
  };
}
