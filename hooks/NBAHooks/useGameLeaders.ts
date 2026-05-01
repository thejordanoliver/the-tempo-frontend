import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

type TeamType = "home" | "away" | undefined;

export function useGameLeaders(
  gameId: number,
  homeTeamId: number,
  awayTeamId: number,
) {
  const [gameLeaders, setGameLeaders] = useState<any[] | null>(null);
  const [gameLeadersLoading, setGameLeadersLoading] = useState(true);
  const [gameLeadersError, setGameLeadersError] = useState<null | string>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaders = async () => {
      setGameLeadersLoading(true);
      setGameLeadersError(null);

      try {
        const res = await apiClient.get(`/api/game-stats/leaders/${gameId}`);

        if (!isMounted) return;

        const teams = res.data.response || [];

        const normalized = teams.map((teamBlock: any) => {
          const teamType: TeamType =
            teamBlock.team.id === homeTeamId
              ? "home"
              : teamBlock.team.id === awayTeamId
                ? "away"
                : undefined;

          return {
            team: teamBlock.team,
            leaders: teamBlock.leaders,
            teamType,
          };
        });

        setGameLeaders(normalized);
      } catch (err: any) {
        if (isMounted) {
          setGameLeadersError(err.message || "Failed to fetch game leaders");
        }
      } finally {
        if (isMounted) setGameLeadersLoading(false);
      }
    };

    if (gameId && homeTeamId && awayTeamId) {
      fetchLeaders();
    } else {
      setGameLeadersLoading(false);
      setGameLeaders(null);
    }

    return () => {
      isMounted = false;
    };
  }, [gameId, homeTeamId, awayTeamId]);

  return {
    gameLeaders,
    gameLeadersLoading,
    gameLeadersError,
  };
}
