import axios from "axios";
import { useEffect, useState } from "react";

export type PlayerStat = {
  player: { id: number; firstname: string; lastname: string };
  team: { id: number; name: string; code: string; logo: string };
  pFouls: number;
  minutes: string;
};

type Props = {
  gameId: number | string;
  foulLimit?: number;
  teamId?: number | string;
};
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export function usePlayersInFoulTrouble({ gameId, foulLimit = 4, teamId }: Props) {
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    let isMounted = true;

    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${BASE_URL}/api/details/foul-trouble`, {
          params: { gameId, teamId, foulLimit },
        });
        if (isMounted) setPlayers(data.players);
      } catch (err) {
        if (isMounted) setError("Failed to load foul trouble players");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlayers();

    return () => {
      isMounted = false;
    };
  }, [gameId, foulLimit, teamId]);

  return { players, loading, error };
}
