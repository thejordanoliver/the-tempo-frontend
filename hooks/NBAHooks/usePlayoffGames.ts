import { useCallback, useEffect, useMemo, useState } from "react";
import { PlayoffGame, PlayoffResponse, PlayoffSeries } from "types/nba";
import { apiClient } from "utils/apiClient";
import { buildPlayoffTree } from "utils/NBAUtils/buildBracket";

/* ================= TYPE GUARD ================= */

const isValidSeries = (s: unknown): s is PlayoffSeries => {
  return !!s && typeof s === "object" && "teams" in s;
};

/* ================= HOOK ================= */

export const usePlayoffGames = (season: number) => {
  const [data, setData] = useState<PlayoffResponse | null>(null);
  const [playoffsLoading, setPlayoffsLoading] = useState(false);
  const [playoffsError, setPlayoffsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchPlayoffs = useCallback(async () => {
    try {
      setPlayoffsError(null);

      const res = await apiClient.get<PlayoffResponse>(
        `/api/games/nba/playoffs/${season}`,
      );

      setData(res.data);
    } catch (err: any) {
      setPlayoffsError(err?.message || "Failed to fetch playoff data");
    }
  }, [season]);

  useEffect(() => {
    if (!season) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setPlayoffsLoading(true);
        await fetchPlayoffs();
      } finally {
        if (!controller.signal.aborted) {
          setPlayoffsLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, [season, fetchPlayoffs]);

  /* pull to refresh handler */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlayoffs();
    setRefreshing(false);
  }, [fetchPlayoffs]);

  /* ================= DERIVED ================= */

  const eastSeries = useMemo<PlayoffSeries[]>(() => {
    return data?.east?.filter(isValidSeries) ?? [];
  }, [data]);

  const westSeries = useMemo<PlayoffSeries[]>(() => {
    return data?.west?.filter(isValidSeries) ?? [];
  }, [data]);

  const allGames = useMemo<PlayoffGame[]>(() => {
    return [...eastSeries, ...westSeries].flatMap((s) => s.games ?? []);
  }, [eastSeries, westSeries]);

  const bracket = useMemo(() => {
    if (!eastSeries.length || !westSeries.length) return null;
    return buildPlayoffTree(eastSeries, westSeries);
  }, [eastSeries, westSeries]);

  return {
    data,
    eastSeries,
    westSeries,
    allGames,
    bracket,
    playoffsLoading,
    refreshing,
    playoffsError,
    onRefresh,
  };
};
