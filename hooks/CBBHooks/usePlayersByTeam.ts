import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { CBBPlayer } from "types/types";

interface ApiPlayer {
  id: number;
  league: string;
  player_id?: number;
  espn_id?: number;
  first_name: string;
  last_name: string;
  short_name: string;
  name: string;
  full_name: string;
  jersey_number: string;
  position: string | null;
  height: string;
  weight?: string | null;
  experience_years?: number | null;
  experience_display?: string | null;
  experience_abbr?: string | null;
  team: string;
  team_id: number;
  headshot_url?: string | null;
  birth_place_city?: string | null;
  birth_place_state?: string | null;
  birth_place_country?: string | null;
  birth_place_display_text?: string | null;
  active: boolean;
}

interface PlayersResponse {
  teamId: number;
  count: number;
  players: Partial<ApiPlayer>[];
  isWomen: boolean;
  league: "cbb" | "wcbb";
}

export default function usePlayersByTeam(
  teamId: string,
  isWomen: boolean = false
) {
  const [players, setPlayers] = useState<CBBPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.90:4000";

  const leagueKey = isWomen ? "wcbb" : "cbb";

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
        `${BASE_URL}/api/${leagueKey}/players/team/${teamId}`
      );

      const mappedPlayers: CBBPlayer[] = (res.data.players || []).map((p) => ({
        id: String(p.id ?? 0),
        teamId: String(p.team_id ?? 0),
        jersey: p.jersey_number ?? "",
        imageUrl: p.headshot_url ?? undefined,
        firstName: p.first_name ?? "",
        lastName: p.last_name ?? "",
        league: p.league ?? leagueKey.toUpperCase(),
        position: p.position ?? undefined,
        height: p.height ?? "",
        weight: p.weight ?? undefined,
        experienceYears: p.experience_years ?? undefined,
        experienceDisplay: p.experience_display ?? undefined,
        experienceAbbr: p.experience_abbr ?? undefined,
        playerId: p.player_id,
        espnId: p.espn_id,
        shortName: p.short_name ?? "",
        fullName: p.full_name ?? p.name ?? "",
        birthPlaceCity: p.birth_place_city ?? undefined,
        birthPlaceState: p.birth_place_state ?? undefined,
        birthPlaceCountry: p.birth_place_country ?? undefined,
        birthPlaceDisplayText: p.birth_place_display_text ?? undefined,
        active: p.active ?? true,
      }));

      setPlayers(mappedPlayers);
      setError(null);
    } catch (err: any) {
      console.error(
        "Failed to fetch players",
        err.response?.data ?? err.message ?? err
      );
      setError("Could not load team roster.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, leagueKey, BASE_URL]);

  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  return { players, loading, error, refreshPlayers };
}
