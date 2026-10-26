import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

type RecruitingTeam = {
  id: number;
  name: string;
  shortName: string | null;
};

export function useRecruitingTeams(league: "cfb" | "mcbb") {
  const [state, setState] = useState<{
    league: string;
    teams: RecruitingTeam[];
    error: string | null;
  }>({ league, teams: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    void apiClient
      .get<{ teams: RecruitingTeam[] }>(`api/teams/${league}`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setState({ league, teams: data.teams, error: null });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({
            league,
            teams: [],
            error: "Unable to load team filters.",
          });
        }
      });
    return () => controller.abort();
  }, [league]);

  return state.league === league ? state : { league, teams: [], error: null };
}
