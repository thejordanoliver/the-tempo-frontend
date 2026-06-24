// hooks/NFLHooks/useNFLGameLeaders.ts
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type PlayerStat = {
  name: string;
  value: string | number | null;
};

export interface Player {
  id: number | null;
  name: string;
  group: string; // Passing, Rushing, Receiving, etc.
  stats: PlayerStat[];
  team?: { id: number; name: string } | null;
  image?: string | null;
}



export function useFootballGameLeaders(gameId?: string, teamId?: string) {
  const [leaders, setLeaders] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!gameId || !teamId) return;

    let isMounted = true;

    async function fetchLeaders() {
      setIsLoading(true);
      setIsError(false);

      try {
        const res = await apiClient.get(`api/football/game-leaders`, {
          params: { gameId, teamId },
        });

        if (!isMounted) return;

        setLeaders(res.data?.leaders ?? []);
      } catch (err) {
        console.error("Error fetching 🏈 game leaders", err);
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchLeaders();

    return () => {
      isMounted = false;
    };
  }, [gameId, teamId]);

  return { leaders, isLoading, isError };
}
