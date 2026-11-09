import { useEffect, useState } from "react";

// Keep later date, week, and conference changes inside the loaded league view.
export function useLeagueEntryLoading(loading: boolean, league: string) {
  const [loadedLeague, setLoadedLeague] = useState<string | null>(null);

  useEffect(() => {
    if (loading || loadedLeague === league) return;

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setLoadedLeague(league);
    });

    return () => {
      cancelled = true;
    };
  }, [league, loadedLeague, loading]);

  return loading && loadedLeague !== league;
}
