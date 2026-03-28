import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

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

function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  return "http://192.168.1.90:4000";
}

export default function usePlayersByTeam(
  teamId: number,
  league: "NFL" | "CFB" = "NFL"
) {
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
      const endpoint =
        league === "NFL"
          ? `/api/nfl/players/team/${teamId}`
          : `/api/cfb/players/team/${teamId}`;

      const res = await axios.get<PlayersResponse>(
        `${API_URL}${endpoint}`
      );

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
  }, [teamId, league, API_URL]);

  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  return { players, loading, error, refreshPlayers };
}