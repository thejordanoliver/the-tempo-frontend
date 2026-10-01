import type { RosterResponse } from "types/roster";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export type { RosterPlayer as Player } from "types/roster";

export default function useRoster(
  teamId: number,
  league: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const requestIdRef = useRef(0);
  const [roster, setRoster] = useState<RosterResponse>({ players: [], sections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    if (!teamId || !league) {
      setRoster({ players: [], sections: [] });
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const url = `api/roster/${league}/${teamId}`;

    try {
      const res = await apiClient.get<RosterResponse>(url, { signal });
      if (signal?.aborted || requestId !== requestIdRef.current) return;

      setRoster({
        players: Array.isArray(res.data.players) ? res.data.players : [],
        sections: Array.isArray(res.data.sections) ? res.data.sections : [],
      });
      setError(null);
    } catch (err: any) {
      if (signal?.aborted || requestId !== requestIdRef.current) return;
      const status = err?.response?.status;

      // Treat "not found" roster responses as an empty roster,
      // not a real frontend error.
      if (status === 404) {
        setRoster({ players: [], sections: [] });
        setError(null);
        return;
      }

      console.error("Could not load team roster:", err?.message || err);

      setRoster({ players: [], sections: [] });
      setError("Could not load team roster.");
    } finally {
      if (!signal?.aborted && requestId === requestIdRef.current) setLoading(false);
    }
  }, [teamId, league]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setRoster({ players: [], sections: [] });
      void fetchPlayers(controller.signal);
    });
    return () => {
      controller.abort();
      requestIdRef.current += 1;
    };
  }, [enabled, fetchPlayers]);

  const refreshPlayers = useCallback(() => fetchPlayers(), [fetchPlayers]);

  return {
    players: roster.players,
    sections: roster.sections,
    loading,
    error,
    refreshPlayers,
  };
}
