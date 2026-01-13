import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";

export interface Player {
  id: number;
  player_id: number;
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

function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === "android") {
    // Android emulator localhost workaround
    return "http://10.0.2.2:4000";
  }

  // iOS simulator or web fallback
  return "http://192.168.1.90:4000";
}

export default function useDbPlayersByTeam(teamId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = getApiBaseUrl();

  const refreshPlayers = useCallback(async () => {
    if (!teamId) {
      setPlayers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get<PlayersResponse>(
        `${API_URL}/api/players/team/${teamId}`
      );

      const mappedPlayers: Player[] = (res.data.players || []).map((p) => ({
        id: p.id ?? 0,
        player_id: p.player_id ?? 0,
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
  }, [teamId, API_URL]);

  // ✅ Always run effect, but skip fetching if teamId is empty
  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  return { players, loading, error, refreshPlayers };
}
