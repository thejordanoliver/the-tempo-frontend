import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

type TeamType = "home" | "away" | undefined;

export function useGameLeaders(
  gameId: string,
  homeTeamId: number,
  awayTeamId: number,
) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaders = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiClient.get(
          `/api/game-stats/leaders/${gameId}`,
        );

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

        setData(normalized);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch game leaders");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (gameId && homeTeamId && awayTeamId) {
      fetchLeaders();
    } else {
      setLoading(false);
      setData(null);
    }

    return () => {
      isMounted = false;
    };
  }, [gameId, homeTeamId, awayTeamId]);

  return {
    data,
    isLoading: loading,
    isError: !!error,
    error,
  };
}