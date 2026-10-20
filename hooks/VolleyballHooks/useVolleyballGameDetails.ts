import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import type { VolleyballGameDetailsResponse } from "types/volleyball/volleyball";
import { getVolleyballLeagueKey } from "utils/navigation/volleyballGame";
import { useVolleyballResource } from "./useVolleyball";

/** The details endpoint and live updates share the same normalized backend snapshot. */
export function useVolleyballGameDetails(
  league: string | null,
  gameId?: string | number | null,
) {
  const id = String(gameId ?? "");
  const leagueKey = getVolleyballLeagueKey(league);
  const enabled = !!leagueKey && /^[1-9]\d*$/.test(id);
  const resource = useVolleyballResource<VolleyballGameDetailsResponse>(
    enabled
      ? `/api/volleyball/details?league=${leagueKey}&gameId=${encodeURIComponent(id)}`
      : null,
  );
  useLiveSportsSubscription<VolleyballGameDetailsResponse>({
    enabled,
    kind: "game",
    payload: { sport: "volleyball", league: leagueKey ?? "wcvb", gameId: id },
    onUpdate: resource.replace,
  });
  return {
    ...resource,
    score: resource.data?.score ?? null,
    details: resource.data?.details ?? null,
    warning: resource.error?.message ?? null,
    isLive: resource.data?.score?.status.state === "in",
  };
}
