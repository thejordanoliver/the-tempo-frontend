import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface Player {
  id: number;
  player_id: number;
  espn_id: number;
  first_name: string;
  last_name: string;
  short_name: string;
  team_id: number;
  name: string;
  full_name: string;
  jersey_number: string;
  position: string | null;
  avatarUrl: string | null;
  height: string;
  active: boolean;
}

interface PlayersResponse {
  players: Partial<Player>[]; // API might return incomplete objects
}

export default function usePlayersByTeam(teamId: string) {
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
      const res = await apiClient.get<PlayersResponse>(
        `api/players/team/${teamId}`,
      );

      const mappedPlayers: Player[] = (res.data.players || []).map((p) => ({
        id: p.id ?? 0,
        player_id: p.player_id ?? 0,
        espn_id: p.espn_id ?? 0,
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        short_name: p.short_name || "",
        team_id: p.team_id ?? 0,
        name: p.name || "",
        full_name: p.full_name || p.name || "",
        jersey_number: p.jersey_number || "",
        position: p.position || null,
        avatarUrl: p.avatarUrl || null,
        height: p.height || "",
        active: p.active ?? true,
      }));

      setPlayers(mappedPlayers);
      setError(null);
    } catch (err: any) {
      setError("Could not load team roster.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // ✅ Always run effect, but skip fetching if teamId is empty
  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  return { players, loading, error, refreshPlayers };
}
