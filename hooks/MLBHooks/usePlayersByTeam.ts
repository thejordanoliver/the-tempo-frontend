import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export interface Player {
  id: string;
  team_id: number;
  uid: string;
  guid: string;
  slug: string;
  first_name: string;
  last_name: string;
  full_name: string;
  display_name: string;
  short_name: string;
  height: string;
  weight?: string;
  birth_date?: string;
  position?: string | null;
  jersey_number?: string;
  headshot?: string | null;
  avatarUrl?: string | null;
  active: boolean;
  affiliation?: string;
}

interface PlayersResponse {
  teamId: number;
  count: number;
  players: Player[];
}

function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === "android") return "http://10.0.2.2:4000";

  return "http://192.168.1.90:4000";
}

export default function usePlayersByTeam(teamId: number | string) {
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
        `${API_URL}/api/mlb/players/team/${teamId}`
      );

      // Map players to ensure consistent fields
      const mappedPlayers: Player[] = (res.data.players || []).map((p) => ({
        id: p.id,
        team_id: p.team_id,
        uid: p.uid,
        guid: p.guid,
        slug: p.slug,
        first_name: p.first_name,
        last_name: p.last_name,
        full_name: p.full_name,
        display_name: p.display_name,
        short_name: p.short_name,
        height: p.height,
        weight: p.weight,
        birth_date: p.birth_date,
        position: p.position ?? null,
        jersey_number: p.jersey_number,
        headshot: p.headshot,
        avatarUrl: p.avatarUrl || p.headshot || null,
        active: p.active,
        affiliation: p.affiliation,
      }));

      setPlayers(mappedPlayers);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch players for teamId:", teamId, err);
      setError("Could not load team roster.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, API_URL]);

  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  return { players, loading, error, refreshPlayers };
}