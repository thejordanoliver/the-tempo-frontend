// hooks/usePlayerCareerStats.ts
import axios from "axios";
import { useEffect, useState } from "react";

export type PlayerStat = {
  player_id: number;
  season: string;
  team: string;
  gp: number;
  gs: number;
  min: number;
  fg: string;
  fg_percent: number;
  three_pt: string;
  three_pt_percent: number;
  ft: string;
  ft_percent: number;
  or_num: number;
  dr: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
  pf: number;
  to_num: number;
  pts: number;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function usePlayerCareerStats(playerId: number) {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return; // skip if playerId is invalid

    setLoading(true);
    setError(null); // reset error on new fetch

    axios
      .get(`${BASE_URL}/api/player-stats/player/${playerId}`)
      .then((res) => {
        setStats(Array.isArray(res.data) ? res.data : []); // ensure array
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load player stats");
        setStats([]); // always set stats to an array
        setLoading(false);
      });
  }, [playerId]);
  console.log(Object.keys(stats[0]));

  return { stats, loading, error };
}
