import { useVolleyballResource } from "hooks/VolleyballHooks/useVolleyball";
import { useMemo } from "react";
import type {
  VolleyballLeagueKey,
  VolleyballRankings,
  VolleyballStandings,
} from "types/volleyball/volleyball";
import { volleyballTableGroups } from "utils/volleyball";

export function useVolleyballTable(
  league: VolleyballLeagueKey,
  kind: "standings" | "rankings",
) {
  const resource = useVolleyballResource<
    VolleyballStandings | VolleyballRankings
  >(`/api/standings/${league}${kind === "rankings" ? "/rankings" : ""}`);
  const groups = useMemo(
    () => volleyballTableGroups(resource.data),
    [resource.data],
  );
  return { ...resource, groups };
}
