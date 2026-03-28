import axios from "axios";
import { useEffect, useState } from "react";

import { BASE_URL } from "utils/apiClient";

export type RosterPlayer = {
  id: number;
  player_id: number;
  college: string;
  weight: string;
  height: string;
  age: number;
  name: string;
  position: string | null;
  jersey_number: number | null;
  avatarUrl: string | null;
  team_id: number;
  experience?: number;
  group_name?: string;
};

export function useTeamRoster(teamId: string) {
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const fetchRoster = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${BASE_URL}/api/nfl/players/team/${teamId}`;

        const res = await axios.get(url);
        setPlayers(res.data.players ?? []);
      } catch (err) {
        console.error("❌ ROSTER FETCH ERROR:", err);
        setError("Failed to load roster");
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [teamId]);

  return { players, loading, error };
}
