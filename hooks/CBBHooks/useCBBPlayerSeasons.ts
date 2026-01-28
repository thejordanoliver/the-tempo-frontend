import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Player season stat type
export type PlayerSeasonStat = {
  dr: number;
  fg: string;
  ft: string;
  gp: number;
  gs: number;
  or: number;
  pf: number;
  to: number;
  "3p%": number;
  "3pt": string;
  ast: number;
  blk: number;
  "fg%": number;
  "ft%": number;
  pts: number;
  reb: number;
  stl: number;
  team: string;
  season: string;
};

// Player info type
export type PlayerInfo = {
  id: number;
  league: string;
  name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  jersey_number: string | null;
  position: string | null;
  height: string | null;
  weight: string | null;
  experience_years: number | null;
  experience_display: string | null;
  experience_abbr: string | null;
  team: string | null;
  team_id: number | null;
  headshot_url: string | null;
  birth_place_city: string | null;
  birth_place_state: string | null;
  birth_place_country: string | null;
  birth_place_display_text: string | null;
  season_stats: PlayerSeasonStat[];
  careerStats: PlayerSeasonStat[];
};

// Hook return type
interface PlayerSeasonsResponse extends PlayerInfo {}

export function useCBBPlayerSeasons(playerId?: number) {
  const [player, setPlayer] = useState<PlayerSeasonsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;

    async function fetchPlayerSeasons() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get<PlayerSeasonsResponse>(
          `${BASE_URL}/api/players/cbb/${playerId}/seasons`
        );

        if (!cancelled) {
          setPlayer(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              err.message ||
              "Failed to fetch player seasons"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPlayerSeasons();

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  return {
    player,
    careerStats: player?.careerStats ?? [],
    seasonStats: player?.season_stats ?? [],
    loading,
    error,
  };
}
