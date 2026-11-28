import { useScreenActivity } from "hooks/useScreenActivity";
import { useCallback, useEffect, useState } from "react";
import type { PlayoffBracketData, PlayoffLeague } from "types/playoffs";
import { apiClient } from "utils/apiClient";
import {
  createPlaceholderBracket,
  withPlaceholderBracket,
} from "utils/playoffs/placeholderBracket";
import {
  PLAYOFF_ENDPOINTS,
  getDefaultPlayoffSeason,
} from "utils/playoffs/playoffConfig";

type State = {
  key: string;
  data: PlayoffBracketData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};
export function usePlayoffBracket(
  league: PlayoffLeague,
  season: number,
  enabled = true,
) {
  const { active: screenActive } = useScreenActivity();
  const active = enabled && screenActive;
  const key = `${league}:${season}`;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<State>({
    key,
    data: null,
    loading: true,
    refreshing: false,
    error: null,
  });
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let controller: AbortController | null = null;
    let poll: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      controller = new AbortController();
      const request = controller;
      setState((previous) => {
        const data = previous.key === key ? previous.data : null;
        return { key, data, loading: !data, refreshing: !!data, error: null };
      });
      try {
        const { data } = await apiClient.get<PlayoffBracketData>(
          PLAYOFF_ENDPOINTS[league],
          {
            params: { season },
            signal: request.signal,
          },
        );
        if (disposed || request.signal.aborted) return;
        if (!data || !Array.isArray(data.rounds))
          throw new Error("Invalid playoff response");
        setState({
          key,
          data: withPlaceholderBracket(league, data),
          loading: false,
          refreshing: false,
          error: null,
        });
        if (
          data.rounds.some((round) =>
            round.matchups.some((matchup) => matchup.status !== "complete"),
          )
        ) {
          poll = setTimeout(() => void load(), 30_000);
        }
      } catch {
        if (disposed || request.signal.aborted) return;
        setState((previous) => ({
          key,
          data:
            (previous.key === key ? previous.data : null) ??
            (season >= getDefaultPlayoffSeason(league)
              ? createPlaceholderBracket(league, season)
              : null),
          loading: false,
          refreshing: false,
          error: "Playoff data is temporarily unavailable. Pull to refresh.",
        }));
        // Recover automatically when the backend or provider becomes available.
        poll = setTimeout(() => void load(), 30_000);
      }
    };
    void load();
    return () => {
      disposed = true;
      controller?.abort();
      if (poll) clearTimeout(poll);
    };
  }, [active, key, league, season, revision]);

  return {
    ...(state.key === key
      ? state
      : { key, data: null, loading: true, refreshing: false, error: null }),
    refresh,
  };
}
