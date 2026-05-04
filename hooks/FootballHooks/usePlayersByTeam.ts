import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface Player {
  id: number;
  player_id: number;
  espn_id: number;
  name: string;
  full_name: string;
  team_id: number;
  jersey_number: string;
  position: string | null;
  avatarUrl: string | null;
  height: string;
  weight?: string;
  age?: number;
  college?: string;
  experience?: number;
  group_name?: string;
  active: boolean;
  affiliation: "NFL" | "CFB";
}

interface PlayersResponse {
  players: Partial<Player>[];
}

export default function usePlayersByTeam(
  teamId: number,
  league: "NFL" | "CFB" = "NFL",
) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPlayers = useCallback(async () => {
    if (!teamId) {
      setPlayers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        league === "NFL"
          ? `/api/nfl/players/team/${teamId}`
          : `/api/cfb/players/team/${teamId}`;

      const res = await apiClient.get<PlayersResponse>(`${endpoint}`);

      const mappedPlayers: Player[] = (res.data.players || []).map((p) => ({
        id: p.id ?? 0,
        player_id: p.player_id ?? 0,
        espn_id: p.espn_id ?? 0,

        name: p.name || "",
        full_name: p.full_name || p.name || "",

        team_id: p.team_id ?? 0,
        jersey_number: p.jersey_number || "",

        position: p.position || null,
        avatarUrl: p.avatarUrl || null,

        height: p.height || "",
        weight: p.weight || "",
        age: p.age ?? undefined,

        college: p.college || "",
        experience: p.experience ?? undefined,
        group_name: p.group_name || "",

        active: p.active ?? true,
        affiliation: (p.affiliation as "NFL" | "CFB") || league,
      }));

      setPlayers(mappedPlayers);
      setError(null);
    } catch (err: any) {
      console.error("Roster error:", err?.response?.data || err.message);
      setError("Could not load team roster.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, league]);

  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  return { players, loading, error, refreshPlayers };
}
