import { useCallback, useEffect, useState } from "react";
import type { Team, TeamDetails } from "types/team";
import { apiClient } from "utils/apiClient";
import { resolveImage } from "utils/customheader/utils";

const HOCKEY_LEAGUES = ["nhl", "mch", "wch"] as const;

export function useHockeyTeamDirectory() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [generation, setGeneration] = useState(0);
  const refresh = useCallback(
    () => setGeneration((current) => current + 1),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setError(null);
      return Promise.allSettled(
        HOCKEY_LEAGUES.map(async (league) => {
          const { data } = await apiClient.get<{ teams: TeamDetails[] }>(
            `/api/teams/${league}`,
            { signal: controller.signal },
          );
          return data.teams.map(
            (team): Team => ({
              id: team.id,
              league,
              name: team.name,
              shortName: team.shortName,
              fullName:
                typeof team.fullName === "string" ? team.fullName : team.name,
              code: team.code ?? "",
              city: team.city ?? null,
              location: team.location ?? null,
              established: team.established ?? 0,
              logo: resolveImage(team.logo),
              logoLight: resolveImage(team.logoDark || team.logo),
              primaryColor: team.primaryColor,
              secondaryColor: team.secondaryColor,
              isActive: team.isActive,
              isNational: team.isNational,
              isAllStar: team.isAllStar,
            }),
          );
        }),
      ).then((results) => {
        if (controller.signal.aborted) return;
        setTeams((previous) =>
          results.flatMap((result, index) =>
            result.status === "fulfilled"
              ? result.value
              : previous.filter(
                  (team) => team.league === HOCKEY_LEAGUES[index],
                ),
          ),
        );
        if (results.some((result) => result.status === "rejected")) {
          setError(new Error("Couldn’t load the hockey team directory"));
        }
        setLoading(false);
      });
    });

    return () => controller.abort();
  }, [generation]);

  return { teams, loading, error, refresh };
}
